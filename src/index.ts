/// <reference path="controller.ts"/>

var ScratchExtensions: any

(function(ext: any) {
    var server = new PLENControlServer($);
    // Cleanup function when the extension is unloaded
    ext._shutdown = function() {};

    // Status reporting code
    // Use this to report missing hardware, plugin or unsupported browser
    ext._getStatus = function() {
        var server_status: SERVER_STATE = server.getStatus();
        var status: number;
        var msg: string;
        if(server_status == SERVER_STATE.CONNECTED) {
            status = 2;
            msg = 'Connected';
        } else if(server_status == SERVER_STATE.DISCONNECTED) {
            status = 0;
            msg = 'Disconnected';
        } else {
            status = 1;
            msg = 'Waiting';
        }
        return {status: status, msg: msg};
    };

    ext.connect = function() {
        server.connect();
    }
    
    ext.stop = function() {
        server.stop();
    }

    ext.push = function(n: number) {
        server.push(n)
    } 

    ext.execute_and_pop = function() {
        server.pop()
    }

    ext.forward = function() {
        return 1;
    };

    ext.right_turn = function() {                
        return 72;
    }
    
    ext.left_turn = function() {
        return 71;
    }

    ext.right_kick = function() {
        return 25;
    }    
    
    ext.left_kick = function() {
        return 23;
    }

    // Block and block menu descriptions
    var descriptor = {
        blocks: [
            // block type, block name, function name
            [' ', 'push %n', 'push', 1],
            [' ', 'execute & pop', 'execute_and_pop'],
            [' ', '接続する', 'connect'],
            [' ', '止まる', 'stop'],
            ['r', '1歩歩く', 'forward'],
            ['r', '時計回りで回転', 'right_turn'],
            ['r', '反時計周りで回転', 'left_turn'],
            ['r', '右キック', 'right_kick'],
            ['r', '左キック', 'left_kick'],
        ]
    };

    // Register the extension
    ScratchExtensions.register('PLEN', descriptor, ext);
})({});
