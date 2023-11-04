import React, {useState, useEffect} from 'react'
import Layout from '../components/Layout'
import axios from 'axios';
import { toast } from 'react-toastify';
import Cookies from 'js-cookie';
import { useNavigate } from 'react-router-dom';

const ActiveRoom = ({io}) => {
    const navigate = useNavigate();
    const [isJoined, setIsJoined] = useState(false);
    const [roomData, setRoomData] = useState({});
    const [loading, setLoading] = useState(true);
    const [socket, setSocket] = useState('');
    const getUserDetails = async()=>{
        setLoading(true);
        const res = await axios.post(`${process.env.REACT_APP_API_URL}/get-user-details`, {username: JSON.parse(Cookies.get('quizz-user')).username});
        if(res.data.status==='success'){
            const room = res.data.data;
            if(room.joinedRoomID!=null){
                setRoomData(room);
                setIsJoined(true);
            }
        }
        else{
            return toast.error(res.data.message);
        }
        setLoading(false);
    }
    const handleEnterRoom = (rID)=>{
       return navigate(`/room/${rID}`);
    }
    const handleLeaveRoom = async(rID,uID)=>{
        const res = await axios.post(`${process.env.REACT_APP_API_URL}/remove-user-from-room`, {rID,uID});
        if(res.data.status==='success'){
            setIsJoined(false);
            setRoomData({});
            socket.emit('initiate-close',{roomID: rID, userID: uID});
            toast.success(res.data.message);
        }
        else{
            toast.error(res.data.message);
        }
    }
    useEffect(()=>{
        setSocket(io);
        getUserDetails();
    },[io])
  return (
    <Layout>
        {loading ? <p>Loading...</p>:
        isJoined ? 
        <div>
            <h1>{roomData.joinedRoomID?.name}</h1>
            <h3>Active Members: {roomData.joinedRoomID?.members.length}</h3>
            <div>
                <button style={{backgroundColor: 'red', color: 'white'}} onClick={()=>handleLeaveRoom(roomData.joinedRoomID.name, JSON.parse(Cookies.get('quizz-user')).userID)}>Leave Room</button>
                <button style={{backgroundColor: 'blue', color: 'white'}} onClick={()=>handleEnterRoom(roomData.joinedRoomID.name, JSON.parse(Cookies.get('quizz-user')).userID)}>Enter Room</button>
            </div>
        </div>
        :
        <div>
            <h1>Join a room to see details</h1>
        </div>}
    </Layout>
  )
}

export default ActiveRoom