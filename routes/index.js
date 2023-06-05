const express = require('express');
const router = express.Router();
const auth = require('../config/auth');
const isUser = auth.isUser;

//Get Product Model
let Product = require('../models/product');
//let Category Model
let Category = require('../models/category');
//let Order Model
let Order = require('../models/order');


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
                                                title: 'Joyz Store | Home',
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

router.get('/store/about', (req, res) => {
    res.render('about', {
        title: 'Joyz Store | About Us'
    });
})

router.get('/store/contact', (req, res) => {
    res.render('contact', {
        title: 'Joyz Store | Contact Us'
    });
});

router.get('/home/payment', isUser, (req, res) => {
    res.render('payment', {
        title: 'Joyz Store | Payment',
        cart: req.session.cart
    });
});

router.post('/home/payment/card', isUser, async (req, res) => {

    if (!req.session.cart) {
        return res.redirect('/cart/checkout');
    } 
    let cart = req.session.cart;
    const stripe = require('stripe')('sk_test_51MPPkRB0QZiULxUV9NtUI1ahGQ8tRF9YaFLfLNXZn2ZkX7UlKHrZLwWZ3Cf3qMR2uhF2JBiR8e6yM98YLCw3s7zA00J3KiTstE');
  // `source` is obtained with Stripe.js; see https://stripe.com/docs/payments/accept-a-payment-charges#web-create-token
  const charge = await stripe.charges.create({
    amount: req.body.total * 100, 
    currency: 'usd',
    source: req.body.stripeToken, 
    description: 'Joyz Store Charge',
  }, 
    function(err, charge) {
        if(err) {
            req.flash('error', err.message); //err.message produced by stripe
            return res.redirect('/home/payment');
        }
        let order = new Order({
            user: req.user,
            cart: cart,
            address: req.body.address,
            name: req.body.name,
            total: req.body.total,
            paymentId: charge.id
        })
        order.save(function(err) {
            if(err)
                return console.log(err);
            req.flash('success', 'Purchase was successful.');
            delete req.session.cart;
            res.redirect('/cart/checkout')
        })  
    });
})

// under $200
router.get('/home/two-hundred-price', (req, res) => {

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
router.get('/home/btw-hundred-price1', (req, res) => {

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
router.get('/home/btw-hundred-price2', (req, res) => {

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
router.get('/home/btw-hundred-price3', (req, res) => {

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
router.get('/home/btw-hundred-price4', (req, res) => {

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
router.get('/home/btw-hundred-price5', (req, res) => {

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
router.get('/home/discount-ten', (req, res) => {

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
router.get('/home/discount-twenty', (req, res) => {

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
router.get('/home/discount-thirty', (req, res) => {

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
router.get('/home/discount-fifty', (req, res) => {

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
router.get('/home/discount-sixty', (req, res) =>{

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

router.get('/joyz-store/category/:category', (req, res) => {

    let categorySlug = req.params.category;

        Category.findOne({slug: categorySlug}, (err) => {
            Product.find({category: categorySlug}, (err, products) => {
                if(err) {
                    res.status(500).json({ message: err.message });
                } else {
                    res.render('cat_products', {
                        title: req.params.category.toUpperCase(),
                        products: products
                    })
                }     
            })
        })
    
});

module.exports = router;