const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync");
const Listing = require("../models/listing.js");
const {isLoggedIn , isOwner, ValidateListing} = require("../middleware.js");

// Home Page for All listings
router.get("/", wrapAsync(async(req,res)=>{
    const allListing = await Listing.find({});
    res.render("listings/index.ejs" , {allListing});
})
)


// To add a new Listing form
router.get("/add", isLoggedIn ,(req,res)=>{
    res.render("listings/new.ejs");
})


// Show item page
router.get("/:id", wrapAsync(async (req,res)=>{
    let {id} = req.params;
    const item = await Listing.findById(id).populate({path: "reviews", populate: {path: "author"}}).populate("owner");
    if(!item){
        req.flash("error", "Listing doesnt exist!")
        return res.redirect("/listings");
    }
    res.render("listings/show.ejs", {item});
})
)


// All Listings page after adding a new Listing
router.post("/", isLoggedIn, ValidateListing, wrapAsync(async (req,res)=>{
    let newListing = new Listing(req.body.listing);
    newListing.owner = req.user._id;
    await newListing.save();
    req.flash("success", "New Listing added!")
    res.redirect("/listings")
})
)


// To edit Listing form (edit karna padega)
router.get("/:id/edit", isLoggedIn, isOwner, wrapAsync(async (req,res)=>{
    let {id} = req.params;
    const item = await Listing.findById(id);
    if(!item){
        req.flash("error", "Listing doesnt exist!")
        return res.redirect("/listings");
    }
    res.render("listings/edit.ejs", {item});
})
)


// Listing after it is edited 
router.put("/:id", isLoggedIn, isOwner, ValidateListing, wrapAsync(async (req, res, next)=>{
        let {id} = req.params;
        await Listing.findByIdAndUpdate(id ,{...req.body.listing}); 
        req.flash("success", "Listing Updated!")
        res.redirect(`/listings/${id}`);
    })
)


// delete route  (edit karna padega)
router.delete("/:id", isLoggedIn, isOwner, wrapAsync(async (req,res)=>{
    let {id} = req.params;
    await Listing.findByIdAndDelete(id);
    req.flash("success", "Listing Deleted!")
    res.redirect("/listings");
})
)

module.exports = router;