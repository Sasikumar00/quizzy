import Cookies from 'js-cookie';
import React, {useEffect, useState} from 'react'
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import axios from 'axios';
import { toast } from 'react-toastify';
import {IoMdContacts} from 'react-icons/io'
import {GrUserAdmin} from 'react-icons/gr'

const HomePage = ({io}) => {
    const navigate = useNavigate();
    const [rooms, setRooms] = useState([]);
    const [userData, setUserData] = useState({});
    const getUserDetails = async()=>{
        const res = await axios.post(`${process.env.REACT_APP_API_URL}/get-user-details`,{
            username: JSON.parse(Cookies.get('quizz-user')).username
        });
        if(res.data.status==='success'){
            setUserData(res.data.data);
        }
        else if(res.data.status==='fail'){
            toast.error(res.data.message);
            Cookies.remove('quizz-user');
            window.location.replace('/signup');
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
        <div className='mt-5 px-10'>
        <h1 className='text-5xl font-semibold'>Welcome {Cookies.get('quizz-user') && JSON.parse(Cookies.get('quizz-user')).username},</h1>
        <h2 className='text-center text-3xl font-semibold'>Lobby</h2>
        <div className='grid grid-cols-3 gap-4 mt-5'>
        {rooms.map((room,index)=>(
            <div key={index} className='border border-[#7743DB] py-2 px-3 w-full rounded-md text-xl'>
                <h1 className='text-center text-2xl font-semibold my-3 text-[#7743DB]'>{room.name}</h1>
                <h3 className='ml-4 flex items-center'><IoMdContacts className='mr-2 text-[#7743DB]'/> Active: {room.members.length}</h3>
                <p className='ml-4 flex items-center'><GrUserAdmin className='mr-2 text-[#7743DB]'/> Admin: {room.creatorID?.username}</p>
                <div className='flex justify-center'>
                <button className='join-btn px-2 py-1 mt-5 border border-black rounded-md' onClick={()=>handleRoomJoin(`${room.name}`)}>Join</button>
                </div>
            </div>
        ))}
        </div>
        </div>
    </Layout>
  )
}

export default HomePage