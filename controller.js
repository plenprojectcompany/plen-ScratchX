/// <reference path="./typings/globals/jquery/index.d.ts"/>
'use strict';
var SERVER_STATE;
(function (SERVER_STATE) {
    SERVER_STATE[SERVER_STATE["DISCONNECTED"] = 0] = "DISCONNECTED";
    SERVER_STATE[SERVER_STATE["CONNECTED"] = 1] = "CONNECTED";
    SERVER_STATE[SERVER_STATE["WAITING"] = 2] = "WAITING";
})(SERVER_STATE || (SERVER_STATE = {}));
;
var PLENControlServer = (function () {
    function PLENControlServer($http) {
        this.$http = $http;
        this._state = SERVER_STATE.DISCONNECTED;
        this._socket = null;
        this._ip_addr = "localhost:17264";
        this.connect();
    }
    PLENControlServer.prototype.connect = function (success_callback) {
        var _this = this;
        if (success_callback === void 0) { success_callback = null; }
        if (this._state === SERVER_STATE.DISCONNECTED) {
            this._state = SERVER_STATE.WAITING;
            this.$http.get("//" + this._ip_addr + "/v2/connect")
                .success(function (response) {
                if (response.data.result === true) {
                    _this._state = SERVER_STATE.CONNECTED;
                    _this._createWebSocket();
                    if (!(success_callback == null)) {
                        success_callback();
                    }
                }
                else {
                    _this._state = SERVER_STATE.DISCONNECTED;
                    alert("USB connection has been disconnected!");
                }
            })
                .error(function () {
                _this._state = SERVER_STATE.DISCONNECTED;
                alert("The control-server hasn't run.");
            });
        }
    };
    PLENControlServer.prototype.install = function (json, success_callback) {
        var _this = this;
        if (success_callback === void 0) { success_callback = null; }
        if (this._state === SERVER_STATE.CONNECTED) {
            this._state = SERVER_STATE.WAITING;
            this.$http.put("//" + this._ip_addr + "/v2/motions/" + json.slot.toString(), json)
                .success(function (response) {
                _this._state = SERVER_STATE.CONNECTED;
                if (response.data.result === true) {
                    if (!(success_callback == null)) {
                        success_callback();
                    }
                }
            })
                .error(function () {
                _this._state = SERVER_STATE.DISCONNECTED;
            })
                .finally(function () {
                console.log("Install Finished");
            });
        }
    };
    PLENControlServer.prototype.applyNative = function (device, value) {
        if (this._state === SERVER_STATE.CONNECTED) {
            this._socket.send('apply/' + device + '/' + value.toString());
            this._state = SERVER_STATE.WAITING;
        }
    };
    PLENControlServer.prototype.setMin = function (device, value) {
        if (this._state === SERVER_STATE.CONNECTED) {
            this._socket.send('setMin/' + device + '/' + value.toString());
            this._state = SERVER_STATE.WAITING;
        }
    };
    PLENControlServer.prototype.setMax = function (device, value) {
        if (this._state === SERVER_STATE.CONNECTED) {
            this._socket.send('setMax/' + device + '/' + value.toString());
            this._state = SERVER_STATE.WAITING;
        }
    };
    PLENControlServer.prototype.setHome = function (device, value) {
        if (this._state === SERVER_STATE.CONNECTED) {
            console.log("setHome");
            this._socket.send('setHome/' + device + '/' + value.toString());
            this._state = SERVER_STATE.WAITING;
        }
    };
    PLENControlServer.prototype.getStatus = function () {
        return this._state;
    };
    PLENControlServer.prototype._createWebSocket = function () {
        var _this = this;
        if (!(this._socket == null)) {
            this._socket.close();
            this._socket = null;
        }
        this._socket = new WebSocket('ws://' + this._ip_addr + '/v2/cmdstream');
        this._socket.onopen = function () {
            if (_this._socket.readyState === WebSocket.OPEN) {
                _this._state = SERVER_STATE.CONNECTED;
            }
        };
        this._socket.onmessage = function (event) {
            if (event.data == "False") {
                if (_this._state === SERVER_STATE.WAITING) {
                    _this._state = SERVER_STATE.DISCONNECTED;
                    alert("USB connection has been disconnected!");
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
    return PLENControlServer;
}());
