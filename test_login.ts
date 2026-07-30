import axios from 'axios';

const testLogin = async () => {
  try {
    const res = await axios.post('https://stylein-backend.onrender.com/admin/admin/login', {
      adminId: 'admin@stylein.com', // or whatever valid credentials
      password: 'password'
    });
    console.log(res.data);
  } catch (err: any) {
    console.error(err.response?.data || err.message);
  }
};

testLogin();
