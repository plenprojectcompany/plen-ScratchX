# Scratch X for PLEN
A operating tool for PLEN using Scratch X.

## How to use

1. Connect to PLEN using USB.
2. Launch PLEN Control Server. 
3. Access to http://scratchx.org/?url=https://tatsukawa.github.io/plen-Scratch/script.js

  Here, if it shows `USB connection has been disconnected!`, please check the connection to PLEN.

4. If it shows confirming dialog, please click `I understand, continue`.
5. There are blocks for operating PLEN in `Scripts > More Blocks > PLEN`.

## Development

1. clone or fork this repository.
2. `$ npm install`
3. update script.ts
4. build 

  In Visual Studio Code, `Ctrl+Shift+p > Tasks: run task > tsc` or `Ctrl+Shift+b`
    
5. debug

  cd git-root in this directory

  ```
  $ python -m SimpleHTTPServer {port}
  ```
  
  you open the url `http://scratchx.org/?url=http://localhost:{port}/docs/script.js#scratch`
