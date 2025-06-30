import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Signup.css'; // Assuming you have a CSS file for styling

  
function Signup() {
    const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  // const [imgurl, setImgurl] = useState(null); // New state for imgurl
  // Function to handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    console.log('Input changed:', name, value); // Debugging line

    // Update state based on the input name
    if (name === 'username') setUsername(value);
    else if (name === 'email') setEmail(value);
    else if (name === 'password') setPassword(value);
    // else if (name === 'imgurl') setImgurl(value); // Update imgurl state
  };

  // Function to handle form submission
 const handleSubmit = async (e) => {
  e.preventDefault();

  try {
    // 1. Check email validity via backend
  const validateRes = await fetch(`http://localhost:3000/user/check-email?email=${email}`);
const validateData = await validateRes.json();

if (!validateData.valid) {
  alert("❌ Invalid email address.");
  return;
}
    // 2. Proceed to signup
    const response = await fetch('http://localhost:3000/user/signup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ username, email, password }),
    });

    const data = await response.json();

    if (response.ok) {
      console.log('✅ Signup successful:', data);
      navigate('/login');
    } else {
      alert('❌ Signup failed: ' + (data.message || 'Unknown error'));
    }

  } catch (error) {
    console.error('Error submitting form:', error);
    alert('❌ Signup failed: Network or server error');
  }
};


  return (
    <div className="containersingup">
      <h1>Sign Up</h1>
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
          <label htmlFor="email" className="form-label">Email address</label>
          <input
            type="email"
            className="form-control"
            id="email"
            name="email"
            value={email}
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
        {/* <div className="mb-3">
          <label htmlFor="imgurl" className="form-label">imgurl</label>
          <input
            type="file"
            accept="image/*"
            // Note: You might want to handle file uploads differently, e.g., using FormData  
            className="form-control"
            id="imgurl"
            name="imgurl"
            value={imgurl}
            onChange={handleInputChange}
          />
        </div> */}
        <button type="submit" className="btn btn-primary">Sign Up</button>
      </form>
    </div>
  );
}

export default Signup;