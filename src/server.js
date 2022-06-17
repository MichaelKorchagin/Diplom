import http from 'http';
import { saveData } from './data';
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
      response.write(JSON.stringify(modelData(paramObj.fileName, paramObj.timeFrame)));
      resetParamState();
      response.end();
    }

    else if (request.url.includes("/save")) {
      response.writeHead(200, { 'Content-Type': 'application/javascript' });
      const resultSaveData = await saveData("5");
      response.write('Data was save succesfully');
      resetParamState();
      response.end();
    }

    else {
      console.log('Default case has started');
      response.end();
    }
  }
).listen(port);