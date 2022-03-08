import { Server } from 'socket.io';
import { DefaultEventsMap } from 'socket.io/dist/typed-events';
import { IUserData } from '../user.type';
declare global {
  namespace Express {
    interface Request {
        auth?: IUserData | undefined;
        io: Server<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>;
    }
  }
}