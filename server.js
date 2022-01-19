"use strict";

const fs = require('fs')
const https = require('https')
const express = require('express');
const request = require('request');

const app = express();
const PORT = process.env.PORT || 5000;

/*
app.listen(PORT, () => {
        console.log(`Running at http://localhost:${PORT}`)
    });
app.get('/', (req, res) => {
        res.sendFile(path.join(__dirname, '/public/index.html'));
    });
*/

var token = "empty";
try {
    const data = fs.readFileSync('api_key.txt', 'utf8');
    token = data;
} catch (err) {
    console.error(err);
}

/*
def update_light_power(is_on):
    # is_on: Boolean controlling light power.
    # a light set to 'off' will not emit light regardless of power, but can still receive updates
    payload = {
        "power": {True:"on", False:"off"}.get(is_on, "off")
    }

    response = requests.put('https://api.lifx.com/v1/lights/all/state', data=payload, headers=headers)
    logging.info(f"updating power setting to {is_on}")
    logging.info(response,response.json())
    return response
*/

function update_light_power(is_on) {
    // is_on: Boolean controlling light power.
    // a light set to 'off' will not emit light regardless of power, but can still receive updates  
    
    var payload_str = "";
    if (is_on) {
        payload_str = "on";
    }
    else {
        payload_str = "off";
    }
    var auth = {
        'bearer': token
    };
    var payload = {
        "power": payload_str
    };

    request({
        method: 'PUT',
        uri: `https://api.lifx.com/v1/lights/all/state`,
        auth:{bearer:token},
        json:payload
    },
    (error, response, body) => {
        if (error) {
          console.error(error);
        } else {
          console.log(body);
        }
    });

};

update_light_power(false);