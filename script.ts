/// <reference path="controller.ts"/>

var ScratchExtensions: any

(function(ext: any) {
    var server = new PLENControlServer($);
    console.log(server)
    // Cleanup function when the extension is unloaded
    ext._shutdown = function() {};

    // Status reporting code
    // Use this to report missing hardware, plugin or unsupported browser
    ext._getStatus = function() {
        return {status: 2, msg: 'Ready'};
    };

    ext.forward = function() {
        console.log("forward");
        console.log(server);
        server.play(70);
    }; 
    
    ext.connect = function() {
        console.log("connect");
        console.log(server);
        server.connect();
    }

    // Block and block menu descriptions
    var descriptor = {
        blocks: [
            // block type, block name, function name
            [' ', 'forward', 'forward'],
            [' ', 'connect', 'connet'],
            [' ', '止まる', 'stop']
        ]
    };

    // Register the extension
    ScratchExtensions.register('PLEN', descriptor, ext);
})({});
