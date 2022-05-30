import axios from "axios";
import { useCallback, useRef } from "react";
import { IMessage } from "server/types/message.type";
import IRoom from "server/types/room.type";
import { IUser, IUserData } from "server/types/user.type";
import { Socket } from "socket.io-client";
import { useFetchAuth } from "./useFetchAuth";
import { useFriends, useFriendsRequestSent, usePendingFriendsRequest } from "./useFriends";
import useListGroup, { useGroup, useTxtSearchGroup } from "./useListGroup";
import useListMessage from "./useListMessage";
import useUser from "./useUser";

export const useProccessSocket = (socket: Socket) => {
  const user = useUser();
  const instance = useFetchAuth();
  const axiosCancelSource = useRef(axios.CancelToken.source());
  const friends = useFriends();
  const pendingFriendsRequest = usePendingFriendsRequest();
  const friendsRequestSent = useFriendsRequestSent();
  const listGroup = useListGroup();
  const group = useGroup();
  const listMessage = useListMessage();
	const searchTextState = useTxtSearchGroup();
  const checkGroup = (room: IRoom) => {
    if (!room.isGroup && room.name2) return room.name2[user._id.get()].includes(searchTextState.get());
    else return room.name.includes(searchTextState.get());
  }
  return useCallback(() => {
    //* Start: Gửi lời mời kết bạn (A gửi lời mời kết bạn đến B)*//
    // 1. Người gửi đi
    socket.on('friend-request-sent', (userData: IUser) => {
      user.addFriendRequestSent(userData._id);
      friendsRequestSent.add(userData);
    });
    // 2. Người nhận
    socket.on('pending-friend-request', (userData: IUser) => {
      user.addPendingFriendRequest(userData._id);
      pendingFriendsRequest.add(userData);
    });
    //* End: Gửi lời mời kết bạn *//

    //* Start: Huỷ lời mời kết bạn đã gửi đi (A gửi lời mời kết bạn đến B, A huỷ lời mời) *//
    // 1. Các socket của A cập nhật
    socket.on('retake-friend-request-sent', ({ userID }) => {
      user.removeFriendRequestSent(userID);
      friendsRequestSent.delete(userID);
    });
    // 2. Các socket của B cập nhật
    socket.on('retake-pending-friend-request', ({ userID }) => {
      user.removePendingFriendRequest(userID);
      pendingFriendsRequest.delete(userID);
    });
    //* End: Huỷ lời mời kết bạn đã gửi đi *//

    //* Start: Chấp nhận lời mời kết bạn (B gửi lời mời kết bạn đến A, A đồng ý)*//
    // 1. Các socket của A cập nhật
    socket.on('accept-pending-friend-request', (userData: IUser) => {
      user.removePendingFriendRequest(userData._id);
      pendingFriendsRequest.delete(userData._id);
      user.addFriend(userData._id);
      friends.add(userData);
    });
    // 2. Các socket của B cập nhật
    socket.on('accept-friend-request-sent', (userData: IUser) => {
      user.removeFriendRequestSent(userData._id);
      friendsRequestSent.delete(userData._id);
      user.addFriend(userData._id);
      friends.add(userData);
    });
    //* End: Chấp nhận lời mời kết bạn *//

    //* Start: Không chấp nhận (B gửi lời mời kết bạn đến A, A không chấp nhận) *//
    // 1. Các socket của A cập nhật
    socket.on('denie-pending-friend-request', ({ userID }) => {
      user.removePendingFriendRequest(userID);
      pendingFriendsRequest.delete(userID);
    });
    // 2. Các socket của B cập nhật
    socket.on('denie-friend-request-sent', ({ userID }) => {
      user.removeFriendRequestSent(userID);
      friendsRequestSent.delete(userID);
    });
    //* End: Không chấp nhận *//

    //* Start: Huỷ kết bạn (A và B là bạn bè, A huỷ kế bạn) *//
    // 1. Các socket của A, B cập nhật
    socket.on('unfriend', ({ userID }) => {
      user.removeFriend(userID);
      friends.delete(userID);
    });
    //* End: Huỷ kết bạn *//

    // Tạo group
    socket.on('new-room', (newGroup: IRoom) => {
      listGroup.add({ ...newGroup, message: null, user: null});
    });
    // Them tin nhan
    socket.on('new-message', ({ message, user, room }: { message: IMessage, user: IUserData, room: IRoom }) => {
      if (group.get()._id === message.roomID) {
        if (checkGroup(room)) listGroup.updateMessage({ message: {
          ...message,
          readers: [...new Set([...message.readers, user._id ])]
        }, user, room });
        axiosCancelSource.current.cancel();
        axiosCancelSource.current = axios.CancelToken.source();
        listMessage.add(message);
        (async() => {
          await instance.post(`/api/room/${message.roomID}/read-messages`, {}, { cancelToken: axiosCancelSource.current.token })
        })();
      } else if (checkGroup(room)) listGroup.updateMessage({ message, user, room });
    });
  }, [friends, pendingFriendsRequest, friendsRequestSent, group.get()._id])
}