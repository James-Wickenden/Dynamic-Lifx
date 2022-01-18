"use strict";

const express = require('express');
const app = express();
const path = require('path');
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
        console.log(`Running at http://localhost:${PORT}`)
    });
app.get('/', (req, res) => {
        res.sendFile(path.join(__dirname, '/public/index.html'));
    });
