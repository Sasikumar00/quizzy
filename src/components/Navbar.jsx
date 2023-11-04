import React, {useEffect, useState} from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios';
import Cookies from 'js-cookie';
import { toast } from 'react-toastify';
import socketIO from 'socket.io-client';

const Navbar = () => {
    const [roomData, setRoomData] = useState({roomName: '', creatorID: ''})
    const [socket, setSocket] = useState('');
    const handleRoomCreate = async()=>{
        const res = await axios.post(`${process.env.REACT_APP_API_URL}/create-room`,{...roomData});
        if(res.data.status==='success'){
            socket.emit('newroomcreated');
            toast.success(res.data.message);
        }
        else{
            toast.error(res.data.message);
        }
    }
    useEffect(()=>{
        const io = socketIO.connect('ws://localhost:8080');
        setSocket(io);
        if(Cookies.get('quizz-user')){
            setRoomData({...roomData, creatorID: JSON.parse(Cookies.get('quizz-user')).userID});
        }
    //eslint-disable-next-line
    },[])
  return (
    <div className='navigation-bar'>
        <nav>
            <ul className='nav-links'>
                <li><Link to='/'>Lobby</Link></li>
                <li><Link to='/myrooms'>My Rooms</Link></li>
                <li><Link to='/logout'>Logout</Link></li>
                <li><Link to='/room'>Active room</Link></li>
            </ul>
        </nav>
        <div>
            <input name='room_name' placeholder='Enter room name' onChange={(e)=>{
                setRoomData({...roomData, roomName: e.target.value});
            }}/>
            <button onClick={handleRoomCreate}>Create Room</button>
        </div>
    </div>
  )
}

export default Navbar