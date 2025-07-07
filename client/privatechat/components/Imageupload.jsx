// src/components/ImageUpload.js
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
const api=  import.meta.env.VITE_REACT_APP_API_URL;
function ImageUpload() {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const currentUser = localStorage.getItem('username');

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    const formData = new FormData();
    formData.append('image', file);
    formData.append('username', currentUser);       
    try {
      const res = await axios.post(`${api}upload`, formData);
     localStorage.setItem("profilepic", JSON.stringify(res.data.imageUrl));
    
      navigate("/"); // src path milega yaha
    } catch (err) {
      console.error('Upload failed:', err);
    }
  };

  return (
          
    <div>
      <input type="file" onChange={handleFileChange} />
      <button onClick={handleUpload}>Upload</button>
    </div>
  );
}

export default ImageUpload;
