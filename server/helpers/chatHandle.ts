import { verifyToken } from "./jwt";
import { IMessageData } from "server/types/message.type";
import { Server } from "socket.io";
import { DefaultEventsMap } from "socket.io/dist/typed-events";
import SocketManager from "./socketManager";

const chatHandle = (io) => {
    io.on("connection", (socket) => {
        console.log("[SOCKET-IO] client connected with id: " + socket.id);
        socket.on("logged-in",async (token: string) => {
            // decode token
            let tokenDecript;
            try{
            tokenDecript =await verifyToken(token,process.env.TOKEN_SECRET||'' )  
            SocketManager.addSocket(socket.id, tokenDecript._id)   
            socket.userID = tokenDecript._id
            socket.emit("loggin", {type: "sucess"})    
            }catch(err) {
                socket.emit("error", {type: "error-login"})
            }
        })
        socket.on("disconnect", () => {
            SocketManager.removeSocket(socket.id, socket.userID)
        });
    })
}

export default chatHandle;