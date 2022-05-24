import { TMsg } from "server/types/common.type";
import SocketIO from "./socketIO";
import socketManager from "./socketManager";

export const subscribeClient = async () => {
    await socketManager.subClient.subscribe('socket', (message, chanel) => {
        const { data, eventName, userID } = JSON.parse(message) as TMsg;
        const sockets = socketManager.sockets[userID];
        console.log(sockets);
        if (sockets && sockets.length) {
            sockets.forEach(socket => {
                SocketIO.sendEvent({
                    eventName, data, socketID: socket, userID
                })
            })
        }
    });
}