Scratch X Plugin | PLEN Project Company Inc.
===============================================================================

Scratch X plugin to operate PLEN series robots.


## How to Use

1. Connect with PLEN using USB (type micro B) cable.
2. Launch the [Control Server](https://github.com/plenprojectcompany/plen-ControlServer/releases).
3. Access to http://scratchx.org/?url=https://plenprojectcompany.github.io/plen-ScratchX/script.js
   If it shows `USB connection has been disconnected!`, please check the connection status.
4. Please click `I understand, continue` button when it shows confirming dialog.
5. There are blocks to operate PLEN series robots in `Scripts >> More Blocks >> PLEN`.

## Getting Started with the Development

1. Clone or fork this repository.
2. Run `npm install` command.
3. Update `index.ts`.
4. If you are a Visual Studio Code user, you can build it doing
   `Ctrl + Shift + p >> Tasks: run task >> tsc` or `Ctrl + Shift + b`.
5. Debugging process is shown as below:
    - Change directory `git-root` of this repository.
    - Run any local HTTP server such as `python -m SimpleHTTPServer <PORT_NUMBER>`.
    - Open the url `http://scratchx.org/?url=http://localhost:<PORT_NUMBER>/docs/plugin.js`.

## Build Environment
- node.js v5.12.0
- npm v3.8.6
- typescript v1.8.10
- typings v1.3.2

## Copyright (c) 2016,
- [Tsuyoshi TATSUKAWA](https://github.com/tatsukawa)
- [Kazuyuki TAKASE](https://github.com/guvalif)
- [PLEN Project Company Inc.](https://plen.jp)

## License
This software is released under [the MIT License](https://opensource.org/licenses/mit-license.php).