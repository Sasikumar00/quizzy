import { useState, useEffect } from 'react';
import {Routes, Route} from 'react-router-dom';
import HomePage from './pages/HomePage';
import Room from './pages/Room';
import SignUp from './pages/SignUp';
import Logout from './pages/Logout';
import MyRooms from './pages/MyRooms';
import './App.css';
import 'react-toastify/dist/ReactToastify.css';
import ActiveRoom from './pages/ActiveRoom';
import socketIO from 'socket.io-client';
import QuizRoom from './pages/QuizRoom';

function App() {
  const [io] = useState(socketIO.connect('ws://localhost:8080'));
  return (
    <Routes>
      <Route path='/' element={<HomePage io={io}/>}/>
      <Route path='/room/:roomID' element={<Room io={io}/>}/>
      <Route path='/signup' element={<SignUp io={io}/>}/>
      <Route path='/logout' element={<Logout io={io}/>}/>
      <Route path='/myrooms' element={<MyRooms io={io}/>}/>
      <Route path='/room' element={<ActiveRoom io={io}/>}/>
      <Route path='/room/quizroom/:quizID' element={<QuizRoom/>}/>
    </Routes>
  );
}

export default App;
