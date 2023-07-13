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

app.use(cors({
  credentials: true, // 응답 헤더에 Access-Control-Allow-Credentials 추가
  optionsSuccessStatus: 200
}));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.listen(port, '0.0.0.0', e => {
  console.log(`this server is running on port ${port}`);
});

/* 위에 있는 것들은 모두 초기 설정임. */

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

app.post('/chat/gettokens', (rq, rs) => {
  const body = rq.body;
  let sql = `select * from users where nickname = '${body.nickname}' and pw = '${body.pw}'`; //해당 닉네임을 가지고 있는 유저의 정보를 불러옴.
  try {
    connection.query(sql, (err, rst, fld) => {
      if (err) throw err;
      if (rst[0]?.id !== undefined) {
        let accessToken, refreshToken;
        accessToken = Math.random().toString(36).substr(2, 11) + Math.random().toString(36).substr(2, 11);
        refreshToken = Math.random().toString(36).substr(2, 11) + Math.random().toString(36).substr(2, 11);
        sql = `select * from tokens where accessToken = '${accessToken}' or refreshToken = '${refreshToken}'`;
        connection.query(sql, (err, rst, fld) => {
          if (err) throw err;
          if (rst[0] !== undefined) {
            console.log("They already exist");
            rs.end();
          }
        });
        const time = new Date().getTime() / 1000 / 60; //분 단위
        sql = `insert into tokens values(${rst[0].id}, '${accessToken}', '${refreshToken}', '${Math.floor(time)}')`;
        connection.query(sql, (err, rest, fld) => {
          if (err) throw err;
          rs.send({
            id: rst[0].id,
            accessToken: accessToken,
            refreshToken: refreshToken,
            accessExpireTime: Math.floor(time) + 30 //현재 시각하고 30분 이상 차이 날시 재로그인 요청 보내도록 하기
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

app.post('/chat/signup', (rq, rs) => {
  const body = rq.body;
  let sql = `select * from users where nickname = '${body.nickname}'`;
  try {
    connection.query(sql, (err, rst, fld) => {
      if (err) throw err;
      if (rst[0]?.id !== undefined) {
        rs.send({ message: "your nickname already exists" });
      } else {
        sql = `insert into users values((select max(id)+1 from users ALIAS_FOR_SUBQUERY), '${body.nickname}', '${body.pw}')`;
        connection.query(sql, (err, rst, fld) => {
          if (err) throw err;
          if (rst.affectedRows >= 1) {
            rs.send({ message: "succeded" });
          }
        });
      }
    });
  } catch (e) {
    console.log(e);
  }
});

function checkAuthoriztion(id, accessToken, callback) {
  let sql = `select * from tokens where accessToken = '${accessToken}' and id = ${id}`;
  try {
    connection.query(sql, (err, rst, fld) => {
      if (err) throw err;
      const time = new Date().getTime() / 1000 / 60;
      if (time - rst[0].registedTime >= 30) {
        callback(false);
      } else {
        callback(true);
      }
    });
  } catch (e) {
    console.log(e);
  }
}

app.post('/chat/checkaccesstoken', (rq, rs) => {
  const body = rq.body;
  const headers = rq.headers.authorization.substr(7);
  console.log(headers, body.id);
  checkAuthoriztion(body.id, headers, e => {
    rs.send(e);
  });
});

app.post('/chat/checkrefreshtoken', (rq, rs) => {
  const body = rq.body;
  let sql = `select * from tokens where refreshToken = '${body.refreshToken}'`;
  try {
    connection.query(sql, (err, rst, fld) => {
      if (err) throw err;
      const time = new Date().getTime() / 1000 / 60;
      if (time - rst[0].registedTime >= 3000 && rst[0].id === body.id) {
        rs.send(false);
      } else {
        rs.send(true);
      }
    });
  } catch (e) {
    console.log(e);
  }
});


app.post('/chat/newroom', (rq, rs) => {
  try {
    const body = rq.body;
    const header = rq.headers;
    const rand = Math.floor(Math.random() * 10000000);
    console.log(body.roomid2make, header.authorization.substr(7), rand);
    let sql = `select * from chatroomandid where chatroomid = ${rand} or roomname = '${body.roomid2make}'`;
    connection.query(sql, (err, rst, fld) => {
      if (err) throw err;
      if (rst[0] !== undefined) {
        rs.send({ message: "이미 존재하는 방 이름입니다." });
      } else {
        sql = `insert into chatrommandid values(rand, '${body.roomid2make}')`;
        connection.query(sql, (err, rst, fld) => {
          if (err) throw err;
          console.log(rst);
        })
      }
    });
  } catch (e) {
    console.log(e);
  }
});