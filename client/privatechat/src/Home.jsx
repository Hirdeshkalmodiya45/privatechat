import Nav from "./nav";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import "./home.css"; // Assuming you have a CSS file for styling
import Searchbox from "../components/Searchbox";

function Home() {
  
  const navigate = useNavigate();

  const [friends, setFriends] = useState([]);
  const lastMessage = localStorage.getItem("lastMessage");
const lastMessageObj = JSON.parse(lastMessage);
// If using Vite



 const fetchFriends = async () => {
  
const apiu=  import.meta.env.VITE_REACT_APP_APICF_URL;    
    try {
      const newLocal = await fetch(apiu, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });
      const res = newLocal;

      if (!res.ok) {
        throw new Error("Failed to fetch friends");
      }

      const data = await res.json();
      setFriends(data.friends);
      console.log("Friends fetched:", data.friends);
    } catch (error) {
      console.error("Error fetching friends:", error);
    }
  };
    useEffect(() => {
    if (!localStorage.getItem("username")) {
      navigate("/login");
    } else {
      fetchFriends();
    }
  }, []);
  useEffect(() => {
    const interval = setInterval(() => {
      const flag = localStorage.getItem("friendAdded");
      if (flag === "true") {
        fetchFriends();
        localStorage.removeItem("friendAdded");
      }

    }, 1000); // check every 1 second

    return () => clearInterval(interval);
  }, []);

  return (
    <>

    <div className="home">

      <div className="containersidebar">
    
        <Searchbox />
        {friends.map((friend, idx) => (
          <div className="card mb-3" style={{ maxWidth: "540px" }} key={idx} onClick={()=> navigate(`/chat/${friend._id}`, { state:{ rurl:true} })}>
            <div className="row g-0">
              <div className="col-md-4">
                <img src={`http://localhost:3000${friend.imgurl}`}className="img-fluid  dp" alt="uploaded" />
      
              </div>
              <div className="col-md-8">
                <div className="card-body">
                  <h5 className="card-title">{friend.username}</h5>
                  <div className="card-text">
                    <p className="text-body-secondary">{friend.lastMessage}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
    </>
  
  );
}
export default Home;
