const express = require("express");
const mongoose = require("mongoose");
const Listing = require("./models/listing.js");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const app = express();

async function main(){
    await mongoose.connect('mongodb://127.0.0.1:27017/wanderlust');
}

main().then(()=>{
    console.log("Connected to DB")
}).catch((err)=>{
    console.log(err);
});

app.set("view-engine","ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({extended: true}));
app.use(methodOverride("_method"));
app.engine("ejs", ejsMate);
app.use(express.static(path.join(__dirname,"/public")));

// Landing Page 
app.get("/",(req,res)=>{
    res.send("Server is working");
})


// Home Page or All listing page
app.get("/listings", async(req,res)=>{
    const allListing = await Listing.find({});
    res.render("listings/index.ejs" , {allListing});
})


// New form
app.get("/listings/add",(req,res)=>{
    res.render("listings/new.ejs");
})


// Show item page
app.get("/listings/:id", async (req,res)=>{
    let {id} = req.params;
    const item = await Listing.findById(id);
    res.render("listings/show.ejs", {item});
})


// add new page
app.post("/listings",async (req,res)=>{
    let newListing = new Listing(req.body.listing);
    await newListing.save();
    res.redirect("/listings")
})


// edit route
app.get("/listings/:id/edit", async (req,res)=>{
    let {id} = req.params;
    const item = await Listing.findById(id);
    res.render("listings/edit.ejs", {item});
})


// edited routed
app.put("/listings/:id", async (req,res)=>{
    let {id} = req.params;
    await Listing.findByIdAndUpdate(id ,{...req.body.listing}); 
    res.redirect(`/listings/${id}`);
})


// delete route 
app.delete("/listings/:id", async (req,res)=>{
    let {id} = req.params;
    await Listing.findByIdAndDelete(id);
    res.redirect("/listings");
})

app.listen(8080, ()=>{
    console.log("app is listening on: localhost:8080/")
})






// app.get("/testListing" , async (req,res)=>{
//     let sampleListing = new Listing({
//         title : "My New Villa",
//         description : "By the beach",
//         price: 1200,
//         location: "Calangute, Goa",
//         country: "India"
//     });

//     await sampleListing.save();
//     console.log("sample saved");
//     res.send("Successful testing");
// })