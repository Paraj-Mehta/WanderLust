if(process.env.NODE_ENV != "production"){
    require('dotenv').config();
}

const express = require("express")
const mongoose = require("mongoose")
const path = require("path");
const methodOverride = require("method-override")
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError.js")
const app = express();

// Routers
const listingRouter = require("./routes/listing.js");
const reviewRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");

// Session and cookie with flash
const session = require("express-session");
const MongoStore = require('connect-mongo');
// const sessionOptions = require("./init/secret.js");
const flash = require("connect-flash");

// User authentication and authorization with passport 
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");


app.set("view engine","ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({extended: true}));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname,"/public")));
app.engine("ejs", ejsMate);

const dbUrl = process.env.ATLASDB_URL;
console.log(dbUrl)

async function main(){
    await mongoose.connect(dbUrl);
}

main().then(()=>{
    console.log("Connected to DB")
}).catch((err)=>{
    console.log(err);
});


// Mongo Store
const store = MongoStore.create({
    mongoUrl: dbUrl,
    crypto:{
        secret: process.env.SECRET
    },
    touchAfter: 24 * 60 * 60
})

store.on("error" , ()=>{
    console.log("ERROR in mongo store", err);
})

const sessionOptions = {
    store: store,
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: true,
    cookie:{
        expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
        maxAge: 7 * 24 * 60 * 60 * 1000,
        httpOnly : true
    }
};

// Session and flash middlewares
app.use(session(sessionOptions));
app.use(flash());


// Passport middleware (for user login and register)
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()))


// To serialize a user and deserialize (to add to remeber stack and to remove from it)
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());



app.use((req,res,next)=>{
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currUser = req.user;
    next();
})


// Routes
app.use("/listings", listingRouter);
app.use("/listings/:id/reviews", reviewRouter);
app.use("/", userRouter);


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

