# Dynamic-Lifx

<https://mammoth-lamp.herokuapp.com/>

This is a Node.JS app for controlling my LIFX smart light bulb, currently connected to a free Heroku dyno.

The server is written in Vanilla JS, with <socket.io> for bidirectional server communication.

## Self-hosting

The server can be hosted locally with Node.JS by running `npm run start` and going to `localhost:5000`.

The required packages are found at <https://github.com/James-Wickenden/Dynamic-Lifx/blob/main/package.json>.

If you want to use your own LIFX bulb, you need a file called `api_key.txt` in the main folder containing the LIFX key.

## Colour picker

The JS colour wheel is taken from <https://github.com/luncheon/reinvented-color-wheel>.
