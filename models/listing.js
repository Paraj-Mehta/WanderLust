const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const listingSchema = new Schema({
    title :{
     type : String,
     required : true
    },
    description : String,
    image: {
    filename: String,
    url: {
        type: String,
        default: "https://thumb.ac-illust.com/b1/b170870007dfa419295d949814474ab2_t.jpeg",
        set: (v) => v === "" ? "https://thumb.ac-illust.com/b1/b170870007dfa419295d949814474ab2_t.jpeg" : v,
    }
    },
    price : Number,
    location : String,
    country : String
});

const Listing = mongoose.model("Listing", listingSchema);
module.exports = Listing;