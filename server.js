const express = require('express');

const app = express();
const port = 8888;

app.listen(port, '0.0.0.0', e => {
  console.log(`this server is running on port ${port}`);
});

app.get('/', (rq, rs) => {
  rs.send("wow this is insame.");
  console.log(rq.connection.remoteAddress);
})