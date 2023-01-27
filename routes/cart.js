const express = require('express');
const router = express.Router();

//Get the Product Model
let Product = require("../models/product");

//Add product to cart
router.get('/add/:product', (req, res) => {

    let slug = req.params.product;

    Product.findOne({ slug: slug }, (err, p) => {
        if (err)
            console.log(err);

        //check if session cart is undefined : product not in cart
        if (typeof req.session.cart == "undefined") {
            req.session.cart = [];
            //push product to cart
            req.session.cart.push({
                title: slug,
                qty: 1,
                price: parseFloat(p.price).toFixed(2),
                discount_price: parseFloat(p.discount_price).toFixed(2),
                image: '/product_images/' + p._id + '/' + p.image
            })
            //if the cart exist 
        } else {
            let cart = req.session.cart;
            let newItem = true;

            //looping through cart array : incrementing
            for (let i = 0; i < cart.length; i++) {
                if (cart[i].title == slug) {
                    cart[i].qty++
                    newItem = false;
                    break;
                }
            }

            //check if newItem is true, if it is true then add a new item
            if (newItem) {
                //adding a new item
                cart.push({
                    title: slug,
                    qty: 1,
                    price: parseFloat(p.price).toFixed(2),
                    discount_price: parseFloat(p.discount_price).toFixed(2),
                    image: '/product_images/' + p._id + '/' + p.image
                })
            }
        }
        //console.log(req.session.cart);
        req.flash('success', 'Product added to cart');
        res.redirect('back');
    })

});

//Get Checkout Page
router.get('/checkout', (req, res) => {

    //the cart should not display if it has been cleared with action remove
    if (req.session.cart && req.session.cart.length == 0) {
        delete req.session.cart;
        res.redirect('/cart/checkout');
    } else {
        res.render('checkout', {
            title: 'checkout',
            cart: req.session.cart
        });
    }
   
})

//Get Update Product : + and -
router.get('/update/:product', (req, res) => {
    let slug = req.params.product;

    let cart = req.session.cart;
    let action = req.query.action;

    for(let i = 0; i < cart.length; i++) {
        if(cart[i].title == slug) {
            switch(action) {
                case "add" :
                    cart[i].qty++;
                    break;
                case "remove" :
                    cart[i].qty--;
                    if(cart[i].qty < 1) cart.splice(i, 1);
                    break;
                case "clear" :
                    cart.splice(i, 1);
                    if(cart.length == 0) delete req.session.cart;
                    break;
                default:
                    res.status(200).json({ message });
                    break;
            }
            break;
        }
    }

    req.flash('success', 'Cart updated!');
    res.redirect('/cart/checkout');
});

//Get clear cart
router.get('/clear', function(req, res) {

    delete req.session.cart;

    req.flash('success', 'Cart deleted.');
    res.redirect('/cart/checkout');
})


module.exports = router;