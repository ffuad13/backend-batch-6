const errorRoute = (req, res, next) => {

  return res.status(404).json({
    message: `Rute ${req.url} tidak ditemukan`,
  });
};

const globalError = (err, req, res, next) => {
	return res.status(err.status || 500).json({
		message: err.message || "Terjadi server error"
	})
}

export { errorRoute, globalError };
