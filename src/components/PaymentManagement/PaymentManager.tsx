import { useState } from 'react';
import { TransactionList } from './TransactionList';
import { TransactionDetails } from './TransactionDetails';

const TABS = [
  { id: 'transactions', label: 'Transactions' },
  { id: 'payment-verification', label: 'Payment Verification' },
  { id: 'invoices', label: 'Invoices' },
  { id: 'refunds', label: 'Refunds' },
  { id: 'settlements', label: 'Settlements' },
  { id: 'wallet', label: 'Wallet' },
  { id: 'gateway-logs', label: 'Gateway Logs' },
  { id: 'financial-reports', label: 'Financial Reports' },
];

export function PaymentManager() {
  const [activeTab, setActiveTab] = useState('transactions');
  const [selectedTransaction, setSelectedTransaction] = useState<string | null>(null);

  if (selectedTransaction) {
    return <TransactionDetails transactionId={selectedTransaction} onBack={() => setSelectedTransaction(null)} />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'transactions':
        return <TransactionList onSelectTransaction={setSelectedTransaction} />;
      default:
        return (
          <div className="p-6">
            <h2 className="text-xl font-bold text-white capitalize">{activeTab.replace('-', ' ')}</h2>
            <p className="text-slate-400 mt-2">The {activeTab} module is under development.</p>
          </div>
        );
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex overflow-x-auto custom-scrollbar border-b border-slate-800/60 pb-px">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-5 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
              activeTab === tab.id
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      {renderContent()}
    </div>
  );
}
