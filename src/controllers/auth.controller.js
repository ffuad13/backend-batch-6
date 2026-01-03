const { prisma } = require('../config/database');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const register = async (req, res, next) => {
  const { fullName, userName, email, password } = req.body;

  if (!userName || !password || !fullName) {
    return res.json({
      message: 'Kolom username, password, dan fullName tidak boleh kosong',
    });
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
    const result = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (!result) {
      const err = new Error('Email tidak ditemukan');
      err.status = 404;
      throw err;
    }

    const isValidPassword = bcrypt.compareSync(password, result.password);
    if (!isValidPassword) {
      const err = new Error('Password salah');
      err.status = 401;
      throw err;
    }

    delete result.password;

    const token = jwt.sign(
      { id: result.id, username: result.username, role: result.roleId },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    return res.json({
      message: 'Login berhasil',
      data: result,
      token,
    });
  } catch (error) {
    next(error);
  }
};

const logout = (req, res, next) => {
  try {
    if (true) {
      const error = new Error('Terjadi kesalahan Logout');
      error.status = 400;
      throw error;
    }

    res.json({
      message: 'berhasil logout',
    });
  } catch (error) {
    next(error);
  }
};

const createRole = async (req, res, next) => {
  // buat env api key untuk pembuatan role
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

module.exports = { register, login, logout, createRole };
