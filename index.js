import express from "express";
import bodyParser from "body-parser";
import dataStore from "nedb";
import {handler} from "./front/build/handler.js";
import cors from "cors";


//APIs
import {api_NRM} from './BackNRM/index-api-v2.js';

//para el proxy
import request from "request";

let dbUfc = new dataStore();

let app = express();
const PORT = (process.env.PORT || 10002);
app.use(cors({
    "origin": "*",
    "methods" : "GET,HEAD,PUT,PATCH,POST,DELETE",
    "preflightContinue": false,
    "optionsSuccessStatus":204
}));


//Proxy NRM
app.use("/proxyNRM", function(req,res){
    var url = "https://sos2324-14.appspot.com/api/v2/ufc-events-data";
    console.log("piped: " + req.url);
    req.pipe(request(url)).pipe(res);
});

app.use(bodyParser.json());



app.listen(PORT,()=>{
    console.log(`Server listening on port ${PORT}.`);
});

// Nicolas Redondo Moreno
// API v1
api_NRM(app, dbUfc);


app.use(handler);