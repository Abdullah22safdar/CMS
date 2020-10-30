const express = require('express');
const router = express.Router()
const Posts = require('../../models/posts')
const categories = require('../../models/categories')
const fs = require('fs');
const { isEmpty, uploadDir } = require('../../helpers/upload-helpers')
const {userAuthenticate} = require('../../helpers/authenticate')

router.get('/*',userAuthenticate,(req,res,next)=>{
    req.app.locals.layout = 'admin';
    next();
})

router.get('/',(req,res)=>{

    Posts.find({}).populate('category').then(post=>{

        res.render('admin/posts', {posts:post});

    });

});

router.get('/user-posts',(req,res)=>{

    Posts.find({user:req.user.id}).populate('category').then(post=>{

        res.render('admin/posts/user-posts', {posts:post});

    });

});


router.get('/create',(req,res)=>{
    categories.find({}).then(categories=>{
        res.render('admin/posts/create',{categories:categories});
    }).catch();

})


router.post('/create',(req,res)=>{

    let errors = [];

    if(!req.body.title){
        errors.push({message:'Title field is required'})
    }
    if(!req.body.body){
        errors.push({message:'Body field is required'})
    }

    if(errors.length > 0)
    {
        res.render('admin/posts/create',{error: errors})
    }else {
        let filename = '';
        if (!isEmpty(req.files)) {
            let file = req.files;
            filename = Date.now() + '-' + file.file.name;

            file.file.mv('./public/uploads/' + filename, (err) => {
                if (err) throw err;
            });

        }

        console.log(filename);
        let allowComments = true;
        if (req.body.allowComments) {
            allowComments = true;
        } else {
            allowComments = false;
        }
        const newPost = new Posts({
            user: req.user.id,
            title: req.body.title,
            status: req.body.status,
            category: req.body.category,
            allowComments: allowComments,
            body: req.body.body,
            file: filename

        });

        newPost.save().then(dataSaved => {
            req.flash('success-message','Post was created successfully!');
            res.redirect('/admin/posts');
        }).catch(err => {
            console.log(err);
        });


    }

})

router.get('/edit/:id',(req,res)=>{

    Posts.findOne({_id: req.params.id}).then(post=>{

        categories.find({}).then(categories=>{

            res.render('admin/posts/edit', {posts: post, categories: categories});

        }).catch();

    });

})

router.put('/edit/:id',(req,res)=>{

    Posts.findOne({_id: req.params.id}).then(posts=>{
        if(req.body.allowComments) {
            allowComments = true;
        }else {
            allowComments = false;
        }
        user: req.user.id,
        posts.title = req.body.title;
        posts.status = req.body.status;
        posts.category = req.body.category;
        posts.allowComments = allowComments;
        posts.body = req.body.body;

        if (!isEmpty(req.files)) {
            let file = req.files;
            filename = Date.now() + '-' + file.file.name;
            posts.file = filename;
            file.file.mv('./public/uploads/' + filename, (err) => {
                if (err) throw err;
            });

        }


        posts.save().then(()=>{
            res.redirect('/admin/posts/user-posts')
        }).catch();
    }).catch(err=>{
        console.log("Id not found")
    });
});

router.delete('/:id',(req,res)=>{

    Posts.findOne({_id: req.params.id}).populate('comments').then(post=>{

        fs.unlink(uploadDir+post.file,err=>{

            console.log(post.comments);
            if(!post.comments.length < 1)
            {
                console.log("insidednwjdsxnflk")
                post.comments.forEach(comment=>{
                    comment.remove();
                })

            }
            post.remove();
            res.redirect('/admin/posts/user-posts')
        })


    }).catch();

});

module.exports = router