'use strict';

var socket;


// Starts a clienside socket connection and sets up the handlers for receiving from the server
function setup_socket_editor() {
    socket = io();
    //socket.emit('rgb', 'pink');
    // Catches messages from the server containing trees, and unpacks them
    socket.on('rgb_accepted', function (response) {
        console.log(response);
    });
};


function request_colour(rgb) {
    socket.emit('rgb', rgb);
};


setup_socket_editor();