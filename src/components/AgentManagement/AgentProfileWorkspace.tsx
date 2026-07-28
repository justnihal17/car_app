import React from 'react';
import { ArrowLeft } from 'lucide-react';

interface AgentProfileWorkspaceProps {
  agentId: string;
  onBack: () => void;
}

export function AgentProfileWorkspace({ agentId, onBack }: AgentProfileWorkspaceProps) {
  return (
    <div className="flex-1 bg-slate-50 min-h-screen">
      <div className="bg-white border-b border-slate-200">
        <div className="px-8 py-6 max-w-7xl mx-auto flex items-center gap-4">
          <button 
            onClick={onBack}
            className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-slate-100 transition-colors text-slate-500"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-black text-slate-800 tracking-tight">Agent Profile</h1>
            <p className="text-sm font-medium text-slate-500 mt-1">Viewing profile for Agent ID: {agentId}</p>
          </div>
        </div>
      </div>
      <div className="p-8 max-w-7xl mx-auto flex items-center justify-center min-h-[400px]">
        <div className="text-center text-slate-500">
          <p className="text-lg font-semibold">Agent Profile Under Construction</p>
          <p className="text-sm mt-2">The detailed profile view will be implemented soon.</p>
        </div>
      </div>
    </div>
  );
}
