# Increment Example
This example is nearly as simple as a socket-based application can be. A value is stored in the server, in which the user can click
a button to increment/decrement the value. 

## Setup
Running `npm install` will install all dependencies.

## Start up the Socket Server
By default, the socket server listens on port `44500`. You can access the current value being stored in the server
by navigating to `localhost:44500`.

```
$> node socket_server.js
```

You'll see various console messages based upon user actions.

## Run the webpack dev server
The webpack dev server will boot up the website and compile the react components. All the code for this example can be found in the `src/`
directory. Boot up the dev server in a separate terminal window.

```
$> npm start
```

Navigate to `localhost:9090` to view the form. If unable to connect to the socket server, you will see a message: `Connecting to server...`.
Once connected, the form will display.
