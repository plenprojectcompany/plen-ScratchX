/// <reference path="plen-control-server.api.ts"/>
(function (plen_extension) {
    var server = new PLENControlServerAPI($);
    // Cleanup function when the extension is unloaded.
    plen_extension._shutdown = function () {
        server.disconnect().catch(function (e) { console.log(e); });
    };
    // Status reporting code:
    // Use this to report missing hardware, plugin or unsupported browser.
    plen_extension._getStatus = function () {
        var status = 1;
        var msg = 'Waiting...';
        switch (server.getStatus()) {
            case (SERVER_STATE.CONNECTED):
                {
                    status = 2;
                    msg = 'Connected';
                    break;
                }
            case (SERVER_STATE.DISCONNECTED):
                {
                    status = 0;
                    msg = 'Disconnected';
                    break;
                }
        }
        return { status: status, msg: msg };
    };
    // Definition of command blocks.
    plen_extension.connect = function (callback) {
        server.connect()
            .then(function () { callback(); })
            .catch(function (e) { console.log(e); });
    };
    plen_extension.stop = function (callback) {
        server.stop()
            .then(function () { callback(); })
            .catch(function (e) { console.log(e); });
    };
    plen_extension.push = function (n, t) { server.push(n, (t > 0) ? t - 1 : 0); };
    plen_extension.pop = function () { server.pop(); };
    // Definition of reporter blocks.
    plen_extension.motion_forward = function () { return 1; };
    plen_extension.motion_left_turn = function () { return 71; };
    plen_extension.motion_right_turn = function () { return 72; };
    plen_extension.motion_left_kick = function () { return 23; };
    plen_extension.motion_right_kick = function () { return 25; };
    // Block and block menu descriptions.
    var descriptor = {
        blocks: window.navigator.language === 'ja' ?
            [
                // [<BLOCK_TYPE>, <BLOCK_NAME>, <FUNCTION_NAME>, <DEFAULT_ARGUMENT>...]
                // s.a. https://github.com/LLK/scratchx/wiki#adding-blocks
                ['w', 'せつぞく', 'connect'],
                [' ', 'うごき %n をよやく (%n かい)', 'push', 0, 1],
                [' ', 'よやくしたうごきをさいせい', 'pop'],
                ['w', 'うごきをとめる', 'stop'],
                ['r', 'まえへあるく', 'motion_forward'],
                ['r', 'ひだりへまがる', 'motion_left_turn'],
                ['r', 'みぎへまがる', 'motion_right_turn'],
                ['r', 'ひだりキック', 'motion_left_kick'],
                ['r', 'みぎキック', 'motion_right_kick']
            ] :
            [
                ['w', 'Connect', 'connect'],
                [' ', 'Reserve to play motion %n (%n times)', 'push', 0, 1],
                [' ', 'Play the all reserved motions', 'pop'],
                ['w', 'Stop to play any motion', 'stop'],
                ['r', 'Motion: Step to forward', 'motion_forward'],
                ['r', 'Motion: Turn to left', 'motion_left_turn'],
                ['r', 'Motion: Turn to right', 'motion_right_turn'],
                ['r', 'Motion: Left kick', 'motion_left_kick'],
                ['r', 'Motion: Right kick', 'motion_right_kick']
            ]
    };
    // Register the extension.
    ScratchExtensions.register('PLEN', descriptor, plen_extension);
})({});
