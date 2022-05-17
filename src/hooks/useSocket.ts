import { createContext, useContext } from "react"
import socketIOClient, { Socket } from "socket.io-client"
import { DefaultEventsMap } from "socket.io/dist/typed-events"
const getToken = () => {
  let token = "";
  if (typeof window !== "undefined") {
    const auth = window.localStorage.getItem("auth");
    if (auth) {
      try {
        const { accessToken } = JSON.parse(auth);
        token = accessToken;
      } catch (error) { }
    }
  }
  return token;
}
export const SocketContext = createContext<Socket<DefaultEventsMap, DefaultEventsMap>>(socketIOClient(process.env.NEXT_PUBLIC_APP_URL!, {
  auth: {
    token: getToken()
  }
}))

const useSocket = () => useContext(SocketContext)
export default useSocket;