const mongoose = require("mongoose");
var validUrl = require('valid-url');

const UrlSchema = new mongoose.Schema({

    urlCode: { type: String, required: "urlCode is mandatory" , trim: true, unique: true,  lowercase: true},

    longUrl: { 
        
                type: String,  
                
                trim: true, 
                
                required: "longUrl is mandatory ",
                
                validate: {

                    //validator: function (email) {

                    validator : function (longUrl) {

                        if (!validUrl.isUri(longUrl)){
                            return 
                            
                        } 
                        
        
                    }, message: 'Please fill a valid URl', isAsync: false
                }
            },

    shortUrl: { type: String, required: "shortUrl is mandatory" , unique: true},

    

}, { timestamps: true })

module.exports = mongoose.model('Url', UrlSchema)
 