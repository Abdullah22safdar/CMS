const express = require('express');
const router = express.Router();
const faker = require('faker');
const Posts = require('../../models/posts');
const categories = require('../../models/categories');
const comments = require('../../models/comments');
const {userAuthenticate} = require('../../helpers/authenticate');

router.get('/*',userAuthenticate,(req,res,next)=>{
    req.app.locals.layout = 'admin';
    next();
})

router.get('/',(req,res)=>{

    const promises = [
        Posts.count().exec(),
        categories.count().exec(),
        comments.count().exec()
    ]

    Promise.all(promises).then(([postCount,categoriesCount,commentsCount])=>{
        res.render('admin/index',{postCount: postCount, categoriesCount: categoriesCount, commentsCount:commentsCount});

    }).catch()

})

router.post('/generate-fake-posts',(req,res)=>{

    for (let i= 0; i<=req.body.amount; i++)
    {
        let post = new Posts();
        post.user = req.user.id;
        post.title = faker.name.title();
        post.status = 'public';
        post.allowComments = faker.random.boolean();
        post.body = faker.lorem.sentence();
        post.slug = faker.name.title();
        post.save().then().catch();
    }
    res.redirect('/admin/posts');

})


module.exports = router