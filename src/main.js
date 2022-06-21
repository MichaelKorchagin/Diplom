require("@babel/core");
require("@babel/register");
const { saveData, readData, searchHighPeaks, modelData, searchComboHighPeaks, highLine } = require('./data');


const [ , , operation, fileName, timeFrame ] = process.argv;
switch (operation) {
  case "saveData":
    const timeFrameHere = process.argv[3];
    saveData(timeFrameHere).then(console.log("end"));
    break;
  case "readData":
    readData(fileName, timeFrame);
    break;
  case "searchHighPeaks":
    searchHighPeaks(fileName, timeFrame);
    break;
  case "searchComboHighPeaks":
    searchComboHighPeaks(fileName, timeFrame);
    break;
  case "highLine":
    highLine(fileName, timeFrame);
    break;
  case "modelData":
    modelData(fileName, timeFrame);
    break;
  default:
    throw new Error(`Argument 4 operation: ${ operation } is not supported`);
}
;
