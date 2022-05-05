/**
 * Quản lí các socket khi kết nối với server
 */
class SocketManager{
    static sockets = {};
    /**
     * Thêm socket vào kho lưu trữ cùng với userID tương ứng
     * 
     * @async
     * @param socketID 
     * @param userid 
     */
    static async addSocket(socketID:string, userid:string) {
        if(!SocketManager.sockets[userid]) {
            SocketManager.sockets[userid] = []
        }
        // Loại bỏ socketId trùng lặp
        SocketManager.sockets[userid] = [...new Set([...SocketManager.sockets[userid], socketID])];
    }
    /**
     * Xóa socket khỏi kho lưu trữ nếu nó tồn tại
     * @async
     * @param sockerID 
     * @param userid 
     */
    static async removeSocket(socketID:string, userid:string) {
        if(!SocketManager.sockets[userid]) return 
        // tìm index của socket id này
        let indexSocket = SocketManager.sockets[userid].indexOf(socketID)
        if(indexSocket === -1) return
        SocketManager.sockets[userid].splice(indexSocket, 1)
    }
    /**
     * tìm Socket đang online dựa trên userID 
     * trả về 1 array bao gôm các kết quả
     * @async
     * @param userid string
     * @returns string[]
     */
    static async getSockets(userid:string) : Promise<string[]>  {
        if(!SocketManager.sockets[userid]) return []

        return SocketManager.sockets[userid]
    }
    /**
     * kiểm tra user có online hay ko
     * @async
     * @param userid 
     * @return boolean
     */
    static async isOnline(userid: string) {
        if(!SocketManager.sockets[userid] || SocketManager.sockets[userid].length === 0) return false
        return true
    }
}

export default SocketManager