'use strict';

// Shamelessly stolen from:
// https://github.com/jfurrow/flood/blob/master/server/util/scgi.js
// thanks to jfurrow!

let Deserializer = require('xmlrpc/lib/deserializer');
let net = require('net');
let fs = require('fs');
let Serializer = require('xmlrpc/lib/serializer');
let mainStory = require('storyboard').mainStory;


export default {
  methodCall: (methodName, parameters, host, port) => {

    let connectMethod = {port: port, host: host};
    let deserializer = new Deserializer('utf8');
    let headerLength = 0;
    let nullChar = String.fromCharCode(0);
    let stream = net.connect(connectMethod);
    let xml = Serializer.serializeMethodCall(methodName, parameters);

    stream.setEncoding('UTF8');

    let headerItems = [
      `CONTENT_LENGTH${nullChar}${xml.length}${nullChar}`,
      `SCGI${nullChar}1${nullChar}`
    ];

    headerItems.forEach((item) => {
      headerLength += item.length;
    });

    let header = `${headerLength}:`;

    headerItems.forEach((headerItem) => {
      header += headerItem;
    });

    stream.write(`${header},${xml}`);

    let time = Date.now();

    return new Promise((resolve, reject) => {
      mainStory.debug('scgi', `Called ${methodName} on ${host}:${port} in ${Date.now() - time}ms`);
      deserializer.deserializeMethodResponse(stream, (error, response) => {
        if (error) {
          return reject(error);
        }
        return resolve(response);
      });
    });
  }
}
