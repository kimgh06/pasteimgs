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
  const [sendMessage, setSendMessage] = useState('');
  const [chatRoomName, setChatRoomName] = useState('');
  const [chatlist, setChatlist] = useState([{}]);
  function send_message(message) {
    socket.emit('message', {
      clientId: JSON.parse(localStorage.getItem('logininfo')).nickname,
      time: Math.floor(new Date().getTime() / 1000 / 60),
      message: message,
      room: id
    });
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
  useEffect(e => {
    getRoomInfomation();
    //eslint-disable-next-line
  }, []);
  socket.on("received", data => {
    let list = chatlist;
    list?.push(data);
    setChatlist(e => list);
    chatlistref.current.scrollBy(0, 100000);
  });
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
      setSendMessage('');
      if (sendMessage !== '') {
        send_message(sendMessage);
      }
    }}>
      <input onChange={e => {
        setSendMessage(e.target.value);
      }} value={sendMessage} />
      <button>메시지 보내기</button>
    </form>
  </S.Chat >;
}