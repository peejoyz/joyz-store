if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config()
}

const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const MongoStore = require('connect-mongo');
const ExpressValidator = require('express-validator');
const fileUpload = require('express-fileupload');
const passport = require('passport');
const auth = require('./config/auth.js');
const isUser = auth.isUser;
const app = express();
const port = process.env.port || 8000;

mongoose.set('strictQuery', false);
const connectDB = async () => {
    try {
      const conn = await mongoose.connect(process.env.MONGO_URI);
      console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
      console.log(error);
      process.exit(1);
    }
}

//Passport Config
require('./config/passport.js')(passport);

//view engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

//public folder
app.use(express.static(path.join(__dirname, 'public')));

//set global errors variable
app.locals.errors = null;

// Get Category Model 
let Category = require('./models/category.js');

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
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser("cookie-parser-secret"));
app.set('trust proxy', 1) // trust first proxy
//Express session
app.use(session({
    secret: process.env.secret,  
    resave: process.env.resave,
    saveUninitialized: process.env.saveUninitialized, 
    store: MongoStore.create({
        mongoUrl: process.env.MONGO_URI
        // touchAfter: process.env.touchAfter
    }), 
    cookie: {
        // secure: process.env.secure,
        // maxAge: 180 * 60 * 1000,
        // secure: true 
        maxAge: null,
        // path: '/'
    }
}))

// app.use(express.session({cookie: {path: '/', httpOnly:true, maxAge: null}, secret:'eeuqram'}))

//Passport Middleware
app.use(passport.initialize());
app.use(passport.session());
// app.use(passport.authenticate('session'));

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
// app.get('*', (req, res, next) => {
//     res.locals.login = req.isAuthenticated();
//     res.locals.cart = req.session.cart; 
//     res.locals.session = req.session; 
//     res.locals.user =  req.user || null; 
//     next()  
 // res.locals.user = req.user || null;
    // res.locals.user = req.isUser; 
    // res.locals.user = req.session;
    // res.locals.user = req.session.cart;
    // res.locals.user = req.isAuthenticated(); 
// })

app.get('*', (req, res, next) => {
    res.locals.cart = req.session.cart;
    res.locals.user = req.user || null;
    next();
})

// app.use(function(req, res, next) {
//     res.locals.login = req.isAuthenticated();
//     res.locals.cart = req.session.cart; 
//     res.locals.session = req.session; 
//     res.locals.user =  req.user || null; 
//     next()
// })
const index = require('./routes/index');
const products = require('./routes/products.js');
const cart = require('./routes/cart.js');
const user = require('./routes/user.js');
const adminCategories = require('./routes/admin_categories.js');
const adminProducts = require('./routes/admin_products.js');

app.use('/admin/categories', adminCategories);
app.use('/admin/products', adminProducts);
app.use('/products', products);
app.use('/cart', cart);
app.use('/user', user);
app.use('/home/product', index);
app.use('/', index);

// displaying 404 page if the route does not exist.
app.use((req, res) => {
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