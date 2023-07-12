import { useEffect, useState } from "react"
import * as S from "./style";
import axios from "axios";

export default function Chat(e) {
  const [toput, setToput] = useState('');
  const [able, setAble] = useState(null);
  useEffect(e => {
    document.title = 'chat'
  }, []);
  return <S.Chat>
    <form className="insertClientId" onSubmit={async e => {
      e.preventDefault();
      await axios.get(`http://localhost:8888/chat/checkid?id=${toput}`)
        .then(e => {
          setAble(e.data);
        })
        .catch(e => {
          console.log(e);
        })
    }}>
      <input onChange={e => setToput(e.target.value)} placeholder="확인할 id" />
      {able === null ? '' : able === true ? "사용할 수 없는 아이디 입니다." : "사용할 수 있는 아이디 입니다."}

    </form>
  </S.Chat>
}