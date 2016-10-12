/// <reference path="./typings/globals/jquery/index.d.ts"/>

'use strict';

enum SERVER_STATE
{
    DISCONNECTED,
    CONNECTED,
    WAITING
};

class PLENControlServer
{
    private _state: SERVER_STATE = SERVER_STATE.DISCONNECTED;
    private _socket: WebSocket = null;
    private _ip_addr: string = "localhost:17264";

    constructor(
        public $http: any,
    )
    {
        this.connect();
    }

    connect(success_callback = null): void
    {
        if (this._state === SERVER_STATE.DISCONNECTED)
        {
            this._state = SERVER_STATE.WAITING;

            this.$http.get("//" + this._ip_addr + "/v2/connect")
                .success((response: any) =>
                {
                    if (response.data.result === true)
                    {
                        this._state = SERVER_STATE.CONNECTED;
                        this._createWebSocket();

                        if (!(success_callback == null))
                        {
                            success_callback();
                        }
                    }
                    else
                    {
                        this._state = SERVER_STATE.DISCONNECTED;

                        alert("USB connection has been disconnected!");
                    }
                })
                .error(() =>
                {
                    this._state = SERVER_STATE.DISCONNECTED;

                    alert("The control-server hasn't run.");
                });
        }
    }

    install(json, success_callback = null): void
    {
        if (this._state === SERVER_STATE.CONNECTED)
        {
            this._state = SERVER_STATE.WAITING;

            this.$http.put("//" + this._ip_addr + "/v2/motions/" + json.slot.toString(), json)
                .success((response: any) =>
                {
                    this._state = SERVER_STATE.CONNECTED;

                    if (response.data.result === true)
                    {
                        if (!(success_callback == null))
                        {
                            success_callback();
                        }
                    }
                })
                .error(() =>
                {
                    this._state = SERVER_STATE.DISCONNECTED;
                })
                .finally(() =>
                {
                    console.log("Install Finished")
                });
        }
    }
    
        play(slot: number, success_callback = null): void
    {
        if (this._state === SERVER_STATE.CONNECTED)
        {
            this._state = SERVER_STATE.WAITING;

            this.$http.get("//" + this._ip_addr + "/v2/motions/" + slot.toString() + "/play")
                .success((response: any) =>
                {
                    this._state = SERVER_STATE.CONNECTED;

                    if (response.data.result === true)
                    {
                        if (!(success_callback == null))
                        {
                            success_callback();
                        }
                    }
                    else
                    {
                        this._state = SERVER_STATE.DISCONNECTED;

                        alert("USB connection was disconnected!");
                    }
                })
                .error(() =>
                {
                    this._state = SERVER_STATE.DISCONNECTED;
                });
        }
    }

    stop(success_callback = null): void
    {
        if (this._state === SERVER_STATE.CONNECTED)
        {
            this._state = SERVER_STATE.WAITING;

            this.$http.get("//" + this._ip_addr + "/v2/motions/stop")
                .success((response: any) =>
                {
                    this._state = SERVER_STATE.CONNECTED;

                    if (response.data.result === true)
                    {
                        if (!(success_callback == null))
                        {
                            success_callback();
                        }
                    }
                    else
                    {
                        this._state = SERVER_STATE.DISCONNECTED;

                        alert("USB connection was disconnected!");
                    }
                })
                .error(() =>
                {
                    this._state = SERVER_STATE.DISCONNECTED;
                });
        }
    }

    applyNative(device: string, value: number): void
    {
        if (this._state === SERVER_STATE.CONNECTED)
        {
            this._socket.send('apply/' + device + '/' + value.toString());
            this._state = SERVER_STATE.WAITING;
        }
    }

    setMin(device: string, value: number): void
    {
        if (this._state === SERVER_STATE.CONNECTED)
        {
            this._socket.send('setMin/' + device + '/' + value.toString());
            this._state = SERVER_STATE.WAITING;
        }
    }

    setMax(device: string, value: number): void
    {
        if (this._state === SERVER_STATE.CONNECTED)
        {
            this._socket.send('setMax/' + device + '/' + value.toString());
            this._state = SERVER_STATE.WAITING;
        }
    }

    setHome(device: string, value: number): void
    {
        if (this._state === SERVER_STATE.CONNECTED)
        {
            console.log("setHome");

            this._socket.send('setHome/' + device + '/' + value.toString());
            this._state = SERVER_STATE.WAITING;
        }
    }

    getStatus(): SERVER_STATE
    {
        return this._state;
    }

    private _createWebSocket(): void
    {
        if (!(this._socket == null))
        {
            this._socket.close();
            this._socket = null;
        }

        this._socket = new WebSocket('ws://' + this._ip_addr + '/v2/cmdstream');

        this._socket.onopen = () =>
        {
            if (this._socket.readyState === WebSocket.OPEN)
            {
                this._state = SERVER_STATE.CONNECTED;
            }
        };

        this._socket.onmessage = (event) =>
        {
            if (event.data == "False")
            {
                if (this._state === SERVER_STATE.WAITING)
                {
                    this._state = SERVER_STATE.DISCONNECTED;

                    alert("USB connection has been disconnected!");
                }
            }
            else
            {
                this._state = SERVER_STATE.CONNECTED;
            }
        };

        this._socket.onerror = () =>
        {
            this._state = SERVER_STATE.DISCONNECTED;

            alert("The control-server hasn't run.");
        };
    }
}
