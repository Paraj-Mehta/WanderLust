const Joi = require("joi");

module.exports.ListingSchema = Joi.object({
    listing: Joi.object({
        title : Joi.string().required(),
        description: Joi.string().required(),
        image:Joi.string().allow("",null),
        price:Joi.number().required(),
        location: Joi.string().required(),
        country: Joi.string().required(),
        categories: Joi.alternatives()
        .try(
                Joi.string(),                // in case only one checkbox is checked (Express sends it as a string)
                Joi.array().items(Joi.string())  // multiple checkboxes → array of strings
        ).optional()

    }).required()
})

module.exports.reviewSchema = Joi.object({
    review: Joi.object({
        rating: Joi.number().required().min(1).max(5),
        comment : Joi.string().required()
    }).required()
})