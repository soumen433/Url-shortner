const mongoose = require('mongoose')
const UrlModel = require('../models/UrlModel')


//package for validation of url
const validUrl = require('valid-url')

//package for url code generator
const shortid = require('shortid')

const createUrl = async function (req, res) {
    const isValid = function(value) {
        if(typeof value === 'undefined' || value === null) return false
        if(typeof value === 'string' && value.trim().length === 0) return false
        return true;
    }
    const baseUrl = 'http://localhost:3000'

    const isValidRequestBody = function(requestBody) {
        return Object.keys(requestBody).length > 0
    }
    const requestBody = req.body

    const LongURL = req.body.longUrl;

    if(!isValidRequestBody(requestBody)) {
        res.status(400).send({status: false, message: 'Invalid request parameters. Please provide url details'})
        return
    }

    // check base url if valid using the validUrl.isUri method
    if (!validUrl.isUri(baseUrl)) {
        res.status(401).json('Invalid base URL')
        return
    }

    // if valid, we create the url code
    const URLCode = shortid.generate()
    
    

    if (validUrl.isUri(LongURL)) {
    
        try {
            
            let url = await UrlModel.findOne({longUrl: LongURL})
            if (url){
                
                res.status(200).json({status : true, data: url})
            }

            else{
                
                const ShortUrl = baseUrl + '/getUrl/' + URLCode
                
                let tempurldetails = {longUrl : LongURL, shortUrl: ShortUrl, urlCode: URLCode }

                let details = await UrlModel.create(tempurldetails);
                
                res.status(201).json({status: true, data: details})

            }    
            
        }
        
        catch (err) {
            res.status(500).send({ msg: err.message })
        }
    }


}


// Getting the url data of the long url with shortened url
const getUrl = async function (req, res) {
    try {
        // find a document match to the code in req.params.code
        const url = await UrlModel.findOne({
            urlCode: req.params.urlcode
        })
        
        if (url) {
            // when valid we perform a redirect
            
            res.status(200).redirect(url.longUrl)
        } else {
            // else return a not found 404 status
            return res.status(404).send({status: false , err: "No Url found"})
        }

    }
    //exception handler
    catch (err) {
        console.error(err)
        res.status(500).send({status: false , err: err.message})
    }


}


module.exports.createUrl = createUrl;
module.exports.getUrl = getUrl;
