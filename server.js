if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config()
  }

const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const session = require('express-session');
const ExpressValidator = require('express-validator');
const fileUpload = require('express-fileupload');
const passport = require('passport');

const app = express();

const port = process.env.port || 7000;

mongoose.set('strictQuery', false);

const connectDB = async () => {
    try {
      const conn = await mongoose.connect(process.env.MONGO_URI);
      console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
      console.log(error);
    //   process.exit(1);
    }
  }

//view engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

//public folder
app.use(express.static(path.join(__dirname, 'public')));

//set global errors variable
app.locals.errors = null;

// Get Category Model 
let Category = require('./models/category');

// Get all categories to pass to header.ejs
Category.find(function (err, categories) {
    if (err) {
        console.log(err);
    } else {
        app.locals.categories = categories;
    }   
});

//express fileupload middleware
app.use(fileUpload());

//bodyParser middleware
app.use(bodyParser.urlencoded({ extended : false }));
app.use(bodyParser.json());

//Express session
const expiryDate = new Date(Date.now() + 60 * 60 * 1000) // 1 hour

// app.set('')
app.use(session({
  name: 'session',
  keys: ['key1', 'key2'],
  cookie: {
    secure: true,
    httpOnly: true,
    domain: 'example.com',
    path: '/',
    expires: expiryDate
  }
}))

//Express validator middleware
app.use(ExpressValidator({
    errorFormatter: function(param, msg, value) {
        var namespace = param.split('.')
        , root = namespace.shift()
        , formParam = root;

        while(namespace.length) {
            formParam +='[' + namespace.shift() + ']';
        }
        return {
            param : formParam,
            msg: msg,
            value: value
        };
    },
    //custom validator image
    customValidators : {
        isImage : function(value, filename) {
            let extension = (path.extname(filename)).toLowerCase();
            switch (extension) {
                case '.jpg':
                    return '.jpg';
                case '.jpeg':
                    return '.jpeg';
                case '.png':
                    return '.png';
                case '':
                    return '.jpg';
                default:
                    return false;
            }
        }
    }
}));

// Express Messages middleware : NB: you need to install connect-flash too
app.use(require('connect-flash')());
app.use(function (req, res, next) {
    res.locals.messages = require('express-messages') (req, res);
    next();
});

//Passport Config
require('./config/passport')(passport);

//Passport Middleware
app.use(passport.initialize());
app.use(passport.session());

app.get('*', (req, res, next) => {
    res.locals.cart = req.session.cart;
    res.locals.user = req.user || null;
    next()
})

const index = require('./routes/index');
const products = require('./routes/products.js');
const cart = require('./routes/cart.js');
const user = require('./routes/user.js');
const adminCategories = require('./routes/admin_categories');
const adminProducts = require('./routes/admin_products');

app.use('/admin/categories', adminCategories);
app.use('/admin/products', adminProducts);
app.use('/products', products);
app.use('/cart', cart);
app.use('/user', user);
app.use('/home/product', index);
app.use('/', index);

// displaying 404 page if the route does not exist.
app.use((req, res) => {
    // res.status(404).sendFile(path.join(rootDir, 'views', '404.html'));
    res.status(404).render('404.ejs', {
        title: 'Page not Found'
    });
});

//Connect to the database before listening
connectDB().then(() => {
    app.listen(port, () => {
        console.log("listening for requests");
    })
})