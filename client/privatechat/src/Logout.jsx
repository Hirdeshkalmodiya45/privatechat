import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
const api=  import.meta.env.VITE_REACT_APP_API_URL;
function Logout() {
  const navigate = useNavigate();

  useEffect(() => {
    const logout = async () => {
      try {
        const response = await fetch(`${api}user/logout`, {
          method: 'POST',
          credentials: 'include', // important for session cookies
        });

        if (response.ok) {
            localStorage.clear(); // Clear all items from localStorage
          navigate('/login'); // Redirect to login page
        } else {
          alert('Logout failed. Please try again.');
        }
      } catch (error) {
        console.error('Error during logout:', error);
        alert('Logout failed due to a network error.');
      }
    };

    logout();
  }, [navigate]);

  return null; 
  
}
export default Logout;