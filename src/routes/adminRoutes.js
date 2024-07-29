const router = require('express').Router();
const { checkNotAuthenticated } = require('../middlewares/authCheckNotAuthenticate.js');



router.get('/dashboard_admin', checkNotAuthenticated(), async(req, res) => {
   res.render("adminUI/dashboard_admin.ejs");
})

module.exports = router;