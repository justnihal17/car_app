import React, { useState, useEffect } from 'react';
import { X, UserPlus } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../../../store/store';
import { OrderService } from '../../../services/order.service';
import { fetchOrderById, fetchOrders } from '../../../store/orderSlice';
import { CustomSelect } from '../../common/CustomSelect';
import api from '../../../api/axios';
import toast from 'react-hot-toast';

interface AssignAgentModalProps {
  order: any;
  isOpen: boolean;
  onClose: () => void;
}

export function AssignAgentModal({ order, isOpen, onClose }: AssignAgentModalProps) {
  const dispatch = useDispatch<AppDispatch>();
  const [agentId, setAgentId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [agents, setAgents] = useState<{label: string, value: string}[]>([]);
  const [loadingAgents, setLoadingAgents] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setAgentId('');
      setError(null);
      fetchAgents();
    }
  }, [isOpen]);

  const fetchAgents = async () => {
    setLoadingAgents(true);
    try {
      const response = await api.get('/agent/agent');
      if (response.data && response.data.data) {
        const agentOptions = response.data.data.map((agent: any) => ({
          label: `${agent.firstName} ${agent.lastName} (${agent.agentId || agent._id.substring(agent._id.length - 6).toUpperCase()})`,
          value: agent._id
        }));
        setAgents(agentOptions);
      }
    } catch (error) {
      console.error("Error fetching agents:", error);
    } finally {
      setLoadingAgents(false);
    }
  };

  if (!isOpen || !order) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agentId.trim()) {
      setError('Please select an Agent.');
      return;
    }
    
    setLoading(true);
    setError(null);
    try {
      const response = await OrderService.assignAgent(order._id, agentId);
      if (response.success) {
        toast.success('Agent assigned successfully!');
        dispatch(fetchOrderById(order._id));
        dispatch(fetchOrders({ page: 1 }));
        onClose();
      } else {
        setError(response.message || 'Failed to assign agent');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-visible">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-slate-500" /> Assign Agent
          </h2>
          <button type="button" onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <p className="text-sm text-slate-600 mb-4">
            Assign an agent to order <span className="font-bold text-slate-900">{order.order_number}</span>.
          </p>

          {error && <div className="p-3 bg-red-50 text-red-700 text-sm rounded-lg border border-red-100">{error}</div>}
          
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Select Agent <span className="text-red-500">*</span></label>
            {loadingAgents ? (
              <div className="w-full bg-slate-50 border border-slate-200 text-slate-500 rounded-lg px-4 py-3 text-sm animate-pulse">Loading agents...</div>
            ) : (
              <CustomSelect
                value={agentId}
                onChange={setAgentId}
                options={agents}
                placeholder="Select an agent"
                className="bg-white border-slate-200"
                searchable
              />
            )}
          </div>

          <div className="pt-4 flex items-center gap-3 justify-end mt-4">
            <button type="button" onClick={onClose} className="px-5 py-2.5 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">Cancel</button>
            <button type="submit" disabled={loading || loadingAgents || !agentId} className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-sm font-medium rounded-lg transition-all shadow-sm disabled:opacity-50">
              {loading ? 'Assigning...' : 'Assign Agent'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
