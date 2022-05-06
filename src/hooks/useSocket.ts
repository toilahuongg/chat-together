import { createContext, useContext } from "react"
import socketIOClient, { Socket } from "socket.io-client"
import { DefaultEventsMap } from "socket.io/dist/typed-events"

export const SocketContext = createContext<Socket<DefaultEventsMap, DefaultEventsMap>>(socketIOClient(process.env.NEXT_PUBLIC_APP_URL || ''))

const useSocket = () => useContext(SocketContext)
export default useSocket;