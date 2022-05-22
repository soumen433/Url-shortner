const mongoose = require("mongoose");
//var validUrl = require('valid-url');

//var expression = '^(?!mailto:)(?:(?:http|https|HTTP|HTTPS|ftp)://)(?:\\S+(?::\\S*)?@)?(?:(?:(?:[1-9]\\d?|1\\d\\d|2[01]\\d|22[0-3])(?:\\.(?:1?\\d{1,2}|2[0-4]\\d|25[0-5])){2}(?:\\.(?:[0-9]\\d?|1\\d\\d|2[0-4]\\d|25[0-4]))|(?:(?:[a-z\\u00a1-\\uffff0-9]+-?)*[a-z\\u00a1-\\uffff0-9]+)(?:\\.(?:[a-z\\u00a1-\\uffff0-9]+-?)*[a-z\\u00a1-\\uffff0-9]+)*(?:\\.(?:[a-z\\u00a1-\\uffff]{2,})))|localhost)(?::\\d{2,5})?(?:(/|\\?|#)[^\\s]*)?$';
//var regex = new RegExp(expression);

const UrlSchema = new mongoose.Schema({

    urlCode: { type: String, required: true, trim: true, unique: true, lowercase: true },

    longUrl: {
        type: String,

        trim: true,

        required: true,
    },

    shortUrl: { type: String, required: true, unique: true },



}, { timestamps: true })

module.exports = mongoose.model('Url', UrlSchema)

