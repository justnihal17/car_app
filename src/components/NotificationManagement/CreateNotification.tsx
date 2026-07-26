import { useState } from 'react';
import { ArrowLeft, Send, Clock, Users, Smartphone, Mail, MessageSquare, Image as ImageIcon, Bell } from 'lucide-react';

export function CreateNotification({ onBack }: { onBack: () => void }) {
  const [step, setStep] = useState(1);
  const [type, setType] = useState('Push');

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8 w-full bg-slate-50/60 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button 
            onClick={onBack}
            className="p-2.5 bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl transition-colors shadow-xs"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">Create Notification</h2>
            <p className="text-sm text-slate-500 mt-0.5">Compose and schedule a new message</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
           <span className="text-xs font-bold text-red-600 bg-red-50 px-3 py-1.5 rounded-full border border-red-100 uppercase tracking-wider">Step {step} of 4</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form */}
        <div className="lg:col-span-2 space-y-6">
          
          {step === 1 && (
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h3 className="text-base font-bold text-slate-900 mb-6">1. Select Channel</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { id: 'Push', icon: Bell, desc: 'Send directly to device screen' },
                  { id: 'SMS', icon: MessageSquare, desc: 'Text message delivery' },
                  { id: 'Email', icon: Mail, desc: 'Rich HTML email templates' },
                  { id: 'In-App', icon: Smartphone, desc: 'Show when user opens app' }
                ].map(channel => {
                  const Icon = channel.icon;
                  const isSelected = type === channel.id;
                  return (
                    <button
                      key={channel.id}
                      onClick={() => setType(channel.id)}
                      className={`p-5 rounded-2xl border-2 text-left transition-all ${
                        isSelected 
                          ? 'border-red-600 bg-red-50/50 shadow-xs' 
                          : 'border-slate-200/80 bg-white hover:border-slate-300'
                      }`}
                    >
                      <Icon className={`w-6 h-6 mb-3 ${isSelected ? 'text-red-600' : 'text-slate-400'}`} />
                      <div className="font-bold text-slate-900 mb-1">{channel.id} Notification</div>
                      <div className="text-xs text-slate-500">{channel.desc}</div>
                    </button>
                  )
                })}
              </div>
              <div className="mt-8 flex justify-end">
                <button onClick={() => setStep(2)} className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-sm shadow-md shadow-red-500/20 transition-all">
                  Next Step
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h3 className="text-base font-bold text-slate-900 mb-6">2. Target Audience</h3>
              <div className="space-y-5">
                 <div>
                   <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Audience Segment</label>
                   <select className="w-full bg-slate-50 border border-slate-200 text-slate-900 font-medium rounded-xl px-4 py-3 focus:outline-none focus:border-red-500 transition-colors">
                     <option>All Customers</option>
                     <option>All Drivers</option>
                     <option>Premium Members Only</option>
                     <option>Inactive Users (30+ days)</option>
                     <option>Specific City / Region</option>
                   </select>
                 </div>
                 
                 <div className="grid grid-cols-2 gap-4">
                   <div>
                     <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Platform</label>
                     <select className="w-full bg-slate-50 border border-slate-200 text-slate-900 font-medium rounded-xl px-4 py-3 focus:outline-none focus:border-red-500 transition-colors">
                       <option>All Platforms</option>
                       <option>iOS Only</option>
                       <option>Android Only</option>
                       <option>Web Only</option>
                     </select>
                   </div>
                   <div>
                     <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Estimated Reach</label>
                     <div className="w-full bg-emerald-50 border border-emerald-100 text-emerald-700 font-bold rounded-xl px-4 py-3 flex items-center gap-2 text-sm">
                       <Users className="w-4 h-4 text-emerald-600" /> ~124,500 Users
                     </div>
                   </div>
                 </div>
              </div>
              <div className="mt-8 flex justify-between">
                <button onClick={() => setStep(1)} className="px-6 py-2.5 bg-white border border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-50 transition-colors text-sm">
                  Back
                </button>
                <button onClick={() => setStep(3)} className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-sm shadow-md shadow-red-500/20 transition-all">
                  Next Step
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h3 className="text-base font-bold text-slate-900 mb-6">3. Compose Content</h3>
              <div className="space-y-5">
                 <div>
                   <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Notification Title</label>
                   <input 
                     type="text" 
                     placeholder="e.g., Flash Sale! 50% Off"
                     className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-4 py-3 focus:outline-none focus:border-red-500 transition-colors placeholder:text-slate-400 font-medium"
                   />
                 </div>
                 <div>
                   <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Message Body</label>
                   <textarea 
                     rows={4}
                     placeholder="Enter your message here..."
                     className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-4 py-3 focus:outline-none focus:border-red-500 transition-colors placeholder:text-slate-400 font-medium resize-none"
                   ></textarea>
                 </div>
                 
                 {type === 'Push' && (
                   <div className="grid grid-cols-2 gap-4">
                     <div>
                       <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Action Button (Optional)</label>
                       <input 
                         type="text" 
                         placeholder="e.g., Book Now"
                         className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-4 py-3 focus:outline-none focus:border-red-500 transition-colors placeholder:text-slate-400 font-medium"
                       />
                     </div>
                     <div>
                       <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Deep Link URL</label>
                       <input 
                         type="text" 
                         placeholder="app://booking/promo"
                         className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-4 py-3 focus:outline-none focus:border-red-500 transition-colors placeholder:text-slate-400 font-mono text-sm"
                       />
                     </div>
                   </div>
                 )}
                 
                 {type === 'Push' && (
                   <div>
                     <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Rich Media (Banner)</label>
                     <div className="border-2 border-dashed border-slate-200 rounded-2xl p-6 flex flex-col items-center justify-center text-slate-400 hover:bg-slate-50 transition-colors cursor-pointer hover:border-red-500">
                       <ImageIcon className="w-8 h-8 mb-2 text-slate-400" />
                       <span className="text-sm font-medium text-slate-600">Click to upload image (JPG, PNG)</span>
                     </div>
                   </div>
                 )}
              </div>
              <div className="mt-8 flex justify-between">
                <button onClick={() => setStep(2)} className="px-6 py-2.5 bg-white border border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-50 transition-colors text-sm">
                  Back
                </button>
                <button onClick={() => setStep(4)} className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-sm shadow-md shadow-red-500/20 transition-all">
                  Next Step
                </button>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h3 className="text-base font-bold text-slate-900 mb-6">4. Review & Schedule</h3>
              <div className="space-y-6">
                 
                 <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 space-y-4">
                   <div className="flex justify-between items-center pb-3 border-b border-slate-200/80">
                      <span className="text-sm text-slate-500 font-medium">Channel</span>
                      <span className="text-sm font-bold text-slate-900 flex items-center gap-2"><Bell className="w-4 h-4 text-red-600"/> {type} Notification</span>
                   </div>
                   <div className="flex justify-between items-center pb-3 border-b border-slate-200/80">
                      <span className="text-sm text-slate-500 font-medium">Audience</span>
                      <span className="text-sm font-bold text-slate-900">All Customers (~124,500)</span>
                   </div>
                 </div>

                 <div>
                   <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Delivery Timing</label>
                   <div className="grid grid-cols-2 gap-4">
                     <button className="p-4 rounded-2xl border-2 border-red-600 bg-red-50/50 text-left flex items-start gap-3">
                       <Send className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                       <div>
                         <div className="font-bold text-slate-900 mb-0.5">Send Immediately</div>
                         <div className="text-xs text-slate-500">Starts processing right away</div>
                       </div>
                     </button>
                     <button className="p-4 rounded-2xl border-2 border-slate-200 bg-slate-50 text-left flex items-start gap-3 opacity-60 cursor-not-allowed">
                       <Clock className="w-5 h-5 text-slate-400 flex-shrink-0 mt-0.5" />
                       <div>
                         <div className="font-bold text-slate-700 mb-0.5">Schedule for Later</div>
                         <div className="text-xs text-slate-400">Pick a future date & time</div>
                       </div>
                     </button>
                   </div>
                 </div>
              </div>
              
              <div className="mt-8 pt-6 border-t border-slate-100 flex justify-between items-center">
                <button onClick={() => setStep(3)} className="px-6 py-2.5 bg-white border border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-50 transition-colors text-sm">
                  Back
                </button>
                <div className="flex gap-3">
                  <button className="px-6 py-2.5 bg-white border border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-50 transition-colors text-sm">
                    Save Draft
                  </button>
                  <button onClick={onBack} className="px-6 py-2.5 bg-gradient-to-r from-red-600 to-red-600 hover:from-red-700 hover:to-red-700 text-white font-bold rounded-xl text-sm shadow-md shadow-red-500/20 transition-all flex items-center gap-2">
                    <Send className="w-4 h-4" /> Publish Notification
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Sidebar - Preview */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-red-600" /> Device Preview
            </h3>
            
            <div className="bg-slate-900 rounded-[2.5rem] border-[6px] border-slate-800 p-4 h-[400px] flex items-start justify-center relative overflow-hidden shadow-md">
               {/* Phone Notch */}
               <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-5 bg-slate-800 rounded-b-xl"></div>
               
               {/* Notification Bubble */}
               <div className="w-full bg-slate-800/90 backdrop-blur-md rounded-2xl p-4 mt-6 shadow-xl border border-slate-700/50">
                 <div className="flex items-center gap-2 mb-2">
                   <div className="w-5 h-5 bg-red-600 rounded flex items-center justify-center">
                     <span className="text-[10px] font-bold text-white">S</span>
                   </div>
                   <span className="text-[10px] font-bold text-slate-200 uppercase tracking-wider">Stylein</span>
                   <span className="text-[10px] text-slate-400 ml-auto">now</span>
                 </div>
                 <div className="font-bold text-white text-sm leading-tight mb-1">Flash Sale! 50% Off</div>
                 <div className="text-xs text-slate-300 leading-snug">Get 50% off your next exterior wash. Use code FLASH50 at checkout.</div>
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

