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

export { users, user };
