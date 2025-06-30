import "./nav.css";
import { useNavigate } from "react-router";
import {  useEffect,useState} from "react";

function Nav() {
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
      const response = await fetch('http://localhost:3000/search', {
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
      const response = await fetch('http://localhost:3000/add-friend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ userId }),
      });

      const data = await response.json();
      setMessage(data.message);
      searchResults.length=0;
    } catch (err) {
      setMessage('Error adding friend');
    }
  };
  
  const username = localStorage.getItem("username");

  // Automatically clear message after 2 seconds
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

  return (
    <div className="containernavbar">
      <nav className="navbar navbar-expand-lg bg-body-tertiary">
        <div className="container-fluid">
          <h2 className="navbar-brand">
            {username ? `${username}, continue chatting...` : "Chat for logged-in users"}
          </h2>

          <div className="search-container">
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
              <button className="btn btn-outline-success" type="submit">Search</button>
            </form>
          </div>

          {!username ? (
            <button className="login" onClick={() => navigate('/login')}>Login</button>
          ) : (
            <button className="login" onClick={() => navigate('/logout')}>Logout</button>
          )}
        </div>
      </nav>
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
    </div>
  );
}
export default Nav;