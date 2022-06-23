// "build": "rm -rf dist && babel src --out-dir dist --source-maps true"   rm -rf dist - удалить скомпилированный код. прогнать bаbелем и доbавить сорс мапы


import { validateUseBuiltInsOption } from '@babel/preset-env/lib/normalize-options';
import axios from "axios";
import fs from "fs";
import BigNumber from "bignumber.js";

const url5Min = 'https://www.alphavantage.co/query?function=CRYPTO_INTRADAY&symbol=ETH&market=USD&interval=5min&apikey=ISRNCIVORXW4BP27';
const url15min = 'https://www.alphavantage.co/query?function=CRYPTO_INTRADAY&symbol=ETH&market=USD&interval=15min&slice=year1month2&apikey=ISRNCIVORXW4BP27';
const url60min = 'https://www.alphavantage.co/query?function=CRYPTO_INTRADAY&symbol=ETH&market=USD&interval=60min&slice=year1month3&adjusted=false&apikey=ISRNCIVORXW4BP27';

const dataPath = `${ process.cwd() }/data/`; // Во время работы node запускает process. CWD - возвращает путь к root. = process.cwd() + "data".
const objDate = new Date();


const openPriceKey = "1. open";
const highPriceKey = "2. high";
const lowPriceKey = "3. low";
const closePriceKey = "4. close";


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
  const pathToDataHere = dataPath + fileName + `(${ timeFrame }min).json`;
  const fileString = fs.readFileSync(pathToDataHere); // возвращает весь файл, как стрингу
  const apiFile = JSON.parse(fileString);
  const upperKey = `Time Series Crypto (${ timeFrame }min)`;   // заменяют вызов через точку, потому что стринга
  const allData = apiFile[upperKey];

  return allData;
};


export const modelData = (fileName, timeFrame) => {

  console.log('modeling started');

  const data = readData(fileName, timeFrame);

  const dataArr = Object.entries(data).map(
    ([ key, value ]) => {
      const dataObj = {};

      dataObj.x = key;
      dataObj.y = [ parseFloat(value[openPriceKey]), parseFloat(value[highPriceKey]), parseFloat(value[lowPriceKey]), parseFloat(value[closePriceKey]) ];

      return dataObj;
    }
  );

  return dataArr;
};


export const searchHighPeaks = (fileName, timeFrame) => {
  const pathToDataHere = dataPath + fileName + `(${ timeFrame }min).json`;
  const fileString = fs.readFileSync(pathToDataHere); // возвращает весь файл, как стрингу
  const apiFile = JSON.parse(fileString);

  const upperKeyTimeSeries = `Time Series Crypto (${ timeFrame }min)`;
  const timeSeriesArr = Object.entries(apiFile[upperKeyTimeSeries]); // превратили в аррей. редьюс расширяет функционал
  const highPriceKey = "2. high";


  const highPeaks = {};

  for (let index = 1; index < timeSeriesArr.length - 2; index++) {

    let previous = new BigNumber(timeSeriesArr[index - 1][1][highPriceKey]);
    let operand = new BigNumber(timeSeriesArr[index][1][highPriceKey]);
    let next = new BigNumber(timeSeriesArr[index + 1][1][highPriceKey]);

    if (operand.isGreaterThan(previous) && operand.isGreaterThan(next)) {
      highPeaks[index] = operand;
    }
    if (operand.isEqualTo(previous) || operand.isEqualTo(next)) {
      if (!operand.isEqualTo(highPeaks[index - 1])){
        highPeaks[index] = operand;
      }
    }
    //
    // previous = operand;
    // operand = next;
    // next = new BigNumber(timeSeriesArr[index + 2][1][highPriceKey]);
  }


  return highPeaks;
};

// Проверить в каком виде приходят и отдаются данные. Выbрать правильную типизацию

// Надо получить все треугольники и выbрать те, в которых 5 > S (площадь)
// Отоbрать по kx + b
export const searchComboHighPeaks = (fileName, timeFrame) => {
  const combine = (arr, k, withRepetition = false) => {
    const combinations = []
    const combination = Array(k)
    const internalCombine = (start, depth) => {
      if (depth === k) {
        combinations.push([ ...combination ])
        return
      }
      for (let index = start; index < arr.length; ++index) {
        combination[depth] = arr[index]
        internalCombine(index + (withRepetition ? 0 : 1), depth + 1)
      }
    }
    internalCombine(0, 0)
    return combinations
  }

  const dataForAnalysis = searchHighPeaks(fileName, timeFrame);
  const array = Object.entries(dataForAnalysis);
  const k = 3;

  const combinations = combine(array, k);

  return combinations;
}

export const highLine = (fileName, timeFrame) => {

  const combinations = searchComboHighPeaks(fileName, timeFrame);

  // получает всю дату для того, чтоы вытащить дату и время
  const timeSeriesArrHere = Object.getOwnPropertyNames(readData(fileName, timeFrame));
  const timeSeriesArr = Object.entries(readData(fileName, timeFrame));

  const lines = [];

  for (let i = 0; i < combinations.length; i++) {

    let firstXKoef = new BigNumber(combinations[i][0][0]);
    let secXKoef = new BigNumber(combinations[i][1][0]);
    let thirdXKoef = new BigNumber(combinations[i][2][0]);
    let firstYKoef = combinations[i][0][1];
    let secYKoef = combinations[i][1][1];
    let thirdYKoef = combinations[i][2][1];

    const firstXMinusXThird = firstXKoef.minus(thirdXKoef);
    const secXMinusXThird = secXKoef.minus(thirdXKoef);
    const secYMinusYThird = secYKoef.minus(thirdYKoef);
    const firstYMinusYthird = firstYKoef.minus(thirdYKoef);

    const s = ((firstXMinusXThird.multipliedBy(secYMinusYThird)).minus(secXMinusXThird.multipliedBy(firstYMinusYthird))).div(2);

    const oneLine = {};
    const deviation = new BigNumber(combinations[i][1][1].div(1000).multipliedBy(5)); // отклонение

    // if dev > |s|
    if (deviation.isGreaterThanOrEqualTo(s.absoluteValue())) {

      let firstIndex = null;
      let thirdIndex = null;
      let firstPrice = null;
      let thirdPrice = null;

      for (let j = 0; j < combinations[i].length; j++) {
        const dateTime = combinations[i][j][0];
        const x = timeSeriesArrHere[dateTime];
        const y = combinations[i][j][1];

        if (j === 0) {
          firstIndex = dateTime;
          firstPrice = y;
        }
        if (j === 2) {
          thirdIndex = dateTime;
          thirdPrice = y;
        }

        oneLine[x] = y; // пуш точки в oneLine
      }


      const multOne = new BigNumber(firstIndex).multipliedBy(thirdPrice);
      const multTwo = new BigNumber(firstPrice).multipliedBy(thirdIndex);

      const aKoef = new BigNumber(firstPrice).minus(thirdPrice); // A = y1 - y2
      const bKoef = new BigNumber(thirdIndex - firstIndex); // B = X2 - X1,
      const cKoef = multOne.minus(multTwo); // C = X1*Y2 - X2*Y1.

      const equation = (g, operand) => {
        const multFirst = aKoef.multipliedBy(g);
        const multSec = bKoef.multipliedBy(operand);

        const plus = multFirst.plus(multSec);
        return plus.plus(cKoef); // ax + by + c
      }


      let eq = true;

      for (let g = parseInt(firstIndex); g < parseInt(thirdIndex); g++) {
        const operand = timeSeriesArr[g][1]['2. high'];
        const resultEquation = equation(g, operand);
        if (new BigNumber(0).isGreaterThanOrEqualTo(resultEquation)) {

        } else {
          eq = false;
          break;
        }
      }

      if (eq === true) {
        lines.push(oneLine);
      }
    }
  }
  return lines;
}


export const modelHighLines = (fileName, timeFrame) => {

  console.log('modeling lines started');

  const data = highLine(fileName, timeFrame);

  const oneLine = data.map(
    (value, index) => {
      const dataObj = {};

      dataObj.name = `Resistance Line ${index + 1}`;
      dataObj.type = 'line';
      dataObj.data = Object.entries(value).map(
        ([ key, value ]) => ({
          x: key,
          y: parseFloat(value)
        })
      );

      return dataObj;
    });

  return oneLine;
};



// TODO:
//     -----------------------------------------------------------------------------------------------
