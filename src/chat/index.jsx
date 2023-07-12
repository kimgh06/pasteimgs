import { useEffect, useState } from "react"
import * as S from "./style";
import axios from "axios";

export default function Chat(e) {
  const [toput, setToput] = useState('');
  const [able, setAble] = useState(null);
  const [logininfo, setLogininfo] = useState({ nickname: '', pw: '' });
  const url = "http://localhost:8888";
  useEffect(e => {
    document.title = 'chat'
  }, []);
  return <S.Chat>
    <form className="checkId" onSubmit={async e => {
      e.preventDefault();
      await axios.get(`${url}/chat/checkid?id=${toput}`)
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
    <form className="login" onSubmit={async e => {
      e.preventDefault();
      await axios.post(`${url}/chat/deltokens`, { nickname: logininfo.nickname })
        .then(async e => {
          if (e.data.affectedRows > 0) {
            await axios.post(`${url}/chat/login`, {
              nickname: logininfo.nickname,
              pw: logininfo.pw
            }).then(e => {
              console.log(e.data);
            }).catch(e => {
              console.log(e);
            });
          }
        })
        .catch(e => console.log(e));
    }}>
      <input onChange={e => setLogininfo(a => ({ ...a, nickname: e.target.value }))} placeholder="로그인 닉네임" />
      <input onChange={e => setLogininfo(a => ({ ...a, pw: e.target.value }))} placeholder="로그인 비밀번호" />
      <button>토큰 발급</button>
    </form>
  </S.Chat>
}