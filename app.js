const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;
const DATA_FILE_NAME = path.join(__dirname,'data.json');

app.use(express.json());
app.use(express.static(__dirname));

function saveData(data){
    fs.writeFileSync(DATA_FILE_NAME, JSON.string(data, null, 2));
}
