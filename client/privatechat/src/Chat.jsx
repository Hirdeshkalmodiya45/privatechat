import React, { useState, useEffect ,useRef} from 'react';
import { useParams } from 'react-router-dom';
import './Chat.css';
import { io } from 'socket.io-client';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGear } from '@fortawesome/free-solid-svg-icons';
import { faPhone } from '@fortawesome/free-solid-svg-icons';
import Home from './home';
import VoiceCall from './VoiceCall';
const socket = io('http://localhost:3000', { withCredentials: true });
import { useNavigate,useLocation } from 'react-router-dom';

function Chat() {
    const { id: fuser_id } = useParams();
    const [chatHistory, setChatHistory] = useState([]);
    const [message, setMessage] = useState('');
  const currentUserId = localStorage.getItem('currentUserId');
  const [receiverusername, setReceiverUsername] = useState(''); // Clear last message on chat load
const chatEndRef = useRef(null);
  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

 const location = useLocation();
  const navigate = useNavigate();
  const [error, setError] = useState(false);  

    // Fetch the logged-in user's ID from localStorage

  useEffect(() => {
    // If accessed directly (no state), redirect to homepage or error page
    if (!location.state?.rurl) {
      navigate("/");
    }
  }, [location.state, navigate]);
    // Fetch logged-in user's ID once
  const fetchChatHistory = async () => {
            try {
                const response = await fetch(`http://localhost:3000/chat/messages`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ fuser_id }),
                    credentials: 'include',
                });

                if (!response.ok) throw new Error('Failed to fetch chat history');

                const data = await response.json();
                setChatHistory(data.messages);
                setReceiverUsername(data.receiverusername);
            } catch (error) {
                console.error('Error fetching chat history:', error);
                   

 // Redirect to homepage if error occurs

            }
        };
    // Fetch chat messages
    useEffect(() => {
        if (fuser_id) {
        fetchChatHistory();
        }
    }, [fuser_id]);
 useEffect(() => {
    if(chatHistory.length > 0) {
 
    scrollToBottom();
    }
  }, [chatHistory]);
    const handleInputChange = (e) => {
        setMessage(e.target.value);
    };

    // const handleSubmit = async (e) => {
    //     e.preventDefault();
    //     try {
    //         const response = await fetch('http://localhost:3000/chat', {
    //             method: 'POST',
    //             headers: { 'Content-Type': 'application/json' },
    //             body: JSON.stringify({ message, fuser_id }),
    //             credentials: 'include',
    //         });

    //         const data = await response.json();

    //         if (response.ok) {
    //             setMessage('');
    //         } else {
    //             alert('Failed to send message: ' + (data.message || 'Unknown error'));
    //         }
    //     } catch (error) {
    //         console.error('Error sending message:', error);
    //         alert('Network error sending message');
    //     }
    // };
const handleSubmit = (e) => {
    e.preventDefault();

    if (!message.trim()) return;

    socket.emit("chatMessage", {
        message,
        senderId: currentUserId, // use your logged-in user ID
        receiverId: fuser_id,    // friend user ID
    });

    setMessage('');
   // Reset error state on successful message send
    fetchChatHistory(); // Fetch chat history after sending message 
      localStorage.setItem("friendAdded", "true");
    scrollToBottom(); // Scroll to the bottom after sending a message   
};



// Function to give options for message deletion   
const deleteMessageAll =async()=>{
    const response = await fetch('http://localhost:3000/chat/deleteAll', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fuser_id }),
        credentials: 'include',
    });
    
    if (response.ok) {
        fetchChatHistory();
        alert('Messages deleted successfully');
        
    } else {
        alert('Failed to delete messages');
    }

}




const giveoption = () => {  
    const option = prompt("Choose an option:\n1. Delete After 24 hour\n2. After view\n3.ALL Delete");
    if (option === '1') {
        alert('Option 1 selected: Messages will be deleted after 24 hours.');
        setTimeout(() => {  
            deleteMessageAll();
        }, 24 * 60 * 60 * 1000); // 24 hours in milliseconds

    } else if (option === '2') {
        alert('Option 2 selected: Messages will be deleted after being viewed.');
       
        // Listen for message viewed event only once per option selection
        window.addEventListener('popstate', function handleBack() {
            deleteMessageAll();
            window.removeEventListener('popstate', handleBack);
        });
       
        } else if (option === '3') {
        alert('Option 3 selected:   All  Messages deleted.');
        deleteMessageAll();
    }
  
     else {
        alert('Invalid option selected.');
    } 
}           
const callRef = useRef();

  const voicecall = () => {
    const call = prompt("Enter the username to call:");
    if (call) {
      socket.emit("voiceCall", {
        callerId: currentUserId,
        receiverId: fuser_id,
        callUsername: call,
      });
      alert(`Calling ${call}...`);
      callRef.current?.startCall(true); // ✅ trigger from ref
    }
  };


    return (
        <>
        <div className="homepage">
 
        <Home />
</div>

        <div className="chat-container">
            <div className='topuser'>
                <h2>Chat with  {receiverusername ? receiverusername : '...'}</h2>
                <div className="settings-icon"   >
                    <FontAwesomeIcon icon={faGear} onClick={() => giveoption()} />
                    <FontAwesomeIcon icon={faPhone} onClick={ voicecall } />
                           <VoiceCall ref={callRef} currentUserId={currentUserId} fuser_id={fuser_id} />
                </div>
            </div>
            <div className="chat-history">
                {chatHistory.map((msg, index) => (
                    <div
                        key={index}
                        className={`chat-message ${
                            msg.sender && msg.sender._id === currentUserId ? 'sender' : 'receiver'
                        }`}
                    >
                        <p>{msg.message}</p>
                        <span className="timestamp">
                            {msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString() : ''}
                        </span>
                    </div>
                ))}
                <div ref={chatEndRef} />
            </div>
            <div className="chat-input">
                <form onSubmit={handleSubmit} style={{ display: 'flex', width: '100%' }}>
                    <input
                        type="text"
                        placeholder="Type your message..."
                        name="message"
                        value={message}
                        onChange={handleInputChange}
                        autoComplete="off"
                        style={{ flex: 1 }}
                    />
                    <button className="send-button" type="submit">Send</button>
                </form>
            </div>
        </div>
        </>
    );
}

export default Chat;
