const url = require('url');
const http = require('http');
const https = require('https');
const app = require('express')();
const config = require('config');
const fs = require('fs');

const serverConfig = config.get("server");

app.get('/bundle*.js', function(req, res) {
  res.sendFile('www' + req.url, { root: process.cwd() });
});

app.get('/bundle*.css', function(req, res) {
  res.sendFile('www' + req.url, { root: process.cwd() });
});

app.get('/www/*', function(req, res) {
  res.sendFile(req.url, { root: process.cwd() });
});

app.get('/*', function(req, res) {
  res.sendFile('src/index.html', { root: process.cwd() });
});

let server;

if (serverConfig.protocol == 'https:') {
  let httpsConf = {};
  httpsConf.cert = fs.readFileSync(config.get('https').cert, {encoding: "utf8", flag: "r"});
  httpsConf.key = fs.readFileSync(config.get('https').key, {encoding: "utf8", flag: "r"});
  httpsConf.agent = new https.Agent(httpsConf)
  server = https.createServer(httpsConf, app);
}
else {
  server = http.createServer(app);
}

server.listen(serverConfig.port, () => {
  console.log(`Listening on ${url.format(serverConfig)}`);
});
