const express = require('express');
const router = express.Router();


//Get Product Model
let Product = require('../models/product');

//let Category Model
let Category = require('../models/category');

//Search Product
router.get('/product/product-search', (req, res) => {
    Product.find({"full_title" : {"$regex": req.query['search'], "$options" : "i"}}, (err, products) => {
        if(products == "") {
            res.render('search404');
        } else {
            res.render('search', {
                products: products,
                title: req.query['search'], "$options" : "i"
            })
        }
    })
})

//Get Men, mobiles Product : index.ejs
router.get('/', (req, res) => {
    let categorySlug = 'men';
    let categorySlug2 = 'mobiles'
    let categorySlug3 = 'appliances'
    let categorySlug4 = 'women'
    let categorySlug5 = 'miscellaneous'

    Category.findOne({slug: categorySlug}, (err) => {
        Category.findOne({slug: categorySlug2}, (err) => {
            Category.findOne({slug: categorySlug3}, (err) => {
                Category.findOne({slug: categorySlug4}, (err) => {
                    Category.findOne({slug: categorySlug5}, (err) => {
                        Product.find({category: categorySlug5, ratings: 2}, (err, miscellaneous) => {
                            Product.find({category: categorySlug}, (err, men) => {
                                Product.find({category: categorySlug2}, (err, mobiles) => {
                                    Product.find({category: categorySlug3}, (err, appliances) => {
                                        Product.find({category: categorySlug4}, (err, women) => {
                                            if(err)
                                            res.status(500).json({ message: err.message });
                                        
                                            res.render('index', {
                                                title: 'Joyz Store',
                                                title: 'Joyz Store',
                                                men: men,
                                                mobiles: mobiles,
                                                appliances: appliances,
                                                women: women,
                                                miscellaneous: miscellaneous
                                            })  
                                        })    
                                    }).limit(3); 
                                }).limit(3);  
                            }).limit(3); 
                        })
                    })
                    
                })
                
            })
        })    
    });
});

//Get menIndex
router.get('/men-product', (req, res) => {

    let categorySlugg = 'men';

        Category.findOne({slug: categorySlugg}, (err) => {
            Product.find({category: categorySlugg}, (err, men) => {
                if(err)
                res.status(500).json({ message: err.message });
                
                res.render('menindex', {
                    // title: c.slug.toUpperCase(),
                    title: 'Men Products',
                    men: men
                })  
            })
        })    
});


//Get womenIndex
router.get('/women-product', (req, res) => {

    let categorySlugg = 'women';

        Category.findOne({slug: categorySlugg}, (err) => {
            Product.find({category: categorySlugg}, (err, women) => {
                if(err)
                res.status(500).json({ message: err.message });
                
                res.render('womenindex', {
                    // title: c.slug.toUpperCase(),
                    title: 'Women Products',
                    women: women,
                })  
            })
        })    
});

router.get('/about', (req, res) => {
    res.render('about', {
        title: 'Joyz Store | About Us'
    });
})

router.get('/contact', (req, res) => {
    res.render('contact', {
        title: 'Joyz Store | Contact Us'
    });
});

router.get('/payment', (req, res) => {

    res.render('payment', {
        title: 'Joyz Store | Payment',
    });
});

router.post('/payment/card', (req, res) => {
   
    delete req.session.cart;
    
    req.flash('success', 'Purchase successful.');
    res.redirect('/cart/checkout')

})

// under $200
router.get('/two-hundred-price', (req, res) => {

    Product.find({ price : {"$lt" : 200}}, (err, products) => {
        // console.log(products);
        if(err){
            res.status(500).json({ message: err.message}); 
        } else {
            res.render('filter', {
                products: products,
                title: 'Products under $200'
            })
        }
    });    
})

//btw $100 - $200
router.get('/btw-hundred-price1', (req, res) => {

    Product.find({$and: [{price:{$gt: 100}}, {price:{$lt: 200}}]}, (err, products) => {
        // console.log(products);
        if(err){
            res.status(500).json({ message: err.message}); 
        } else {
            res.render('filter', {
                products: products,
                title: 'Products between $100 - $200'
            })
        }
    });  
})

//btw $200 - $300
router.get('/btw-hundred-price2', (req, res) => {

    Product.find({$and: [{price:{$gt: 200}}, {price:{$lt: 300}}]}, (err, products) => {
        // console.log(products);
        if(err){
            res.status(500).json({ message: err.message}); 
        } else {
            res.render('filter', {
                products: products,
                title: 'Products between $200 - $300'
            })
        }
    });  
})

//btw $300 - $400
router.get('/btw-hundred-price3', (req, res) => {

    Product.find({$and: [{price:{$gt: 300}}, {price:{$lt: 400}}]}, (err, products) => {
        // console.log(products);
        if(err){
            res.status(500).json({ message: err.message}); 
        } else {
            res.render('filter', {
                products: products,
                title: 'Products between $300 - $400'
            })
        }
    });  
})

//btw $400 - $500
router.get('/btw-hundred-price4', (req, res) => {

    Product.find({$and: [{price:{$gt: 400}}, {price:{$lt: 500}}]}, (err, products) => {
        // console.log(products);
        if(err){
            res.status(500).json({ message: err.message}); 
        } else {
            res.render('filter', {
                products: products,
                title: 'Products between $400 - $500'
            })
        }
    });  
})

//Over $500
router.get('/btw-hundred-price5', (req, res) => {

    Product.find({ price : {"$gt" : 500}}, (err, products) => {
        // console.log(products);
        if(err){
            res.status(500).json({ message: err.message}); 
        } else {
            res.render('filter', {
                products: products,
                title: 'Products over $500'
            })
        }
    });    
})

//discounts

//10%
router.get('/discount-ten', (req, res) => {

    Product.find({$and: [{discount_percentage: {$gte: "10%"}}, {discount_percentage:{$lt: "20%"}}]}, (err, products) => {
        if(err){
            res.status(500).json({ message: err.message}); 
        } else {
            res.render('discount_filter', {
                products: products,
                title: 'Products between 10% - 20% discount'
            })
        }
    });
});

//20%
router.get('/discount-twenty', (req, res) => {

    Product.find({$and: [{discount_percentage: {$gte: "20%"}}, {discount_percentage:{$lt: "30%"}}]}, (err, products) => {
        if(err){
            res.status(500).json({ message: err.message}); 
        } else {
            res.render('discount_filter', {
                products: products,
                title: 'Products between 20% - 30% discount'
            })
        }
    });
});

//30%
router.get('/discount-thirty', (req, res) => {

    Product.find({$and: [{discount_percentage: {$gte: "30%"}}, {discount_percentage:{$lte: "50%"}}]}, (err, products) => {
        if(err){
            res.status(500).json({ message: err.message}); 
        } else {
            res.render('discount_filter', {
                products: products,
                title: 'Products between 30% - 50% discount'
            })
        }
    });
});

//50%
router.get('/discount-fifty', (req, res) => {

    Product.find({$and: [{discount_percentage:{$gte: "50%"}}, {discount_percentage:{$lt: "60%"}}]}, (err, products) => {
        if(err){
            res.status(500).json({ message: err.message}); 
        } else {
            res.render('discount_filter', {
                products: products,
                title: 'Products between 50% - 60% discount'
            })
        }
    });
});

//60%
router.get('/discount-sixty', (req, res) =>{

    Product.find({discount_percentage : {"gte" : "60%"}}, (err, products) => {
        if(err){
            res.status(500).json({ message: err.message}); 
        } else {
            res.render('discount_filter', {
                products: products,
                title: 'Products between 60% discount'
            });
        }
    })
});

router.get('/:category', (req, res) => {

    let categorySlug = req.params.category;
    
    Category.findOne({slug: categorySlug}, (err) => {
        Product.find({category: categorySlug}, (err, products) => {
            if(err) {
                res.status(500).json({ message: err.message });
            } else {
                res.render('cat_products', {
                    title: req.params.category,
                    products: products
                })
            }     
        })
    })
});

module.exports = router;