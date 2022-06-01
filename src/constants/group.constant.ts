import IRoom from "server/types/room.type";

export const defaultGroup = (): IRoom => ({ 
    _id: '',
    name: '',
    isGroup: true,
    settings: {},
    userIDs: [],
    avatar: '',
    ownerID: '',
    infoUsers: {},
    createdAt: ''
});