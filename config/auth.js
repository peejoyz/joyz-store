exports.isUser = function(req, res, next) {
    if(req.isAuthenticated()) {
        return next();
    } else {
        req.session.originalUrl = req.url; //for redirecting.
        req.flash('danger', 'Please log in.');
        res.redirect('/user/login');
    }

}

exports.isAdmin = function(req, res, next) {
    if(req.isAuthenticated() && res.locals.user.admin == 1) {
        return next();
    } else {
        req.session.originalUrl = req.url; //for redirecting.
        req.flash('danger', 'Please log in as admin.');
        res.redirect('/user/login');
    }
}