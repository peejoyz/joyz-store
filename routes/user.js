const express = require('express');
const router = express.Router();
const passport = require('passport');
const bcrypt = require('bcryptjs');

//Get User Model
let User = require('../models/user');

//Get Register
router.get('/register', function(req, res) {
    res.render('register', {
        title: 'Joyz Store | Register'
    });
});

//Post Register
router.post('/register', function(req, res) {
    let name = req.body.name;
    let email = req.body.email;
    let username = req.body.username;
    let password = req.body.password;
    let password2 = req.body.password2;

    req.checkBody('name', 'Name is required').notEmpty();
    req.checkBody('email', 'Email is required').notEmpty();
    req.checkBody('username', 'Username is required').notEmpty();
    req.checkBody('password', 'Password is required').notEmpty();
    req.checkBody('password2', 'Passwords do not match!').equals(password);

    let errors = req.validationErrors();

    if(errors) {
        res.render('register', {
            errors: errors,
            user: null,
            title: 'Joyz Store | Register'
        })
    } else {
        User.findOne({username: username}, (err, user) => {
            if(err) console.log(err);

            if(user) {
                req.flash('danger', 'Username exist, choose another');
                res.redirect('/user/register')
            } else {
                let user = new User({
                    name: name,
                    email: email,
                    username: username,
                    password: password,
                    admin: 0
                });
                bcrypt.genSalt(10, function(err, salt) {
                    bcrypt.hash(user.password, salt, function(err, hash) {
                        if(err) console.log(err);

                        user.password = hash;

                        user.save((err) => {
                            if(err) {
                                console.log(err);
                            } else {
                                req.flash('success', 'You are now registered');
                                res.redirect('/user/login');
                            }
                        })
                    })
                })
            }
        })
    }
})


//Get Login
router.get('/login', function(req, res) {

    if(res.locals.user) res.redirect('/')

    res.render('login', {
        title: 'Joyz store | Log in'
    })
});


//Post Login
router.post('/login', function(req, res, next) {
    
        passport.authenticate('local', {
            successRedirect: '/',
            failureRedirect: '/user/login',
            failureFlash: true
        })(req, res, next);
    
})

//Get Logout
router.get('/logout', function(req, res) {

    req.logout(function(err) {
        if(err) {
            return next(err);
        }

        req.flash('success', 'You are logged out');
        res.redirect('/user/login');
    });
});

module.exports = router;