import React, {useEffect, useState} from 'react'
import Layout from '../components/Layout'
import Cookies from 'js-cookie'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { toast } from 'react-toastify'
import {IoMdContacts} from 'react-icons/io'
import {HiStatusOnline} from 'react-icons/hi'

const MyRooms = ({io}) => {
    const navigate = useNavigate();
    const [rooms, setRooms] = useState([]);
    const [socket, setSocket] = useState('');
    const [started, setStarted] = useState(false);
    const deleteMyRoom = async(rID)=>{
      socket.emit('delete-my-room', {rID, uID: JSON.parse(Cookies.get('quizz-user')).userID});
    }
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
        io.on('deletion-ack', (response)=>{
          if(response.status==='success'){
            return toast.success(response.message);
          }
          else{
            toast.error(response.message);
          }
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
        <h1 className='text-5xl text-center font-semibold mt-5'>My Rooms</h1>
        {rooms.length>=1 ?
        <div className='grid grid-cols-3 gap-4 mt-5 px-10'>
        {rooms.map((room,index)=>(
          <div key={index} className='border border-[#7743DB] py-2 px-3 w-full rounded-md text-xl'>
            <h1 className='text-center text-2xl font-semibold my-3 text-[#7743DB]'>{room.name}</h1>
            <h3 className='ml-4 flex items-center'><IoMdContacts className='mr-2 text-[#7743DB]'/>Active: {room.members.length}</h3>
            <h3 className='ml-4 flex items-center'><HiStatusOnline className='mr-2 text-[#7743DB]'/>Status: <span className={
              `ml-1 ${
              room.status==='started'?'text-yellow-400': (room.status==='waiting'?'text-[#7743DB]':'text-green-400')}`
            }>{room.status}</span></h3>
            <div className='flex items-center justify-center mt-5'>
              <button onClick={()=>{
                deleteMyRoom(room.name)
              }} className='delete-btn mr-5'>Delete Room</button>
              {!started?
              <input className='start-btn' type='button' value={'Start'} disabled={room.members.length===2?false:true} onClick={()=>{
                updateRoomStatus(room.name, JSON.parse(Cookies.get('quizz-user')).username)
              }}/>
              :
              <button className='stop-btn'>Stop quiz</button>}
            </div>
          </div>
        ))}
        </div>
        :
        <div className='h-[70vh] flex items-center justify-center'>
          <h1 className='text-2xl'>No rooms to show</h1>
        </div>}
    </Layout>
  )
}

export default MyRooms