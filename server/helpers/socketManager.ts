
class SocketManager{
    static sockets = {};
    /**
     * Thêm socket vào kho lưu trữ cùng với userID tương ứng
     * 
     * @param socketID 
     * @param userid 
     * @return void
     */
    static addSocket(socketID:string, userid:string):void {
        if(!SocketManager.sockets[userid]) {
            SocketManager.sockets[userid] = []
        }
        SocketManager.sockets[userid].push(socketID)
    }
    /**
     * Xóa socket khỏi kho lưu trữ nếu nó tồn tại
     * @param sockerID 
     * @param userid 
     */
    static removeSocket(socketID:string, userid:string):void {
        if(!SocketManager.sockets[userid]) return 
        // tìm index của socket id này
        let indexSocket = SocketManager.sockets[userid].indexOf(socketID)
        if(indexSocket === -1) return
        SocketManager.sockets[userid].splice(indexSocket, 1)
    }
    /**
     * tìm Socket đang online dựa trên userID 
     * trả về 1 array bao gôm các kết quả
     */
    static getSockets(userid:string):string[] {
        if(!SocketManager.sockets[userid]) return []

        return SocketManager.sockets[userid]
    }

}

export default SocketManager