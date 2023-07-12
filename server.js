const express = require('express');
const mysql = require('mysql2');
const cors = require("cors");
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '1234',
  database: 'madang'
});
connection.connect(err => {
  if (err) throw err;
  console.log("the database is connected");
})
const app = express();
const port = 8888;

app.use(cors());
app.use(express.json())
app.use(express.urlencoded({ extended: false }));

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

app.post('/chat/login', (rq, rs) => {
  const body = rq.body;
  let sql = `select * from users where nickname = '${body.nickname}' and pw = '${body.pw}'`; //해당 닉네임을 가지고 있는 유저의 정보를 불러옴.
  try {
    connection.query(sql, (err, rst, fld) => {
      if (err) throw err;
      if (rst[0]?.id !== undefined) {
        const accessToken = Math.random().toString(36).substr(2, 11) + Math.random().toString(36).substr(2, 11);
        const refreshToken = Math.random().toString(36).substr(2, 11) + Math.random().toString(36).substr(2, 11);
        const time = new Date().getTime() / 1000 / 60; //분 단위
        sql = `insert into tokens values(${rst[0].id}, '${accessToken}', '${refreshToken}', '${Math.floor(time)}')`;
        connection.query(sql, (err, rst, fld) => {
          if (err) throw err;
          rs.send({
            accessToken: accessToken,
            refreshToken: refreshToken,
            registTime: Math.floor(time) + 30
          });
        });
      } else {
        rs.send({ message: "not found" });
      }
    });
  } catch (e) {
    console.log(e);
  }
});

app.post('/chat/deltokens', (rq, rs) => {
  const nickname = rq.body?.nickname;
  let sql = `delete from tokens where id = (select id from users where nickname = '${nickname}')`;
  try {
    connection.query(sql, (err, rst, fld) => {
      if (err) throw err;
      rs.send({ affectedRows: rst.affectedRows });
    });
  } catch (e) {
    console.log(e);
  }
});

app.post('/chat/regist')