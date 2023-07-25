import axios from "axios";
import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { io } from "socket.io-client";
import * as S from './style';
const url = "http://localhost:8888";
// const url = 'http://10.53.68.222:8888';

export default function Room() {
  let socket = io.connect(url, { transports: ["websocket"] });
  let { id } = useParams();
  let chatlistref = useRef();
  let fileref = useRef();
  const [sendMessage, setSendMessage] = useState('');
  const [chatRoomName, setChatRoomName] = useState('');
  const [src, setSrc] = useState(null);
  const [chatlist, setChatlist] = useState([{}]);
  const [uselesscnt, setUselesscnt] = useState(0);
  function send_message(message) {
    socket.emit('message', {
      clientId: JSON.parse(localStorage.getItem('logininfo')).nickname,
      time: Math.floor(new Date().getTime() / 1000 / 60),
      message: message,
      room: id
    });
    setSendMessage('');
  }
  async function getRoomInfomation() {
    await axios.get(`${url}/chat/getroominfo?id=${id}`)
      .then(e => {
        setChatRoomName(e.data);
        document.title = `${e.data}`;
        document.body.style.backgroundColor = "#121212";
        socket.emit('join_room', { room: id, clientId: JSON.parse(localStorage.getItem('logininfo')).nickname });
      });
  }
  function time2date(time) {
    let t = new Date(time * 60000);
    return `${t.getFullYear()}. ${t.getMonth()}. ${t.getDay()}. ${t.getHours()}:${t.getMinutes()}`;
  }
  socket.on("received", data => {
    let list = chatlist;
    if (data?.img) {
      const blob = new Blob([new Uint8Array(data?.img)], { type: 'image/png' });
      data.img = URL.createObjectURL(blob);
    }
    list?.push(data);
    setChatlist(e => list);
    setTimeout(() => {
      chatlistref.current.scrollBy(0, chatlistref.current.scrollHeight);
    }, 300);
  });
  socket.on("new one", data => {
    let list = chatlist;
    list?.push({ newone: data });
    setChatlist(e => list);
    setTimeout(() => {
      chatlistref.current.scrollBy(0, chatlistref.current.scrollHeight);
    }, 300);
  })
  useEffect(e => {
    getRoomInfomation();
    setInterval(() => {
      setUselesscnt(e => e + 1);
    }, 300);
    //eslint-disable-next-line
  }, []);
  return <S.Chat>
    <h1>{chatRoomName}</h1>
    <div className="chatlist" ref={chatlistref}>
      {//eslint-disable-next-line
        chatlist?.map((i, n) => {
          if (n > 0) {
            return <div>
              {i?.clientId && <p id={n} key={n}>{time2date(i?.time)} {i?.clientId}: {i?.message}</p>}
              {i?.newone && <p>{i?.newone}</p>}
              {i?.img && <img src={i?.img} alt="img" />}
            </div>;
          }
        })}</div>
    <form onSubmit={e => {
      e.preventDefault();
      if (sendMessage !== '') {
        send_message(sendMessage);
      }
    }}>
      <input onChange={e => {
        setSendMessage(e.target.value);
      }} value={sendMessage} />
      <button>메시지 보내기</button>
    </form>
    <form onSubmit={e => {
      e.preventDefault();
      const thefile = fileref.current.files[0];
      console.log(thefile)
      send_message(sendMessage);
      setSendMessage('');
      socket.emit('uploadFiles', (thefile), id, s => {
        const blob = new Blob([new Uint8Array(s.img)], { type: 'image/png' });
        let url = URL.createObjectURL(blob);
      })
    }}>
      <input type="file" ref={fileref} onChange={e => {
        if (fileref.current.files[0]) {
          let reader = new FileReader();
          reader.onload = e => {
            setSrc(e.target.result);
          }
          reader.readAsDataURL(fileref.current.files[0]);
        }
      }} />
      <button>보내기</button>
    </form>
    <img src={src} alt="img" />
  </S.Chat >;
}