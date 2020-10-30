const express = require('express');
const app = express();
const path = require('path')
const Handlebars = require('handlebars')
const exphbs = require('express-handlebars');
const {allowInsecurePrototypeAccess} = require('@handlebars/allow-prototype-access')
const mongoose = require('mongoose')
const upload = require('express-fileupload');
const session = require('express-session');
const flash = require('connect-flash');
const {mongoDbUrl} = require('./config/database')
const passport = require('passport')

//Helper function

app.use(upload());


//Mongoose connection
mongoose.connect(mongoDbUrl,{ useNewUrlParser: true,useUnifiedTopology: true } ).then(db=>{
    console.log(`${db} connected`)
}).catch(err=>{
    console.log(err)
})

// file upload



// Body Parser
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

app.use(express.static(path.join(__dirname,'public')));

//Set View Engine
const {select, dateFormat, paginate} = require('./helpers/handlebars-helper');
app.engine('handlebars',exphbs({defaultLayout: 'home', handlebars: allowInsecurePrototypeAccess(Handlebars),helpers: {select: select, dateFormat: dateFormat, paginate: paginate},}))
app.set('view engine','handlebars');

//method Override
const methodOverRide = require('method-override');
app.use(methodOverRide('_method'));

//Sessions and flash
app.use(session({
    secret: '123456',
    resave: true,
    saveUninitialized: true
}));

app.use(flash());

//Passport
app.use(passport.initialize());
app.use(passport.session());

//local variables using middlewares

app.use((req,res,next)=>{
    res.locals.user = req.user || null;
    res.locals.success_message = req.flash('success-message');
    res.locals.error_message = req.flash('error_message');
    res.locals.error = req.flash('error');
    next();
})

//Load Routes
const home = require('./routes/home/index');
const admin = require('./routes/admin/index');
const post = require('./routes/admin/posts');
const categories = require('./routes/admin/categories');
const comments = require('./routes/admin/comments');

//Use Routes
app.use('/',home);
app.use('/admin',admin);
app.use('/admin/posts',post);
app.use('/admin/categories',categories);
app.use('/admin/comments',comments);


app.listen(4444,()=>{
    console.log("Listening on port");
})