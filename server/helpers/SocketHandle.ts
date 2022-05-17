import { verifyToken } from "./jwt";
import SocketManager from "./socketManager";
import { User } from "../models/user.model";
import dotenv from 'dotenv';
import { Server, Socket } from "socket.io";

dotenv.config();

const socketHandle = (io: Server) => {
    let userID = "";
    io.use(async(socket, next) => {
        if (socket.handshake.auth && socket.handshake.auth.token) {
            try {
                const tokenDecript = await verifyToken(socket.handshake.auth.token, process.env.TOKEN_SECRET || '');
                console.log(`[SOCKET-IO] ${tokenDecript.fullname} connected with id: ${socket.id}`);
    
                const sockets = await SocketManager.getSockets(tokenDecript._id)
                if (sockets.length === 0) {
                    // gửi thông báo là user online tới tất cả bạn bè
                    const friends = await User.getFriend(tokenDecript._id)
                    for (let i = 0; i < friends.length; i++) {
                        const sockets = await SocketManager.getSockets(friends[i])
                        for (let j = 0; j < sockets.length; j++) {
                            io.to(sockets[j]).emit("user-status", {
                                userID: tokenDecript._id,
                                status: "online"
                            })
                        }
                    }
                }
                SocketManager.addSocket(socket.id, tokenDecript._id);
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
            await SocketManager.removeSocket(socket.id, userID)

            // kiểm tra xem có offline ko
            const sockets = await SocketManager.getSockets(userID)
            if (sockets.length === 0) {
                // gửi thông báo là user off line tới tất cả bạn bè
                const friends = await User.getFriend(userID)
                for (let i = 0; i < friends.length; i++) {
                    const sockets = await SocketManager.getSockets(friends[i])
                    for (let j = 0; j < sockets.length; j++) {
                        io.to(sockets[j]).emit("user-status", {
                            userID: socket.id,
                            status: "offline"
                        }
                        )
                    }
                }
            }

        });
    })
}

export default socketHandle;