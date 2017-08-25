/// <reference path='../typings/index.d.ts'/>


enum SERVER_STATE
{
    DISCONNECTED,
    CONNECTED,
    WAITING
};

class PLENControlServerAPI
{
    private _state: SERVER_STATE = SERVER_STATE.DISCONNECTED;
    private _socket: WebSocket = null;
    private _ip_addr: string = 'localhost:17264';

    constructor(
        private _$jquery: JQueryStatic
    )
    {
        this.connect();

        this._$jquery(window).on('beforeunload', () => { this.disconnect(); });
    }

    connect(success_callback = null): void
    {
        if (this._state === SERVER_STATE.DISCONNECTED)
        {
            this._state = SERVER_STATE.WAITING;

            this._$jquery.get('//' + this._ip_addr + '/v2/connect')
                .done((response: any) =>
                {
                    if (response.data.result === true)
                    {
                        this._state = SERVER_STATE.CONNECTED;
                        this._createWebSocket();

                        if (success_callback !== null)
                        {
                            success_callback();
                        }
                    }
                    else
                    {
                        this._state = SERVER_STATE.DISCONNECTED;

                        alert('USB connection has been disconnected!');
                    }
                })
                .fail(() =>
                {
                    this._state = SERVER_STATE.DISCONNECTED;

                    alert("The control-server hasn't run.");
                });
        }
    }

    disconnect(success_callback = null): void
    {
        if (this._state === SERVER_STATE.CONNECTED)
        {
            this._state = SERVER_STATE.WAITING;

            this._$jquery.get('//' + this._ip_addr + '/v2/disconnect')
                .done((response: any) =>
                {
                    if (response.data.result === true)
                    {
                        if (success_callback !== null)
                        {
                            success_callback();
                        }
                    }

                    this._state = SERVER_STATE.DISCONNECTED;
                })
                .fail(() =>
                {
                    this._state = SERVER_STATE.CONNECTED;
                });
        }
    }

    play(slot: number, success_callback = null): void
    {
        if (this._state === SERVER_STATE.CONNECTED)
        {
            this._state = SERVER_STATE.WAITING;

            this._$jquery.get('//' + this._ip_addr + '/v2/motions/' + slot.toString() + '/play')
                .done((response: any) =>
                {
                    this._state = SERVER_STATE.CONNECTED;

                    if (response.data.result === true)
                    {
                        if (success_callback !== null)
                        {
                            success_callback();
                        }
                    }
                    else
                    {
                        this._state = SERVER_STATE.DISCONNECTED;

                        alert('USB connection was disconnected!');
                    }
                })
                .fail(() =>
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

            this._$jquery.get('//' + this._ip_addr + '/v2/motions/stop')
                .done((response: any) =>
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

                        alert('USB connection was disconnected!');
                    }
                })
                .fail(() =>
                {
                    this._state = SERVER_STATE.DISCONNECTED;
                });
        }
    }

    push(slot: number, loop_count: number = 0): void
    {
         this._socket.send('push/' + slot.toString() + '/' + loop_count.toString());
    }

    pop(): void
    {
         this._socket.send('pop')
    }

    applyNative(device: string, value: number): void
    {
        if (this._state === SERVER_STATE.CONNECTED)
        {
            this._socket.send('apply/' + device + '/' + value.toString());
            this._state = SERVER_STATE.WAITING;
        }
    }

    applyDiff(device: string, value: number): void
    {
        if (this._state === SERVER_STATE.CONNECTED)
        {
            this._socket.send('applyDiff/' + device + '/' + value.toString());
            this._state = SERVER_STATE.WAITING;
        }
    }

    getStatus(): SERVER_STATE
    {
        return this._state;
    }

    checkVersionOfPLEN(): void
    {
        if (this._state === SERVER_STATE.CONNECTED)
        {
            var deferred: JQueryDeferred<any> = this._$jquery.Deferred();
            var promise: JQueryPromise<any>   = deferred.promise();

            var urls: Array<string> = [
                '//' + this._ip_addr + '/v2/version',
                '//' + this._ip_addr + '/v2/metadata'
            ];

            var responses: Array<any> = [];

            urls.forEach((url: string) =>
            {
                promise = promise.always(() =>
                {
                    return this._$jquery.get(url)
                        .done((response: any) =>
                        {
                            responses.push(response);
                        });
                });
            });

            promise = promise
                .then(() =>
                {
                    try {
                        var firmware_version: number = parseInt(responses[0].data['version'].replace(/\./g, ''));
                        var required_verison: number = parseInt(responses[1].data['required-firmware'].replace(/[\.\~]/g, ''));

                        if (firmware_version < required_verison) throw 'version error';
                    }
                    catch (e)
                    {
                        this._state = SERVER_STATE.DISCONNECTED;

                        alert('Firmware version of your PLEN is old. Please update version ' + responses[1].data['required-firmware'] + '.');
                    }
                })
                .fail(() =>
                {
                    this._state = SERVER_STATE.DISCONNECTED;
                });

            deferred.resolve();
        }
    }

    private _createWebSocket(): void
    {
        if (this._socket !== null)
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

        this._socket.onmessage = (e: MessageEvent) =>
        {
            if (e.data == 'False')
            {
                if (this._state === SERVER_STATE.WAITING)
                {
                    this._state = SERVER_STATE.DISCONNECTED;

                    alert('USB connection has been disconnected!');
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
