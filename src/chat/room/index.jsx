import axios from "axios";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { io } from "socket.io-client";
const url = "http://localhost:8888";

export default function Room() {
  let { id } = useParams();
  const [sendMessage, setSendMessage] = useState('');
  const [chatRoomName, setChatRoomName] = useState('');
  const [chatlist, setChatlist] = useState([{}]);
  let socket = io.connect(url);
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
  useEffect(e => {
    socket.on("received", data => {
      let list = chatlist;
      list.push(data);
      setChatlist(e => list);
    })
    //eslint-disable-next-line
  }, [socket]);
  return <div>
    <h1>{chatRoomName}</h1>
    <form onSubmit={e => {
      e.preventDefault();
      setSendMessage('');
      if (sendMessage !== '') {
        send_message(sendMessage);
      }
    }}>
      <input onChange={e => setSendMessage(e.target.value)} value={sendMessage} />
      <button>메시지 보내기</button>
    </form>
    {//eslint-disable-next-line
      chatlist?.map((i, n) => {
        if (n > 0) {
          return <p key={n}>{time2date(i?.time)} {i?.clientId}: {i?.message}</p>
        }
      })}
  </div >;
}