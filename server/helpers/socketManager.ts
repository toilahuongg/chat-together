/**
 * Quản lí các socket khi kết nối với server
 */
import { createClient } from 'redis';
import * as redisStore from './redisStore';
const store = () => {
    const pubClient = createClient({ url: "redis://localhost:6379" });
    const subClient = pubClient.duplicate();
    const sockets = {};
    return {
        pubClient,
        subClient,
        sockets,
        addSocket: async (socketID:string, userid:string) => {
            const allSocket = await redisStore.getRedis(pubClient, 'sockets');
            if(!allSocket || !allSocket[userid]) {
                allSocket[userid] = [];
            }
            if (!sockets[userid]) sockets[userid] = [];
            // Loại bỏ socketId trùng lặp
            sockets[userid] = [...new Set([...sockets[userid], socketID])];
            allSocket[userid] = [...new Set([...allSocket[userid], socketID])];
            await redisStore.setRedis(pubClient, 'sockets', allSocket);
        },
        removeSocket: async (socketID:string, userid:string) => {
            const allSocket = await redisStore.getRedis(pubClient, 'sockets');
            if(!allSocket || !allSocket[userid]) return;
            if (sockets[userid]) {
                const idx = sockets[userid].indexOf(socketID);
                if(idx === -1) return;
                sockets[userid].splice(idx, 1);
            }
            // tìm index của socket id này
            let indexSocket = allSocket[userid].indexOf(socketID);
            if(indexSocket === -1) return;
            allSocket[userid].splice(indexSocket, 1);
            await redisStore.setRedis(pubClient, 'sockets', allSocket);
        },
        getSockets: async (userid:string) =>  {
            const sockets = await redisStore.getRedis(pubClient, 'sockets');
            if(!sockets || !sockets[userid]) return [];
            return sockets[userid];
        },
        getAllSockets: async () => {
            const sockets = await redisStore.getRedis(pubClient, 'sockets').then(res => res || {});
            return sockets;
        },
        isOnline: async (userID: string) => true
      };
} 

const socketManager = store();
export default socketManager;