import { useEffect, useState } from "react";

export default function App() {
  const [src, setSrc] = useState('');
  useEffect(e => {
    document.title = "copy the clipboard";
  }, []);
  return <div>
    <input type="file" onPaste={e => {
      const items = e.clipboardData.items[0];
      if (items.type.indexOf('image') === 0) {
        let blob = items.getAsFile();
        let reader = new FileReader();
        reader.onload = e => {
          setSrc(e.target.result);
        }
        reader.readAsDataURL(blob);
      }
      console.log(items.type);
    }} />
    <img src={src} alt="pasteit" />
  </div>;
}