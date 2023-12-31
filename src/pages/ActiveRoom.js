import React, {useState, useEffect} from 'react'
import Layout from '../components/Layout'
import axios from 'axios';
import { toast } from 'react-toastify';
import Cookies from 'js-cookie';
import { useNavigate } from 'react-router-dom';
import Spinner from '../components/Spinner'

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
                console.log(room);
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

    useEffect(()=>{
        setRoomData({});
        getUserDetails()
    },[])
  return (
    <Layout>
        {loading ? 
        <div className='w-full h-[70vh] flex items-center justify-center'>
        <Spinner/>
        </div>
        :
        isJoined ? 
        <div className='flex flex-col items-center'>
            <h1 className='text-5xl mt-5'>{roomData.joinedRoomID?.name}</h1>
            <h3 className='text-4xl mt-3'>Active Members: {roomData.joinedRoomID?.members.length}</h3>
            <div className='flex gap-4 mt-5'>
                <button className='delete-btn px-2 py-1' onClick={()=>handleLeaveRoom(roomData.joinedRoomID.name, JSON.parse(Cookies.get('quizz-user')).userID)}>Leave Room</button>
                <button className='join-btn px-2 py-1' onClick={()=>handleEnterRoom(roomData.joinedRoomID.name, JSON.parse(Cookies.get('quizz-user')).userID)}>Enter Room</button>
            </div>
        </div>
        :
        <div className='h-[70vh] flex items-center justify-center'>
            <h1 className='text-2xl'>Join a room to see details</h1>
        </div>}
    </Layout>
  )
}

export default ActiveRoom