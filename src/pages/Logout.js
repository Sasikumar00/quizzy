import Cookies from 'js-cookie'
import React,{useEffect} from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { toast } from 'react-toastify'

const Logout = ({io}) => {
    const navigate = useNavigate();
    const removeUser = async()=>{
      const res = await axios.post(`${process.env.REACT_APP_API_URL}/delete-user`,{username: JSON.parse(Cookies.get('quizz-user')).username});
      if(res.data.status==='success'){
        Cookies.remove('quizz-user');
        navigate('/signup');
      }
      else{
        toast.error(res.data.message);
        navigate('/');
      }
    }
    useEffect(()=>{
      io.emit('userloggedout', {uID: JSON.parse(Cookies.get('quizz-user')).userID});
      io.on('userlogout-ack',()=>{
        removeUser();
      })
        // removeUser();
    //eslint-disable-next-line
    },[])
  return (
    <></>
  )
}

export default Logout