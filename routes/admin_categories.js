const express = require('express');
const router = express.Router();
const auth = require('../config/auth');
const isAdmin = auth.isAdmin;

const Category = require('../models/category');

//GET ALL CATEGORY
router.get('/', isAdmin, (req, res) => { 
    Category.find({}, (err, categories) => {
        if(err){
            throw err
        } else {
            res.render('admin/categories', {
                categories: categories
            })
        }
    })
})

//GET ADD CATEGORY
router.get('/add_category', isAdmin, (req, res) => {
    const title = '';
    res.render('admin/add_category', {
        title : title
    });
});

//POST ADD CATEGORY
router.post('/add_category', (req, res) => {

    req.checkBody('title', 'Title is required').notEmpty();

    let title = req.body.title;
    let slug = title.replace(/\s+/g, '-').toLowerCase();

    const errors = req.validationErrors();

    if(errors) {
        res.render('admin/add_category', {
            errors: errors,
            title: title
        })
    } else {
        Category.findOne({slug: slug}, (err, category) => {
            if(category) {
                req.flash('danger', 'Category name exist, choose another');
                res.render('admin/add_category', {
                    title: title
                })
            } else {
                let category = new Category ({
                    title: title,
                    slug: slug
                })

                category.save((err) => {
                    if(err)
                        return console.log(err);
                    req.flash('success', 'category Added!');
                    res.redirect('/admin/categories');
                })
            }
        })
    }

});

//GET EDIT CATEGORY
router.get('/edit_category/:id', isAdmin, (req, res) => {
    Category.findById(req.params.id, (err, category) => {
        if(err) {
            throw err
        } else {
            res.render('admin/edit_category', {
                title: category.title,
                id: category._id
            })
        }
    })
});

//POST EDIT CATEGORY
router.post('/edit_category/:id', (req, res) => {

    req.checkBody('title', 'Title must have a value').notEmpty();

    let title = req.body.title;
    let slug = title.replace(/\s+/g, '-').toLowerCase();
    let id = req.params.id;

    let errors = req.validationErrors();

    if(errors){
        res.render('admin/edit_category', {
            errors: errors,
            title: title,
            id: id
        });
    } else {
        Category.findOne({slug: slug, _id:{'$ne': id}}, function(err, category) {
            if(category) {
                req.flash('danger', 'Category name exists, choose another.');
                res.render('admin/edit_category', {
                    title: title,
                    id: id
                });
            } else {
                Category.findById(id, (err, category) => {
                    if(err)
                        return console.log(err);
                        category.title = title;
                        category.slug = slug;

                        category.save(function(err) {
                            if(err) return console.log(err);

                            req.flash('success', 'Category edited successfully!');
                            // res.redirect('/admin/categories');
                            res.redirect('/admin/categories/edit_category/' + id); //redirecting to the edit page : id make it possible to get the page with respective to the id else if it is included: cannot get / error will be thrown.
                        })
                })
            }
        })
    }
});

//DELETE CATEGORY
router.get('/delete_category/:id', isAdmin, (req, res) => {
    Category.findByIdAndDelete(req.params.id, (err) => {
        if(err) console.log(err)

        req.flash('success', 'Category deleted successfully');
        res.redirect('/admin/categories');
    })
})

module.exports = router;