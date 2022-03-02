require("@babel/core");
require("@babel/register");
const { saveData, readData, searchAllPeaks } = require('./src/data');


const [, , operation, fileName, timeFrame] = process.argv;
switch(operation) {
  case "saveData":
    const timeFrameHere = process.argv[3];
    saveData(timeFrameHere).then(console.log("end"));
    break;
  case "readData":
    readData(fileName, timeFrame);
    break;
  case "searchAllPeaks":
    searchAllPeaks(fileName, timeFrame);
    break;
  default:
    throw new Error(`Argument 4 operation: ${operation} is not supported`);
};
