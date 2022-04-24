import express from 'express';
import next from 'next';
import bodyParser from 'body-parser';
import { Server } from 'socket.io';
import http from 'http';
import cors from 'cors';
import passport from 'passport';

import userRouter from './routes/user.route';
import roomRouter from './routes/room.route';
import friendRouter from './routes/friend.route'
import messageRouter from './routes/message.route'
import './helpers/passport';
import chatHandle from './helpers/chatHandle';
import config     from './helpers/config'
import SocketIO from './helpers/socketIO';

const { PORT, MONGO_CONNECTSTRING, MONGO_USER, MONGO_PASSWORD } = process.env;
const port = parseInt(PORT || '3000', 10);
const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

const bootstrap = async () => {
  config()
  await app.prepare();
  const server = express()
  const httpServer = new http.Server(server);
  const io = new Server(httpServer, {});
  chatHandle(io);
  server.use(passport.initialize())
  server.use(cors())
  server.use((req, res, next) => {
    req.io = io;
    next()
  })
  SocketIO.Init(io)
  server.use(bodyParser.json())
  server.use(bodyParser.urlencoded({ extended: true }));
  server.use(userRouter);
  server.use(roomRouter);
  server.use(friendRouter)
  server.use(messageRouter)
  server.use(express.static('public'))
  server.all('*', (req, res) => {
    return handle(req, res)
  })

  httpServer.listen(port, () => {
    console.log(`> Ready on http://localhost:${port}`)
  })
}

bootstrap();