"use strict";

const express = require('express');
const app = express();

const http = require('http').createServer(app);
const io = require('socket.io')(http);

const fs = require('fs')
const request = require('request');
const path = require('path');

const PORT = process.env.PORT || 5000;

setup_socket_io();
setup_express();


http.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`);
});


function setup_express() {
    // Sets up the express server
    app.use(express.static(path.join(__dirname, 'public')))
    app.get('/', (req, res) => {
            res.sendFile(path.join(__dirname, '/public/index.html'));
        });
};


// Given an object and some optional numerical bounds, check it is a number and that it falls between those bounds
function validate_number(number, lowerBound=-Infinity, upperBound=Infinity) {
    if (isNaN(number)) throw Error(number + ' is not numeric');
    if (number < lowerBound || number > upperBound) throw Error(number + ' outside given boundaries ' + lowerBound + ', ' + upperBound);
    return true;
};


function receiveRequest(error, response, body) {
    if (error) {
        console.error(error);
      } else {
        console.log(body);
      }
};


// Reads ands parses the LIFX API token from a text file
function get_token() {
    var token = "empty";
    try {
        const data = fs.readFileSync('api_key.txt', 'utf8');
        token = data;
    } catch (err) {
        console.error(err);
    }
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
function requestColourUpdate(username, rgb) {
    if (!logs[username]) {
        logs[username] = [[ Date.now(), rgb ]];
        return true;
    }
    else {
        var userlogs = logs[username];
        var now = Date.now();
        for (var i = 0; i < userlogs.length; i++) {
            console.log(now - userlogs[i][0]) ;
            if (now - userlogs[i][0] < 8000) {
                console.error(username + " tried to change colour too quickly. Rejected at " + now);
                rejections.push([username, now, rgb]);
                return false;
            }
        }
        userlogs.push([ Date.now(), rgb ]);
        return true;
    }
};


const token = process.env.LIFX_API_KEY || get_token();
//update_light_power(true);
const logs = {};
const rejections = [];


// Sets up the socket.io events and handlers
function setup_socket_io() {
    io.on('connection', (socket) => {
        console.log('a user connected');
        //socket.on('disconnect', () => {
        //    console.log(socket.id + ' disconnected');
        //});
        socket.on('colourChangeRequest', (data) => {
            console.log(data);
            var response = requestColourUpdate(data['username'], data['rgb']);
            if (response) update_colour(data['rgb'], 1.0, 1.0);
            console.log(logs, rejections);
            io.to(socket.id).emit('colourChangeResponse', response);
        });
    });
};