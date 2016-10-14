/// <reference path="controller.ts"/>

var ScratchExtensions: any

(function(ext: any) {
    var server = new PLENControlServer($);
    // Cleanup function when the extension is unloaded
    ext._shutdown = function() {};

    // Status reporting code
    // Use this to report missing hardware, plugin or unsupported browser
    ext._getStatus = function() {
        return {status: 2, msg: 'Ready'};
    };

    ext.connect = function() {
        server.connect();
    }
    
    ext.stop = function() {
        server.stop();
    }

    ext.forward = function(n: number) {
        for(var i = 0; i < n; i++) {                
            server.play(1);
        }
    }; 

    ext.right_turn = function(n: number) {                
        for(var i = 0; i < n; i++) {
            server.play(72);
        }
    }
    
    ext.left_turn = function(n: number) {
        for(var i = 0; i < n; i++) {
            server.play(71);
        }
    }
    
    ext.set_angle = function(n: number) {
        // TODO: implement            
    }

    // Block and block menu descriptions
    var descriptor = {
        blocks: [
            // block type, block name, function name
            [' ', '接続する', 'connet'],
            [' ', '止まる', 'stop'],
            [' ', '%n 歩動かす', 'forward', 10],
            [' ', '時計回りに %n 度回す', 'right_turn', 15],
            [' ', '反時計周りに %n 度回す', 'left_turn', 15],
            [' ', '%n 度に向ける', 'set_angle']
        ]
    };

    // Register the extension
    ScratchExtensions.register('PLEN', descriptor, ext);
})({});
