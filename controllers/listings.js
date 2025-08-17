const Listing = require("../models/listing.js")


// Function to show HOME page
module.exports.index = async(req,res)=>{
    const allListing = await Listing.find({});
    res.render("listings/index.ejs" , {allListing});
}

// Function to show New listing form 
module.exports.renderNewForm = (req,res)=>{
    res.render("listings/new.ejs");
}

// Function to show details of a listing
module.exports.showListing = async (req,res)=>{
    let {id} = req.params;
    const item = await Listing.findById(id).populate({path: "reviews", populate: {path: "author"}}).populate("owner");

    // Server side validation / mongoose validation 
    if(!item){
        req.flash("error", "Listing doesnt exist!")
        return res.redirect("/listings");
    }

    res.render("listings/show.ejs", {item});
}

// Function to render listing after adding a new listing
module.exports.newListing = async (req,res)=>{
    let newListing = new Listing(req.body.listing);
    newListing.owner = req.user._id;
    await newListing.save();
    req.flash("success", "New Listing added!")
    res.redirect("/listings")
}

// Funtion to render edit listings form 
module.exports.renderEditForm = async (req,res)=>{
    let {id} = req.params;
    const item = await Listing.findById(id);
    if(!item){
        req.flash("error", "Listing doesnt exist!")
        return res.redirect("/listings");
    }
    res.render("listings/edit.ejs", {item});
}

// Function to update the listing
module.exports.updateListing = async (req, res, next)=>{
    let {id} = req.params;
    await Listing.findByIdAndUpdate(id ,{...req.body.listing}); 
    req.flash("success", "Listing Updated!")
    res.redirect(`/listings/${id}`);
}

// Function to delete a listing
module.exports.deleteListing = async (req,res)=>{
    let {id} = req.params;
    await Listing.findByIdAndDelete(id);
    req.flash("success", "Listing Deleted!")
    res.redirect("/listings");
}