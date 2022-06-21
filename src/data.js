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
  const timeSeriesArr = Object.entries(apiFile[upperKeyTimeSeries]);  // превратили в аррей. редьюс расширяет функционал
  const highPriceKey = "2. high";


  let highPeaks = {};

  for (let index = 1; index < timeSeriesArr.length - 2; index++) {

    let previous = new BigNumber(timeSeriesArr[index - 1][1][highPriceKey]);
    let operand = new BigNumber(timeSeriesArr[index][1][highPriceKey]);
    let next = new BigNumber(timeSeriesArr[index + 1][1][highPriceKey]);

    if (operand > previous && operand > next) {
      highPeaks[index] = operand;
    }

    previous = operand;
    operand = next;
    next = new BigNumber(timeSeriesArr[index + 2][1][highPriceKey]);
  }


  return highPeaks;
};

export const searchLowPeaks = (fileName, timeFrame) => {
  const pathToDataHere = dataPath + fileName + `(${ timeFrame }min).json`;
  const fileString = fs.readFileSync(pathToDataHere); // возвращает весь файл, как стрингу
  const apiFile = JSON.parse(fileString);

  const upperKeyTimeSeries = `Time Series Crypto (${ timeFrame }min)`;
  const timeSeriesArr = Object.entries(apiFile[upperKeyTimeSeries]);  // превратили в аррей. редьюс расширяет функционал
  const lowPriceKey = "3. low";

  let lowPeaks = {};

  for (let index = 1; index < timeSeriesArr.length - 2; index++) {

    let previous = new BigNumber(timeSeriesArr[index - 1][1][lowPriceKey]);
    let operand = new BigNumber(timeSeriesArr[index][1][lowPriceKey]);
    let next = new BigNumber(timeSeriesArr[index + 1][1][lowPriceKey]);


    if (operand > previous && operand > next) {
      lowPeaks[index] = operand;
    }

    previous = operand;
    operand = next;
    next = new BigNumber(timeSeriesArr[index + 2][1][lowPriceKey]);
  }


  return lowPeaks;
};
//
// function combinationsOfPointForLines(n, k) {
//   let x = 0, y = 0, z = 0;
//   let p = new Array(n + 2);
//   let c = new Array(k);
//
//   let init = function () {
//     let i;
//     p[0] = n + 1;
//     for (i = 1; i != n - k + 1; i++) {
//       p[i] = 0;
//     }
//     while (i != n + 1) {
//       p[i] = i + k - n;
//       i++;
//     }
//     p[n + 1] = -2;
//     if (k == 0) {
//       p[1] = 1;
//     }
//     for (i = 0; i < k; i++) {
//       c[i] = i + n - k;
//     }
//   };
//
//   let twiddle = function () {
//     let i, j, m;
//     j = 1;
//     while (p[j] <= 0) {
//       j++;
//     }
//     if (p[j - 1] == 0) {
//       for (i = j - 1; i != 1; i--) {
//         p[i] = -1;
//       }
//       p[j] = 0;
//       x = z = 0;
//       p[1] = 1;
//       y = j - 1;
//     } else {
//       if (j > 1) {
//         p[j - 1] = 0;
//       }
//       do {
//         j++;
//       } while (p[j] > 0);
//       m = j - 1;
//       i = j;
//       while (p[i] == 0) {
//         p[i++] = -1;
//       }
//       if (p[i] == -1) {
//         p[i] = p[m];
//         z = p[m] - 1;
//         x = i - 1;
//         y = m - 1;
//         p[m] = -1;
//       } else {
//         if (i == p[0]) {
//           return false;
//         } else {
//           p[j] = p[i];
//           z = p[i] - 1;
//           p[i] = 0;
//           x = j - 1;
//           y = i - 1;
//         }
//       }
//     }
//     return true;
//   };
//
//   let first = true;
//   init();
//
//   return {
//     hasNext: function () {
//       if (first) {
//         first = false;
//         return true;
//       } else {
//         let result = twiddle();
//         if (result) {
//           c[z] = x;
//         }
//         return result;
//       }
//     },
//     getCombination: function () {
//       return c;
//     }
//   };
// }


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

export const searchComboLowPeaks = (fileName, timeFrame) => {
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

  const dataForAnalysis = searchLowPeaks(fileName, timeFrame);
  const array = Object.entries(dataForAnalysis);
  const k = 3;

  const combinations = combine(array, k);

  console.log({ combinations: combinations.map(c => c.join()) });

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
    const deviation = new BigNumber(combinations[i][1][1].div(10000).multipliedBy(5)); // отклонение

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


// Смоделировать оbъект с данными для Line графика
// подать (запушить) в index.html/options/series/lineChart
export const modelDataForLines = (fileName, timeFrame) => {
  searchComboHighPeaks();
  // searchSupportLine();

}


// TODO: 7. Нашли прямую, по прямой смотрим другие точки, которые попадают в этот диапазон
//       8. Сочетание без повторений. Выбрать нужные экстремумы для сопротивления и поддержки. 3 точки, примерно на одной линии.
//       n. Определяем вверх или вниз идет тренд.
//       n + 1. Мб Рисуем тренд и графики.
//       n + 2. Состояние нынешней цены рынка (Бычьи и медвежие модели - куда уходит пик; на каком моементе волны тренд).
//     -----------------------------------------------------------------------------------------------
