/// <reference path="controller.ts"/>

var ScratchExtensions: any

(function(ext: any) {
    var server = new PLENControlServer($);
    // Cleanup function when the extension is unloaded
    ext._shutdown = function() {};

    // Status reporting code
    // Use this to report missing hardware, plugin or unsupported browser
    ext.connect = function() {
        server.connect();
    }
    
    ext._getStatus = function() {
        return {status: 2, msg: 'Ready'};
    };

    ext.forward = function(n: number) {
        server.play(70);
    }; 
    

    // Block and block menu descriptions
    var descriptor = {
        blocks: [
            // block type, block name, function name
            [' ', '接続する', 'connet'],
            [' ', '止まる', 'stop'],
            [' ', '%n歩動かす', 'forward', 10],
            [' ', '時計回りに%n度回す', 'right_turn', 15],
            [' ', '反時計周りに%n度回す', 'left_turn', 15],
            [' ', '%n度に向ける', 'direct']
        ]
    };

    // Register the extension
    ScratchExtensions.register('PLEN', descriptor, ext);
})({});
