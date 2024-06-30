import express from "express";
import bodyParser from "body-parser";
import dataStore from "nedb";
import {handler} from "./front/build/handler.js";

//API
import apiUfc from './API/api-v1';
let dataUfc = new dataStore();

let app = express();
const PORT = (process.env.PORT || 10002);

app.use(bodyParser.json());
app.use(handler);

app.use("/",express.static("./public"));

app.listen(PORT,()=>{
    console.log(`Server listening on port ${PORT}.`);
});

apiUfc(app, dataUfc);