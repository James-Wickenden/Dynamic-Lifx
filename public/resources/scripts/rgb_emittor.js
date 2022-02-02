'use strict';
var socket;


// Starts a clienside socket connection and sets up the handlers for receiving from the server
function setup_socket_editor() {
    socket = io();
    // Catches messages from the server containing trees, and unpacks them
    socket.on('colourChangeResponse', function (response) {
        console.log(response);
    });
};


// Sends a socket object to the server requesting a colour change
function request_colour() {
    var rgb = colorWheel.hex;
    var username = localStorage.getItem('username');
    if (!username) {
        console.error('username not set');
        return;
    }
    console.log(username + " requests colour change to " + rgb);
    var colourChangeRequestData = { 'rgb': rgb, 'username': username };
    //var api_key = window.prompt("Enter API key","not_given");
    socket.emit('colourChangeRequest', colourChangeRequestData);
};


setup_socket_editor();