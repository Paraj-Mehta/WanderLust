const express = require("express");
const router = express.Router({mergeParams: true});
const wrapAsync = require("../utils/wrapAsync");
const Listing = require("../models/listing.js");
const Review = require("../models/review.js");
const {isLoggedIn , isOwner, ValidateListing, ValidateReview, isReviewAuthor} = require("../middleware.js");
const reviewController = require("../controllers/reviews.js");


// add Reviews
router.post("/", isLoggedIn, ValidateReview , wrapAsync(reviewController.createReview))

// Delete reviews
router.delete("/:reviewId", isReviewAuthor, wrapAsync(reviewController.deleteReview))


module.exports = router;