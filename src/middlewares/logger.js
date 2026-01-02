const logger = (req, res, next) => {
  const time = new Date();
  console.log(`${req.method} ${req.url} ${time.toString()}`);

  next();
};

module.exports = { logger };
