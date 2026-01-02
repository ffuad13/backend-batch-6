const register = (req, res, next) => {
	const { fullName , userName, email, password} = req.body;

	if (!userName || !password || !fullName) {
		return res.json({
			message: "Kolom username, password, dan fullName tidak boleh kosong"
		})
	}

	//login simpan ke database

  res.json({
    message: 'register berhasil',
  });
};

const login = (req, res, next) => {
	const {userName, email, password} = req.body

	if (!email) {
		return res.json({
			message: 'Kolom email atau username harus diisi'
		})
	}
	if (!password) {
		return res.json({
			message: "Password tidak boleh kosong"
		})
	}


	//logic login

	res.json({
		message: "Login berhasil"
	})
}

const logout = (req, res, next) => {
	try {
		if (true) {
			const error = new Error("Terjadi kesalahan Logout")
			error.status = 400
			throw error
		}

		res.json({
			message: "berhasil logout"
		})
	} catch (error) {
		next(error)
	}
}

export { register, login, logout };
