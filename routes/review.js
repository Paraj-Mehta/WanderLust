const express = require("express");
const router = express.Router({mergeParams: true});
const wrapAsync = require("../utils/wrapAsync");
const Listing = require("../models/listing.js");
const Review = require("../models/review.js");
const {isLoggedIn , isOwner, ValidateListing, ValidateReview, isReviewAuthor} = require("../middleware.js");


// add Reviews
router.post("/", isLoggedIn, ValidateReview , wrapAsync(async(req,res)=>{
    let listing = await Listing.findById(req.params.id)
    let newReview = new Review(req.body.review)
    newReview.author = req.user._id;

    listing.reviews.push(newReview)
    await newReview.save()
    await listing.save()
    req.flash("success", "New Review Added")

    res.redirect(`/listings/${listing._id}`)
}))

// Delete reviews
router.delete("/:reviewId", isReviewAuthor, wrapAsync(async(req,res)=>{
    let {id, reviewId} = req.params;

    await Listing.findByIdAndUpdate(id, {$pull: {reviews: reviewId}})
    await Review.findByIdAndDelete(reviewId);
    req.flash("success", "Review Deleted");

    res.redirect(`/listings/${id}`)
}))


module.exports = router;