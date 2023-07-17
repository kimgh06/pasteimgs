const express = require('express');
const mysql = require('mysql2');
const cors = require("cors");
const http = require('http');
const app = express();
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);
const port = 8888;
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '1234',
  database: 'madang'
});

io.on('connection', socket => {
  socket.on("join_room", data => {
    socket.join(data.room);
  });
  socket.on('message', data => {
    console.log(data)
    socket.to(data.room).emit("received", data);
  });
})

connection.connect(err => {
  if (err) throw err;
  console.log("the database is connected");
})

app.use(cors({
  credentials: true, // 응답 헤더에 Access-Control-Allow-Credentials 추가
  optionsSuccessStatus: 200
}));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

server.listen(port, '0.0.0.0', e => {
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
            accessExpireTime: Math.floor(time) + 3 //현재 시각하고 30분 이상 차이 날시 재로그인 요청 보내도록 하기
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

function checkAuthorizationOfAccessToken(id, accessToken, callback) {
  let sql = `select * from tokens where accessToken = '${accessToken}' and id = ${id}`;
  try {
    connection.query(sql, (err, rst, fld) => {
      if (err) throw err;
      const time = new Date().getTime() / 1000 / 60;
      if (time - rst[0]?.registedTime < 3) {
        callback(true);
      } else {
        callback(false);
      }
    });
  } catch (e) {
    console.log(e);
  }
}

app.post('/chat/checkaccesstoken', (rq, rs) => {
  const body = rq.body;
  const headers = rq.headers.authorization.substr(7);
  checkAuthorizationOfAccessToken(body.id, headers, e => {
    rs.send(e);
  });
});

function checkAuthorizationOfRefreshToken(id, refreshToken, callback) {
  let sql = `select * from tokens where refreshToken = '${refreshToken}' and id = '${id}'`;
  try {
    connection.query(sql, (err, rst, fld) => {
      if (err) throw err;
      const time = new Date().getTime() / 1000 / 60;
      if (time - rst[0]?.registedTime >= 3000) {
        callback(false);
      } else {
        callback(true);
      }
    });
  } catch (e) {
    console.log(e);
  }
}

app.post('/chat/checkrefreshtoken', (rq, rs) => {
  const body = rq.body;
  checkAuthorizationOfRefreshToken(body.id, body.refreshToken, e => {
    rs.send(e);
  })
});


app.post('/chat/newroom', (rq, rs) => {
  try {
    const body = rq.body;
    const headers = rq.headers.authorization.substr(7);
    const rand = Math.floor(Math.random() * 10000000);
    checkAuthorizationOfAccessToken(body.id, headers, e => {
      if (e === false) {
        rs.send({ message: "토큰이 만료되었거나 토큰이 없습니다." })
      } else {
        let sql = `select * from chatroomandid where chatroomid = ${rand} or roomname = '${body.roomid2make}'`;
        connection.query(sql, (err, rst, fld) => {
          if (err) throw err;
          if (rst[0] !== undefined) {
            rs.send({ message: "이미 존재하는 방 이름입니다." });
            return;
          } else {
            sql = `insert into chatroomandid values(${rand}, '${body.roomid2make}')`;
            connection.query(sql, (err, rst, fld) => {
              if (err) throw err;
              if (rst.affectedRows > 0) {
                rs.sendStatus(201);
              }
            })
          }
        });
      }
    });
  } catch (e) {
    console.log(e);
  }
});

app.post('/chat/refresh', (rq, rs) => {
  const body = rq.body;
  let accessToken;
  let sql = `select * from tokens where refreshtoken = '${body.refreshToken}'`;
  connection.query(sql, (err, rst, fld) => {
    if (err) throw err;
    const time = Math.floor(new Date().getTime() / 1000 / 60); //분 단위
    accessToken = Math.random().toString(36).substr(2, 11) + Math.random().toString(36).substr(2, 11);
    refreshToken = Math.random().toString(36).substr(2, 11) + Math.random().toString(36).substr(2, 11);
    if (time - rst[0]?.registedTime <= 3000) {
      sql = `update tokens set accesstoken = '${accessToken}', refreshToken = '${refreshToken}', registedtime = '${time}' where id = '${rst[0].id}'`;
      connection.query(sql, (err, rst1, fld) => {
        if (err) throw err;
        if (rst1.affectedRows === 1) {
          rs.send({
            id: rst[0].id,
            accessToken: accessToken,
            refreshToken: refreshToken,
            accessExpireTime: Math.floor(time) + 3 //현재 시각하고 30분 이상 차이 날시 재로그인 요청 보내도록 하기
          });
        }
      })
    } else {
      rs.send({ message: "refreshToken have been expired." });
    }
  })
});

app.get('/chat/rooms', (rq, rs) => {
  let sql = `select * from chatroomandid`;
  try {
    connection.query(sql, (err, rst, fld) => {
      if (err) throw err;
      rs.send(rst);
    });
  } catch (e) {
    console.log(e);
  }
});

app.get('/chat/getroominfo', (rq, rs) => {
  const id = rq.query.id;
  let sql = `select * from chatroomandid where chatroomid = ${id}`;
  try {
    connection.query(sql, (err, rst, fld) => {
      if (err) throw err;
      rs.send(rst[0]?.roomname);
    });
  } catch (e) {
    console.log(e);
  }
});