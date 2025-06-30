import "../public/Searchbox.css";
import { useNavigate } from "react-router";
import {  useEffect,useState} from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { faSearch } from '@fortawesome/free-solid-svg-icons';
import Imageupload from "./Imageupload.jsx";
function  Searchbox() {
const [showUpload, setShowUpload] = useState(false);
const [showModal, setShowModal] = useState(false);

  const closeModal = () => setShowModal(false);
 const navigate = useNavigate();
   const [sname, setSname] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [message, setMessage] = useState('');

  const handleInputChange = (e) => {
    setSname(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    try {
      const response = await fetch('http://localhost:3000/friends/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ sname }),
      });

      const data = await response.json();
      if (!response.ok) {
        setMessage(data.message || 'Search failed');
        setSearchResults([]);
      } else {
        setSearchResults(data.users);
        setMessage(data.message);
      }
    } catch (error) {
      setMessage('Network error');
    }
  };

  const handleAddFriend = async (userId) => {
    try {
      const response = await fetch('http://localhost:3000/friends/add-friend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ userId }),
      });

      const data = await response.json();
      setMessage(data.message);
      localStorage.setItem("friendAdded", "true");
      searchResults.length=0;
    } catch (err) {
      setMessage('Error adding friend');
    }
};
  const username = localStorage.getItem("username");
 useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(''), 2000);
      return () => clearTimeout(timer);
    }
    if(searchResults.length>0){
      const timer = setTimeout(() => setSearchResults([]), 3000);
      return () => clearTimeout(timer);
    }
  }, [message, searchResults]);
  const rawPath = localStorage.getItem("profilepic");
const cleanPath = rawPath?.replace(/&quot;|"/g, ""); // Remove encoded or raw quotes

return (  
    <>
     <div className="container-fluid">
       <div className="col-md-4">
                <img src={`http://localhost:3000${cleanPath}`}
                className="img-fluid  dp profile" alt="..."
                onClick={()=> setShowModal(true)} />
                 {/* {showUpload && (
          <div className="mt-3">
            <Imageupload />
          </div>
        )} */}
         {showModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Upload Image</h5>
                <button type="button" className="btn-close" onClick={closeModal}></button>
              </div>
              <div className="modal-body">
                <Imageupload />
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={closeModal}>
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
              </div>
    <h2 className="navbar-brand">
            {username ? `${username}` : "Chat for logged-in users"}
          </h2>
       
          {!username ? (
            <button className="login" onClick={() => navigate('/login')}>Login</button>
          ) : (
            <button className="login" onClick={() => navigate('/logout')}>Logout</button>
          )}
</div>
     
  <div className="search-container1">
    
            <form className="d-flex" role="search" onSubmit={handleSubmit}>
              <input
                className="form-control me-2"
                type="search"
                placeholder="Search users..."
                value={sname}
                name="sname"
                onChange={handleInputChange}
                aria-label="Search"
                
              />
             
              <button className="btn btn-outline-success" type="submit"> <FontAwesomeIcon icon={faSearch}  /></button> 
            </form>
          </div>
           {message && <div className="alert alert-info mt-2">{message}</div>}
      {searchResults.length > 0 && (
        <div className="search-results">
          <h5>Search Results:</h5>
          <ul className="list-group">
            {searchResults.map((user) => (
              <li key={user._id} className="list-group-item d-flex justify-content-between align-items-center">
                {user.username}
                <button
                  className="btn btn-primary"
                  onClick={() => handleAddFriend(user._id)}
                >
                  Add Friend
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
          </>
);
}
export default Searchbox;