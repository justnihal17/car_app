import axios from 'axios';
import * as fs from 'fs';

const testAPI = async () => {
  try {
    const loginRes = await axios.post('https://stylein-backend.onrender.com/admin/admin/login', {
      adminId: 'admin@stylein.com',
      password: 'password'
    });
    
    // We already know this returns Invalid credentials.
    // So we can't test it this way unless we have valid credentials.
    
  } catch (err: any) {
    console.error(err.response?.data || err.message);
  }
};

testAPI();
