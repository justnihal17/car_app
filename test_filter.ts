import axios from 'axios';

const fetchOrders = async () => {
  try {
    const token = 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI2YTYzYThkNmZhMmFmMmJkODAxYjk2NDgiLCJpYXQiOjE3ODUwNDUyOTcsImV4cCI6MTc4NTY1MDA5N30.rpOHJ18cHdkVYhcD650lb5PD92Y8qivgyNbdVg8rCKU';
    
    // test 1: ?status=assigned
    const res1 = await axios.get('https://stylein-backend.onrender.com/admin/order?status=assigned', { headers: { Authorization: token } }).catch(() => ({ data: { data: [] } }));
    console.log('?status=assigned count:', res1.data?.data?.length);

    // test 2: ?is_assigned=true
    const res2 = await axios.get('https://stylein-backend.onrender.com/admin/order?is_assigned=true', { headers: { Authorization: token } }).catch(() => ({ data: { data: [] } }));
    console.log('?is_assigned=true count:', res2.data?.data?.length);

    // test 3: ?has_agent=true
    const res3 = await axios.get('https://stylein-backend.onrender.com/admin/order?has_agent=true', { headers: { Authorization: token } }).catch(() => ({ data: { data: [] } }));
    console.log('?has_agent=true count:', res3.data?.data?.length);

  } catch (err) {
    console.error(err);
  }
};

fetchOrders();
