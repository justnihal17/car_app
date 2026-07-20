const axios = require('axios');

async function testBackend() {
  const url = 'https://stylein-backend.onrender.com/master/role';
  
  try {
    const res1 = await axios.get(url + '/all');
    console.log("/all count:", res1.data.data.length);
  } catch (e) {
    console.log("/all Error:", e.response ? e.response.status : e.message);
  }
  
  try {
    const res2 = await axios.get(url + '/admin');
    console.log("/admin count:", res2.data.data.length);
  } catch (e) {
    console.log("/admin Error:", e.response ? e.response.status : e.message);
  }
}
testBackend();
