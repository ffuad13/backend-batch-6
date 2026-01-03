const jwt = require('jsonwebtoken');

const verify = async (req, res, next) => {
  const token = req.headers['authorization'];

  try {
    if (!token) {
      const err = new Error(
        'Token kosong, silahkan login untuk mendapatkan token'
      );
      err.status = 401;
      throw err;
    }

		const checkToken = jwt.verify(token.split(" ")[1], process.env.JWT_SECRET)
		if (!checkToken) {
      const err = new Error(
        'Gagal memvalidasi token'
      );
      err.status = 403;
      throw err;
    }

		req.user = checkToken

    next();
  } catch (error) {
    next(error);
  }
};

module.exports = { verify };
