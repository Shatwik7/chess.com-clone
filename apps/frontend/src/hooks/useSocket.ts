import { useEffect, useState } from 'react';
import Cookies from 'js-cookie';


const WS_URL = "ws://localhost:8080";

export const useSocket = () => {
  const [Socket, setSocket] = useState<WebSocket | null>(null);

  useEffect(() => {
    const userToken = Cookies.get('userToken');
    if(! userToken){
      console.warn("user not logged in");
      return;
    }
    const ws = new WebSocket(`${WS_URL}?token=${userToken}`);
    
    ws.onopen = () => {
      console.log("connected");
      setSocket(ws);
    };
    
    ws.onclose = () => {
      console.log("disconnected");
      setSocket(null);
    };
    
    return () => {
      ws.close();
    };
  }, []);

  return Socket;
}