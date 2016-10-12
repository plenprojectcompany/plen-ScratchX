var ScratchExtensions;
(function (ext) {
    // Cleanup function when the extension is unloaded
    ext._shutdown = function () { };
    // Status reporting code
    // Use this to report missing hardware, plugin or unsupported browser
    ext._getStatus = function () {
        return { status: 2, msg: 'Ready' };
    };
    ext.forward = function () {
    };
    // Block and block menu descriptions
    var descriptor = {
        blocks: [
            // block type, block name, function name
            [' ', 'forward', 'forward']
        ]
    };
    // Register the extension
    ScratchExtensions.register('PLEN', descriptor, ext);
})({});
