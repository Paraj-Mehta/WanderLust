const Listing = require("./models/listing.js");
const Review = require("./models/review.js");
const ExpressError = require("./utils/ExpressError.js");
const {ListingSchema} = require("./schema.js");
const {reviewSchema} = require("./schema.js");

// Middleware to check if user is logged in
module.exports.isLoggedIn = (req, res, next)=>{
    if(!req.isAuthenticated()){
        req.session.redirectUrl = req.originalUrl;
        req.flash("error", "You must login")
        return res.redirect("/login");
    }
    next();
}


// Middleware to save redirectUrl
module.exports.saveRedirectUrl = (req, res, next)=>{
    if(req.session.redirectUrl){
        res.locals.redirectUrl = req.session.redirectUrl;
    }

    next();
}

// Middleware to check if it is the owner 
module.exports.isOwner = async (req, res, next)=>{
        let {id} = req.params;
        let listing = await Listing.findById(id);
        if(!listing.owner._id.equals(res.locals.currUser._id)){
            req.flash("error", "You dont have permission to Edit this Listing");
            return res.redirect(`/listings/${id}`);
        }

        next();
}

// Validate function for server side validation (listing)
module.exports.ValidateListing = (req,res,next)=>{
    // validating listing schema using joi
    let {error} = ListingSchema.validate(req.body);
    if(error){
        let errMsg = error.details.map((el)=> el.message).join(",");
        throw new ExpressError(400, errMsg);
    }else{
        next();
    }
}

// Validate function for server side validation (review)
module.exports.ValidateReview = (req,res,next)=>{
    // validating review schema using joi
    let {error} = reviewSchema.validate(req.body);
    if(error){
        let errMsg = error.details.map((el)=> el.message).join(",");
        throw new ExpressError(400, errMsg);
    }else{
        next();
    }
}

// Middleware to check if it is the author 
module.exports.isReviewAuthor = async (req, res, next)=>{
        let {id, reviewId} = req.params;
        let review = await Review.findById(reviewId);
        if(!review.author.equals(res.locals.currUser._id)){
            req.flash("error", "You dont have permission to delete this review");
            return res.redirect(`/listings/${id}`);
        }
        next();
}