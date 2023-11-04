import React, { useEffect, useState } from 'react';
import socketIO from 'socket.io-client';
import { useParams } from 'react-router-dom';
import Cookies from 'js-cookie';
import { toast } from 'react-toastify';
import { ToastContainer } from 'react-toastify';

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

  useEffect(()=>{
    if(started && !completed){
    const totalTimer = setInterval(()=>{
      if(!completed){
        setTotalTime(totalTime+1);
      }
      else{
        console.log('Stopped total time')
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
          setQcounter(10);
          setCurrentIndex(currentIndex + 1);
        } else {
          clearInterval(timerInterval);
          console.log('completed');
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
      console.log('Started')
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
    <div>
      <ToastContainer limit={1}/>
      <h1>Quiz Room</h1>
      {started ? (
        <div>
          {!completed ? (
            <div>
                <h1>Question: {currentIndex}</h1>
                <h1>{questions[currentIndex-1]?.question}</h1>
                <div>
                  {questions[currentIndex-1]?.options.map((o,index)=>(
                    <label key={index} htmlFor='option'>
                      <input type='radio' value={currentIndex+index} name='option' onChange={(e)=>{
                        if(e.target.checked){
                          let newAnswers = answers;
                          newAnswers[currentIndex-1]={questionID: questions[currentIndex-1]._id, answer: index};
                          setAnswers(newAnswers)
                        }
                        else{
                          let newAnswers = answers;
                          newAnswers[currentIndex-1]=-1;
                          setAnswers(newAnswers)
                        }
                      }}/>
                      {o}
                    </label>
                  ))}
                  <button onClick={()=>{
                    setQcounter(0);
                  }}>Submit</button>
                </div>
                <h3>Timer: {qcounter}</h3>
            </div>
          ) : (
            <div>
              {
                status==='waiting' ?
              <div>
              <h1>Quiz Completed</h1>
              <h2>Wait for other players to finish</h2>
              <h3>Time Taken: {totalTime-5}</h3>
              </div>
              :
              <div>
                <h1>Results</h1>
                <div>
                  <h3>Rank 1: {results[0].name}</h3>
                  <h3>Score: {results[0].score}</h3>
                  <h3>Time Taken: {results[0].time_taken}</h3>
                </div>
                <hr/>
                <div>
                  <h3>Rank 2: {results[1].name}</h3>
                  <h3>Score: {results[1].score}</h3>
                  <h3>Time Taken: {results[1].time_taken}</h3>
                </div>
                <button onClick={()=>{
                  window.location.replace('/room');
                }}>Exit</button>
              </div>}
            </div>
          )}
        </div>
      ) : (
        <div>
          <h1>Starting in {counter}</h1>
        </div>
      )}
    </div>
  );
};

export default QuizRoom;
