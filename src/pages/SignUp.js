import React, {useState,useEffect} from 'react'
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import axios from 'axios';
import { toast } from 'react-toastify';

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
    <div>
        <h1>Sign Up</h1>
        <input name='username' value={username} placeholder='Enter a username' onChange={(e)=>{
            setUsername(e.target.value);
            if(error.length>=1){
                setError('');
            }
        }}/>
        {error && <p style={{color: 'red'}}>{error}</p>}
        <button onClick={redirectToLobby}>Create user</button>
    </div>
  )
}

export default SignUp