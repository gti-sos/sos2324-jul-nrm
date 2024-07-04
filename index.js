import express from "express";
import bodyParser from "body-parser";
import dataStore from "nedb";
import {handler} from "./front/build/handler.js";
import cors from 'cors';

//API
import {apiUfc} from './API/api-v1.js';
let dataUfc = new dataStore();

let app = express();
const PORT = (process.env.PORT || 10002);

app.use(cors({
    "origin": "*",
    "methods" : "GET,HEAD,PUT,PATCH,POST,DELETE",
    "preflightContinue": false,
    "optionsSuccessStatus":204
}));

app.use(bodyParser.json());

app.listen(PORT,()=>{
    console.log(`Server listening on port ${PORT}.`);
});

apiUfc(app, dataUfc);

app.use(handler);