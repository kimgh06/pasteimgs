import { useEffect, useRef, useState } from "react";
import * as S from './style';

export default function App() {
  const [src, setSrc] = useState('');
  const typefileinput = useRef(null);
  useEffect(e => {
    document.title = "copy the clipboard";
  }, []);
  return <S.App onPaste={e => { //붙여넣기 시
    const items = e.clipboardData.items[0];
    if (items.type.indexOf('image') === 0) {
      let blob = items.getAsFile();
      let reader = new FileReader();
      reader.onload = e => {
        setSrc(e.target.result);
      }
      reader.readAsDataURL(blob);
    }
    console.log(items.getAsFile());
  }}>
    <img src={src} alt="pasteit" />
    paste it
    <input ref={typefileinput} type="file" onChange={e => { //파일 끌어올 시
      const input = typefileinput.current;
      if (input.files[0]) {
        let reader = new FileReader();
        reader.onload = e => {
          setSrc(e.target.result);
        }
        console.log(input.files[0])
        reader.readAsDataURL(input.files[0]);
      }
    }} />
  </S.App>;
}