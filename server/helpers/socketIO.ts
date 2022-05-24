import { Server } from "socket.io"
import socketManager from "./socketManager";

class SocketIO {
  static io = null as any
  static async Init(io: Server) {
    SocketIO.io = io
  }
  static async sendEvent({
    eventName,
    userID,
    data,
    socketID,
  }) {
    if (!SocketIO.io) throw new Error("Bạn phải khởi tạo socket trước");
    if (socketManager.sockets[userID] && socketManager.sockets[userID].includes(socketID)) SocketIO.io.to(socketID).emit(eventName, data);
  }
}

export default SocketIO