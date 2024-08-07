import express from 'express';
import got from 'got';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Utility to get __dirname in ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const setting = await import('./settings.js');

const port = process.env.PORT || setting.value.engine.port;
const apiUrl = process.env.APP_APIURL || setting.value.appSettings.apiUrl;
const defaultRedirect = process.env.APP_DEFAULT_REDIRECT || setting.value.appSettings.defaultRedirect;

const app = express();

var appName = "URL Shortener Engine"
var version = "0.0.10"

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
      try {
        const errorPagePath = path.join(__dirname, 'errorPage.html');
        let errorPage = await fs.readFile(errorPagePath, 'utf8');
        errorPage = errorPage.replace(/{statusCode}/g, error.response.statusCode);
        errorPage = errorPage.replace(/{status}/g, parse.status);
        errorPage = errorPage.replace(/{detail}/g, parse.detail);
        res.status(error.response.statusCode).send(errorPage);
      } catch (fileError) {
        // Fallback to basic error page if the complex one doesn't exist
        res.status(error.response.statusCode).send(
          `<h1>${error.response.statusCode} Error</h1><p>${parse.detail}</p>`
        );
      }
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

