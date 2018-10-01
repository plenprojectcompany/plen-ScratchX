enum SERVER_STATE
{
    DISCONNECTED,
    CONNECTED,
    WAITING
};

class PLENControlServerAPI
{
    private _state: SERVER_STATE = SERVER_STATE.DISCONNECTED;
    private _socket: WebSocket | null = null;
    private _ip_addr: string = 'localhost:17264';

    constructor(
        private _$: JQueryStatic
    )
    {
        this.connect()
            .then(() => { return this.checkVersionOfPLEN(); })
            .catch((e) => { alert(e); });

        this._$(window).on('beforeunload', () =>
        {
            this.disconnect().catch((e) => { console.log(e); });
        });
    }

    connect(): JQuery.Promise<any, any, any>
    {
        const d = this._$.Deferred();

        if (this._state === SERVER_STATE.DISCONNECTED)
        {
            this._state = SERVER_STATE.WAITING;

            this._$.get('//' + this._ip_addr + '/v2/connect')
                .then((response: any) =>
                {
                    if (response.data.result === true)
                    {
                        this._state = SERVER_STATE.CONNECTED;

                        return this._createWebSocket()
                            .then(() => { d.resolve(); })
                            .catch(() => { d.reject(); });
                    }
                    else
                    {
                        this._state = SERVER_STATE.DISCONNECTED;

                        d.reject('USB connection has been disconnected!');
                    }
                })
                .catch(() =>
                {
                    this._state = SERVER_STATE.DISCONNECTED;

                    d.reject("The control-server hasn't run. (or the api version is not supported.)");
                });
        }
        else
        {
            d.reject('Already connected to the control-server.');
        }

        return d.promise();
    }

    disconnect(): JQuery.Promise<any, any, any>
    {
        const d = this._$.Deferred();

        if (this._state === SERVER_STATE.CONNECTED)
        {
            this._state = SERVER_STATE.WAITING;

            this._$.get('//' + this._ip_addr + '/v2/disconnect')
                .then((response: any) =>
                {
                    if (response.data.result === true)
                    {
                        this._state = SERVER_STATE.DISCONNECTED;

                        d.resolve();
                    }
                    else
                    {
                        d.reject("The control-server hasn't run. (or the api version is not supported.)");
                    }
                })
                .catch(() =>
                {
                    this._state = SERVER_STATE.CONNECTED;

                    d.reject("The control-server hasn't run. (or the api version is not supported.)");
                });
        }
        else
        {
            d.reject('Already disconnected from the control-server.');
        }

        return d.promise();
    }

    play(slot: number): JQuery.Promise<any, any, any>
    {
        const d = this._$.Deferred();

        if (this._state === SERVER_STATE.CONNECTED)
        {
            this._state = SERVER_STATE.WAITING;

            this._$.get('//' + this._ip_addr + '/v2/motions/' + slot.toString() + '/play')
                .then((response: any) =>
                {
                    this._state = SERVER_STATE.CONNECTED;

                    if (response.data.result === true)
                    {
                        d.resolve();
                    }
                    else
                    {
                        this._state = SERVER_STATE.DISCONNECTED;

                        d.reject('USB connection has been disconnected!');
                    }
                })
                .catch(() =>
                {
                    this._state = SERVER_STATE.DISCONNECTED;

                    d.reject("The control-server hasn't run. (or the api version is not supported.)");
                });
        }
        else
        {
            d.reject('The control-server is busy or the connection was disabled.');
        }

        return d.promise();
    }

    stop(): JQuery.Promise<any, any, any>
    {
        const d = this._$.Deferred();

        if (this._state === SERVER_STATE.CONNECTED)
        {
            this._state = SERVER_STATE.WAITING;

            this._$.get('//' + this._ip_addr + '/v2/motions/stop')
                .then((response: any) =>
                {
                    this._state = SERVER_STATE.CONNECTED;

                    if (response.data.result === true)
                    {
                        d.resolve();
                    }
                    else
                    {
                        this._state = SERVER_STATE.DISCONNECTED;

                        d.reject('USB connection has been disconnected!');
                    }
                })
                .catch(() =>
                {
                    this._state = SERVER_STATE.DISCONNECTED;

                    d.reject("The control-server hasn't run. (or the api version is not supported.)");
                });
        }
        else
        {
            d.reject('The control-server is busy or the connection was disabled.');
        }

        return d.promise();
    }

    push(slot: number, loop_count: number = 0): boolean
    {
        if (this._socket)
        {
            this._socket.send('push/' + slot.toString() + '/' + loop_count.toString());

            return true;
        }

        return false;
    }

    pop(): boolean
    {
        if (this._socket)
        {
            this._socket.send('pop');

            return true;
        }

        return false
    }

    getStatus(): SERVER_STATE
    {
        return this._state;
    }

    checkVersionOfPLEN(): JQuery.Promise<any, any, any>
    {
        const d = this._$.Deferred();

        if (this._state === SERVER_STATE.CONNECTED)
        {
            const urls: Array<string> = [
                '//' + this._ip_addr + '/v2/version',
                '//' + this._ip_addr + '/v2/metadata'
            ];

            const promises = this._$.map(urls, (url: string) => { return this._$.get(url); });

            this._$.when(promises)
                .then((_0, _1) =>
                {
                    console.log(_0, _1);

                    try {
                        const firmware_version: number = parseInt(_0[0].responseJSON.data.version.replace(/\./g, ''));
                        const required_verison: number = parseInt(_1[0].responseJSON.required_firmware.replace(/[\.\~]/g, ''));

                        if (firmware_version < required_verison)
                        {
                            throw ('Firmware version of your PLEN is old. Please update version ' + _1[0].responseJSON.required_firmware + '.');
                        }

                        if (required_verison < 141)
                        {
                            throw ('Application version of "Control Server" is old. Please update version 2.5.0 or above.');
                        }

                        d.resolve();
                    }
                    catch (e)
                    {
                        return this._$.Deferred().reject(e);
                    }
                })
                .catch((error: any) =>
                {
                    if (typeof(error) === 'string')
                    {
                        d.reject(error);
                    }
                    else
                    {
                        d.reject('Application version of "Control Server" is old. Please update version 2.5.0 or above.');
                    }

                    this.disconnect();
                });
        }
        else
        {
            d.reject('The control-server is busy or the connection was disabled.');
        }

        return d.promise();
    }

    private _createWebSocket(): JQuery.Promise<any, any, any>
    {
        const d = this._$.Deferred();

        if (this._socket)
        {
            this._socket.close();
            this._socket = null;
        }

        this._socket = new WebSocket('ws://' + this._ip_addr + '/v2/cmdstream');

        this._socket.onopen = () =>
        {
            if (this._socket && this._socket.readyState === WebSocket.OPEN)
            {
                this._state = SERVER_STATE.CONNECTED;
            }
        };

        this._socket.onmessage = (e: MessageEvent) =>
        {
            if (e.data === 'False')
            {
                this._state = SERVER_STATE.DISCONNECTED;

                d.reject('USB connection has been disconnected!');
            }
            else
            {
                this._state = SERVER_STATE.CONNECTED;

                d.notify(e.data);
            }
        };

        this._socket.onerror = () =>
        {
            this._state = SERVER_STATE.DISCONNECTED;

            d.reject("The control-server hasn't run. (or the api version is not supported.)");
        };

        return d.promise();
    }
}
