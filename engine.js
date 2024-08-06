import express from 'express';
import got from 'got';
const setting = await import('./settings.js');

const port = process.env.PORT || setting.value.engine.port;
const apiUrl = process.env.APP_APIURL || setting.value.appSettings.apiUrl;
const defaultRedirect = process.env.APP_DEFAULT_REDIRECT || setting.value.appSettings.defaultRedirect;

const app = express();

var appName = "URL Shortener Engine"
var version = "0.0.8"

app.get('/', (req, res) => {
  res.redirect(301, defaultRedirect);
});

app.get('/ping', (req, res, next) => {
  res.status(200).json({ application: appName, version: version });
});

app.get('/:urlCode', (req, res) => {
  (async () => {
    try {
      const response = await got(apiUrl + "/lookup/" + req.params.urlCode);
      console.log(response.body);
      var parse = JSON.parse(response.body);
      res.redirect(301, parse.longUrl);
    } catch (error) {
      console.log(error.response.body);
      var parse = JSON.parse(error.response.body);
      res.status(error.response.statusCode).send("<h1>" + error.response.statusCode + " Error</h1><p>" + parse.detail + "</p>");
    }
  })();
});

app.use(function (err, req, res, next) {
  console.error(err.stack)
  res.status(500).send('Internal Server Error')
})

app.listen(port, () => {
  console.log("Server started and listening on port " + port)
});

