import React, {useEffect,useState} from 'react'
import { useParams, useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import Layout from '../components/Layout';
import { toast } from 'react-toastify';

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
    //eslint-disable-next-line
    },[params.roomID])
    const sendMessageToUser = (rID,uID)=>{
        socket.emit('send message',{rID,uID, message})
        setMessage('');
    }
  return (
    <Layout>
        <h1>{params.roomID}</h1>
        {loading ? <p>Loading...</p>:
        <div>
            <h1>Admin: {roomData.creatorID.username}</h1>
            <h2>{roomData.status==='waiting'?'Waiting for admin to start':'Starting Quiz...'}</h2>
            <div>
                <h2>Active Members:</h2>
                <div>
                    {roomData.members?.map((member, index)=>(
                        <h3 key={index}>{member.username}</h3>
                    ))}
                </div>
            </div>
            <div>
                <h1>Messages</h1>
                <div>
                    <ul style={{listStyle: 'none'}}>
                        {messages.map((msg,index)=>(
                            <li key={index}>{msg}</li>
                        ))}
                    </ul>
                </div>
            </div>
            <input name='message' value={message} placeholder='Enter a message' onChange={(e)=>{
                setMessage(e.target.value);
            }}/>
            <button onClick={()=>sendMessageToUser(params.roomID, JSON.parse(Cookies.get('quizz-user')).username)}>Send Message</button>
        </div>}
    </Layout>
  )
}

export default Room