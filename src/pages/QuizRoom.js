import React, { useEffect, useState } from 'react';
import socketIO from 'socket.io-client';
import { useParams } from 'react-router-dom';
import Cookies from 'js-cookie';
import { toast } from 'react-toastify';
import { ToastContainer } from 'react-toastify';
import { TypeAnimation } from 'react-type-animation';

const QuizRoom = () => {
  const params = useParams();
  const [socket, setSocket] = useState(null)
  const [questions, setQuestions] = useState([]);
  const [started, setStarted] = useState(false);
  const [counter, setCounter] = useState(5);
  const [qcounter, setQcounter] = useState(10);
  const [totalQuestions] = useState(5);
  const [currentIndex, setCurrentIndex] = useState(1);
  const [totalTime, setTotalTime] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [answers, setAnswers] = useState([-1,-1,-1,-1,-1]);
  const [status, setStatus] = useState('waiting');
  const [results, setResults] = useState(null);
  const [selected, setSelected] = useState(-1);

  useEffect(()=>{
    if(started && !completed){
    const totalTimer = setInterval(()=>{
      if(!completed){
        setTotalTime(totalTime+1);
      }
      else{
        // console.log('Stopped total time')
        clearInterval(totalTimer);
      }
    }, 1000)
    return () => {
      clearInterval(totalTimer);
    };
  }
  }, [started, completed, totalTime]);

  useEffect(()=>{
    if(questions.length>=1){
    const timerInterval = setInterval(() => {
      if (qcounter > 0) {
        setQcounter(qcounter - 1);
      } 
      else {
        if (currentIndex < totalQuestions) {
          setSelected(-1);
          setQcounter(10);
          setCurrentIndex(currentIndex + 1);
        } else {
          clearInterval(timerInterval);
          // console.log('completed');
          socket.emit('initiateEndQuiz', {qID: params.quizID, userID: JSON.parse(Cookies.get('quizz-user')).userID, time_taken: totalTime-5, answers: answers})
          setCompleted(true);
        }
      }
    }, 1000);
    return () => {
      clearInterval(timerInterval);
    };
  }
  //eslint-disable-next-line
  },[questions, qcounter, currentIndex, totalQuestions])

  useEffect(() => {
    const io = socketIO.connect('ws://localhost:8080');
    io.emit('beginQuiz', { rID: params.quizID.split('-')[1],qID: params.quizID });
    setSocket(io);
    io.on('startingQuiz', () => {
      let i = counter;
      if (!started) {
        const timer = setInterval(() => {
            if (i >= 0) {
                setCounter(i);
                i--;
            } 
            else {
                clearInterval(timer);
                io.emit('getQuestions', { qID: params.quizID });
            }
        }, 1000);
      }
    });

    io.on('questions', (questions) => {
      setQuestions(questions.questions);
      setStarted(true);
      // console.log('Started')
    });
    io.on('quiz-completion-ack', (message)=>{
      toast.success(message);
    });
    io.on('showResults', (results)=>{
      setStatus('finished');
      setResults(results);
      toast.success('Quiz completed successfully')
    })
    //eslint-disable-next-line
  }, []);

  return (
    <div className='py-7 px-10'>
      <ToastContainer limit={1}/>
      <h1 className='text-5xl text-center'>Quiz <span className='text-[#7743DB]'>Room</span></h1>
      {started ? (
        <div>
          {!completed ? (
            <div className='mt-10 px-10'>
              <div className='flex justify-between items-center w-[90%]'>
                <h1 className='text-4xl font-semibold'>Question: {currentIndex}</h1>
                <h3 className='text-xl'>Timer: <span className={`${qcounter<=3?'text-red-500':'text-yellow-500'}`}>{qcounter}</span></h3>
              </div>
                <h1 className='text-3xl mt-3'>{questions[currentIndex-1]?.question}</h1>
                <div className='flex justify-between gap-4 mx-auto mt-10'>
                  {questions[currentIndex-1]?.options.map((o,index)=>(
                      <div className={`question-option-card flex items-center justify-center ${selected===`${questions[currentIndex-1]._id}${currentIndex+index}`?'bg-[#7743DB]':''}`} key={index} htmlFor='option' onClick={(e)=>{
                            setSelected(`${questions[currentIndex-1]._id}${currentIndex+index}`);
                            let newAnswers = [...answers];
                            newAnswers[currentIndex-1]={questionID: questions[currentIndex-1]._id, answer: index};
                            setAnswers(newAnswers)
                        }}>
                        <h1 className={`text-[#7743DB] option-card-value text-3xl ${selected===`${questions[currentIndex-1]._id}${currentIndex+index}`?' text-white':''}`}>{o}</h1>
                      </div>
                  ))}
                </div>
                <div className='flex items-center justify-center mt-10'>
                  <button className='bg-yellow-500 text-white text-2xl px-5 py-2 rounded-md mx-auto' onClick={()=>{
                      setQcounter(0);
                  }}>Submit</button>
                </div>
            </div>
          ) : (
            <div>
              {
                status==='waiting' ?
              <div>
              <h1 className='text-4xl text-center mt-10 font-semibold mb-[4rem]'>Quiz Completed</h1>
              <TypeAnimation
                sequence={[
                'Wait for other players to finish',
                1000,
                '',
                1000
                  ]}
                  wrapper="span"
                  speed={40}
                  style={{ fontSize: '4rem', color: '#7743DB', textAlign: 'center'}}
                  repeat={Infinity}
              />
              <h3 className='text-2xl text-center mt-[4rem]'>Time Taken: {totalTime-5} sec</h3>
              </div>
              :
              <div className='relative'>
                <button className='absolute bg-red-500 text-white px-5 py-2 rounded-md' onClick={()=>{
                window.location.replace('/room');
                }}>Exit</button>
                <h1 className='text-6xl font-bold text-center mt-5'>Results</h1>
                {results.length>1?
                <div className='flex flex-col items-center justify-center mt-3'>
                  <div className='border-2 border-[#7743DB] px-10 py-5 w-[70%] rounded-md'>
                    <h1 className='text-5xl text-center font-bold text-[#7743DB]'>Winner</h1>
                    <h3 className='text-3xl font-semibold text-center'>{results[0].name}</h3>
                    <h3 className='text-2xl'>Score: {results[0].score}</h3>
                    <h3 className='text-2xl'>Time Taken: {results[0].time_taken} sec</h3>
                  </div>
                  <div className='border-2 border-[#7743DB] px-10 py-5 w-[65%] rounded-md mt-3'>
                  <h1 className='text-4xl text-center font-bold text-[#7743DB]'>1st Runner Up</h1>
                    <h3 className='text-3xl font-semibold text-center'>{results[1].name}</h3>
                    <h3 className='text-xl'>Score: {results[1].score}</h3>
                    <h3 className='text-xl'>Time Taken: {results[1].time_taken} sec</h3>
                  </div>
                </div>
                :
                <div>
                  <h1 className='text-6xl mt-[6rem] text-center text-[#7743DB] font-bold'>{results[0].message}</h1>
                </div>}
              </div>}
            </div>
          )}
        </div>
      ) : (
        <div className='h-[80vh] flex flex-col items-center justify-center'>
          <h1 className='text-2xl'>Starting in</h1>
          <h1 className='text-[15rem] font-semibold text-[#7743DB]'>{counter}</h1>
        </div>
      )}
    </div>
  );
};

export default QuizRoom;
