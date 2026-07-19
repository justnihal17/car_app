import { useState } from 'react';
import { OrderList } from './OrderList';
import { OrderDetails } from './OrderDetails';

export function OrderManager() {
  const [selectedOrder, setSelectedOrder] = useState<string | null>(null);

  if (selectedOrder) {
    return <OrderDetails orderId={selectedOrder} onBack={() => setSelectedOrder(null)} />;
  }

  return <OrderList onSelectOrder={setSelectedOrder} />;
}
