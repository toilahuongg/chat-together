import { verifyToken } from "./jwt";
import SocketManager from "./socketManager";
import { User } from "../models/user.model";
import dotenv from 'dotenv';
import { Server, Socket } from "socket.io";
import SocketIO from "./socketIO";

dotenv.config();

const socketHandle = (io: Server) => {
    const socketManager = SocketManager;
    try {
        let userID = "";
        io.on("connect", (socket) => {
            socket.on("error", (err) => console.log('1'));
        });
        io.use(async (socket, next) => {
            socket.on("error", (err) => console.log('2'));
            if (socket.handshake.auth && socket.handshake.auth.token) {
                try {
                    const tokenDecript = await verifyToken(socket.handshake.auth.token, process.env.TOKEN_SECRET || '');
                    console.log(`[SOCKET-IO] ${tokenDecript.fullname} connected with id: ${socket.id}`);

                    const sockets = await socketManager.getSockets(tokenDecript._id);
                    if (sockets && sockets.length === 0) {
                        // gửi thông báo là user online tới tất cả bạn bè
                        const friends = await User.getFriend(tokenDecript._id)
                        for (let i = 0; i < friends.length; i++) {
                            const sockets = await socketManager.getSockets(friends[i]);
                            if (sockets && sockets.length) {
                                for (let j = 0; j < sockets.length; j++) {
                                    SocketIO.sendEvent({
                                        data: {
                                            userID: tokenDecript._id,
                                            status: "online"
                                        },
                                        eventName: "user-status",
                                        socketID: sockets[j],
                                        userID: friends[i]
                                    });
                                }
                            }
                        }
                    }
                    await socketManager.addSocket(socket.id, tokenDecript._id);
                    userID = tokenDecript._id;
                    next();
                } catch (err) {
                    console.log(err);
                    next(new Error('Authentication error'))
                }
            } else {
                next(new Error('Authentication error'))
            }

        }).on("connection", async (socket: Socket) => {
            socket.on("disconnect", async () => {
                console.log("[SOCKET-IO] client disconnected with id: " + socket.id);
                if (!userID) return
                await socketManager.removeSocket(socket.id, userID)

                // kiểm tra xem có offline ko
                const sockets = await socketManager.getSockets(userID)
                if (sockets && sockets.length === 0) {
                    // gửi thông báo là user off line tới tất cả bạn bè
                    const friends = await User.getFriend(userID)
                    for (let i = 0; i < friends.length; i++) {
                        const sockets = await socketManager.getSockets(friends[i])
                        if (sockets && sockets.length) {
                            for (let j = 0; j < sockets.length; j++) {
                                SocketIO.sendEvent({
                                    data: {
                                        userID: userID,
                                        status: "offline"
                                    },
                                    eventName: "user-status",
                                    socketID: sockets[j],
                                    userID: friends[i]
                                });
                            }
                        }
                    }
                }

            });
        })
    }
    catch (error) {
        console.log(error);
    }
}

export default socketHandle;