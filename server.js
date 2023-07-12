const express = require('express');
const mysql = require('mysql2');
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '1234',
  database: 'madang'
});
connection.connect(err => {
  if (err) throw err;
  console.log("database connected");
})

const app = express();
const port = 8888;

app.listen(port, '0.0.0.0', e => {
  console.log(`this server is running on port ${port}`);
});

app.get('/', (rq, rs) => {
  rs.send("root.");
  console.log(rq.connection.remoteAddress);
})

app.get('/chat/checkid', (rq, rs) => {
  const nickname = rq.query.id;
  let sql = `select * from users where nickname = '${nickname}'`;
  try {
    connection.query(sql, (err, rst) => {
      if (err) throw err;
      rs.send(rst[0]?.id !== undefined);
    });
  } catch (e) {
    console.log(e);
  }
});

app.post('/chat/regist')