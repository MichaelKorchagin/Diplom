require("@babel/core");
require("@babel/register");
const { saveData, readData } = require('./src/data');


switch(process.argv[2]) {
  case "saveData":
    saveData().then(console.log("end"));
    break;
  case "readData":
    readData();
    break;
};
