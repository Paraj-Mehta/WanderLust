const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync");
const User = require("../models/user.js");
const passport = require("passport");
const { saveRedirectUrl } = require("../middleware.js");

router.get("/signup", (req,res)=>{
    res.render("user/signup.ejs");
})

router.post("/signup" , wrapAsync(async(req,res)=>{
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
}))

router.get("/login", (req,res)=>{
    res.render("user/login.ejs");
})

router.post("/login", saveRedirectUrl ,passport.authenticate("local", {failureRedirect: "/login" , failureFlash: true}) ,wrapAsync(async(req,res)=>{
    req.flash("success","Welcome back to Wanderlust!!");
    let redirectUrl = res.locals.redirectUrl || "/listings"
    res.redirect(redirectUrl);
    
}))

router.get("/logout", (req,res,next)=>{
    req.logout((err)=>{
        if(err){
            return next(err);
        }
        req.flash("success", "You are logged out");
        res.redirect("/listings");
    })
})

module.exports = router;