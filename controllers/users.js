const User = require("../models/user.js");

// Function to render signUp form
module.exports.renderSignUpForm = (req,res)=>{
    res.render("user/signup.ejs");
}

// Function to handle sign Up and redirect to all listings 
module.exports.signUp = async(req,res)=>{
    try{
        let {username, email, password} = req.body;
        const newUser = new User({email, username});
        const regiteredUser = await User.register(newUser, password);

        req.login(regiteredUser, (err)=>{
        if(err){
            return next(err);
        }
        req.flash("success" , "New user Registered")
        res.redirect("/listings");
    })
    }catch(e){
        req.flash("error", e.message);
        res.redirect("/signup");
    }
}

// Function to render login form
module.exports.renderLoginForm = (req,res)=>{
    res.render("user/login.ejs");
}

// Function to login
module.exports.login = async(req,res)=>{
    req.flash("success","Welcome back to Wanderlust!!");
    let redirectUrl = res.locals.redirectUrl || "/listings"
    res.redirect(redirectUrl);
    
}

// function to logout
module.exports.logout = (req,res,next)=>{
    req.logout((err)=>{
        if(err){
            return next(err);
        }
        req.flash("success", "You are logged out");
        res.redirect("/listings");
    })
}