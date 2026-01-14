const { prisma } = require("../config/database");

const usersData = [
  { nama: 'Faizul', Alamat: 'Sumbawa Barat' },
  { nama: 'Rani', Alamat: 'Sumbawa Barat' },
  { nama: 'Jaka', Alamat: 'Sumbawa Barat' },
  { nama: 'Sino', Alamat: 'Sumbawa Barat' },
  { nama: 'Basir', Alamat: 'Sumbawa Barat' },
];

const users = (req, res, next) => {
  return res.json(usersData);
};

const user = (req, res, next) => {
	const id = req.params.id

	const user = usersData[id -1]

	if (!user) {
		return res.json({
			message: "Data tidak ditemukan"
		})
	}

	return res.json(user)
}

const uploadUser = async (req, res, next) => {
	try {
		const {id} = req.user
		const {path} = req.file

		const updateUser = await prisma.user.update({
			where: {id},
			data: {imageurl: path}
		})

		return res.status(201).json({
			message: "Upload user profile berhasil",
			data: updateUser
		})
	} catch (error) {
		next(error)
	}
}

const profile = async (req, res, next) => {
	try {
		const {id} = req.user


		const getUser = await prisma.user.findFirst({
			where: {
				id
			},
			include: {
				role: true
			}
		})

		delete getUser.id
		delete getUser.password

		return res.status(200).json({
			message: "berhasil get data user",
			data: getUser
		})
	} catch (error) {
		next(error)
	}
}

module.exports =  { users, user, uploadUser, profile };
