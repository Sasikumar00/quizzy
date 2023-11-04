import Cookies from 'js-cookie';
import React, {useEffect, useState} from 'react'
import { useNavigate, useParams } from 'react-router-dom';
import Layout from '../components/Layout';
import axios from 'axios';
import { toast } from 'react-toastify';

const HomePage = ({io}) => {
    const params = useParams();
    const navigate = useNavigate();
    const [rooms, setRooms] = useState([]);
    const [userData, setUserData] = useState({});
    const [socket, setSocket] = useState(null);
    const getUserDetails = async()=>{
        const res = await axios.post(`${process.env.REACT_APP_API_URL}/get-user-details`,{
            username: JSON.parse(Cookies.get('quizz-user')).username
        });
        if(res.data.status==='success'){
            setUserData(res.data.data);
        }
        else{
            toast.error(res.data.message);
        }
    }
    const handleRoomJoin = (roomID) =>{
        if(!userData['isJoinedRoom'])
            return window.location.replace(`/room/${roomID}`);
        else
            return io.emit('joinroom',{roomID: roomID, userID: JSON.parse(Cookies.get('quizz-user')).userID})
    }
    useEffect(()=>{
        if(!Cookies.get('quizz-user')){
            return navigate('/signup')
        }
        getUserDetails();
        setSocket(io);
        io.emit('getrooms');
        io.on('roomlist', (roomlist)=>{
            setRooms(roomlist.rooms);
        });
        io.on('updateRooms',()=>{
            io.emit('getrooms');
        })
        io.on('joiningUpdate', (response)=>{
            return toast.error(response.message)
        })
    //eslint-disable-next-line
    },[])
  return (
    <Layout>
        <div>
        <h1>Welcome {Cookies.get('quizz-user') && JSON.parse(Cookies.get('quizz-user')).username},</h1>
        <h2 style={{textAlign: 'center'}}>Lobby</h2>
        <div style={{padding: '5px 2rem'}}>
        {rooms.map((room,index)=>(
            <div key={index} style={{display: 'flex', flexDirection:'column', alignItems: 'center', border: '2px solid black', width: '40%'}}>
                <h1>{room.name}</h1>
                <h3>Active members: {room.members.length}</h3>
                <p>creator: {room.creatorID?.username}</p>
                <button onClick={()=>handleRoomJoin(`${room.name}`)}>Join</button>
            </div>
        ))}
        </div>
        </div>
    </Layout>
  )
}

export default HomePage