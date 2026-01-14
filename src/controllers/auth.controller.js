const { prisma } = require('../config/database');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const validator = require("validator")
const crypto = require('crypto');

const register = async (req, res, next) => {
  const { fullName, userName, email, password } = req.body;

  if (!userName || !password || !fullName) {
    const err = new Error(
      'Kolom username, password, dan fullName tidak boleh kosong'
    );
    err.status = 404;
    throw err;
  }

  const isEmail = validator.isEmail(email, {host_whitelist: ['gmail.com', 'yahoo.com']})
  if (!isEmail) {
    const err = new Error(
      'Email tidak valid.'
    );
    err.status = 404;
    throw err;
  }

  const isStrongPassword = validator.isStrongPassword(password)
  if (!isStrongPassword) {
    const err = new Error(
      'Password minimal 8 karakter, terdapat huruf besar, huruf kecil, angka, dan simbol.'
    );
    err.status = 404;
    throw err;
  }

  const hashedPassword = bcrypt.hashSync(password, 10);

  try {
    const getDefaultRole = await (
      await prisma.role.findMany()
    ).filter((x) => x.name === 'user');

    const user = await prisma.user.create({
      data: {
        fullname: fullName,
        username: userName,
        email,
        password: hashedPassword,
        roleId: getDefaultRole[0].id,
      },
    });

    return res.status(201).json({
      message: 'register berhasil',
    });
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  const { email, password } = req.body;

  if (!email) {
    return res.status(400).json({
      message: 'Kolom email harus diisi',
    });
  }
  if (!password) {
    return res.status(400).json({
      message: 'Password tidak boleh kosong',
    });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email },
      include: { role: true }
    });

    if (!user) {
      const err = new Error('Email tidak ditemukan');
      err.status = 404;
      throw err;
    }

    const isValidPassword = bcrypt.compareSync(password, user.password);
    if (!isValidPassword) {
      const err = new Error('Password salah');
      err.status = 401;
      throw err;
    }

    // Remove password from user object
    delete user.password;

    // Generate access token (short-lived)
    const accessToken = jwt.sign(
      { id: user.id, username: user.username, role: user.roleId },
      process.env.JWT_SECRET,
      { expiresIn: '15m' }
    );

    // Generate refresh token (long-lived)
    const refreshToken = crypto.randomBytes(64).toString('hex');
    const refreshTokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    // Store hashed refresh token in DB
    await prisma.refreshToken.create({
      data: {
        token: refreshTokenHash,
        userId: user.id,
        expiresAt,
      },
    });

    // Set refresh token as HTTP-only cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', //true if prodcution
      sameSite: 'strict',
      expires: expiresAt,
    });

    return res.json({
      message: 'Login berhasil',
      data: user,
      accessToken,
    });
  } catch (error) {
    next(error);
  }
};

const logout = async (req, res, next) => {
  try {
    const refreshToken = req.headers["cookie"]?.split("=")[1];
    if (!refreshToken) {
      return res.status(400).json({ message: 'Refresh token tidak ditemukan' });
    }

    // Hash the token to match DB
    const refreshTokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');

    // Revoke the token in DB
    await prisma.refreshToken.updateMany({
      where: { token: refreshTokenHash, revokedAt: null },
      data: { revokedAt: new Date() },
    });

    // Remove cookie
    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    });

    return res.json({ message: 'Berhasil logout' });
  } catch (error) {
    next(error);
  }
};

const createRole = async (req, res, next) => {
  // buat env api key untuk pembuatan role
  // buat aturan agar hanya admin yang dapat membuat role
  const { role } = req.body;
  if (!role) {
    return res.status(400).json({
      message: 'Nama role harus diisi',
    });
  }

  try {
    const isRoleExist = await prisma.role.findFirst({
      where: {
        name: role,
      },
    });
    if (isRoleExist) {
      return res.status(400).json({
        message: 'Role sudah ada, tidak dapat membuat role baru',
      });
    }

    const result = await prisma.role.create({
      data: {
        name: role,
      },
    });

    return res.status(201).json({
      message: 'role created',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const refreshTokenHandler = async (req, res, next) => {
  try {
    //jangan buat refreshtoken baru jika refreshtoken yang ada, belum expired
    const oldRefreshToken = req.headers['cookie']?.split('=')[1];

    if (!oldRefreshToken) {
      return res.status(401).json({ message: 'Refresh token tidak ditemukan' });
    }

    const oldRefreshTokenHash = crypto.createHash('sha256').update(oldRefreshToken).digest('hex');
    const storedToken = await prisma.refreshToken.findUnique({
      where: { token: oldRefreshTokenHash },
      include: { user: true }
    });

    if (!storedToken || storedToken.revokedAt || storedToken.expiresAt < new Date()) {
      return res.status(401).json({ message: 'Refresh token tidak valid atau sudah kadaluarsa' });
    }

    // Rotate: revoke old token, create new one
    const newRefreshToken = crypto.randomBytes(64).toString('hex');
    const newRefreshTokenHash = crypto.createHash('sha256').update(newRefreshToken).digest('hex');
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    await prisma.refreshToken.update({
      where: { token: oldRefreshTokenHash },
      data: {
        revokedAt: new Date(),
        replacedBy: newRefreshTokenHash,
      },
    });

    await prisma.refreshToken.create({
      data: {
        token: newRefreshTokenHash,
        userId: storedToken.userId,
        expiresAt,
      },
    });

    // Issue new access token
    const accessToken = jwt.sign(
      { id: storedToken.user.id, username: storedToken.user.username, role: storedToken.user.roleId },
      process.env.JWT_SECRET,
      { expiresIn: '15m' }
    );

    // Set new refresh token cookie
    res.cookie('refreshToken', newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      expires: expiresAt,
    });

    return res.json({
      message: 'Token berhasil diperbarui',
      accessToken,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { register, login, logout, createRole, refreshTokenHandler };
