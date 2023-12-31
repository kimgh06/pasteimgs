import axios from "axios";
import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { io } from "socket.io-client";
import * as S from './style';
const url = "http://localhost:8888";
// const url = 'http://192.168.1.10:8888';

export default function Room() {
  let { id } = useParams();
  let chatlistref = useRef();
  let fileref = useRef();
  const [sendMessage, setSendMessage] = useState('');
  const [chatRoomName, setChatRoomName] = useState('');
  const [src, setSrc] = useState(null);
  const [chatlist, setChatlist] = useState([{}]);
  let socket = io.connect(url, { transports: ["websocket"], reconnection: false });
  function send_message(message) {
    socket.emit('message', {
      clientId: JSON.parse(localStorage.getItem('logininfo')).nickname,
      time: Math.floor(new Date().getTime()),
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
    let t = new Date(time);
    return `${t.getFullYear()}. ${t.getMonth()}. ${t.getDay()}. ${t.getHours()}:${t.getMinutes()}:${t.getSeconds()}`;
  }
  socket.on("received", data => {
    if (data?.img) {
      const blob = new Blob([new Uint8Array(data?.img)], { type: 'image/png' });
      data.img = window.URL.createObjectURL(blob);
    }
    setChatlist(e => [...e, data]);
    setTimeout(() => {
      chatlistref.current.scrollBy(0, chatlistref.current.scrollHeight);
    }, 10);
  });
  socket.on("new one", data => {
    setChatlist(e => [...e, { newone: data }]);
    setTimeout(() => {
      chatlistref.current.scrollBy(0, chatlistref.current.scrollHeight);
    }, 10);
  })
  useEffect(e => {
    getRoomInfomation();
    return e => {
      socket.disconnect();
    }
    //eslint-disable-next-line
  }, []);
  return <S.Chat>
    <h1>{chatRoomName}</h1>
    <div className="chatlist" ref={chatlistref}>
      {//eslint-disable-next-line
        chatlist?.map((i, n) => {
          if (n > 0) {
            return <div key={n}>
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
      <input autoFocus={true} onChange={e => {
        setSendMessage(e.target.value);
      }} value={sendMessage} />
      <button>메시지 보내기</button>
    </form>
    <form onSubmit={e => {
      e.preventDefault();
      const thefile = fileref.current.files[0];
      send_message(sendMessage);
      setSendMessage('');
      socket.emit('uploadFiles', (thefile), id);
      fileref.current.value = null;
      setSrc(null);
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
    {src && <img src={src} alt="img" />}
  </S.Chat >;
}