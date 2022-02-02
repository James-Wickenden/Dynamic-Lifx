"use strict";
// taken from https://github.com/luncheon/reinvented-color-wheel

var colorWheel = new ReinventedColorWheel({
    appendTo: document.getElementById("colour_picker_container"),

    // initial color
     hex: "#ff0000",
  
    // appearance
    wheelDiameter: 400,
    wheelThickness: 40,
    handleDiameter: 30,
    wheelReflectsSaturation: true,
  
    // handler
    onChange: function (colorWheel) {},
  });
  