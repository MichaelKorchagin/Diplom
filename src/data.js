import axios from "axios";
import fs from "fs";
import { parametrs } from '../index';

const url5Min = 'https://www.alphavantage.co/query?function=CRYPTO_INTRADAY&symbol=ETH&market=USD&interval=5min&apikey=demo';
const dataPath = `${process.cwd()}/data/`; // Во время работы node запускает process. CWD - возвращает путь к текущей папке. = process.cwd() + "data".

export const saveData = async () => {
  const objDate = new Date();
  const dateForNameMonth = String(objDate.getMonth() + 1).padStart(2, "0");
  const dateForNameDay = String(objDate.getDay()).padStart(2, "0");
  const nameWithDate = dateForNameMonth + "-" +  dateForNameDay;
  const pathToData = dataPath + nameWithDate + ".json";

  const data = await axios.get(url5Min);
  const dataString = JSON.stringify(data.data, null, "\t");  // Переводит Джсон в стринг
  fs.writeFileSync(pathToData, dataString); // записывает в файл полный документ (путь, data)
};

const dateToRead = process.argv[3];
export const readData = (dateToRead) => {
  const pathToDataHere = dateToRead + ".json";
  const fileString = fs.readFileSync(pathToDataHere); // возвращает весь файл, как стрингу
  const apiFile = JSON.parse(fileString);
  const upperKey = "Time Series Crypto (5min)";   // заменяют вызов через точку, потому что стринга
  // const lowerKey = "2022-01-14 08:30:00";
  const value = apiFile[upperKey];

  console.log(value);
};

// TODO: 3. Реализовать выбор ключей и файла Даты по агрументам в консоли ???
//       4. Настроить правильные даты в названиях файлов.
//       5. Получать графики во всем временным интервалам.
//       6. Выделяем нужные свечки.
//       7. Ищем экстремумы.
//       8. Определяем вверх или вниз идет тренд.