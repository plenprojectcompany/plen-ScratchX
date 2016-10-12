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

    ext.forward = function(server: PLENControlServer) {
        $.getJSON("https://raw.githubusercontent.com/plenprojectcompany/PLEN2/master/motions/46_Walk_Forward.json", function(data: any) {
            server.install(data);
        });
    }; 

    // Block and block menu descriptions
    var descriptor = {
        blocks: [
            // block type, block name, function name
            [' ', 'forward', 'forward', server]
        ]
    };

    // Register the extension
    ScratchExtensions.register('PLEN', descriptor, ext);
})({});
