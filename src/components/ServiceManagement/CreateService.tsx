import { useState } from 'react';
import { ArrowLeft, Check, ChevronRight, Upload, Info, MapPin, Tag, Plus } from 'lucide-react';

const STEPS = [
  { id: 1, label: 'Basic Information' },
  { id: 2, label: 'Pricing' },
  { id: 3, label: 'Configuration' },
  { id: 4, label: 'Availability' },
  { id: 5, label: 'Confirmation' },
];

export function CreateService({ onBack }: { onBack: () => void }) {
  const [currentStep, setCurrentStep] = useState(1);

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button 
            onClick={onBack}
            className="p-2 bg-slate-900 border border-slate-700 text-slate-400 hover:text-white rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Create Service</h1>
            <p className="text-sm text-slate-400 mt-1">Configure a new service offering</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button className="px-4 py-2 bg-slate-900 border border-slate-700 text-slate-300 font-medium rounded-lg hover:bg-slate-800 hover:text-white transition-colors text-sm shadow-sm">
            Save Draft
          </button>
          {currentStep === 5 && (
            <button className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-white font-medium rounded-lg shadow-lg shadow-emerald-900/20 transition-all text-sm">
              Publish Service
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Progress Stepper Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-[#0f1218] p-5 rounded-xl border border-slate-800/60 shadow-lg sticky top-8">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-6">Service Setup</h3>
            <div className="space-y-4">
              {STEPS.map((step, index) => {
                const isCompleted = step.id < currentStep;
                const isCurrent = step.id === currentStep;
                return (
                  <div key={step.id} className="relative">
                    {index !== STEPS.length - 1 && (
                      <div className={`absolute left-3.5 top-8 w-px h-full -ml-px ${isCompleted ? 'bg-emerald-500' : 'bg-slate-800'}`}></div>
                    )}
                    <button 
                      onClick={() => setCurrentStep(step.id)}
                      className={`flex items-center gap-4 w-full text-left group ${step.id > currentStep ? 'opacity-50' : ''}`}
                    >
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 border-2 transition-colors z-10
                        ${isCompleted ? 'bg-emerald-500 border-emerald-500 text-[#0f1218]' : 
                          isCurrent ? 'bg-[#0f1218] border-emerald-500 text-emerald-400' : 
                          'bg-[#0f1218] border-slate-700 text-slate-500'}
                      `}>
                        {isCompleted ? <Check className="w-4 h-4" /> : <span className="text-xs font-bold">{step.id}</span>}
                      </div>
                      <div>
                        <div className={`text-sm font-medium ${isCurrent ? 'text-white' : isCompleted ? 'text-slate-300' : 'text-slate-500'}`}>
                          {step.label}
                        </div>
                      </div>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Form Area */}
        <div className="lg:col-span-3">
          <div className="bg-[#0f1218] p-6 md:p-8 rounded-xl border border-slate-800/60 shadow-lg min-h-[500px] flex flex-col">
            
            {currentStep === 1 && (
              <div className="flex-1 space-y-6">
                <h2 className="text-xl font-bold text-white tracking-tight border-b border-slate-800 pb-4">Basic Information</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300">Service Name <span className="text-red-400">*</span></label>
                    <input type="text" placeholder="e.g. Super98 Fuel Delivery" className="w-full bg-slate-900 border border-slate-800 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:border-emerald-500/50 transition-colors" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300">Service Code</label>
                    <input type="text" placeholder="e.g. FUEL-98" className="w-full bg-slate-900 border border-slate-800 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:border-emerald-500/50 transition-colors font-mono uppercase" />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">Short Description</label>
                  <input type="text" placeholder="Brief tagline for the service card" className="w-full bg-slate-900 border border-slate-800 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:border-emerald-500/50 transition-colors" />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">Detailed Description</label>
                  <textarea rows={4} placeholder="Full description of what the service includes..." className="w-full bg-slate-900 border border-slate-800 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:border-emerald-500/50 transition-colors resize-none"></textarea>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300">Category</label>
                    <select className="w-full bg-slate-900 border border-slate-800 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:border-emerald-500/50 transition-colors appearance-none">
                      <option>Select a category</option>
                      <option>Fuel Delivery</option>
                      <option>Car Wash</option>
                      <option>Emergency Services</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300">Subcategory</label>
                    <select className="w-full bg-slate-900 border border-slate-800 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:border-emerald-500/50 transition-colors appearance-none">
                      <option>Select a subcategory</option>
                      <option>Premium Fuel</option>
                      <option>Standard Fuel</option>
                      <option>Diesel</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">Service Image</label>
                  <div className="border-2 border-dashed border-slate-700 rounded-xl p-8 flex flex-col items-center justify-center text-center hover:bg-slate-900/50 transition-colors cursor-pointer group">
                    <div className="w-12 h-12 bg-slate-800 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                      <Upload className="w-5 h-5 text-emerald-400" />
                    </div>
                    <div className="text-sm font-medium text-white mb-1">Click to upload or drag and drop</div>
                    <div className="text-xs text-slate-500">SVG, PNG, JPG or GIF (max. 2MB)</div>
                  </div>
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="flex-1 space-y-6">
                <h2 className="text-xl font-bold text-white tracking-tight border-b border-slate-800 pb-4">Pricing Configuration</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300">Base Price (AED) <span className="text-red-400">*</span></label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-medium">د.إ</span>
                      <input type="number" placeholder="0.00" className="w-full bg-slate-900 border border-slate-800 text-white rounded-lg pl-10 pr-4 py-2.5 focus:outline-none focus:border-emerald-500/50 transition-colors font-mono" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300">Tax (%)</label>
                    <div className="relative">
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 font-medium">%</span>
                      <input type="number" defaultValue="5" className="w-full bg-slate-900 border border-slate-800 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:border-emerald-500/50 transition-colors font-mono" />
                    </div>
                  </div>
                </div>

                <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
                  <div className="flex items-center gap-2 text-sm font-medium text-white">
                    <Tag className="w-4 h-4 text-emerald-400" /> Promotional Pricing
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-slate-400">Discount Type</label>
                      <select className="w-full bg-[#0f1218] border border-slate-800 text-white rounded-lg px-4 py-2 focus:outline-none focus:border-emerald-500/50 transition-colors appearance-none text-sm">
                        <option>Percentage (%)</option>
                        <option>Fixed Amount (AED)</option>
                        <option>No Discount</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-slate-400">Discount Value</label>
                      <input type="number" placeholder="0" className="w-full bg-[#0f1218] border border-slate-800 text-white rounded-lg px-4 py-2 focus:outline-none focus:border-emerald-500/50 transition-colors font-mono text-sm" />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300">Driver Commission (%)</label>
                    <div className="relative">
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 font-medium">%</span>
                      <input type="number" placeholder="20" className="w-full bg-slate-900 border border-slate-800 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:border-emerald-500/50 transition-colors font-mono" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300">Platform Fee (%)</label>
                    <div className="relative">
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 font-medium">%</span>
                      <input type="number" placeholder="10" className="w-full bg-slate-900 border border-slate-800 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:border-emerald-500/50 transition-colors font-mono" />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div className="flex-1 space-y-6">
                <h2 className="text-xl font-bold text-white tracking-tight border-b border-slate-800 pb-4">Service Configuration</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300">Estimated Duration (Mins)</label>
                    <input type="number" placeholder="45" className="w-full bg-slate-900 border border-slate-800 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:border-emerald-500/50 transition-colors font-mono" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300">Maximum Service Distance (KM)</label>
                    <input type="number" placeholder="25" className="w-full bg-slate-900 border border-slate-800 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:border-emerald-500/50 transition-colors font-mono" />
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-sm font-medium text-slate-300">Supported Vehicle Types</label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {['Sedan', 'SUV', 'Truck', 'Motorcycle'].map(type => (
                      <label key={type} className="flex items-center gap-3 p-3 rounded-lg border border-slate-700 bg-slate-900 cursor-pointer hover:bg-slate-800 transition-colors">
                        <input type="checkbox" className="w-4 h-4 rounded bg-[#0f1218] border-slate-600 text-emerald-500 focus:ring-emerald-500 focus:ring-offset-[#0f1218]" defaultChecked={type !== 'Motorcycle'} />
                        <span className="text-sm text-slate-200 font-medium">{type}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-sm font-medium text-slate-300">Required Driver Skills</label>
                  <div className="flex flex-wrap gap-2">
                    {['Hazmat Certified', 'Heavy Duty License', 'Basic Mechanic', 'Pressure Washing'].map(skill => (
                      <span key={skill} className="px-3 py-1.5 rounded-full bg-slate-900 border border-slate-700 text-sm text-slate-300 flex items-center gap-2 cursor-pointer hover:border-slate-500">
                        {skill} <span className="text-slate-500 hover:text-white">×</span>
                      </span>
                    ))}
                    <button className="px-3 py-1.5 rounded-full border border-dashed border-slate-600 text-sm text-slate-400 hover:text-white hover:border-slate-500 flex items-center gap-1">
                      <Plus className="w-3.5 h-3.5" /> Add Skill
                    </button>
                  </div>
                </div>
              </div>
            )}

            {currentStep === 4 && (
              <div className="flex-1 space-y-6">
                <h2 className="text-xl font-bold text-white tracking-tight border-b border-slate-800 pb-4">Availability & Scheduling</h2>
                
                <div className="space-y-3">
                  <label className="text-sm font-medium text-slate-300">Available Operating Cities</label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {['Dubai', 'Abu Dhabi', 'Sharjah', 'Ajman', 'Fujairah'].map(city => (
                      <label key={city} className="flex items-center gap-3 p-3 rounded-lg border border-slate-700 bg-slate-900 cursor-pointer hover:bg-slate-800 transition-colors">
                        <input type="checkbox" className="w-4 h-4 rounded bg-[#0f1218] border-slate-600 text-emerald-500 focus:ring-emerald-500 focus:ring-offset-[#0f1218]" defaultChecked={['Dubai', 'Abu Dhabi'].includes(city)} />
                        <MapPin className={`w-4 h-4 ${['Dubai', 'Abu Dhabi'].includes(city) ? 'text-emerald-400' : 'text-slate-500'}`} />
                        <span className="text-sm text-slate-200 font-medium">{city}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300">Operating Hours Start</label>
                    <input type="time" defaultValue="08:00" className="w-full bg-slate-900 border border-slate-800 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:border-emerald-500/50 transition-colors" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300">Operating Hours End</label>
                    <input type="time" defaultValue="22:00" className="w-full bg-slate-900 border border-slate-800 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:border-emerald-500/50 transition-colors" />
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl mt-4">
                  <Info className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-medium text-blue-400 mb-1">Emergency 24/7 Mode</h4>
                    <p className="text-xs text-blue-400/80">If enabled, this service ignores operating hours and can be requested at any time. Night surcharges may automatically apply.</p>
                    <label className="flex items-center gap-2 mt-3 cursor-pointer">
                      <input type="checkbox" className="w-4 h-4 rounded bg-blue-900/50 border-blue-700 text-blue-500 focus:ring-blue-500 focus:ring-offset-[#0f1218]" />
                      <span className="text-sm font-medium text-blue-300">Enable 24/7 Emergency Mode</span>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {currentStep === 5 && (
              <div className="flex-1 space-y-6">
                <h2 className="text-xl font-bold text-white tracking-tight border-b border-slate-800 pb-4">Review & Publish</h2>
                
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
                  <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Service Preview</h3>
                  
                  <div className="flex items-start gap-6">
                    <div className="w-32 h-32 bg-[#0f1218] rounded-xl border border-slate-700 flex flex-col items-center justify-center shrink-0">
                      <span className="text-slate-500 text-xs">No Image</span>
                    </div>
                    <div className="space-y-4 flex-1">
                      <div>
                        <h4 className="text-xl font-bold text-white mb-1">Super98 Fuel Delivery</h4>
                        <div className="flex items-center gap-2 text-sm">
                          <span className="text-emerald-400 font-medium">AED 45.00</span>
                          <span className="text-slate-500">•</span>
                          <span className="text-slate-400">45 Mins</span>
                          <span className="text-slate-500">•</span>
                          <span className="bg-slate-800 text-slate-300 px-2 py-0.5 rounded text-xs">Fuel Delivery</span>
                        </div>
                      </div>
                      <p className="text-sm text-slate-400 leading-relaxed max-w-xl">
                        Premium Super98 fuel delivered directly to your vehicle anywhere in Dubai and Abu Dhabi.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="p-4 bg-slate-900 border border-slate-800 rounded-lg">
                    <div className="text-xs text-slate-500 mb-1">Tax Included</div>
                    <div className="text-sm font-medium text-white">5%</div>
                  </div>
                  <div className="p-4 bg-slate-900 border border-slate-800 rounded-lg">
                    <div className="text-xs text-slate-500 mb-1">Driver Commission</div>
                    <div className="text-sm font-medium text-white">20%</div>
                  </div>
                  <div className="p-4 bg-slate-900 border border-slate-800 rounded-lg">
                    <div className="text-xs text-slate-500 mb-1">Service Cities</div>
                    <div className="text-sm font-medium text-white">2 Selected</div>
                  </div>
                  <div className="p-4 bg-slate-900 border border-slate-800 rounded-lg">
                    <div className="text-xs text-slate-500 mb-1">Operating Hours</div>
                    <div className="text-sm font-medium text-white">08:00 - 22:00</div>
                  </div>
                </div>
              </div>
            )}

            {/* Bottom Navigation */}
            <div className="mt-8 pt-6 border-t border-slate-800 flex items-center justify-between">
              <button 
                onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
                disabled={currentStep === 1}
                className="px-5 py-2.5 bg-slate-900 border border-slate-700 text-slate-300 font-medium rounded-lg hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                Previous Step
              </button>
              
              {currentStep < 5 && (
                <button 
                  onClick={() => setCurrentStep(Math.min(5, currentStep + 1))}
                  className="flex items-center gap-2 px-6 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-white font-medium rounded-lg shadow-lg shadow-emerald-900/20 transition-all text-sm"
                >
                  Continue <ChevronRight className="w-4 h-4" />
                </button>
              )}
            </div>
            
          </div>
        </div>
      </div>
    </div>
  );
}
