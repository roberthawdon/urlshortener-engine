import fs from 'fs';

var settingsPath = './settings.json';
var parsed = JSON.parse(fs.readFileSync(settingsPath, 'UTF-8'));

export const value = parsed;
