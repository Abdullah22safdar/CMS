const express = require('express');
const router = express.Router();
const categories = require('../../models/categories')
const {userAuthenticate} = require('../../helpers/authenticate');


router.get('/*',userAuthenticate,(req,res,next)=>{
    req.app.locals.layout = 'admin';
    next();
});

router.get('/',(req,res)=>{
    categories.find({}).then(categories=>{
        res.render('admin/categories/index',{categories: categories});
    }).catch();

});


router.post('/create',(req,res)=>{
    const newCategory = categories({
        name: req.body.name
    });

    newCategory.save().then(savedCategory=>{
        res.redirect('/admin/categories');
    }).catch();
})

router.get('/edit/:id',(req,res)=>{
    categories.findOne({_id:req.params.id}).then(category=>{
        res.render('admin/categories/edit',{category:category});
    }).catch();
})

router.put('/edit/:id',(req,res)=>{
    categories.findOne({_id: req.params.id}).then(category=>{
        category.name = req.body.name;
        category.save().then(categoryUpdated=>{
            res.redirect('/admin/categories');
        }).catch();
    }).catch();
})

router.delete('/delete/:id',(req,res)=>{
    categories.findOne({_id:req.params.id}).then(category=>{
        category.remove().then(categoryDeleted=>{
            res.redirect('/admin/categories');
        }).catch();
    }).catch();
})


module.exports = router;