import { User, Shield, Star, Briefcase } from 'lucide-react';
import { motion } from 'motion/react';

export function ProfilePreviewCard() {
  return (
    <motion.div 
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="sticky top-8 bg-gradient-to-br from-blue-600 to-blue-800 p-6 rounded-2xl text-white shadow-xl shadow-blue-200"
    >
      <div className="flex flex-col items-center text-center">
        <div className="w-32 h-32 rounded-full border-4 border-white/20 mb-4 overflow-hidden bg-white/10 flex items-center justify-center">
          <User className="w-16 h-16 text-white/50" />
        </div>
        <h3 className="text-xl font-bold">Agent Name</h3>
        <p className="text-blue-100 text-sm">EMP-1001</p>
        <div className="flex gap-1 mt-2">
            {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 text-amber-400 fill-amber-400" />)}
        </div>
      </div>
      <div className="mt-8 space-y-4 text-sm">
        <div className="flex justify-between border-b border-white/10 pb-2">
            <span className="text-blue-100">Role</span>
            <span className="font-medium">Service Agent</span>
        </div>
        <div className="flex justify-between border-b border-white/10 pb-2">
            <span className="text-blue-100">Status</span>
            <span className="font-medium bg-white/20 px-2 py-0.5 rounded-md">Active</span>
        </div>
      </div>
    </motion.div>
  );
}
