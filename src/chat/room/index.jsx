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
        document.title = `${e.data}`
        socket.emit('join_room', { room: id });
      });
  }
  function time2date(time) {
    let t = new Date(time * 60000);
    return `${t.getFullYear()}. ${t.getMonth()}. ${t.getDay()}. ${t.getHours()}:${t.getMinutes()}`;
  }
  socket.on("received", data => {
    let list = chatlist;
    list?.push(data);
    setChatlist(e => list);
  });
  useEffect(e => {
    getRoomInfomation();
    setInterval(() => {
      setUselesscnt(e => e + 1);
    }, 400);
    //eslint-disable-next-line
  }, []);
  useEffect(e => {
    chatlistref.current.scrollBy(0, chatlistref.current.scrollHeight);
  }, [uselesscnt])
  return <S.Chat>
    <h1>{chatRoomName}</h1>
    <div className="chatlist" ref={chatlistref} >
      {//eslint-disable-next-line
        chatlist?.map((i, n) => {
          if (n > 0) {
            return <p id={n} key={n}>{time2date(i?.time)} {i?.clientId}: {i?.message}</p>
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
      send_message(sendMessage);
      setSendMessage('');
      socket.emit('uploadFiles', (thefile), s => {
        const blob = new Blob([new Uint8Array(s.message)], { type: 'image/png' });
        const url = URL.createObjectURL(blob);
        setSrc(url);
      })
    }}>
      <input type="file" ref={fileref} />
      <button>보내기</button>
    </form>
    <img src={src} alt="img" />
  </S.Chat >;
}