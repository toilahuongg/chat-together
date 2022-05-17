import { Server } from "socket.io"

class SocketIO {
  static io = null as any
  static async Init(io: Server) {
    SocketIO.io = io
  }
  static async sendEvent(eventName, data, socket) {
    if(!SocketIO.io) throw new Error("Bạn phải khởi tạo socket trước")
    if(!socket) {
       SocketIO.io.emit(eventName, data)
       return
    }
    SocketIO.io.to(socket).emit(eventName, data)
  }
}

export default SocketIO