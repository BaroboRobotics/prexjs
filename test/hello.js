"use strict";

var prex = require('./../src/js/prex.js');
var promise = require('promise');

var code = "print ('Hello, world!')";

var proxy = new prex.Proxy();
proxy.on('io', function(io_object) {
    console.log(io_object.data.toString('utf8'));
});

console.log('Connecting...');
proxy.connect('ws://localhost:43000').then( function() {
    console.log('Loading program...');
    return proxy.loadProgram('hello.py', code, []);
}).then( function() {
    console.log('Done.');
    return promise.resolve();
});

