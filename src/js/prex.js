"use strict";

var Promise = require( 'promise' );
var ProtoBuf = require( 'protobufjs' );
var WebSocketClient = require( 'websocket' ).w3cwebsocket;
var ByteBuffer = require( 'bytebuffer' );

var Proxy = function() {
    var self = this;
    var _pb_builder = ProtoBuf.loadProtoFile( 'proto/message.proto' );
    var _pb_root = _pb_builder.build();

    self._socket = {};
    self.connect = function(uri) {
        return new Promise( function( resolve, reject ) {
            self._socket = new WebSocketClient( uri );
            self._socket.binaryType = "arraybuffer";
            self._socket.onopen = function() {
                for ( var i = 0; i < self._callbacks.connect.length; i++) {
                    self._callbacks.connect[i]();
                }
                resolve();
            };
            self._socket.onclose = function() {
                for ( var i = 0; i < self._callbacks.connectionTerminated.length; i++) {
                    self._callbacks.connectionTerminated[i]();
                }
            };
            self._socket.onmessage = function( message ) {
                var prexMessage = _pb_root.PrexMessage.decode( message.data );
                if( prexMessage.type == _pb_root.PrexMessage.MessageType.IO ) {
                    self._handleIoMessage(prexMessage.payload);
                } else if ( prexMessage.type == _pb_root.PrexMessage.MessageType.IMAGE) {
                    self._handleImageMessage(prexMessage.payload);
                } else {
                    // We shouldn't be receiving any other type of message...
                }
            };
        });
    };

    self.loadProgram = function( filename, code, argv ) {
        // 'filename' and 'code' should both be string objects, 'argv' should be [string]
        return new Promise( function( resolve, reject ) {
            var loadProgramMessage = new _pb_root.LoadProgram({
                'filename': filename,
                'code': code
            });
            var prexMessage = new _pb_root.PrexMessage( {
                'type': _pb_root.PrexMessage.MessageType.LOAD_PROGRAM,
                'payload': loadProgramMessage.encode()
            });
            self._socket.send(prexMessage.toBuffer());
            resolve();
        });
    };

    self._callbacks = {};
    var names = ['io', 'image', 'connect', 'connectionTerminated', 'stdin'];
    for( var i = 0; i < names.length; i++ ) {
        self._callbacks[names[i]] = [];
    }
    self.on = function(name, callback) {
        // Valid callback names:
        // io( io_message_object );
        // image( image_message_object );
        // connect();
        // connectionTerminated();
        if ( typeof callback === 'undefined' || callback === null ) {
            return self.off(name);
        }
        self._callbacks[name].push(callback);
    };

    self.off = function(name) {
        // TODO
    };

    // Send a string to the remote process's stdin
    self.sendIo = function( to_stdin ) {
        return new Promise( function( resolve, reject ) {
            var ioMessage = new _pb_root.Io({
                'type': _pb_root.Io.FD.STDIN,
                'data': ByteBuffer.wrap(to_stdin)
            });
            var prexMessage = new _pb_root.PrexMessage( {
                'type': _pb_root.PrexMessage.MessageType.IO,
                'payload': ioMessage.encode()
            });
            self._socket.send(prexMessage.toBuffer());
            resolve();
        });
    };

    self._handleIoMessage = function( message ) {
        var ioMessage = _pb_root.Io.decode( message );
        if (ioMessage.type == _pb_root.Io.FD.STDOUT) {
            for( var i = 0; i < self._callbacks.io.length; i++ ) {
                self._callbacks.io[i](ioMessage);
            }
        }
        if (ioMessage.type == _pb_root.Io.FD.STDIN) {
            for( var j = 0; j < self._callbacks.io.length; j++ ) {
                self._callbacks.stdin[j](ioMessage.data.toString('utf8'));
            }
        }
    };

    self._handleImageMessage = function( message ) {
        var imageMessage = _pb_root.Image.decode( message );
        for( var i = 0; i < self._callbacks.image.length; i++ ) {
            self._callbacks.image[i](imageMessage);
        }
    };
};

module.exports.Proxy = Proxy;
