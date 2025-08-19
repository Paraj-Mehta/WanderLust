const Listing = require("../models/listing.js")
const cloudinary = require("../cloudinaryConfig");
const streamifier = require("streamifier");


// Function to show HOME page
module.exports.index = async(req,res)=>{
  const { category, location } = req.query; 

  let filter = {};
  if (category) {
    filter.categories = category;
  }

  if (location) {
    filter.location = { $regex: location, $options: "i" };
  }
    const allListing = await Listing.find(filter);
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
    try {
        let {listing} = req.body;
        let categories = listing.categories;

        if(categories){
            categories = Array.isArray(categories) ? categories : [categories];
        }else{
            categories = [];
        }

        let newListing = new Listing({...listing, categories});
        newListing.owner = req.user._id;

        if (req.file) {
        // Convert buffer to stream and upload to Cloudinary
        const result = await new Promise((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream(
            { folder: "Wanderlust" }, //  Cloudinary folder
            (error, result) => {
                if (result) resolve(result);
                else reject(error);
            }
            );
            streamifier.createReadStream(req.file.buffer).pipe(stream);
        });

        newListing.image ={ url: result.secure_url,filename: result.original_filename}; //save to DB
        }

        await newListing.save();
        req.flash("success", "New Listing added!")
        res.redirect("/listings")
        }catch (err) {
        req.flash("error", err.message);
        res.redirect("/listings");
  }
}

// Funtion to render edit listings form 
module.exports.renderEditForm = async (req,res)=>{
    let {id} = req.params;
    const item = await Listing.findById(id);

    if(!item){
        req.flash("error", "Listing doesnt exist!")
        return res.redirect("/listings");
    }

    let originalUrl = item.image.url;
    originalUrl = originalUrl.replace("/upload", "/upload/w_250")
    res.render("listings/edit.ejs", {item, originalUrl});
}

// Function to update the listing
module.exports.updateListing = async (req, res, next)=>{
    let {id} = req.params;
    let listing = await Listing.findByIdAndUpdate(id ,{...req.body.listing}); 

            if (req.file) {
        // Convert buffer to stream and upload to Cloudinary
        const result = await new Promise((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream(
            { folder: "Wanderlust" }, //  Cloudinary folder
            (error, result) => {
                if (result) resolve(result);
                else reject(error);
            }
            );
            streamifier.createReadStream(req.file.buffer).pipe(stream);
            });

            listing.image ={ url: result.secure_url,filename: result.original_filename};   // save filename in DB
            await listing.save()
        }

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