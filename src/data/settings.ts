export const ADMINS = [
  {
    id: "ADM-001",
    name: "John Doe",
    role: "Super Admin",
    email: "john@example.com",
    phone: "+1 234 567 8900",
    status: "Active",
    lastLogin: "2026-07-12T08:30:00Z"
  },
  {
    id: "ADM-002",
    name: "Sarah Smith",
    role: "Operations Manager",
    email: "sarah@example.com",
    phone: "+1 234 567 8901",
    status: "Active",
    lastLogin: "2026-07-12T09:15:00Z"
  },
  {
    id: "ADM-003",
    name: "Michael Johnson",
    role: "Finance Manager",
    email: "michael@example.com",
    phone: "+1 234 567 8902",
    status: "Inactive",
    lastLogin: "2026-07-10T14:20:00Z"
  }
];

export const AUDIT_LOGS = [
  {
    id: "LOG-9001",
    user: "John Doe",
    action: "Updated Payment Gateway",
    date: "2026-07-12T10:45:00Z",
    ipAddress: "192.168.1.1",
    browser: "Chrome 114",
    device: "MacBook Pro",
    status: "Success"
  },
  {
    id: "LOG-9002",
    user: "Sarah Smith",
    action: "Assigned Driver DRV-003",
    date: "2026-07-12T09:30:00Z",
    ipAddress: "192.168.1.5",
    browser: "Safari 16",
    device: "iPhone 14",
    status: "Success"
  },
  {
    id: "LOG-9003",
    user: "System",
    action: "Automated Database Backup",
    date: "2026-07-12T00:00:00Z",
    ipAddress: "Localhost",
    browser: "System",
    device: "Server",
    status: "Success"
  },
  {
    id: "LOG-9004",
    user: "Unknown",
    action: "Failed Login Attempt",
    date: "2026-07-11T23:45:00Z",
    ipAddress: "45.22.11.9",
    browser: "Firefox 115",
    device: "Windows PC",
    status: "Failed"
  }
];
