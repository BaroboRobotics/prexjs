"use strict";

var prex = require('./../src/js/prex.js');
var promise = require('promise');

var code = "import linkbot3 as linkbot\nlinkbot.scatter_plot([0, 1], [0, 1])\n";

var proxy = new prex.Proxy();
proxy.on('io', function(io_object) {
    console.log(io_object.data.toString('utf8'));
});

proxy.on('image', function(image_object) {
    console.log("Received image object:");
    console.log(image_object.payload);
});

console.log('Connecting...');
proxy.connect('ws://localhost:43000').then( function() {
    console.log('Loading program...');
    return proxy.loadProgram('hello.py', code, []);
}).then( function() {
    return new Promise( function(resolve, reject) {
        setTimeout(resolve, 2000);
    });
}).then( function() {
    console.log('Done.');
    return promise.resolve();
});


