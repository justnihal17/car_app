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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-3 animate-in fade-in duration-200">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-sm border border-slate-200/90 overflow-visible">
        <div className="px-4 py-2.5 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
          <h2 className="text-xs font-semibold text-slate-900 flex items-center gap-1.5">
            <UserPlus className="w-3.5 h-3.5 text-slate-700" /> Assign Agent
          </h2>
          <button type="button" onClick={onClose} className="p-1 text-slate-400 hover:text-slate-700 rounded-md transition-colors cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-3.5 space-y-3">
          <p className="text-xs text-slate-600">
            Assign an agent to order <span className="font-semibold text-slate-900">{order.order_number}</span>.
          </p>

          {error && <div className="p-2 bg-red-50 text-red-700 text-xs rounded-md border border-red-100">{error}</div>}
          
          <div>
            <label className="block text-[11px] font-semibold text-slate-700 mb-1">Select Agent <span className="text-red-500">*</span></label>
            {loadingAgents ? (
              <div className="w-full bg-slate-50 border border-slate-200 text-slate-500 rounded-lg px-3 py-2 text-xs animate-pulse">Loading agents...</div>
            ) : (
              <CustomSelect
                value={agentId}
                onChange={setAgentId}
                options={agents}
                placeholder="Select an agent"
                className="bg-white border-slate-200 text-xs"
                searchable
              />
            )}
          </div>

          <div className="pt-2 flex items-center gap-2 justify-end">
            <button type="button" onClick={onClose} className="h-8 px-3 text-xs font-semibold text-slate-600 hover:text-slate-900 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer">Cancel</button>
            <button type="submit" disabled={loading || loadingAgents || !agentId} className="h-8 px-3.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg transition-all shadow-2xs disabled:opacity-50 cursor-pointer">
              {loading ? 'Assigning...' : 'Assign Agent'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
