'use strict';
var socket;


// Starts a clienside socket connection and sets up the handlers for receiving from the server
function setup_socket_editor() {
    socket = io();
    // Catches messages from the server containing trees, and unpacks them
    socket.on('colourChangeResponse', function (response) {
        var status = document.getElementById('updatestatus');
        if (response == true) {
            status.style.backgroundColor = 'green';
            status.innerText = 'Success!';
        }
        else {
            status.style.backgroundColor = 'red';
            status.innerText = 'Failed.';
        }
    });
};


// Make sure the user is OK to send a new colour request
function validate_request() {
    var status = document.getElementById('updatestatus');
    var lastClicked = localStorage.getItem('lastClicked');
    
    if (!localStorage.getItem('username')) {
        status.style.backgroundColor = 'red';
        status.innerText = 'No username set. Refresh the page.';
        return false;
    }
    if (!lastClicked) return true;
    if (Date.now() - lastClicked < 8000) {
        status.style.backgroundColor = 'red';
        status.innerText = 'Wait another ' + Math.round(8-(Date.now() - lastClicked) / 1000) + ' seconds.';
        return false;
    }

    return true;
};


// Sends a socket object to the server requesting a colour change
function request_colour() {
    if (!validate_request()) return;

    var rgb = colorWheel.hex;
    var username = localStorage.getItem('username');
    var colourChangeRequestData = { 'rgb': rgb, 'username': username };

    //var api_key = window.prompt("Enter API key","not_given");
    socket.emit('colourChangeRequest', colourChangeRequestData);
    localStorage.setItem('lastClicked', Date.now().toString());
};


setup_socket_editor();