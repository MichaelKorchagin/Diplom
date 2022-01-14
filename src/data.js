import axios from "axios";
import fs from "fs";

const url5Min = 'https://www.alphavantage.co/query?function=CRYPTO_INTRADAY&symbol=ETH&market=USD&interval=5min&apikey=demo';
const dataPath = `${process.cwd()}/data`; // Во время работы node запускает process. CWD - возвращает путь к текущей папке. = process.cwd() + "data".
const pathToData = `${dataPath}/come.json`;

export const saveData = async () => {
  const data = await axios.get(url5Min);
  const dataString = JSON.stringify(data.data, null, "\t");  // Переводит Джсон в стринг
  fs.writeFileSync(pathToData, dataString); // записывает в файл полный документ (путь, data)
};

export const readData = () => {
  const fileString = fs.readFileSync(pathToData); // возвращает весь файл, как стрингу
  const apiFile = JSON.parse(fileString);
  const upperKey = "Time Series Crypto (5min)";   // заменяет вызов через точку, потому что стринга
  const lowerKey = "2022-01-14 08:30:00";
  const value = apiFile[upperKey][lowerKey];

  console.log(value);
};

// TODO: 1. Запускать отдельно все функции по агрументам в консоль.
//       2. SaveData каждый раз в новый файл.
//       3. Реализовать выбор ключей и файла Даты по агрументам в консоли.
