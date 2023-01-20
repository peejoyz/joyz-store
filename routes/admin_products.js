const express = require('express');
const router = express.Router();
const mkdirp = require('mkdirp');
const fs = require('fs-extra');
const resizeImg = require('resize-img');
const auth = require('../config/auth');
const isAdmin = auth.isAdmin;

//Product  Model
const Product = require('../models/product');

//Category Model
const Category = require('../models/category');

//Get Products index(all products page)
router.get('/', isAdmin, (req, res) => {
    
    Product.find(function(err, products) {
        res.render('admin/products', {
            products: products,
            
        });
    })
})

//Get add product
router.get('/add-product', isAdmin, (req, res) => {
    let full_title = '';
    let title = '';
    let desc = '';
    let price = '';
    let image = '';
    let discount_price = '';
    let discount_percentage = '';
    let ratings = '';
    let rated_by = '';

    Category.find((err, categories) => {
        res.render('admin/add_product', {
            full_title: full_title,
            title : title,
            desc: desc,
            categories: categories,
            price: price,
            image: image,
            discount_price: discount_price,
            discount_percentage: discount_percentage,
            ratings: ratings,
            rated_by : rated_by
        })
    })
});

//Post product
router.post('/add-product', (req, res) => {

    //checking if an image is undefined
    let imageFile = typeof req?.files?.image !== "undefined" ? req.files.image.name : "";
    
    req.checkBody('full_title', 'Full product name is required').notEmpty();
    req.checkBody('title', 'Title is required').notEmpty();
    req.checkBody('desc', 'Description is required').notEmpty();
    req.checkBody('price', 'Price is required').isDecimal();

    //validating if an image is uploaded or not
    req.checkBody('image', 'You must upload an image, only jpg and png format.').isImage(imageFile);

    let full_title = req.body.full_title;
    let title = req.body.title;
    let slug = title.replace(/\s+/g, '-').toLowerCase();
    let desc = req.body.desc;
    let price = req.body.price;
    let discount_price = req.body.discount_price;
    let discount_percentage = req.body.discount_percentage;
    let ratings = req.body.ratings;
    let rated_by = req.body.rated_by;

    let category = req.body.category;

    let errors = req.validationErrors();

    if(errors) {
        Category.find((err, categories) => {
            res.render('admin/add_product', {
                errors: errors,
                full_title: full_title,
                title : title,
                desc: desc,
                categories: categories,
                price: price,
                discount_price: discount_price,
                discount_percentage: discount_percentage,
                ratings: ratings,
                rated_by : rated_by
            })
        })
    } else {
        Product.findOne({slug: slug}, (err, product) => {
            if(product) {
                req.flash('danger', 'Product title exists, choose another.');
                Category.find((err, categories) => {
                    res.render('admin/add_product', {
                        full_title:full_title,
                        title : title,
                        desc: desc,
                        categories: categories,
                        price: price,
                        discount_price: discount_price,
                        discount_percentage: discount_percentage,
                        ratings: ratings,
                        rated_by : rated_by
                    })
                });
            } else {
                let price2 = parseFloat(price).toFixed(2);

                if(discount_price){
                    discount_price = parseFloat(discount_price).toFixed(2);
                }

                if(discount_percentage){
                    discount_percentage = discount_percentage;
                }

                let product = new Product({
                    full_title: full_title,
                    title: title,
                    slug: slug,
                    desc: desc,
                    price: price2,
                    category: category,
                    image: imageFile,
                    discount_price: discount_price,
                    discount_percentage: discount_percentage,
                    ratings: ratings,
                    rated_by : rated_by
                });

                product.save((err) => {
                    if(err) return res.status(500).json({message : err.message});

                    mkdirp('public/product_images/' + product._id, function(err) {
                        return console.log(err);
                    });

                    //inside the folder above (public/product_images/' + product._id) another folder is created with name gallery
                    mkdirp('public/product_images/' + product._id + '/gallery', function(err) {
                        return console.log(err);
                    });

                    //inside the folder above (public/product_images/' + product._id/gallery) another folder is created with name thumbs
                    mkdirp('public/product_images/' + product._id + '/gallery/thumbs', function(err) {
                        return console.log(err);
                    });

                    //checking if image File is not an empty string
                    if (imageFile != ""){
                        let productImage = req.files.image;
                        let path = 'public/product_images/' + product._id + '/' + imageFile;

                        productImage.mv(path, function(err) {
                            return console.log(err);
                        });
                    }
                    
                    req.flash('success', 'Product Added!');
                    res.redirect('/admin/products')
                })
            }
        })
    }

});

//Edit Product
router.get('/edit-product/:id', isAdmin, (req, res) => {

    let errors;

    if(req.session.errors) errors = req.session.errors;
    req.session.errors = null;

    Category.find((err, categories) => {
        Product.findById(req.params.id, function(err, p) {
            if(err) {
                res.status(500).json({message: err });
                res.redirect('/admin/products');
            } else {
                let galleryDir= 'public/product_images/' + p._id + '/gallery';
                let galleryImages = null;

                //reading the files
                fs.readdir(galleryDir, (err, files) => {
                    if(err) {
                        res.status(500).json({message: err });
                    } else {
                        galleryImages = files;
                        
                        res.render('admin/edit_product', {
                            full_title: p.full_title,
                            title : p.title,
                            errors: errors,
                            desc: p.desc,
                            categories: categories,
                            category: p.category.replace(/\s+/g, '-').toLowerCase(),
                            price: parseFloat(p.price).toFixed(2),
                            discount_price: p.discount_price,
                            discount_percentage: p.discount_percentage,
                            ratings: p.ratings,
                            rated_by : p.rated_by,
                            image: p.image,
                            galleryImages: galleryImages,
                            id: p._id
                        })
                    }
                })
            }
        })
    })
});

//Post Edit Product
router.post('/edit-product/:id', (req, res) => {

    //checking if an image is undefined
    let imageFile = typeof req?.files?.image !== "undefined" ? req.files.image.name : "";

    req.checkBody('full_title', 'Full product name is required').notEmpty();
    req.checkBody('title', 'Title is required').notEmpty();
    req.checkBody('desc', 'Description is required').notEmpty();
    req.checkBody('price', 'Price is required').isDecimal();

    //now validation if an image is uploaded or not
    req.checkBody('image', 'You must upload an image, only jpg and png format.').isImage(imageFile);

    let full_title = req.body.full_title;
    let title = req.body.title;
    let slug = title.replace(/\s+/g, '-').toLowerCase();
    let desc = req.body.desc;
    let price = req.body.price;
    let ratings = req.body.ratings;
    let rated_by = req.body.rated_by;
    
    let category = req.body.category;
    let pimage = req.body.pimage;
    let id = req.params.id;

    let errors = req.validationErrors();

    if(errors) {
        req.session.errors = errors;
        res.redirect('/admin/products/edit-product/' +id);
    } else {
        Product.findOne({slug: slug, _id:{'$ne':id}}, (err, p) => {
            if(err)
                console.log(err);

            if(p) {
                req.flash('danger', 'Product title exists, choose another.');
                res.redirect('/admin/products/edit-product/' + id);
            } else {
                Product.findById(id, (err, p) => {
                    if(err)
                        console.log(err)

                        let discount_price = req.body.discount_price;
                        let discount_percentage = req.body.discount_percentage;

                        if(discount_price != ""){
                            discount_price = parseFloat(discount_price).toFixed(2);
                        } else {
                            discount_price = req.body.discount_price;
                        }
        
                        if(discount_percentage != ""){
                            discount_percentage = discount_percentage;
                        } else {
                            discount_percentage = req.body.discount_percentage
                        }
                    
                        p.full_title = full_title;
                        p.title = title;
                        p.slug = slug;
                        p.desc = desc;
                        p.price = parseFloat(price).toFixed(2);
                        p.discount_price = discount_price;
                        p.discount_percentage = discount_percentage;
                        p.ratings = ratings;
                        p.rated_by = rated_by;
                        p.category = category;
                        if(imageFile != "") {
                            p.image = imageFile;
                        }

                        p.save((err) => {
                            if(err)
                                console.log(err);

                            //checking if a new image is uploaded
                            if(imageFile != ""){
                                //First of all: check if there is an image already and if there is, i want to remove it
                                if(pimage != "") { //in this case there is an image
                                    //removing the image
                                    fs.remove('public/product_images/' + id + '/' + pimage, (err) => {
                                        if(err)
                                            console.log(err);
                                    });
                                }

                                let productImage = req.files.image;
                                let path = 'public/product_images/' + id + '/' + imageFile;

                                productImage.mv(path, function(err) {
                                    return console.log(err);
                                })
                            }

                            req.flash('success', 'Product edited!');
                            res.redirect('/admin/products/edit-product/' +id);
                        })
                })
            }
        })
    }

});

//Post Product Gallery
router.post('/product-gallery/:id', (req, res) => {
    let productImage = req.files.file; //file is the name of the input field in edit_product.ejs 
    let id = req.params.id;
    let path = 'public/product_images/' + id + '/gallery/' + req.files.file.name;
    let thumbsPath = 'public/product_images/' + id + '/gallery/thumbs/' + req.files.file.name;
 
    productImage.mv(path, (err) => {
        if (err)
         console.log(err);
 
         resizeImg(fs.readFileSync(path), {width: 100, height:100}).then(function (buf) {
             fs.writeFileSync(thumbsPath, buf);
         });
    });
 
    res.sendStatus(200);
});

//Get Deleted Gallery Images
router.get('/delete-image/:image', isAdmin, (req, res) => {

    //req.query.id has it was parsed in edit_product delete url in gallery section
    let originalImage = 'public/product_images/' + req.query.id + '/gallery/' + req.params.image;
    let thumbImage = 'public/product_images/' + req.query.id + '/gallery/thumbs/' + req.params.image;

    fs.remove(originalImage, function (err) {
        if(err) {
            console.log(err);
        } else {
            fs.remove(thumbImage, function (err) {
                if (err) {
                    console.log(err);
                } else {
                    req.flash('success', 'Image deleted successfully');
                    res.redirect('/admin/products/edit-product/' + req.query.id);
                }
            });
        }
    });

})

//DELETE PRODUCT
router.get('/delete-product/:id', isAdmin, (req, res) => {

    let id = req.params.id;
    let path = 'public/product_images/' +id;

    fs.remove(path, function(err) {
        if (err) {
            console.log(err);
        } else {
            Product.findByIdAndDelete(id, function (err) {
                console.log(err);
            });
            req.flash('success', 'Product deleted successfully');
            res.redirect('/admin/products');
            
        }
    });
})

module.exports = router;