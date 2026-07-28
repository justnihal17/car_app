import { Order, Agent } from '../types/order.types';

export const DUMMY_AGENTS: Agent[] = [
  {
    id: 'AGT-001',
    name: 'Rahul Sharma',
    phone: '+91 9876543210',
    avatar: 'https://i.pravatar.cc/150?u=AGT-001',
    rating: 4.8,
    currentOrders: 2,
    status: 'Available',
  },
  {
    id: 'AGT-002',
    name: 'Amit Kumar',
    phone: '+91 9876543211',
    avatar: 'https://i.pravatar.cc/150?u=AGT-002',
    rating: 4.5,
    currentOrders: 4,
    status: 'Busy',
  },
  {
    id: 'AGT-003',
    name: 'Vikram Singh',
    phone: '+91 9876543212',
    avatar: 'https://i.pravatar.cc/150?u=AGT-003',
    rating: 4.9,
    currentOrders: 0,
    status: 'Available',
  }
];

export const DUMMY_ORDERS: Order[] = [
  {
    id: 'ORD-1001',
    orderNumber: '#1001',
    customer: {
      id: 'CUST-001',
      name: 'Rohan Gupta',
      phone: '+91 9998887776',
      address: '123 Palm Avenue, Mumbai',
      avatar: 'https://i.pravatar.cc/150?u=CUST-001'
    },
    vehicle: {
      id: 'VEH-001',
      name: 'Honda City',
      model: '2022',
      registrationNumber: 'MH 01 AB 1234'
    },
    service: {
      id: 'SRV-001',
      name: 'Full Body Wash',
      price: 500,
      description: 'Complete exterior and interior wash.'
    },
    agent: DUMMY_AGENTS[0],
    scheduledDate: '2026-07-28',
    scheduledTime: '10:00 AM',
    createdAt: '2026-07-27T08:30:00Z',
    status: 'Assigned',
    payment: {
      status: 'Paid',
      method: 'UPI',
      transactionId: 'TXN987654321',
      amount: 500,
      subtotal: 500,
      tax: 0,
      discount: 0
    },
    notes: 'Please bring your own cleaning liquid.',
    timeline: [
      {
        id: 'TL-1',
        status: 'Pending',
        timestamp: '2026-07-27T08:30:00Z',
        description: 'Order placed by customer.'
      },
      {
        id: 'TL-2',
        status: 'Accepted',
        timestamp: '2026-07-27T08:45:00Z',
        description: 'Order accepted by admin.'
      },
      {
        id: 'TL-3',
        status: 'Assigned',
        timestamp: '2026-07-27T09:00:00Z',
        description: 'Agent Rahul Sharma assigned.'
      }
    ]
  },
  {
    id: 'ORD-1002',
    orderNumber: '#1002',
    customer: {
      id: 'CUST-002',
      name: 'Priya Verma',
      phone: '+91 9998887777',
      address: '456 MG Road, Delhi',
      avatar: 'https://i.pravatar.cc/150?u=CUST-002'
    },
    vehicle: {
      id: 'VEH-002',
      name: 'Hyundai Creta',
      model: '2021',
      registrationNumber: 'DL 01 CD 5678'
    },
    service: {
      id: 'SRV-002',
      name: 'Battery Jumpstart',
      price: 300,
      description: 'Emergency battery jumpstart service.'
    },
    scheduledDate: '2026-07-27',
    scheduledTime: '02:00 PM',
    createdAt: '2026-07-27T10:15:00Z',
    status: 'Pending',
    payment: {
      status: 'Pending',
      amount: 300,
      subtotal: 300,
      tax: 0,
      discount: 0
    },
    timeline: [
      {
        id: 'TL-4',
        status: 'Pending',
        timestamp: '2026-07-27T10:15:00Z',
        description: 'Order placed by customer.'
      }
    ]
  },
  {
    id: 'ORD-1003',
    orderNumber: '#1003',
    customer: {
      id: 'CUST-003',
      name: 'Karan Mehra',
      phone: '+91 9998887778',
      address: '789 Link Road, Bangalore',
    },
    vehicle: {
      id: 'VEH-003',
      name: 'Maruti Baleno',
      model: '2020',
      registrationNumber: 'KA 01 EF 9012'
    },
    service: {
      id: 'SRV-003',
      name: 'Oil Change',
      price: 1500,
      description: 'Engine oil replacement.'
    },
    agent: DUMMY_AGENTS[1],
    scheduledDate: '2026-07-27',
    scheduledTime: '11:00 AM',
    createdAt: '2026-07-26T14:20:00Z',
    status: 'In Progress',
    payment: {
      status: 'Paid',
      method: 'Card',
      transactionId: 'TXN456789123',
      amount: 1500,
      subtotal: 1400,
      tax: 100,
      discount: 0
    },
    timeline: [
      {
        id: 'TL-5',
        status: 'Pending',
        timestamp: '2026-07-26T14:20:00Z',
        description: 'Order placed by customer.'
      },
      {
        id: 'TL-6',
        status: 'In Progress',
        timestamp: '2026-07-27T11:05:00Z',
        description: 'Agent started service.'
      }
    ]
  },
  {
    id: 'ORD-1004',
    orderNumber: '#1004',
    customer: {
      id: 'CUST-004',
      name: 'Neha Singh',
      phone: '+91 9998887779',
      address: '101 Cyber City, Gurgaon',
    },
    vehicle: {
      id: 'VEH-004',
      name: 'Tata Nexon',
      model: '2023',
      registrationNumber: 'HR 26 GH 3456'
    },
    service: {
      id: 'SRV-004',
      name: 'Interior Cleaning',
      price: 800,
      description: 'Deep cleaning of car interior.'
    },
    scheduledDate: '2026-07-29',
    scheduledTime: '04:00 PM',
    createdAt: '2026-07-27T12:00:00Z',
    status: 'Cancelled',
    payment: {
      status: 'Refunded',
      method: 'UPI',
      amount: 800,
      subtotal: 800,
      tax: 0,
      discount: 0
    },
    notes: 'Customer requested cancellation due to change of plans.',
    timeline: [
      {
        id: 'TL-7',
        status: 'Pending',
        timestamp: '2026-07-27T12:00:00Z',
        description: 'Order placed by customer.'
      },
      {
        id: 'TL-8',
        status: 'Cancelled',
        timestamp: '2026-07-27T13:00:00Z',
        description: 'Order cancelled by customer.'
      }
    ]
  },
  {
    id: 'ORD-1005',
    orderNumber: '#1005',
    customer: {
      id: 'CUST-005',
      name: 'Ajay Desai',
      phone: '+91 9998887780',
      address: '321 Ring Road, Surat',
    },
    vehicle: {
      id: 'VEH-005',
      name: 'Mahindra Thar',
      model: '2023',
      registrationNumber: 'GJ 05 IJ 7890'
    },
    service: {
      id: 'SRV-005',
      name: 'Flat Tire Fix',
      price: 250,
      description: 'Puncture repair and air filling.'
    },
    agent: DUMMY_AGENTS[2],
    scheduledDate: '2026-07-26',
    scheduledTime: '09:00 AM',
    createdAt: '2026-07-26T08:00:00Z',
    status: 'Completed',
    payment: {
      status: 'Paid',
      method: 'Cash',
      amount: 250,
      subtotal: 250,
      tax: 0,
      discount: 0
    },
    timeline: [
      {
        id: 'TL-9',
        status: 'Pending',
        timestamp: '2026-07-26T08:00:00Z',
        description: 'Order placed by customer.'
      },
      {
        id: 'TL-10',
        status: 'Completed',
        timestamp: '2026-07-26T09:45:00Z',
        description: 'Service completed successfully.'
      }
    ]
  }
];
