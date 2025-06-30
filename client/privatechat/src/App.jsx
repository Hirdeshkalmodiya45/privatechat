import { BrowserRouter } from 'react-router-dom';
import React from 'react'
import ReactDOM from 'react-dom/client'
import { Router, Route, Routes } from 'react-router-dom'
import Nav from './nav';
import Home from './home';
import Signup from './Signup';
 import Login from './Login';
import Logout from './logout';
import Chat from './Chat';
import ImageUpload from '../components/Imageupload';
import Chart from './Chart';
//   const [message, setmessage] = useState({})
//  async function helloapi() {
//   try {
//     const response = await fetch('http://localhost:3000');
//     if (!response.ok) {
//       throw new Error('Network response was not ok');
//     }
//     const data = await response.json();          
//     setmessage(data);
//     console.log(data); 
//   } catch (error) {
//     console.error('There has been a problem with your fetch operation:', error);
//   }
//  }
  
    function App() {
  return (
    
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home/>} />

        <Route path="/signup" element={<Signup/>} />
        <Route path="/login" element={<Login/>} />
         <Route path="/logout" element={<Logout/>} />
        <Route path="/chat/:id" element={<Chat/>} />
        <Route path="/upload" element={<ImageUpload/>} />
        <Route path="/chart" element={<Chart/>} />
      </Routes>
    </BrowserRouter>
  );
}


 

export default App;
