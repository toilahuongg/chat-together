import { IMessageData } from "server/types/message.type";
import { Server } from "socket.io";
import { DefaultEventsMap } from "socket.io/dist/typed-events";

const chatHandle = (io: Server<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>) => {
    let userIDToSocketMap: Record<string, string[]> = {};
    let userIDToOnlineMap: string[] = [];

    const getUserIDFromSocketID = (id: string) => {
        for (let userID in userIDToSocketMap) {
            if (Array.isArray(userIDToSocketMap[userID]) && userIDToSocketMap[userID].includes(id))
                return userID;
        }
        return null;
    }

    const removeSocketId = (id: string) => {
        const userID = getUserIDFromSocketID(id);
        if (userID) userIDToSocketMap[userID] = userIDToSocketMap[userID].filter(socketID => socketID !== id);
    }
    io.on("connection", (socket) => {
        console.log("[SOCKET-IO] client connected with id: " + socket.id);
        socket.on("logged-in", userID => {
            console.log("[SOCKET-IO] userID: " + userID);
            if (!userIDToOnlineMap.includes(userID)) userIDToOnlineMap.push(userID);
            if (userIDToSocketMap.hasOwnProperty(userID)) {
                if (!userIDToSocketMap[userID].includes(socket.id)) userIDToSocketMap[userID].push(socket.id);
            } else {
                userIDToSocketMap[userID] = [socket.id];
            }
            io.sockets.emit("users-online", userIDToOnlineMap);
        })
        socket.on("disconnect", () => {
            const userID = getUserIDFromSocketID(socket.id);
            removeSocketId(socket.id);
            if (userID && userIDToSocketMap[userID].length === 0) {
                userIDToOnlineMap = userIDToOnlineMap.filter(id => id !== userID);
                io.sockets.emit("users-online", userIDToOnlineMap);
            }
        });

        socket.on('join-room', function (room) {
            console.log(`[SOCKET-IO] client id ${socket.id} join to room ${room}`);
            socket.join(room);
        });

        socket.on('messages', (data: IMessageData) => {
            const { roomID, ...dt } = data;
            socket.to(roomID).emit('messages', dt);
        })
    })
}

export default chatHandle;