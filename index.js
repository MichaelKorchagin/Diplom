require("@babel/core");
require("@babel/register");
const { saveData, readData, searchPeaks } = require('./src/data');

const [, , operation, fileName] = process.argv;
switch(operation) {
  case "saveData":
    const timeFrame = process.argv[3];
    saveData(timeFrame).then(console.log("end"));
    break;
  case "readData":
    readData(fileName);
    break;
  case "searchPeaks":
    searchPeaks(fileName);
    break;
  default:
    throw new Error(`Argument 4 operation: ${operation} is not supported`);
};
