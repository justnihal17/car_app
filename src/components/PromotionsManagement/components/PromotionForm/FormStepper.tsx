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
    <div className="bg-white p-3 rounded-xl border border-slate-200/90 shadow-2xs mb-3.5">
      <div className="flex items-center justify-between overflow-x-auto py-1 px-1 [&::-webkit-scrollbar]:hidden">
        {STEPS.map((s, idx) => {
          const isCompleted = currentStep > s.step;
          const isCurrent = currentStep === s.step;

          return (
            <React.Fragment key={s.step}>
              <div
                onClick={() => isCompleted && onStepClick(s.step)}
                className={`flex items-center gap-2 shrink-0 ${
                  isCompleted ? 'cursor-pointer' : 'cursor-default'
                }`}
              >
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center font-semibold text-xs transition-all ${
                    isCompleted
                      ? 'bg-emerald-500 text-white shadow-2xs'
                      : isCurrent
                      ? 'bg-red-600 text-white shadow-2xs'
                      : 'bg-slate-100 text-slate-400 border border-slate-200/80'
                  }`}
                >
                  {isCompleted ? <Check className="w-3.5 h-3.5 stroke-[2.5]" /> : s.step}
                </div>
                <div className="flex flex-col">
                  <span
                    className={`text-xs font-semibold whitespace-nowrap leading-none ${
                      isCurrent
                        ? 'text-slate-900'
                        : isCompleted
                        ? 'text-slate-700'
                        : 'text-slate-400'
                    }`}
                  >
                    {s.label}
                  </span>
                  <span className="text-[9.5px] font-medium text-slate-400 mt-0.5">
                    Step 0{s.step}
                  </span>
                </div>
              </div>

              {idx < STEPS.length - 1 && (
                <div
                  className={`h-0.5 w-8 sm:w-12 mx-1.5 shrink-0 ${
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
