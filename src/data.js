import axios from "axios";
import fs from "fs";
import { parametrs } from '../index';
import BigNumber from "bignumber.js";

const url5Min = 'https://www.alphavantage.co/query?function=CRYPTO_INTRADAY&symbol=ETH&market=USD&interval=5min&apikey=ISRNCIVORXW4BP27';
const url15min = 'https://www.alphavantage.co/query?function=CRYPTO_INTRADAY&symbol=ETH&market=USD&interval=15min&slice=year1month2&apikey=ISRNCIVORXW4BP27';
const url60min = 'https://www.alphavantage.co/query?function=CRYPTO_INTRADAY&symbol=ETH&market=USD&interval=60min&slice=year1month3&adjusted=false&apikey=ISRNCIVORXW4BP27';

const dataPath = `${ process.cwd() }/data/`; // Во время работы node запускает process. CWD - возвращает путь к root. = process.cwd() + "data".
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
    throw new Error(`Argument 4 timeframe: ${ timeFrame } is not supported`);
  }
  const nameWithDate = dateForNameMonth + "-" + dateForNameDay + `(${ timeFrame }min)`;
  const pathToData = dataPath + nameWithDate + ".json";
  const data = await axios.get(timeFrameUrlMap[timeFrame]);     // вызывает поданный юрл из мапингов

  const dataString = JSON.stringify(data.data, null, "\t");  // Переводит Джсон в стринг
  fs.writeFileSync(pathToData, dataString); // записывает в файл полный документ (путь, data)

};

export const readData = (fileName, timeFrame) => {
  const pathToDataHere = dataPath + fileName + "(" + `${ timeFrame }` + "min)" + ".json";
  const fileString = fs.readFileSync(pathToDataHere); // возвращает весь файл, как стрингу
  const apiFile = JSON.parse(fileString);
  const upperKey = `Time Series Crypto (${ timeFrame }min)`;   // заменяют вызов через точку, потому что стринга
  // const lowerKey = "2022-02-22 15:00:00";
  const value = apiFile[upperKey];

  console.log(value);
};

export const searchAllPeaks = (fileName, timeFrame) => {
  const pathToDataHere = dataPath + fileName + `(${ timeFrame }min).json`;
  const fileString = fs.readFileSync(pathToDataHere); // возвращает весь файл, как стрингу
  const apiFile = JSON.parse(fileString);
  const upperKey = "Meta Data";
  const lowerKey = "6. Last Refreshed";
  const lastRefreshedTime = apiFile[upperKey][lowerKey];
  const upperKeyTimeSeries = `Time Series Crypto (${ timeFrame }min)`;
  const timeSeriesArr = Object.entries(apiFile[upperKeyTimeSeries]);  // превратили в аррей. редьюс расширяет функционал
  const highPriceKey = "2. high";

  let prev = new BigNumber(0);
  let sec = new BigNumber(0);

  const result = timeSeriesArr.reduce(
    (acc, [ key, priceObject ], index) => {
      let operand = new BigNumber(priceObject[highPriceKey]);
      if (index !== timeSeriesArr.length - 1) {
        sec = new BigNumber(timeSeriesArr[index + 1][1][highPriceKey]);
      } else {
        sec = new BigNumber(0);
      }

      if (operand > prev && operand > sec) {
        acc[index] = operand;
      }

      prev = operand;
      return acc;
    }, {}
  );
  console.log(Object.entries(result).map(element => element.toString()));


  const resultForResistantLine = Object.entries(result);
  const resistantLine = resultForResistantLine.reduce(
    (acc, [ key, price ], indexHere) => {
      if (indexHere <= resultForResistantLine.length - 3) {

        const firstXKoef = key;
        const secXKoef = resultForResistantLine[indexHere + 1][0];
        const thirdXKoef = resultForResistantLine[indexHere + 2][0];
        const firstYkoef = price;
        const secYKoef = resultForResistantLine[indexHere + 1][1];
        const thirdyKoef = resultForResistantLine[indexHere + 2][1];

        const s = ((firstXKoef - thirdXKoef) * (secYKoef - thirdyKoef) - (secXKoef - thirdXKoef) * (firstYkoef - thirdyKoef)) / new BigNumber(2);
        // if (s <= 0 && s > -0.5 || s >= 0 && s < 0.5) {
        //   ;
        // }
        acc[indexHere] = s;
      }

      return acc;
    }, {}
  );
  console.log(Object.entries(resistantLine).map(element => element.toString()));
};



// TODO: 7. Сочетание без повторений. Выбрать нужные экстремумы для сопротивления и поддержки. 3 точки, примерно на одной линии.
//       n. Определяем вверх или вниз идет тренд.
//       n + 1. Мб Рисуем тренд и графики.
//     -----------------------------------------------------------------------------------------------
//       tests:
//       1. Проверка на удаление временного файла.
//       2. Не приходит АПИ.
