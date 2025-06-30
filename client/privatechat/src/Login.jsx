import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Signup.css'; 
function Login() {
    const navigate = useNavigate();
  const [username, setUsername] = useState('');
  
  const [password, setPassword] = useState('');

  // Function to handle input changes
const handleInputChange = (e) => {
  const { name, value } = e.target;
  console.log('Input changed:', name, value); // Debugging line
  // Update state based on the input name
      if (name === 'username') setUsername(value);
  else if (name === 'password') setPassword(value);
};

// Function to handle form submission
const handleSubmit = async (e) => {
  e.preventDefault();
  console.log('Form submitted:', { username ,password }); // Debugging line
  try {
    const response = await fetch('http://localhost:3000/user/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username , password }),
      credentials: 'include', // important for session cookies
    });

    const data = await response.json();

    if (response.ok) {
      console.log('login:', data);
      localStorage.setItem('username', username);
      localStorage.setItem("currentUserId", data.user._id);
      console.log('User ID stored in localStorage:', data.user._id);
      localStorage.setItem('currentUser', JSON.stringify(data.user)); // Store user data in localStorage  
 // Store username in localStorage
      navigate('/'); // Redirect to login or home page
    } else {
      alert(' LOGIN  failed: ' + (data.message || 'Unknown error'));
    }
  } catch (error) {
    console.error('Error submitting form:', error);
    alert('LOGIN  failed: Network or server error');
  }
};

  return (
    <div className="containersingup">
      <h1> LOGIN </h1>
      <form onSubmit={handleSubmit} method="POST">
       <div className="mb-3">
          <label htmlFor="username" className="form-label">Username</label>
          <input
            type="text"
            className="form-control"
            id="username"
            name="username"
            value={username}
            onChange={handleInputChange}
          />
        </div>
       
        <div className="mb-3">
          <label htmlFor="password" className="form-label">Password</label>
          <input
            type="password"
            className="form-control"
            id="password"
            name="password"
            value={password}
            onChange={handleInputChange}
          />
        </div>
        <button type="submit" className="btn btn-primary">LOGIN</button>
        <button className="btn btn-primary"  onClick={() =>navigate('/signup')}>Sign Up</button>
      </form>
    </div>
  );
}

export default Login;