var SERVER_STATE;
(function (SERVER_STATE) {
    SERVER_STATE[SERVER_STATE["DISCONNECTED"] = 0] = "DISCONNECTED";
    SERVER_STATE[SERVER_STATE["CONNECTED"] = 1] = "CONNECTED";
    SERVER_STATE[SERVER_STATE["WAITING"] = 2] = "WAITING";
})(SERVER_STATE || (SERVER_STATE = {}));
;
var PLENControlServerAPI = (function () {
    function PLENControlServerAPI(_$) {
        var _this = this;
        this._$ = _$;
        this._state = SERVER_STATE.DISCONNECTED;
        this._socket = null = null;
        this._ip_addr = 'localhost:17264';
        this.connect()
            .then(function () { return _this.checkVersionOfPLEN(); })
            .catch(function (e) { alert(e); });
        this._$(window).on('beforeunload', function () {
            _this.disconnect().catch(function (e) { console.log(e); });
        });
    }
    PLENControlServerAPI.prototype.connect = function () {
        var _this = this;
        var d = this._$.Deferred();
        if (this._state === SERVER_STATE.DISCONNECTED) {
            this._state = SERVER_STATE.WAITING;
            this._$.get('//' + this._ip_addr + '/v2/connect')
                .then(function (response) {
                if (response.data.result === true) {
                    _this._state = SERVER_STATE.CONNECTED;
                    return _this._createWebSocket()
                        .then(function () { d.resolve(); })
                        .catch(function () { d.reject(); });
                }
                else {
                    _this._state = SERVER_STATE.DISCONNECTED;
                    d.reject('USB connection has been disconnected!');
                }
            })
                .catch(function () {
                _this._state = SERVER_STATE.DISCONNECTED;
                d.reject("The control-server hasn't run. (or the api version is not supported.)");
            });
        }
        else {
            d.reject('Already connected to the control-server.');
        }
        return d.promise();
    };
    PLENControlServerAPI.prototype.disconnect = function () {
        var _this = this;
        var d = this._$.Deferred();
        if (this._state === SERVER_STATE.CONNECTED) {
            this._state = SERVER_STATE.WAITING;
            this._$.get('//' + this._ip_addr + '/v2/disconnect')
                .then(function (response) {
                if (response.data.result === true) {
                    _this._state = SERVER_STATE.DISCONNECTED;
                    d.resolve();
                }
                else {
                    d.reject("The control-server hasn't run. (or the api version is not supported.)");
                }
            })
                .catch(function () {
                _this._state = SERVER_STATE.CONNECTED;
                d.reject("The control-server hasn't run. (or the api version is not supported.)");
            });
        }
        else {
            d.reject('Already disconnected from the control-server.');
        }
        return d.promise();
    };
    PLENControlServerAPI.prototype.play = function (slot) {
        var _this = this;
        var d = this._$.Deferred();
        if (this._state === SERVER_STATE.CONNECTED) {
            this._state = SERVER_STATE.WAITING;
            this._$.get('//' + this._ip_addr + '/v2/motions/' + slot.toString() + '/play')
                .then(function (response) {
                _this._state = SERVER_STATE.CONNECTED;
                if (response.data.result === true) {
                    d.resolve();
                }
                else {
                    _this._state = SERVER_STATE.DISCONNECTED;
                    d.reject('USB connection has been disconnected!');
                }
            })
                .catch(function () {
                _this._state = SERVER_STATE.DISCONNECTED;
                d.reject("The control-server hasn't run. (or the api version is not supported.)");
            });
        }
        else {
            d.reject('The control-server is busy or the connection was disabled.');
        }
        return d.promise();
    };
    PLENControlServerAPI.prototype.stop = function () {
        var _this = this;
        var d = this._$.Deferred();
        if (this._state === SERVER_STATE.CONNECTED) {
            this._state = SERVER_STATE.WAITING;
            this._$.get('//' + this._ip_addr + '/v2/motions/stop')
                .then(function (response) {
                _this._state = SERVER_STATE.CONNECTED;
                if (response.data.result === true) {
                    d.resolve();
                }
                else {
                    _this._state = SERVER_STATE.DISCONNECTED;
                    d.reject('USB connection has been disconnected!');
                }
            })
                .catch(function () {
                _this._state = SERVER_STATE.DISCONNECTED;
                d.reject("The control-server hasn't run. (or the api version is not supported.)");
            });
        }
        else {
            d.reject('The control-server is busy or the connection was disabled.');
        }
        return d.promise();
    };
    PLENControlServerAPI.prototype.push = function (slot, loop_count) {
        if (loop_count === void 0) { loop_count = 0; }
        if (this._socket) {
            this._socket.send('push/' + slot.toString() + '/' + loop_count.toString());
            return true;
        }
        return false;
    };
    PLENControlServerAPI.prototype.pop = function () {
        if (this._socket) {
            this._socket.send('pop');
            return true;
        }
        return false;
    };
    PLENControlServerAPI.prototype.getStatus = function () {
        return this._state;
    };
    PLENControlServerAPI.prototype.checkVersionOfPLEN = function () {
        var _this = this;
        var d = this._$.Deferred();
        if (this._state === SERVER_STATE.CONNECTED) {
            var urls = [
                '//' + this._ip_addr + '/v2/version',
                '//' + this._ip_addr + '/v2/metadata'
            ];
            var promises = this._$.map(urls, function (url) { return _this._$.get(url); });
            this._$.when(promises)
                .then(function (_0, _1) {
                console.log(_0, _1);
                try {
                    var firmware_version = parseInt(_0[0].responseJSON.data.version.replace(/\./g, ''));
                    var required_verison = parseInt(_1[0].responseJSON.required_firmware.replace(/[\.\~]/g, ''));
                    if (firmware_version < required_verison) {
                        throw ('Firmware version of your PLEN is old. Please update version ' + _1[0].responseJSON.required_firmware + '.');
                    }
                    if (required_verison < 141) {
                        throw ('Application version of "Control Server" is old. Please update version 2.5.0 or above.');
                    }
                    d.resolve();
                }
                catch (e) {
                    return _this._$.Deferred().reject(e);
                }
            })
                .catch(function (error) {
                if (typeof (error) === 'string') {
                    d.reject(error);
                }
                else {
                    d.reject('Application version of "Control Server" is old. Please update version 2.5.0 or above.');
                }
                _this.disconnect();
            });
        }
        else {
            d.reject('The control-server is busy or the connection was disabled.');
        }
        return d.promise();
    };
    PLENControlServerAPI.prototype._createWebSocket = function () {
        var _this = this;
        var d = this._$.Deferred();
        if (this._socket) {
            this._socket.close();
            this._socket = null;
        }
        this._socket = new WebSocket('ws://' + this._ip_addr + '/v2/cmdstream');
        this._socket.onopen = function () {
            if (_this._socket && _this._socket.readyState === WebSocket.OPEN) {
                _this._state = SERVER_STATE.CONNECTED;
            }
        };
        this._socket.onmessage = function (e) {
            if (e.data === 'False') {
                _this._state = SERVER_STATE.DISCONNECTED;
                d.reject('USB connection has been disconnected!');
            }
            else {
                _this._state = SERVER_STATE.CONNECTED;
                d.notify(e.data);
            }
        };
        this._socket.onerror = function () {
            _this._state = SERVER_STATE.DISCONNECTED;
            d.reject("The control-server hasn't run. (or the api version is not supported.)");
        };
        return d.promise();
    };
    return PLENControlServerAPI;
}());
