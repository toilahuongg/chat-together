import IRoom from "server/types/room.type";

export const defaultGroup = (): IRoom => ({ 
    _id: '',
    name: '',
    isGroup: false,
    settings: {},
    userIDs: [],
    avatar: '',
    ownerID: '',
    name2: {}
});