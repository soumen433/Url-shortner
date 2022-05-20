const mongoose = require('mongoose')
const UrlModel = require('../models/UrlModel')

//const url = require('mongoose-type-url')

//package for validation of url
const validUrl = require('valid-url')

//package for url code generator
const shortid = require('shortid')

//package for redis 
const redis = require("redis");

const { promisify } = require("util");

//Connect to redis
//line 21 is the port on which the server is running 
// line 22 is a public endpoint {host} which we will get when we create a new db on redis
const redisClient = redis.createClient(
    18002,
    "redis-18002.c232.us-east-1-2.ec2.cloud.redislabs.com",
    { no_ready_check: true }
);
// the below line contains the password that is being generated
redisClient.auth("EuHfBYDwlIvlZNWtdqfyR7CjJV7d5bPy", function (err) {
    if (err) throw err;
});

redisClient.on("connect", async function () {
    console.log("Connected to Redis..");
});

// REMEMBER ONE THING THE REDIS BY DEFAULT EXPOSE A CALLBACK FUNCTION WHEN SETTING OR GETTING COMMANDS OF REDIS ,  SO INSTEAD WE ARE USING A PROMISE TO SIMPLIFY THINGS

//1. connect to the server
//2. use the commands :

//Connection setup for redis

//Promisify is a very comman utility function that we use in Node

//What this promisify does is that it says give me a function as argument and then it converts that function in a promised based function

// so it is converting the set and get commands into a promise  

// the 2 line below are Redis commands , and here we are accessing a function (redisClient.SET) of redis client

const SET_ASYNC = promisify(redisClient.SET).bind(redisClient); // and bind is js method and so we are calling it and passing an object(redisCLient) that we got from above. So we use bind when we want to tie function call with an object
const GET_ASYNC = promisify(redisClient.GET).bind(redisClient);

// So above of two line returns a function. So basically whenever we will call these function and then the promise would be invoked and so the function is invoked on particular object and so basically this function is going get called at the above remote redis server(that we craeted above)


//------------------------------------------------functions--------------------------------------------------------//
const isValid = function (value) {
    if (typeof value === 'undefined' || value === null) return false
    if (typeof value === 'string' && value.trim().length === 0) return false
    return true;
}


//const isValidRequestBody = function (requestBody) {
//   return Object.keys(requestBody).length > 0
//}

//var expression = '^(?!mailto:)(?:(?:http|https|HTTP|HTTPS|ftp)://)(?:\\S+(?::\\S*)?@)?(?:(?:(?:[1-9]\\d?|1\\d\\d|2[01]\\d|22[0-3])(?:\\.(?:1?\\d{1,2}|2[0-4]\\d|25[0-5])){2}(?:\\.(?:[0-9]\\d?|1\\d\\d|2[0-4]\\d|25[0-4]))|(?:(?:[a-z\\u00a1-\\uffff0-9]+-?)*[a-z\\u00a1-\\uffff0-9]+)(?:\\.(?:[a-z\\u00a1-\\uffff0-9]+-?)*[a-z\\u00a1-\\uffff0-9]+)*(?:\\.(?:[a-z\\u00a1-\\uffff]{2,})))|localhost)(?::\\d{2,5})?(?:(/|\\?|#)[^\\s]*)?$';
//var regex = new RegExp(expression);

//-------------------------------------------------------------------------------------------------------------------//

//create url 
const createUrl = async function (req, res) {
    try {
        const baseUrl = 'http://localhost:3000'

        const requestBody = req.body

        const LongURL = requestBody.longUrl;

        // validation start
        if (Object.keys(requestBody).length === 0) {
            res.status(400).send({ status: false, message: 'Invalid request parameters. Please provide url details' })
            return
        }

        if (!isValid(LongURL)) {

            res.status(400).send({ status: false, msg: 'longUrl is required' })
            return
        }

        //if valid then trim it
        const trimUrl = LongURL.trim()


        if (!validUrl.isUri(trimUrl)) {
            return res.status(400).send({ status: false, message: "url not valid" })
        }


        //  we create the url code
        const URLCode = shortid.generate()

        const urlData = await GET_ASYNC(`${trimUrl}`)

        if (urlData) {
            return res.status(200).send({ status: true, message: `Data for ${trimUrl} from the cache`, data: JSON.parse(urlData) })

        }

        const url = await UrlModel.findOne({ longUrl: trimUrl }).select({ _id: 0, longUrl: 1, shortUrl: 1, urlCode: 1 })
        if (url) {
            await SET_ASYNC(`${trimUrl}`, JSON.stringify({ "longUrl": url.longUrl,
            "shortUrl": url.shortUrl,
            "urlCode": url.urlCode}))

          return  res.status(200).send({ status: true, msg: "fetch from db", data:{"longUrl": url.longUrl,
            "shortUrl": url.shortUrl,
            "urlCode": url.urlCode}})

            
        }


        const ShortUrl = baseUrl + '/' + URLCode.toLocaleLowerCase()

        const urlDetails = { longUrl: trimUrl, shortUrl: ShortUrl, urlCode: URLCode }

        const details = await UrlModel.create(urlDetails)
       
      return  res.status(201).send({
            status: true, msg: "New Url create", data: {
                "longUrl": details.longUrl,
                "shortUrl": details.shortUrl,
                "urlCode": details.urlCode
            }
        })


    } catch (error) {
        console.log(error)
        res.status(500).send({ status: false, msg: error.message })
    }
}




// Getting the url data of the long url with shortened url
const getUrl = async function (req, res) {
    try {

        const URLCode = req.params.urlcode
        if(!isValid(URLCode)) return res.status(400).send({status:false,message:"plz enter valid urlCode"})

        let urlcache = await GET_ASYNC(`${req.params.urlcode}`)
        if (urlcache) {
            return res.status(302).send("redirect to"+urlcache)
           

        } else {
            const getUrl = await UrlModel.findOne({ urlCode: URLCode });

            if (getUrl) {
                await SET_ASYNC(`${URLCode}`, JSON.stringify(getUrl.longUrl))
                return res.status(302).send("redirect to"+`${getUrl.longUrl}`)
               
            }
            else {
                return res.status(404).send({ status: false, err: 'urlcode not found' })
            }
        }


        //exception handler
    } catch (err) {

        res.status(500).send({ status: false, err: err.message })
    }


}


module.exports.createUrl = createUrl;
module.exports.getUrl = getUrl;
