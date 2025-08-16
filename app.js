const express = require("express")
const mongoose = require("mongoose")
const path = require("path");
const methodOverride = require("method-override")
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError.js")
const app = express();
const listing = require("./routes/listing.js");
const review = require("./routes/review.js");
const session = require("express-session");
const sessionOptions = require("./secret.js");
const flash = require("connect-flash");

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

// Landing Page 
app.get("/",(req,res)=>{
    res.send("Server is working");
})

app.use(session(sessionOptions));
app.use(flash());

app.use((req,res,next)=>{
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    next();
})

app.use("/listings", listing);
app.use("/listings/:id/reviews", review);


// Found not found error handling (if someone sends a req on a not recoginsed path)
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

