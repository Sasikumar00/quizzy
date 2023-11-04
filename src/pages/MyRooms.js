import React, {useEffect, useState} from 'react'
import Layout from '../components/Layout'
import Cookies from 'js-cookie'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { toast } from 'react-toastify'

const MyRooms = ({io}) => {
    const navigate = useNavigate();
    const [rooms, setRooms] = useState([]);
    const [socket, setSocket] = useState('');
    const [started, setStarted] = useState(false);
    const getMyRooms = async()=>{
      const res = await axios.post(`${process.env.REACT_APP_API_URL}/get-my-rooms`, {userID: JSON.parse(Cookies.get('quizz-user')).userID});
      if(res.data.status==='success'){
        setRooms(res.data.rooms);
      }
      else{
        toast.error(res.data.message);
      }
    }
    const updateRoomStatus = async(rID,uID)=>{
      const res = await axios.post(`${process.env.REACT_APP_API_URL}/update-room-status`, {rID,uID});
      if(res.data.status==='success'){
        socket.emit('getRoomDetails', {rID});
        getMyRooms();
        toast.success(res.data.message);
        socket.emit('startQuiz', {rID});
        setStarted(true);
      }
      else{
        toast.error(res.data.message);
      }
    }
    useEffect(()=>{
        setSocket(io);
        io.on('updateRooms', ()=>{
            getMyRooms();
        })
        if(!Cookies.get('quizz-user')){
           return navigate('/signup');
        }
        else{
          getMyRooms();
        }
    //eslint-disable-next-line
    },[])
  return (
    <Layout>
        <h1>My Rooms</h1>
        {rooms.length>=1 ?
        <div>
        {rooms.map((room,index)=>(
          <div key={index} style={{border: '2px solid black'}}>
            <h1>{room.name}</h1>
            <h1>Active members: {room.members.length}</h1>
            <h3>Status: {room.status}</h3>
            <div>
              <button>Delete Room</button>
              {!started?
              <input type='button' value={'Start'} disabled={room.members.length===2?false:true} onClick={()=>{
                updateRoomStatus(room.name, JSON.parse(Cookies.get('quizz-user')).username)
              }}/>
              :
              <button>Stop quiz</button>}
            </div>
          </div>
        ))}
        </div>
        :
        <div>
          <h1>No rooms to show</h1>
        </div>}
    </Layout>
  )
}

export default MyRooms