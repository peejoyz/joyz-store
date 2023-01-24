const express = require('express');
const router = express.Router();
const fs = require('fs-extra');

//Get Product Model
let Product = require('../models/product');

//let Category Model

//Get product details
router.get('/:category/:product', (req, res) => {

    // let galleryImages = null; 

    Product.findOne({slug: req.params.product}, function(err, product) {
        if(err) {
            res.status(404).render('404')
        }

        if(product && product._id) {
            let galleryDir = 'public/product_images/' + product._id + '/gallery';


            fs.readdir(galleryDir, function(err, files) {
                if (err) {
                    console.log(err)
                }
                    else {
                    galleryImages = files; 

                    res.render('singleproductpage', {
                        title: product.title,
                        p: product, //product itself
                        galleryImages: galleryImages
                    });                       
                }      
            });
        } else {
            res.render('404')
        }
    })

});


module.exports = router;


