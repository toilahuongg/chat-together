import { useRouter } from "next/router";
import { useCallback, useEffect, useState } from "react";
import instance from "@src/helpers/instance";
import { useSocket } from "@src/Components/AppProvider";

const Message = () => {
    const router = useRouter();
    const { type, id } = router.query;
    const socket = useSocket();
    const [messages, setMessages] = useState<any>([]);
    const [msg, setMsg] = useState('');
    const [dataRoom, setDataRoom] = useState<any>();
    const [dataUser, setDataUser] = useState<any>();

    useEffect(() => {
      if (socket && type && id) {
        const fetchData = async() => {
            const response = await instance.post('/api/room/'+id, { type });
            setDataRoom(response.data);
            const { _id } = response.data;
            socket.emit('join-room', _id);
        }
        socket.on('messages',({ msg, sender}) => {
            setMessages((current) => [
                {
                    msg,
                    sender
                },
                ...current
            ]);
        });
        fetchData();
      }
    }, [socket, type, id]);

    useEffect(() => {
        (async () => {
            const response = await instance.get('/api/user/profile');
            setDataUser(response.data);
        })()
    }, []);

    const sendMessage = useCallback(() => {
        setMessages((current) => [
            {
                msg: msg,
                sender: dataUser._id
            },
            ...current
        ]);
        if (socket && dataRoom && dataUser) {
            socket.emit('messages', {
                roomID: dataRoom._id,
                msg: msg,
                sender: dataUser._id
            });
        }
    }, [socket, msg, dataRoom?._id, dataUser?._id]);
    return (
        <>
            <div> 
                <input value={msg} onChange={(e) => setMsg(e.target.value)} />
                <button onClick={sendMessage}> Send </button>
                <ul>
                    {messages.map(({ sender, msg }, index) => <li key={index}>{sender}: {msg} </li>)}
                </ul>
            </div>  
        </>
    );
}

export default Message;