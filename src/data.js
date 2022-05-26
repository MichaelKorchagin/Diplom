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
  const lowPriceKey = "3. low";

  let highPeaks = {};
  let lowPeaks = {};

  for (let index = 1; index < timeSeriesArr.length - 2; index++) {

    let highPrevious = new BigNumber(timeSeriesArr[index - 1][1][highPriceKey]);
    let highOperand = new BigNumber(timeSeriesArr[index][1][highPriceKey]);
    let highNext = new BigNumber(timeSeriesArr[index + 1][1][highPriceKey]);

    let lowPrevious = new BigNumber(timeSeriesArr[index - 1][1][lowPriceKey]);
    let lowOperand = new BigNumber(timeSeriesArr[index][1][lowPriceKey]);
    let lowNext = new BigNumber(timeSeriesArr[index + 1][1][lowPriceKey]);


    if (highOperand > highPrevious && highOperand > highNext) {
      highPeaks[index] = highOperand;
    }

    highPrevious = highOperand;
    highOperand = highNext;
    highNext = new BigNumber(timeSeriesArr[index + 2][1][highPriceKey]);


    if (lowOperand < lowPrevious && lowOperand < lowNext) {
      lowPeaks[index] = lowOperand;
    }

    lowPrevious = lowOperand;
    lowOperand = lowNext;
    lowNext = new BigNumber(timeSeriesArr[index + 2][1][lowPriceKey])
  }
};

//
// let a = new BigNumber(timeSeriesArr[index][1][highPriceKey]);
// let b = new BigNumber(timeSeriesArr[index + 1][1][highPriceKey]);
//
// if (a  b) {
//
//   let firstXKoef = new BigNumber(index);
//   let secXKoef = new BigNumber(index + 1);
//   let thirdXKoef = new BigNumber(index + 2);
//   let firstYKoef = new BigNumber(timeSeriesArr[index][1][highPriceKey]);
//   let secYKoef = new BigNumber(timeSeriesArr[index + 1][1][highPriceKey]);
//   let thirdYKoef = new BigNumber(timeSeriesArr[index + 2][1][highPriceKey]);
//   let s = new BigNumber(0);
//
//   s = ((firstXKoef - thirdXKoef) * (secYKoef - thirdYKoef) - (secXKoef - thirdXKoef) * (firstYKoef - thirdYKoef)) / new BigNumber(2);
//
// }

// const result = timeSeriesPeaksArr.reduce(
//   (acc, [ key, priceObject ], index) => {
//     let operand = new BigNumber(priceObject[highPriceKey]);
//     if (index !== timeSeriesPeaksArr.length / 3) {
//       acc.partOne =
//     }
//     if (index)
//       }, {
//     partOne: {},
//     partTwo: {},
//     partThree: {}
//   }
// );
// console.log(Object.entries(result).map(element => element.toString()));

// Три пика на одной прямой:
// найти область в которую ходят все свечи


//   const resultForResistantLine = Object.entries(result);
//   const resistantLine = resultForResistantLine.reduce(
//     (acc, [ key, price ], indexFirst) => {
//       if (indexFirst <= resultForResistantLine.length - 3) {
//
//         let firstXKoef = key;
//         let secXKoef = resultForResistantLine[indexFirst + 1][0];
//         let thirdXKoef = resultForResistantLine[indexFirst + 2][0];
//         let firstYKoef = price;
//         let secYKoef = resultForResistantLine[indexFirst + 1][1];
//         let thirdYKoef = resultForResistantLine[indexFirst + 2][1];
//
//         const objS =  resultForResistantLine.reduce(
//           (acc, [firstXKoef, firstYkoef, s], indexSec) => {
//             do {
//               const s = ((firstXKoef - thirdXKoef) * (secYKoef - thirdYKoef) - (secXKoef - thirdXKoef) * (firstYKoef - thirdYKoef)) / new BigNumber(2);
//               acc[indexSec] = s;
//
//               secXKoef = resultForResistantLine[indexFirst + 2][0];
//               secYKoef = resultForResistantLine[indexFirst + 2][1];
//             }
//             while (indexFirst <= resultForResistantLine.length - 2);
//
//           }, {}
//         );
//
//         acc[indexFirst] = objS;
//
//       }
//
//       return acc;
//     }, {}
//   );
//   console.log(Object.entries(resistantLine).map(element => element.toString()));
// };


// TODO: 7. Нашли прямую, по прямой смотрим другие точки, которые попадают в этот диапазон (мб поиск площади другой фигуры)
//       8. Сочетание без повторений. Выбрать нужные экстремумы для сопротивления и поддержки. 3 точки, примерно на одной линии.
//       n. Определяем вверх или вниз идет тренд.
//       n + 1. Мб Рисуем тренд и графики.
//       n + 2. Состояние нынешней цены рынка (Бычьи и медвежие модели - куда уходит пик; на каком моементе волны тренд).
//     -----------------------------------------------------------------------------------------------
//       tests:
//       1. Проверка на удаление временного файла.
//       2. Не приходит АПИ.
