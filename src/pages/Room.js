import React, {useEffect,useState} from 'react'
import { useParams, useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import Layout from '../components/Layout';
import { toast } from 'react-toastify';
import {IoIosContact} from 'react-icons/io'
import { TypeAnimation } from 'react-type-animation';
import Spinner from '../components/Spinner'

const Room = ({io}) => {
    const navigate=useNavigate();
    const params = useParams();
    const [roomData, setRoomData] = useState(null);
    const [socket, setSocket] = useState(null);
    const [message,setMessage] = useState('');
    const [messages,setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    useEffect(()=>{
        setSocket(io);
        if(!Cookies.get('quizz-user')){
            return navigate('/signup');
        }
        io.emit('getRoomDetails', {rID: params.roomID});
        io.on('roomData', (response)=>{
            setRoomData(response.data);
            setLoading(false);
        })
        io.emit('joinroom',{roomID: params.roomID, userID: JSON.parse(Cookies.get('quizz-user')).userID})
        io.on('updateRooms', ()=>{
            io.emit('getRoomDetails', {rID: params.roomID});
        })
        io.emit('getMessages', {rID: params.roomID});
        io.on('messages', (messages)=>{
            setMessages(messages);
        })
        io.on('newUserJoined', (messageData)=>{
            if(JSON.parse(Cookies.get('quizz-user')).username!==messageData.user){
                return toast(messageData.message);
            }
        })
        io.on('joiningUpdate', (response)=>{
            if(response.status==='success'){
                toast(response.message);
            }
        });
        io.on('initiateQuiz',()=>{
            toast('Redirecting to quiz room...');
            return window.location.replace(`/room/quizroom/quiz-${params.roomID}`)
        })
        io.on('roomdeleted', ()=>{
            return window.location.replace('/room');
        })
    //eslint-disable-next-line
    },[params.roomID])
    const sendMessageToUser = (rID,uID)=>{
        socket.emit('send message',{rID,uID, message})
        setMessage('');
    }
  return (
    <Layout>
        <h1 className='text-5xl text-center mt-5'>{params.roomID}</h1>
        {loading ? 
        <div className='w-full h-[70vh] flex items-center justify-center'>
        <Spinner/>
        </div>
        :
        <div className='relative'>
            <h1 className='text-xl text-center'>Admin: {roomData.creatorID?.username}</h1>
            <div className='text-4xl font-semibold text-center mt-5 text-[#7743DB]'>
            <TypeAnimation
            sequence={[
                roomData.status==='waiting'?'Waiting for admin to start':'Starting Quiz...',
                1000,
                '',
                1000
                ]}
                wrapper="span"
                speed={50}
                style={{ fontSize: '3rem'}}
                repeat={Infinity}
            />
            </div>
            <div className='grid grid-cols-2 gap-3 mt-10 px-5'>
                <div>
                    <h2 className='text-3xl text-center'>Active Members:</h2>
                    <div className='mt-2 rounded-md h-[10rem] bg-[#7743DB] pt-[1rem]'>
                        {roomData.members?.map((member, index)=>(
                            <h3 className='text-2xl text-white font-semibold flex items-center ml-[5rem] mt-[1rem]' key={index}><IoIosContact className='mr-3'/>{member.username}</h3>
                        ))}
                    </div>
                </div>
                <div className='flex flex-col'>
                    <h1 className='text-3xl text-center'>Messages</h1>
                    <div className='border h-[10rem] rounded-md overflow-y-scroll mt-2 p-5'>
                        <ul style={{listStyle: 'none'}}>
                            {messages.map((msg,index)=>(
                                <li key={index}>{msg}</li>
                            ))}
                        </ul>
                    </div>
                    <input className='border w-[60%] outline-none mx-auto border-black/60 px-2 py-1 rounded-md mt-2' name='message' value={message} placeholder='Enter a message' onChange={(e)=>{
                        setMessage(e.target.value);
                    }}/>
                    <button className='mt-2 bg-[#7743DB] text-white rounded-md text-xl w-[30%] mx-auto' onClick={()=>sendMessageToUser(params.roomID, JSON.parse(Cookies.get('quizz-user')).username)}>Send Message</button>
                </div>
            </div>
        </div>}
    </Layout>
  )
}

export default Room