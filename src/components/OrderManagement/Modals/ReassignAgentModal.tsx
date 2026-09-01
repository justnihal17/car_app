import React, { useState, useEffect } from 'react';
import { 
  X, UserCheck, AlertTriangle, AlertCircle, Loader2, 
  Phone, User, Check, RefreshCw, ShieldAlert, ArrowRightLeft 
} from 'lucide-react';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../../../store/store';
import { OrderService } from '../../../services/order.service';
import { fetchOrderById, fetchOrders } from '../../../store/orderSlice';
import { AgentRef } from '../types/order.types';
import toast from 'react-hot-toast';

interface ReassignAgentModalProps {
  isOpen: boolean;
  order: any;
  onClose: () => void;
  onSuccess?: () => void;
}

const BLOCKED_STATUSES = ['completed', 'cancelled', 'rejected'];

export function ReassignAgentModal({
  isOpen,
  order,
  onClose,
  onSuccess,
}: ReassignAgentModalProps) {
  const dispatch = useDispatch<AppDispatch>();

  const [agents, setAgents] = useState<AgentRef[]>([]);
  const [loadingAgents, setLoadingAgents] = useState(false);
  const [selectedAgentId, setSelectedAgentId] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [reason, setReason] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const orderId = order?._id || order?.id || '';
  const orderNumber = order?.order_number || order?.orderNumber || 'N/A';
  const orderStatus = (order?.status || 'pending').toLowerCase();
  const orderVersion = order?.version ?? order?.__v;
  const currentAgent = order?.agent_id || order?.agent;

  const currentAgentId = currentAgent?._id || currentAgent?.id || currentAgent?.agent_id;
  const isBlocked = BLOCKED_STATUSES.includes(orderStatus);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      setErrorMsg(null);
      setSelectedAgentId('');
      setSearchTerm('');
      setReason('');
      fetchAgents();
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, orderId]);

  const fetchAgents = async () => {
    try {
      setLoadingAgents(true);
      setErrorMsg(null);
      const activeAgents = await OrderService.getActiveEligibleAgents();
      // Filter out currently assigned agent
      const eligible = activeAgents.filter((a: any) => {
        const aId = a._id || a.id;
        return aId !== currentAgentId;
      });
      setAgents(eligible);
    } catch (err: any) {
      console.error('Failed to load agents:', err);
      setErrorMsg('Failed to load eligible agents list.');
    } finally {
      setLoadingAgents(false);
    }
  };

  if (!isOpen || !order) return null;

  const filteredAgents = agents.filter((a) => {
    const term = searchTerm.toLowerCase();
    const fullName = `${a.firstName || ''} ${a.lastName || ''}`.toLowerCase();
    const agId = String(a.agentId || a.id || '').toLowerCase();
    const phone = String(a.phone || '');
    return fullName.includes(term) || agId.includes(term) || phone.includes(term);
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isBlocked) {
      toast.error(`Reassignment is not allowed for '${orderStatus}' orders.`);
      return;
    }
    if (!selectedAgentId) {
      setErrorMsg('Please select a new agent to assign.');
      return;
    }

    try {
      setSubmitting(true);
      setErrorMsg(null);

      const payload: any = {
        agent_id: selectedAgentId,
        reason: reason.trim() || 'Assigned / Reassigned by Administrator',
      };

      if (orderVersion !== undefined) {
        payload.version = orderVersion;
      }

      await OrderService.reassignAgent(orderId, payload);

      toast.success(currentAgent ? 'Agent reassigned successfully!' : 'Agent assigned successfully!');
      dispatch(fetchOrderById(orderId));
      dispatch(fetchOrders({ page: 1 }));
      if (onSuccess) onSuccess();
      onClose();
    } catch (err: any) {
      console.error('Reassignment failed:', err);
      const status = err.response?.status;
      const apiMsg = err.response?.data?.message || err.message || 'Failed to reassign agent.';

      if ((status === 400 || status === 409) && apiMsg.toLowerCase().includes('conflict')) {
        setErrorMsg('Conflict Detected: This order was modified by another administrator. Please refresh the page.');
      } else {
        setErrorMsg(apiMsg);
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-3.5 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg border border-slate-200 overflow-hidden flex flex-col my-auto">
        {/* Header */}
        <div className="px-4 sm:px-5 py-3.5 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-red-50 border border-red-100 flex items-center justify-center text-red-600">
              <ArrowRightLeft className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-slate-900">
                {currentAgent ? 'Reassign Service Agent' : 'Assign Service Agent'}
              </h2>
              <p className="text-[11px] text-slate-500">Order #{orderNumber}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-5 space-y-4 text-xs">
          {/* Blocked Status Warning */}
          {isBlocked && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-800 flex items-start gap-2.5 text-xs">
              <ShieldAlert className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <div>
                <strong className="font-semibold block">Action Blocked</strong>
                <span>Agent reassignment is not permitted when order status is '{orderStatus}'.</span>
              </div>
            </div>
          )}

          {/* Error Message */}
          {errorMsg && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 flex items-start gap-2.5 text-xs">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <strong className="font-semibold block">Notice</strong>
                <span>{errorMsg}</span>
              </div>
            </div>
          )}

          {/* Current Assigned Agent Card */}
          <div className="bg-slate-50/80 p-3.5 rounded-xl border border-slate-200/80 space-y-1.5">
            <label className="block text-[10.5px] font-bold text-slate-500 uppercase tracking-wider">
              Current Assigned Agent
            </label>
            {currentAgent ? (
              <div className="flex items-center justify-between bg-white p-2.5 rounded-lg border border-slate-200/80 shadow-2xs">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700 font-bold text-xs shrink-0">
                    {currentAgent.firstName?.[0] || 'A'}
                    {currentAgent.lastName?.[0] || ''}
                  </div>
                  <div>
                    <span className="font-bold text-slate-900 text-xs block">
                      {currentAgent.firstName} {currentAgent.lastName}
                    </span>
                    <span className="text-[10.5px] text-slate-500 font-mono">
                      ID: {currentAgent.agentId || 'N/A'}
                    </span>
                  </div>
                </div>
                {currentAgent.phone && (
                  <div className="flex items-center gap-1 text-slate-600 text-[11px] font-medium bg-slate-50 px-2 py-1 rounded-md border border-slate-100">
                    <Phone className="w-3 h-3 text-slate-400" />
                    <span>{currentAgent.phone}</span>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-slate-400 italic py-1 text-xs">
                No service agent currently assigned to this order.
              </div>
            )}
          </div>

          {/* Select New Agent */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="block font-bold text-slate-800 text-xs">
                Select New Agent <span className="text-red-500">*</span>
              </label>
              <button
                type="button"
                onClick={fetchAgents}
                className="text-[11px] text-slate-500 hover:text-slate-800 flex items-center gap-1 cursor-pointer"
              >
                <RefreshCw className={`w-3 h-3 ${loadingAgents ? 'animate-spin' : ''}`} />
                <span>Refresh Agents</span>
              </button>
            </div>

            {/* Search within agents */}
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search agent by name, ID, or phone..."
              disabled={isBlocked || loadingAgents}
              className="w-full h-8.5 px-3 bg-white border border-slate-200 rounded-lg text-slate-800 text-xs focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500 shadow-2xs mb-1.5"
            />

            {/* Agents List Selection */}
            <div className="max-h-44 overflow-y-auto custom-scrollbar border border-slate-200 rounded-xl divide-y divide-slate-100 bg-white">
              {loadingAgents ? (
                <div className="py-6 text-center text-slate-400 flex items-center justify-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-red-500" />
                  <span>Loading available agents...</span>
                </div>
              ) : filteredAgents.length === 0 ? (
                <div className="py-6 text-center text-slate-400 text-xs">
                  {searchTerm ? 'No matching agents found.' : 'No other active agents available.'}
                </div>
              ) : (
                filteredAgents.map((agent) => {
                  const aId = agent._id || agent.id;
                  const isSelected = selectedAgentId === aId;
                  return (
                    <button
                      type="button"
                      key={aId}
                      onClick={() => setSelectedAgentId(aId)}
                      disabled={isBlocked}
                      className={`w-full text-left p-2.5 transition-all flex items-center justify-between cursor-pointer ${
                        isSelected
                          ? 'bg-red-50/80 text-red-900 font-semibold'
                          : 'hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0 ${
                            isSelected
                              ? 'bg-red-600 text-white'
                              : 'bg-slate-100 text-slate-600 border border-slate-200'
                          }`}
                        >
                          {agent.firstName?.[0] || 'A'}
                          {agent.lastName?.[0] || ''}
                        </div>
                        <div>
                          <span className="text-xs block font-bold text-slate-900">
                            {agent.firstName} {agent.lastName}
                          </span>
                          <span className="text-[10px] text-slate-500 font-mono">
                            ID: {agent.agentId || aId.substring(aId.length - 6).toUpperCase()}
                            {agent.phone ? ` • ${agent.phone}` : ''}
                          </span>
                        </div>
                      </div>

                      <div
                        className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                          isSelected ? 'border-red-600 bg-red-600' : 'border-slate-300 bg-white'
                        }`}
                      >
                        {isSelected && <Check className="w-2.5 h-2.5 text-white" />}
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Reassignment Reason */}
          <div className="space-y-1">
            <label className="block font-bold text-slate-800 text-xs">
              Reassignment Reason <span className="text-slate-400 font-normal">(Optional)</span>
            </label>
            <textarea
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Agent vehicle breakdown / Emergency schedule change (optional)..."
              disabled={isBlocked || submitting}
              className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-slate-800 text-xs focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500 shadow-2xs resize-none"
            />
            <p className="text-[10.5px] text-slate-400">
              Optional note. Stored securely in the order audit log.
            </p>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="h-8.5 px-3.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isBlocked || submitting || !selectedAgentId}
              className="inline-flex items-center gap-1.5 h-8.5 px-4 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg text-xs shadow-sm transition-all active:scale-95 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>{currentAgent ? 'Confirm Reassignment' : 'Assign Agent'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
