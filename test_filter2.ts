import axios from 'axios';

const fetchOrders = async () => {
  try {
    const token = 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI2YTYzYThkNmZhMmFmMmJkODAxYjk2NDgiLCJpYXQiOjE3ODUwNDUyOTcsImV4cCI6MTc4NTY1MDA5N30.rpOHJ18cHdkVYhcD650lb5PD92Y8qivgyNbdVg8rCKU';
    
    const resAll = await axios.get('https://stylein-backend.onrender.com/admin/order', { headers: { Authorization: token } }).catch(() => ({ data: { data: [] } }));
    console.log('All orders count:', resAll.data?.data?.length);

    const resAssignedStr = await axios.get('https://stylein-backend.onrender.com/admin/order?status=assigned', { headers: { Authorization: token } }).catch(() => ({ data: { data: [] } }));
    console.log('?status=assigned count:', resAssignedStr.data?.data?.length);
  } catch (err) {
    console.error(err);
  }
};

fetchOrders();
