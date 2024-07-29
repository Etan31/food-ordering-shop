const checkNotAuthenticated = () => {
  return function(req, res, next) {
    if (req.isAuthenticated()) {
      console.log(req.user.user_role);
      return next();
    } else {
      res.redirect("/");
    }
  };
}

module.exports = { checkNotAuthenticated };