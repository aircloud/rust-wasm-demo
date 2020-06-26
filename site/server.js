
const express = require('express');

express.static.mime.types.wasm = "application/wasm";

const app = express();
const http = require('http').Server(app);

const port = process.env.PORT || 3000;

app.use(express.static(`${__dirname}/dist`));

// eslint-disable-next-line no-console
http.listen(port, () => console.log(`listening on port ${port}`));
