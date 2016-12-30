var SERVER_STATE;
(function (SERVER_STATE) {
    SERVER_STATE[SERVER_STATE["DISCONNECTED"] = 0] = "DISCONNECTED";
    SERVER_STATE[SERVER_STATE["CONNECTED"] = 1] = "CONNECTED";
    SERVER_STATE[SERVER_STATE["WAITING"] = 2] = "WAITING";
})(SERVER_STATE || (SERVER_STATE = {}));
;
var PLENControlServerAPI = (function () {
    function PLENControlServerAPI(_$jquery) {
        this._$jquery = _$jquery;
        this._state = SERVER_STATE.DISCONNECTED;
        this._socket = null;
        this._ip_addr = 'localhost:17264';
        this.connect();
    }
    PLENControlServerAPI.prototype.connect = function (success_callback) {
        var _this = this;
        if (success_callback === void 0) { success_callback = null; }
        if (this._state === SERVER_STATE.DISCONNECTED) {
            this._state = SERVER_STATE.WAITING;
            this._$jquery.get('//' + this._ip_addr + '/v2/connect')
                .done(function (response) {
                if (response.data.result === true) {
                    _this._state = SERVER_STATE.CONNECTED;
                    _this._createWebSocket();
                    if (success_callback !== null) {
                        success_callback();
                    }
                }
                else {
                    _this._state = SERVER_STATE.DISCONNECTED;
                    alert('USB connection has been disconnected!');
                }
            })
                .fail(function () {
                _this._state = SERVER_STATE.DISCONNECTED;
                alert("The control-server hasn't run.");
            });
        }
    };
    PLENControlServerAPI.prototype.disconnect = function (success_callback) {
        var _this = this;
        if (success_callback === void 0) { success_callback = null; }
        if (this._state === SERVER_STATE.CONNECTED) {
            this._state = SERVER_STATE.WAITING;
            this._$jquery.get('//' + this._ip_addr + '/v2/disconnect')
                .done(function (response) {
                if (response.data.result === true) {
                    if (success_callback !== null) {
                        success_callback();
                    }
                }
                _this._state = SERVER_STATE.DISCONNECTED;
            })
                .fail(function () {
                _this._state = SERVER_STATE.CONNECTED;
            });
        }
    };
    PLENControlServerAPI.prototype.play = function (slot, success_callback) {
        var _this = this;
        if (success_callback === void 0) { success_callback = null; }
        if (this._state === SERVER_STATE.CONNECTED) {
            this._state = SERVER_STATE.WAITING;
            this._$jquery.get('//' + this._ip_addr + '/v2/motions/' + slot.toString() + '/play')
                .done(function (response) {
                _this._state = SERVER_STATE.CONNECTED;
                if (response.data.result === true) {
                    if (success_callback !== null) {
                        success_callback();
                    }
                }
                else {
                    _this._state = SERVER_STATE.DISCONNECTED;
                    alert('USB connection was disconnected!');
                }
            })
                .fail(function () {
                _this._state = SERVER_STATE.DISCONNECTED;
            });
        }
    };
    PLENControlServerAPI.prototype.stop = function (success_callback) {
        var _this = this;
        if (success_callback === void 0) { success_callback = null; }
        if (this._state === SERVER_STATE.CONNECTED) {
            this._state = SERVER_STATE.WAITING;
            this._$jquery.get('//' + this._ip_addr + '/v2/motions/stop')
                .done(function (response) {
                _this._state = SERVER_STATE.CONNECTED;
                if (response.data.result === true) {
                    if (!(success_callback == null)) {
                        success_callback();
                    }
                }
                else {
                    _this._state = SERVER_STATE.DISCONNECTED;
                    alert('USB connection was disconnected!');
                }
            })
                .fail(function () {
                _this._state = SERVER_STATE.DISCONNECTED;
            });
        }
    };
    PLENControlServerAPI.prototype.push = function (slot, loop_count) {
        if (loop_count === void 0) { loop_count = 0; }
        this._socket.send('push/' + slot.toString() + '/' + loop_count.toString());
    };
    PLENControlServerAPI.prototype.pop = function () {
        this._socket.send('pop');
    };
    PLENControlServerAPI.prototype.applyNative = function (device, value) {
        if (this._state === SERVER_STATE.CONNECTED) {
            this._socket.send('apply/' + device + '/' + value.toString());
            this._state = SERVER_STATE.WAITING;
        }
    };
    PLENControlServerAPI.prototype.applyDiff = function (device, value) {
        if (this._state === SERVER_STATE.CONNECTED) {
            this._socket.send('applyDiff/' + device + '/' + value.toString());
            this._state = SERVER_STATE.WAITING;
        }
    };
    PLENControlServerAPI.prototype.getStatus = function () {
        return this._state;
    };
    PLENControlServerAPI.prototype.checkVersionOfPLEN = function () {
        var _this = this;
        if (this._state === SERVER_STATE.CONNECTED) {
            var deferred = this._$jquery.Deferred();
            var promise = deferred.promise();
            var urls = [
                '//' + this._ip_addr + '/v2/version',
                '//' + this._ip_addr + '/v2/metadata'
            ];
            var responses = [];
            urls.forEach(function (url) {
                promise = promise.always(function () {
                    return _this._$jquery.get(url)
                        .done(function (response) {
                        responses.push(response);
                    });
                });
            });
            promise = promise
                .then(function () {
                try {
                    var firmware_version = parseInt(responses[0].data['version'].replace(/\./g, ''));
                    var required_verison = parseInt(responses[1].data['required-firmware'].replace(/[\.\~]/g, ''));
                    if (firmware_version < required_verison)
                        throw 'version error';
                }
                catch (e) {
                    _this._state = SERVER_STATE.DISCONNECTED;
                    alert('Firmware version of your PLEN is old. Please update version ' + responses[1].data['required-firmware'] + '.');
                }
            })
                .fail(function () {
                _this._state = SERVER_STATE.DISCONNECTED;
            });
            deferred.resolve();
        }
    };
    PLENControlServerAPI.prototype._createWebSocket = function () {
        var _this = this;
        if (this._socket !== null) {
            this._socket.close();
            this._socket = null;
        }
        this._socket = new WebSocket('ws://' + this._ip_addr + '/v2/cmdstream');
        this._socket.onopen = function () {
            if (_this._socket.readyState === WebSocket.OPEN) {
                _this._state = SERVER_STATE.CONNECTED;
            }
        };
        this._socket.onmessage = function (e) {
            if (e.data == 'False') {
                if (_this._state === SERVER_STATE.WAITING) {
                    _this._state = SERVER_STATE.DISCONNECTED;
                    alert('USB connection has been disconnected!');
                }
            }
            else {
                _this._state = SERVER_STATE.CONNECTED;
            }
        };
        this._socket.onerror = function () {
            _this._state = SERVER_STATE.DISCONNECTED;
            alert("The control-server hasn't run.");
        };
    };
    return PLENControlServerAPI;
}());
(function (plen_extension) {
    var server = new PLENControlServerAPI($);
    plen_extension._shutdown = function () {
        server.disconnect();
    };
    plen_extension._getStatus = function () {
        var server_state = server.getStatus();
        var status;
        var msg;
        switch (server_state) {
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
            default:
                {
                    status = 1;
                    msg = 'Waiting...';
                }
        }
        return { status: status, msg: msg };
    };
    plen_extension.connect = function () { server.connect(); };
    plen_extension.push = function (n) { server.push(n); };
    plen_extension.pop = function () { server.pop(); };
    plen_extension.stop = function () { server.stop(); };
    plen_extension.forward = function () { return 1; };
    plen_extension.left_turn = function () { return 71; };
    plen_extension.right_turn = function () { return 72; };
    plen_extension.left_kick = function () { return 23; };
    plen_extension.right_kick = function () { return 25; };
    var descriptor = {
        blocks: [
            [' ', 'Connect', 'connect'],
            [' ', 'Push %n', 'push', 1],
            [' ', 'Execute all', 'pop'],
            [' ', 'Stop', 'stop'],
            ['r', 'Step to forward', 'forward'],
            ['r', 'Turn to left', 'left_turn'],
            ['r', 'Turn to right', 'right_turn'],
            ['r', 'Left kick', 'left_kick'],
            ['r', 'Right kick', 'right_kick']
        ]
    };
    ScratchExtensions.register('PLEN', descriptor, plen_extension);
})({});
