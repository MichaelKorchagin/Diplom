import http from 'http';
import { modelHighLines, saveData } from './data';
import { modelData } from './data';
import fs from "fs";

const port = 8080;

const paramsMap = {           // для сверки
  fileName: 'fileName',
  timeFrame: 'timeFrame'
};

const defaultParamState = null;
let paramState = defaultParamState;

function resetParamState() {
  paramState = defaultParamState;
}

function getParamsOnServer(allUrlParams) {
  if (paramState === defaultParamState) {
    paramState = allUrlParams.split('&').reduce(
      (acc, param) => {
        const [ paramKey, paramValue ] = param.split('=');  // сплитим в разные переменные

        console.log('');
        console.log('key: ', paramKey);
        console.log('value: ', paramValue);

        const paramName = paramsMap[paramKey];

        console.log('param name: ', paramName);

        if (!paramName) {
          throw new Error('Incorrect parameter');   // проверка на существование
        }
        acc[paramName] = paramValue;
        return acc;
      }, {}
    );
  }
  return paramState;
}

console.log(`Server was started at port: ${ port }`);

const server = http.createServer(async function (request, response) {
    let allUrlParams = request.url.split('?')[1];
    console.log('');
    console.log(request.url);
    console.log(allUrlParams);

    if (request.url.includes("/index")) {
      const paramObj = getParamsOnServer(allUrlParams);

      fs.readFile('./index.html', function (err, data) {
        response.writeHead(200, { 'Content-Type': 'text/html', 'Content-Length': data.length });
        response.write(data);
        response.end();
      });

    } else if (request.url.includes("/styles.css")) {
      fs.readFile('./styles.css', function (err, data) {
        response.writeHead(200, { 'Content-Type': 'style/css', 'Content-Length': data.length });
        response.write(data);
        response.end();
      });
    }

    else if (request.url.includes('/data')) {
      const paramObj = getParamsOnServer(allUrlParams);

      response.writeHead(200, { 'Content-Type': 'application / json' });
      console.log('Start response data');

      const dataReturn = {
        model: modelData(paramObj.fileName, paramObj.timeFrame),
        lines: modelHighLines(paramObj.fileName, paramObj.timeFrame)
      }
      response.write(JSON.stringify(dataReturn));

      resetParamState();
      response.end();
    }

    else if (request.url.includes("/save")) {
      const paramObj = getParamsOnServer(allUrlParams);

      response.writeHead(200, { 'Content-Type': 'application/javascript' });
      const resultSaveData = await saveData(paramObj.timeFrame);
      response.write('Data was saved succesfully');
      resetParamState();
      response.end();
    }

    else {
      console.log('Default case has started');
      response.end();
    }
  }
).listen(port);