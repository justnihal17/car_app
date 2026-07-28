import axios from 'axios';

const fetchOrders = async () => {
  try {
    const res = await axios.get('https://stylein-backend.onrender.com/admin/order', {
      headers: {
        Authorization: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI2YTYzYThkNmZhMmFmMmJkODAxYjk2NDgiLCJpYXQiOjE3ODUwNDUyOTcsImV4cCI6MTc4NTY1MDA5N30.rpOHJ18cHdkVYhcD650lb5PD92Y8qivgyNbdVg8rCKU'
      }
    });
    
    const orders = res.data.data;
    const statuses = orders.map((o: any) => ({
      id: o.order_number, 
      status: o.status, 
      agent: o.agent_id ? o.agent_id : 'Unassigned'
    }));
    
    console.log(statuses);
  } catch (err) {
    console.error(err);
  }
};

fetchOrders();
