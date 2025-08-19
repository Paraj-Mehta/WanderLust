const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync");
const Listing = require("../models/listing.js");
const {isLoggedIn , isOwner, ValidateListing} = require("../middleware.js");
const upload = require("../upload.js")

// Importing contollers
const listingController = require("../controllers/listings.js");


router.route("/")
    .get( wrapAsync(listingController.index))
    .post( isLoggedIn, upload.single("listing[image]"), ValidateListing, wrapAsync(listingController.newListing))

// To add a new Listing form
router.get("/add", isLoggedIn ,listingController.renderNewForm)


router.route("/:id")
    .get( wrapAsync(listingController.showListing))
    .put( isLoggedIn, isOwner, upload.single('listing[image]'), ValidateListing, wrapAsync(listingController.updateListing))
    .delete( isLoggedIn, isOwner, wrapAsync(listingController.deleteListing))


    // To edit Listing form (edit karna padega)
router.get("/:id/edit", isLoggedIn, isOwner, wrapAsync(listingController.renderEditForm))


module.exports = router;