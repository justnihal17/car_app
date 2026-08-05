import { useState, useEffect } from 'react';
import { OrderList } from './OrderList';
import { OrderDetails } from './OrderDetails';

export function OrderManager() {
  const [selectedOrder, setSelectedOrder] = useState<string | null>(null);

  useEffect(() => {
    const handleSelectOrder = (e: CustomEvent<string>) => {
      setSelectedOrder(e.detail);
    };

    window.addEventListener('select_order', handleSelectOrder as EventListener);
    return () => {
      window.removeEventListener('select_order', handleSelectOrder as EventListener);
    };
  }, []);

  if (selectedOrder) {
    return <OrderDetails orderId={selectedOrder} onBack={() => setSelectedOrder(null)} />;
  }

  return <OrderList onSelectOrder={setSelectedOrder} />;
}
