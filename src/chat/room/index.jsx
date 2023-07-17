import axios from "axios";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { io } from "socket.io-client";
const url = "http://localhost:8888";

export default function Room() {
  let { id } = useParams();
  const socket = io.connect(url);
  socket.on('news', data => {
    console.log(data);
    socket.emit('reply', 'hello');
  })
  const [chatRoomName, setChatRoomName] = useState('');
  async function getRoomInfomation() {
    await axios.get(`${url}/chat/getroominfo?id=${id}`)
      .then(e => {
        setChatRoomName(e.data);
      });
  }
  useEffect(e => {
    getRoomInfomation();
    //eslint-disable-next-line
  }, []);
  return <div>
    <h1>{chatRoomName}</h1>
  </div>;
}