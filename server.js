"use strict";

const express = require('express');
const app = express();

const http = require('http').createServer(app);
const io = require('socket.io')(http);

const fs = require('fs')
const request = require('request');
const path = require('path');

const PORT = process.env.PORT || 5000;

var db = {};

setup_socket_io();
setup_express();

http.listen(PORT, () => {
    log('INFO', `Listening on http://localhost:${PORT}`);
    console.log(`Listening on http://localhost:${PORT}`);
});


// create a file if it doesn't exist
function create_if_not_exists(filename, content) {
    try {
        if (!fs.existsSync(filename)) {
          fs.writeFile(filename, content, err => {
            if (err) {
                log('ERROR', err);
            }
        });
        }
      } catch(err) {
        log('ERROR', err);
      }
};

// ensure the database file exists, as well as a logging file
function create_db_log() {
    create_if_not_exists('db.json', '{}');
    create_if_not_exists('out.log', new Date(Date.now()).toString() + '\n');
};


// Log msg with corresponding metadata
function log(level, msg) {
    var now = new Date(Date.now()).toString();
    var log_str = level + ' ' + now + ' ' + msg + '\n';

    fs.appendFile('out.log', log_str, function (err) {
        log('ERROR', err);
      });
};


// set up express server, its directory, and its filepaths
function setup_express() {
    // Sets up the express server
    app.use(express.static(path.join(__dirname, 'public')))
    app.get('/', (req, res) => {
            res.sendFile(path.join(__dirname, '/public/index.html'));
        });
    app.get('/log', (req, res) => {
        res.sendFile(path.join(__dirname, '/out.log'));
    });
    app.get('/db', (req, res) => {
        res.sendFile(path.join(__dirname, '/db.json'));
    });
};


// Sets up the socket.io events and handlers
function setup_socket_io() {
    io.on('connection', (socket) => {
        //socket.on('disconnect', () => {
        //    console.log(socket.id + ' disconnected');
        //});
        socket.on('colourChangeRequest', (data) => {
            log('INFO', 'request by ' + socket.id + ': ' + data.toString());
            var response = requestColourUpdate(socket.id, data['username'], data['rgb']);
            if (response) {
                db[data['username']].push([ Date.now(), socket.id, data['rgb'] ]);
                rewrite_DB();
                update_colour(data['rgb'], 1.0, 1.0);
            }
            io.to(socket.id).emit('colourChangeResponse', response);
        });
    });
};


// read a file and return the text
function readFile(filename) {
    try {
        const data = fs.readFileSync(filename, 'utf8');
        return data;
    } catch (err) {
        log('ERROR', error);
    }
};


// write to a filename
function writeFile(filename, content) {
    try {
        fs.writeFileSync(filename, content)
      } catch (err) {
        log('ERROR', error);
      }
};


// Reload the JSON database from file into memory
function reload_DB() {
    var db_json = JSON.parse(readFile('db.json'));
    db = db_json;
};


// Update the DB and rewrite it to the JSON file.
function rewrite_DB() {
    writeFile('db.json', JSON.stringify(db));
};


// Given an object and some optional numerical bounds, check it is a number and that it falls between those bounds
function validate_number(number, lowerBound=-Infinity, upperBound=Infinity) {
    if (isNaN(number)) log('ERROR', number + ' is not numeric');
    if (number < lowerBound || number > upperBound) log('ERROR', number + ' outside given boundaries ' + lowerBound + ', ' + upperBound);
    return true;
};


// receive a HTTP request
function receiveRequest(error, response, body) {
    if (error) {
        log('ERROR', error);
      } else {
        log('INFO', body);
      }
};


// Reads ands parses the LIFX API token from a text file
function get_token() {
    var token = readFile('api_key.txt') || 'empty';
    return token;
};


// Generates a request header with the parameters
function get_request_header(method, uri, token, payload) {
    return {
        method: method,
        uri: uri,
        auth:{bearer:token},
        json:payload
    };
};


// Sets the light's on/off state to a given value
function update_light_power(is_on) {
    // is_on: Boolean controlling light power.
    // a light set to 'off' will not emit light regardless of power, but can still receive updates  
    var payload_str = "off";
    if (is_on) payload_str = "on";
    var payload = { "power": payload_str };

    request(get_request_header('PUT', 'https://api.lifx.com/v1/lights/all/state', token, payload), receiveRequest);
};


// Sets the light's colour and brightness to a given value over a given period
function update_colour(rgb_hex, brightness, duration) {
    // set a state. format: hue, saturation, and brightness
    // duration: transition time in seconds
    // brightness: light brightness from 0..1
    validate_number(brightness, 0, 1);
    validate_number(duration, 0, 10);

    var payload = {
        "color": rgb_hex,
        //"brightness": brightness,
        "duration": duration,
        //"infrared": 0
    };
    request(get_request_header('PUT', 'https://api.lifx.com/v1/lights/all/state', token, payload), receiveRequest);
};


// todo: rework logging, pull it out of a true/false returning function!
function requestColourUpdate(socket_id, username, rgb) {
    if (!username) return false;
    reload_DB();

    if (!db[username]) {
        db[username] = [];
        return true;
    }
    else {
        var userlogs = logs[username];
        var now = Date.now();
        if (now - userlogs[userlogs.length-1][0] < 8000) {
            log('WARNING', socket_id + ': ' + username + " tried to change colour too quickly, rejected: " + rgb);
            return false;
        }
        else {
            return true;
        }
    }
};


const token = process.env.LIFX_API_KEY || get_token();
//update_light_power(true);
create_db_log();