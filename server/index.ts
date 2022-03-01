import express from 'express';
import next from 'next';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bodyParser from 'body-parser';
import { Server } from 'socket.io';
import http from 'http';
import cors from 'cors';
import passport from 'passport';

import userRouter from './routes/user.route';
import roomRouter from './routes/room.route';
import './helpers/passport';
import chatHandle from './helpers/chatHandle';

dotenv.config();
const { PORT, MONGO_CONNECTSTRING, MONGO_USER, MONGO_PASSWORD } = process.env;
const port = parseInt(PORT || '3000', 10);
const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

const bootstrap = async () => {
  await app.prepare();
  await mongoose.connect(MONGO_CONNECTSTRING || '', {
    user: MONGO_USER,
    pass: MONGO_PASSWORD,
  });
  console.log("Mongodb Connected");
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
  server.use(bodyParser.json())
  server.use(bodyParser.urlencoded({ extended: true }));
  server.use(userRouter);
  server.use(roomRouter);

  server.all('*', (req, res) => {
    return handle(req, res)
  })

  httpServer.listen(port, () => {
    console.log(`> Ready on http://localhost:${port}`)
  })
}

bootstrap();