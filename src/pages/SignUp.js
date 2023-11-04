import React, {useState,useEffect} from 'react'
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import axios from 'axios';
import { toast } from 'react-toastify';
import Typed from 'react-typed';

const SignUp = ({io}) => {
    const navigate = useNavigate();
    const [socket, setSocket] = useState(null)
    const [username,setUsername] = useState('');
    const [error, setError] = useState('');
    const redirectToLobby = async()=>{
        const res = await axios.post(`${process.env.REACT_APP_API_URL}/create-user`,{username: username});
        if(res.data.status==='success'){
            const userID = res.data.userData._id;
            const userData = {userID,username}
            Cookies.set('quizz-user', JSON.stringify(userData), { expires: 1 });
            toast.success(res.data.message);
            socket.emit('userLoggedIn');
            window.location.replace('/')
        }
        else{
            setError(res.data.message);
        }
    }
    useEffect(()=>{
        setSocket(io);
        if(Cookies.get('quizz-user')){
            navigate('/');
        }
        return ()=>{
            io.disconnect();
        }
    //eslint-disable-next-line
    },[])
  return (
    <div className='h-[90vh] flex flex-col items-center justify-center'>
        <div className='flex justify-center'>
        <Typed className='text-5xl' strings={['Welcome To Quizzy']} typeSpeed={100} loop></Typed>
        </div>
        <div className='bg-[#7743DB] flex flex-col px-5 py-10 mt-[3rem] rounded-md'>
        <h1 className='text-4xl text-white text-center'>Sign Up</h1>
        <input className='mt-5 outline-none rounded-md px-2 py-1' name='username' value={username} placeholder='Enter a username' onChange={(e)=>{
            setUsername(e.target.value);
            if(error.length>=1){
                setError('');
            }
        }}/>
        {error && <p style={{color: 'red'}}>{error}</p>}
        <button className='mt-5 border rounded-md text-white border-white hover:bg-white hover:text-[#222222] transition-all ease-in-out duration-300' onClick={redirectToLobby}>Create user</button>
        </div>
    </div>
  )
}

export default SignUp