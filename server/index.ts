import express from 'express';
import next from 'next';
import { Server } from 'socket.io';
import http from 'http';
import cors from 'cors';
import passport from 'passport';
import mongoose from 'mongoose';
import { createAdapter } from '@socket.io/redis-adapter';
import compression from 'compression';

import userRouter from './routes/user.route';
import roomRouter from './routes/room.route';
import friendRouter from './routes/friend.route'
import messageRouter from './routes/message.route'
import './helpers/passport';
import socketHandle from './helpers/SocketHandle';
import SocketIO from './helpers/socketIO';
import socketManager from './helpers/socketManager';
import { subscribeClient } from './helpers/subscribeClient';

const { PORT, MONGO_CONNECTSTRING, MONGO_USER, MONGO_PASSWORD } = process.env;
const port = parseInt(PORT || '3000', 10);
const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

const bootstrap = async () => {
  await app.prepare();
  const server = express()
  const httpServer = new http.Server(server);
  const { pubClient, subClient } = socketManager;
  const io = new Server(httpServer);
  await Promise.all([pubClient.connect(), subClient.connect()]).then(() => {
    //@ts-ignore
    io.adapter(createAdapter(pubClient, subClient));
  });
  await subscribeClient();
  socketHandle(io);
  SocketIO.Init(io);
  server.use(compression({
    level: 6,
    threshold: 100*1024
  }))
  server.use(passport.initialize());
  server.use(cors());
  server.use(express.json());
  server.use(express.urlencoded({ extended: true }));
  server.use(userRouter);
  server.use(roomRouter);
  server.use(friendRouter)
  server.use(messageRouter)
  server.use(express.static('public'))
  server.all('*', (req, res) => {
    return handle(req, res)
  })
  await mongoose.connect(MONGO_CONNECTSTRING || '', {
    user: MONGO_USER,
    pass: MONGO_PASSWORD,
  })
  console.log("Mongodb Connected");
  httpServer.listen(port, () => {
    console.log(`> Ready on http://localhost:${port}`)
  })
}

bootstrap();