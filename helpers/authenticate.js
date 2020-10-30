module.exports = {


    userAuthenticate: (req,res,next)=>{

        if(req.isAuthenticated())
        {
            return next();
        }
        res.redirect('/login');
    }
}