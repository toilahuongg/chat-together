import { TMsg } from "server/types/common.type";
import SocketIO from "./socketIO";
import socketManager from "./socketManager";

export const subscribeClient = async () => {
    await socketManager.subClient.subscribe('socket', (message, chanel) => {
        const { data, eventName, userID, exclude } = JSON.parse(message) as TMsg;
        const sockets = socketManager.sockets[userID];
        if (sockets && sockets.length) {
            if (!exclude.some(e => sockets.some(s => s === e))) {
                sockets.forEach(socket => {
                    SocketIO.sendEvent({
                        eventName, data, socketID: socket, userID
                    })
                })
            }
        }
    });
}