import express from "express";
import bodyParser from "body-parser";
import dataStore from "nedb";
import {handler} from "./front/build/handler.js";


//API
import {apiUfc} from './API/api-v1.js';
let dataUfc = new dataStore();

let app = express();
const PORT = (process.env.PORT || 10002);

//Proxy NRM
app.use("/ufc-events-data", function(req,res){
    var url = "https://sos2324-jul-nrm-428011.ew.r.appspot.com/api/v1/ufc-events-data";
    console.log("piped: " + req.url);
    req.pipe(request(url)).pipe(res);
});

app.use(bodyParser.json());

app.listen(PORT,()=>{
    console.log(`Server listening on port ${PORT}.`);
});

apiUfc(app, dataUfc);

app.use(handler);