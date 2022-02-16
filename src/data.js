import axios from "axios";
import fs from "fs";
import { parametrs } from '../index';

const url5Min = 'https://www.alphavantage.co/query?function=CRYPTO_INTRADAY&symbol=ETH&market=USD&interval=5min&apikey=demo';
const url15min = 'https://www.alphavantage.co/query?function=TIME_SERIES_INTRADAY_EXTENDED&symbol=IBM&interval=15min&slice=year1month2&apikey=demo';
const url60min = 'https://www.alphavantage.co/query?function=TIME_SERIES_INTRADAY_EXTENDED&symbol=IBM&interval=60min&slice=year1month3&adjusted=false&apikey=demo';
const dataPath = `${process.cwd()}/data/`; // Во время работы node запускает process. CWD - возвращает путь к root. = process.cwd() + "data".
const objDate = new Date();

const timeFrameUrlMap = {       // мапинг для наших юрл с таймфреймами
  5: url5Min,
  15: url15min,
  60: url60min
};

export const saveData = async (timeFrame) => {

  const dateForNameMonth = String(objDate.getMonth() + 1).padStart(2, "0");
  const dateForNameDay = String(objDate.getDate()).padStart(2, "0");

  if (!timeFrameUrlMap[timeFrame]) {
    throw new Error(`Argument 4 timeframe: ${timeFrame} is not supported`);
  }
  const nameWithDate = dateForNameMonth + "-" + dateForNameDay + `(${timeFrame}min)`;
  const pathToData = dataPath + nameWithDate + ".json";
  const data = await axios.get(timeFrameUrlMap[timeFrame]);     // вызывает поданный юрл из мапингов

  const dataString = JSON.stringify(data.data, null, "\t");  // Переводит Джсон в стринг
  fs.writeFileSync(pathToData, dataString); // записывает в файл полный документ (путь, data)

};

export const readData = (fileName) => {
  const pathToDataHere = dataPath + fileName + "(5min).json";
  const fileString = fs.readFileSync(pathToDataHere); // возвращает весь файл, как стрингу
  const apiFile = JSON.parse(fileString);
  const upperKey = "Time Series Crypto (5min)";   // заменяют вызов через точку, потому что стринга
  // const lowerKey = "2022-01-14 08:30:00";
  const value = apiFile[upperKey];

  console.log(value);
};

export const searchPeaks = (fileName) => {
  const objDate = new Date();
  const pathToDataHere = dataPath + fileName + "(5min).json";
  const fileString = fs.readFileSync(pathToDataHere); // возвращает весь файл, как стрингу
  const apiFile = JSON.parse(fileString);
  const upperKey = "Meta Data";   // заменяют вызов через точку, потому что стринга
  const lowerKey = "6. Last Refreshed";
  // const lowerKey = String(objDate.getFullYear()) + "-" + String(objDate.getMonth() + 1).padStart(2, "0") + "-" + String(objDate.getDate()).padStart(2, "0") + " " + String(objDate.getHours()) + ":" + String(objDate.getMinutes()) + ":00";
  const value = apiFile[upperKey][lowerKey];
}

// TODO: 5. !!! Получать графики во всем временным интервалам ??? приходит другой API
//       6. Выделяем нужные свечки.
//       7. Ищем экстремумы.
//       8. Определяем вверх или вниз идет тренд.
