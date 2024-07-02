import express from "express";
import bodyParser from "body-parser";
import dataStore from "nedb";
import {handler} from "./front/build/handler.js";

//API
import {apiUfc} from './API/api-v1.js';
let dataUfc = new dataStore();

// import request from "request";

let app = express();
const PORT = (process.env.PORT || 10002);

app.use(bodyParser.json());


// app.use("/",express.static("./public"));

app.listen(PORT,()=>{
    console.log(`Server listening on port ${PORT}.`);
});

apiUfc(app, dataUfc);

app.use(handler);