import React from 'react';
import { Check } from 'lucide-react';

interface FormStepperProps {
  currentStep: number;
  onStepClick: (step: number) => void;
}

const STEPS = [
  { step: 1, label: 'Basic Info' },
  { step: 2, label: 'Discount & Limits' },
  { step: 3, label: 'Applicability' },
  { step: 4, label: 'Schedule & Rules' },
  { step: 5, label: 'Review & Create' },
];

export function FormStepper({ currentStep, onStepClick }: FormStepperProps) {
  return (
    <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs mb-6">
      <div className="flex items-center justify-between overflow-x-auto py-2 px-1 [&::-webkit-scrollbar]:hidden">
        {STEPS.map((s, idx) => {
          const isCompleted = currentStep > s.step;
          const isCurrent = currentStep === s.step;

          return (
            <React.Fragment key={s.step}>
              <div
                onClick={() => isCompleted && onStepClick(s.step)}
                className={`flex items-center gap-2.5 shrink-0 ${
                  isCompleted ? 'cursor-pointer' : 'cursor-default'
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs transition-all ${
                    isCompleted
                      ? 'bg-emerald-500 text-white shadow-sm'
                      : isCurrent
                      ? 'bg-red-600 text-white shadow-md shadow-red-500/20'
                      : 'bg-slate-100 text-slate-400 border border-slate-200'
                  }`}
                >
                  {isCompleted ? <Check className="w-4 h-4" /> : s.step}
                </div>
                <div className="flex flex-col">
                  <span
                    className={`text-xs font-bold whitespace-nowrap ${
                      isCurrent
                        ? 'text-slate-900'
                        : isCompleted
                        ? 'text-slate-700'
                        : 'text-slate-400'
                    }`}
                  >
                    {s.label}
                  </span>
                  <span className="text-[10px] font-semibold text-slate-400">
                    Step 0{s.step}
                  </span>
                </div>
              </div>

              {idx < STEPS.length - 1 && (
                <div
                  className={`h-0.5 w-12 sm:w-16 mx-2 shrink-0 ${
                    currentStep > s.step ? 'bg-emerald-500' : 'bg-slate-200'
                  }`}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}
