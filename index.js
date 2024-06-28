let express = require("express");
let bodyParser = require("body-parser");
let dataStore = require("nedb");

//API
let apiUfc = require('./API/api-v1');
let dataUfc = new dataStore();

let app = express();
const PORT = (process.env.PORT || 10002);

app.use(bodyParser.json());

app.use("/",express.static("./public"));

app.listen(PORT,()=>{
    console.log(`Server listening on port ${PORT}.`);
});

apiUfc(app, dataUfc);