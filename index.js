require("@babel/core");
require("@babel/register");
const { saveData, readData } = require('./src/data');

saveData().then(console.log("end"));
readData();
