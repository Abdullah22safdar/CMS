const express = require('express');
const router = express.Router();
const Posts = require('../../models/posts')
const Category = require('../../models/categories')
const User = require('../../models/User')
const bcrypt = require('bcryptjs')
const passport = require('passport')
const LocalStrategy = require('passport-local').Strategy


router.get('/*',(req,res,next)=>{
    req.app.locals.layout = 'home';
    next();
})
router.get('/',(req,res)=>{

    const perPage = 10;
    const page = req.query.page || 1;
    Posts.find({})
        .skip((perPage * page) - perPage)
        .limit(perPage)
        .then(posts=>{
            Posts.count().then(postCount=>{
                Category.find({}).then(category=>{
                    res.render('home/index',
                            {   posts: posts,
                                category: category,
                                current: parseInt(page),
                                pages: Math.ceil(postCount/perPage)
                            });
                }).catch();
            }).catch();

    }).catch();
})

router.get('/about',(req,res)=>{
    res.render('home/about')
})

router.get('/login',(req,res)=>{
    res.render('home/login')
})

//App Login

passport.use(new LocalStrategy({usernameField: 'email'},
    function(email, password, done) {
        User.findOne({email: email }).then(user=>{

            if (!user) {
                return done(null, false, { message: 'Incorrect email.' });
            }

            bcrypt.compare(password, user.password,(err,matched)=>{
                if(err) return err;
                if(!matched){
                    return done(null, false, { message: 'Incorrect password.' });
                }else {
                    return done(null, user);
                }

            })
           /* console.log(user.validPassword(password, user.password))
            if (user.validPassword(password, user.password)) {
                return done(null, false, { message: 'Incorrect password.' });
            }
            return done(null, user);*/
        });
    }
));

passport.serializeUser(function(user, done) {
    done(null, user.id);
});

passport.deserializeUser(function(id, done) {
    User.findById(id, function(err, user) {
        done(err, user);
    });
});
router.post('/login',(req,res,next)=>{
    passport.authenticate('local', {
        successRedirect: '/admin',
        failureRedirect: '/login',
        failureFlash: true
    })(req,res,next);
})

router.get('/logout', function(req, res){
    req.logout();
    res.redirect('/login');
});


router.get('/register',(req,res)=>{
    res.render('home/register')
})
router.post('/register',(req,res)=>{
    let errors = [];
     if(!req.body.firstName)
     {
         errors.push({message: 'Please add first name'});
     }
    if(!req.body.lastName)
    {
        errors.push({message: 'Please add last name'});
    }
    if(!req.body.email)
    {
        errors.push({message: 'Please enter the email'});
    }
    if (req.body.password === '')
    {
        errors.push({message: 'please enter password '})
    }
    if(req.body.password !== req.body.passwordConfirm )
    {
        errors.push({message: 'password doesnot matches'});
    }

    if (errors.length > 0)
    {

        res.render('home/register',{errors: errors,
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email});

    }else{

        User.findOne({email: req.body.email}).then(user=>{
            if(user)
            {
                req.flash('error_message','User email already exists!');
                res.redirect('/register');
            }else {

                const newUser = new User({
                    firstName: req.body.firstName,
                    lastName: req.body.lastName,
                    email: req.body.email,
                    password: req.body.password
                })

                bcrypt.genSalt(10, function(err, salt) {
                    bcrypt.hash(newUser.password, salt, function(err, hash) {
                        newUser.password = hash;

                        newUser.save().then(userSaved=>{
                            req.flash('success-message','Post was created successfully!');
                            res.redirect('/login');
                        }).catch();
                    });
                });
            }

        }).catch();
    }

})

router.get('/post/:slug',(req,res)=>{
    Posts.findOne({slug: req.params.slug}).populate({path:'comments',match:{approveComment: true}, populate: {path: 'user', model:'users' }}).populate('user')
        .then(post=>{

        Category.find({}).then(category=>{

            res.render('home/post',{post:post, category: category});
        }).catch();
    }).catch();

})
module.exports = router

