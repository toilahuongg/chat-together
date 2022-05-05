import { createContext, useContext } from "react"
import { Socket } from "socket.io-client"
import { DefaultEventsMap } from "socket.io/dist/typed-events"

export const SocketContext = createContext<Socket<DefaultEventsMap, DefaultEventsMap> | undefined>(undefined)

const useSocket = () => {
    return useContext(SocketContext)
}
export default useSocket;