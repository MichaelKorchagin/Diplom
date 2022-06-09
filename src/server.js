import http from 'http';
import { modelData } from './data';

const port = 3001;

console.log(`Server was started at port: ${ port }`);

http.createServer(function (request, response) {

  if (request.url === '/index') {
    console.log('stepzzz');
    response.end(JSON.stringify(modelData("03-01", "5")));
  }
  else {
    response.end('Hello');
  }
}).listen(port);