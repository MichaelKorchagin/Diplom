import http from 'http';
import { modelData } from './data';
import fs from "fs";

const port = 8080;

console.log(`Server was started at port: ${ port }`);

const server = http.createServer(async function (request, response) {

    console.log(request.url);
    switch (request.url) {
      case "/index":
        fs.readFile('./index.html', function (err, data) {
          response.writeHead(200, { 'Content-Type': 'text/html', 'Content-Length': data.length });
          response.write(data);
          response.end();
        });
        // let dataIndex = new Bvvuffer();
        // await fs.readFile('./index.html', function(err, content) {
        //   dataIndex = content;
        // });
        // response.writeHead(200, { 'Content-Type': 'text/html' });
        // response.write(dataIndex);
        // response.end();
        break;

      case "/styles.css":
        fs.readFile('./styles.css', function (err, data) {
          response.writeHead(200, { 'Content-Type': 'style/css', 'Content-Length': data.length });
          response.write(data);
          response.end();
        });
        break;

      case "/data":
        response.writeHead(200, { 'Content-Type': 'application / json' });
        console.log('stepzzz');
        response.write(JSON.stringify(modelData("05-26", "5")))
        response.end();
        break;

      default:
        console.log('Hello');
        response.end();
    }
  }
).listen(port);