const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync");
const Listing = require("../models/listing.js");
const ExpressError = require("../utils/ExpressError.js");
const {ListingSchema} = require("../schema.js")

// Validate function for server side validation
const ValidateListing = (req,res,next)=>{
    // validating listing schema using joi
    let {error} = ListingSchema.validate(req.body);
    if(error){
        let errMsg = error.details.map((el)=> el.message).join(",");
        throw new ExpressError(400, errMsg);
    }else{
        next();
    }
}

// Home Page for All listings
router.get("/", wrapAsync(async(req,res)=>{
    const allListing = await Listing.find({});
    res.render("listings/index.ejs" , {allListing});
})
)


// To add a new Listing form
router.get("/add",(req,res)=>{
    res.render("listings/new.ejs");
})


// Show item page
router.get("/:id", wrapAsync(async (req,res)=>{
    let {id} = req.params;
    const item = await Listing.findById(id).populate("reviews");
    if(!item){
        req.flash("error", "Listing doesnt exist!")
        return res.redirect("/listings");
    }
    res.render("listings/show.ejs", {item});
})
)


// All Listings page after adding a new Listing
router.post("/", ValidateListing, wrapAsync(async (req,res)=>{
    let newListing = new Listing(req.body.listing);
    await newListing.save();
    req.flash("success", "New Listing added!")
    res.redirect("/listings")
})
)


// To edit Listing form
router.get("/:id/edit", wrapAsync(async (req,res)=>{
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
router.put("/:id", ValidateListing, wrapAsync(async (req, res, next)=>{
        let {id} = req.params;
        await Listing.findByIdAndUpdate(id ,{...req.body.listing}); 
        req.flash("success", "Listing Updated!")
        res.redirect(`/listings/${id}`);
    })
)


// delete route 
router.delete("/:id", wrapAsync(async (req,res)=>{
    let {id} = req.params;
    await Listing.findByIdAndDelete(id);
    req.flash("success", "Listing Deleted!")
    res.redirect("/listings");
})
)

module.exports = router;