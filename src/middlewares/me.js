const me = (req, res, next) => {
  req.params.id = req.user.id;
  next();
};

export default me;
