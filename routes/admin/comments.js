const express = require('express');
const router = express.Router();
Comment = require('../../models/comments')
Post = require('../../models/posts')

router.get('/*',(req,res,next)=>{
    req.app.locals.layout = 'admin';
    next();
});

router.get('/',(req,res)=>{


    Comment.find({user: req.user.id}).populate('user').  then(comment=>{

        res.render('admin/comments/index',{comments: comment});
    })


})


router.post('/',(req,res)=>{

    Post.findOne({_id: req.body.id}).then(post=>{

        const newComments = new Comment({
            user: req.user.id,
            body: req.body.body
        });

        post.comments.push(newComments);
        post.save().then(savedPost=>{

            newComments.save().then(savedPost=>{
                req.flash('success-message','Your comment will be reviewed in a moment');
                res.redirect(`/post/${post.id}`);
            }).catch();
        }).catch();


    }).catch();
})

router.delete('/:id',(req,res)=>{
    Comment.findOne({_id: req.params.id}).then(comment=>{
        comment.remove().then(deleted=>{
            Post.findOneAndUpdate({comments: req.params.id},{$pull: {comments: req.params.id}}, (err, data)=>{

                res.redirect('/admin/comments');

            })

        })

    }).catch();
})

router.post('/approve-comment',(req,res)=>{
    console.log(req.body.id)
    Comment.findByIdAndUpdate(req.body.id,{$set: {approveComment: req.body.approveComment}},(err,result)=>{
        if (err) return err;
        res.send(result)
    })
})
module.exports = router