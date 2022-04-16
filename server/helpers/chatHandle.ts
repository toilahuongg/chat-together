import { verifyToken } from "./jwt";
import SocketManager from "./socketManager";
import { User } from "../models/user.model";
import { Room } from "../models/room.model";
const chatHandle = (io) => {
    io.on("connection", (socket) => {
        console.log("[SOCKET-IO] client connected with id: " + socket.id);
        socket.on("logged-in",async (token: string) => {
            // decode token
            let tokenDecript;
            try{
            tokenDecript =await verifyToken(token,process.env.TOKEN_SECRET||'' )  
            const sockets = await SocketManager.getSockets(tokenDecript._id)
            if(sockets.length === 0) {
                // gửi thông báo là user online tới tất cả bạn bè
                const friends = await User.getFriend(tokenDecript._id)
                for(let i = 0 ; i < friends.length; i++) {
                    const sockets = await SocketManager.getSockets(friends[i])
                    for(let j = 0; j < sockets.length; j++) {
                        io.to(sockets[j]).emit("user-status", {
                            userID: tokenDecript._id,
                            status: "online"})
                    }
                }
            }
            SocketManager.addSocket(socket.id, tokenDecript._id)   
            socket.userID = tokenDecript._id
            socket.emit("login", {type: "sucess"}) 
            return 
            }catch(err) {
                socket.emit("error", {type: "error-login"})
            }
        })
        socket.on("read-message", async ({roomID, messageID}) => {
            if(!socket.userID) return
            Room.updateLastReadMessageOfUser(roomID, socket.userID, messageID)
                .then( async result => {
                    if(result) {
                        const roomMembers = await Room.getMemberInRoom(roomID)
                        roomMembers.forEach( async member => {
                            if(member === socket.userID) return
                            const sockets = await SocketManager.getSockets(member)
                            const userIDRead = socket.userID
                            sockets.forEach(socket => {
                                io.to(socket).emit("read-message", {
                                    userID: userIDRead,
                                    roomID: roomID,
                                    messageID: messageID    
                                    }
                                    )
                            });
                        })
                    }
                })
                .catch(err => {
                    console.log(err)
                })
        })
        socket.on("disconnect", async () => {
            if(!socket.userID) return
            await SocketManager.removeSocket(socket.id, socket.userID)
            
            // kiểm tra xem có offline ko
            const sockets = await SocketManager.getSockets(socket.userID)
            if(sockets.length === 0) {
                // gửi thông báo là user off line tới tất cả bạn bè
                const friends = await User.getFriend(socket.userID)
                for(let i = 0 ; i < friends.length; i++) {
                    const sockets = await SocketManager.getSockets(friends[i])
                    for(let j = 0; j < sockets.length; j++) {
                        io.to(sockets[j]).emit("user-status", {
                            userID: socket.id,
                            status: "offline"}
                            )
                    }
                }
            }

        });
    })
}

export default chatHandle;