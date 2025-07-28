const express = require("express")
const mongoose = require("mongoose")
const Listing = require("./models/listing.js")
const path = require("path");
const methodOverride = require("method-override")
const ejsMate = require("ejs-mate");
const wrapAsync = require("./utils/wrapAsync.js")
const ExpressError = require("./utils/ExpressError.js")
const {ListingSchema} = require("./schema.js");
const app = express();

async function main(){
    await mongoose.connect('mongodb://127.0.0.1:27017/wanderlust');
}

main().then(()=>{
    console.log("Connected to DB")
}).catch((err)=>{
    console.log(err);
});

app.set("view engine","ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({extended: true}));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname,"/public")));
app.engine("ejs", ejsMate);


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

// Landing Page 
app.get("/",(req,res)=>{
    res.send("Server is working");
})


// Home Page for All listings
app.get("/listings", wrapAsync(async(req,res)=>{
    const allListing = await Listing.find({});
    res.render("listings/index.ejs" , {allListing});
})
)


// To add a new Listing form
app.get("/listings/add",(req,res)=>{
    res.render("listings/new.ejs");
})


// Show item page
app.get("/listings/:id", wrapAsync(async (req,res)=>{
    let {id} = req.params;
    const item = await Listing.findById(id);
    res.render("listings/show.ejs", {item});
})
)


// All Listings page after adding a new Listing
app.post("/listings", ValidateListing, wrapAsync(async (req,res)=>{
    let newListing = new Listing(req.body.listing);
    await newListing.save();
    res.redirect("/listings")
})
)


// To edit Listing form
app.get("/listings/:id/edit", wrapAsync(async (req,res)=>{
    let {id} = req.params;
    const item = await Listing.findById(id);
    res.render("listings/edit.ejs", {item});
})
)


// Listing after it is edited 
app.put("/listings/:id", ValidateListing, wrapAsync(async (req, res, next)=>{
        let {id} = req.params;
        await Listing.findByIdAndUpdate(id ,{...req.body.listing}); 
        res.redirect(`/listings/${id}`);
    })
)


// delete route 
app.delete("/listings/:id", wrapAsync(async (req,res)=>{
    let {id} = req.params;
    await Listing.findByIdAndDelete(id);
    res.redirect("/listings");
})
)


app.use((req, res, next)=>{
    next(new ExpressError(404, "PAGE NOT FOUND"));
});


// Error middelware
app.use((err, req, res, next)=>{
    let {statusCode=500, message="Something went wrong"} = err
    res.status(statusCode).render("error.ejs", {message})
})


app.listen(8080, ()=>{
    console.log("app is listening on: localhost:8080/")
})

