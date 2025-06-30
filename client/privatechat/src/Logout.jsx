import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
function Logout() {
  const navigate = useNavigate();

  useEffect(() => {
    const logout = async () => {
      try {
        const response = await fetch('http://localhost:3000/user/logout', {
          method: 'POST',
          credentials: 'include', // important for session cookies
        });

        if (response.ok) {
          localStorage.removeItem('username'); // Clear username from localStorage
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

  return null; // No UI needed for logout
}
export default Logout;