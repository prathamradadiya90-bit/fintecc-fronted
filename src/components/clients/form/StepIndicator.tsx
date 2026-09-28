import React from 'react';
import { Check } from 'lucide-react';
import { FORM_STEPS, FormStep } from './clientForm.schema';

interface StepIndicatorProps {
  currentStep: number;
  completedSteps: number[];
  onStepClick: (stepId: number) => void;
}

export const StepIndicator: React.FC<StepIndicatorProps> = ({
  currentStep,
  completedSteps,
  onStepClick,
}) => {
  return (
    <div className="w-full pb-4 mb-4 border-b border-slate-200 dark:border-slate-800">
      {/* Progress Bar */}
      <div className="h-1 w-full bg-slate-100 dark:bg-slate-800 rounded-full mb-4 overflow-hidden">
        <div
          className="h-full bg-[#4A6FA5] transition-all duration-300 ease-out"
          style={{ width: `${((currentStep - 1) / (FORM_STEPS.length - 1)) * 100}%` }}
        />
      </div>

      {/* Stepper nodes */}
      <div className="flex items-center justify-between">
        {FORM_STEPS.map((step: FormStep, index: number) => {
          const isCurrent = step.id === currentStep;
          const isCompleted = completedSteps.includes(step.id);
          const isClickable = isCompleted || step.id <= currentStep;

          return (
            <React.Fragment key={step.id}>
              {/* Step Circle & Details */}
              <button
                type="button"
                disabled={!isClickable}
                onClick={() => isClickable && onStepClick(step.id)}
                className={`flex items-center gap-2.5 text-left transition-all group focus:outline-none ${
                  isClickable ? 'cursor-pointer' : 'cursor-default opacity-60'
                }`}
              >
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                    isCompleted
                      ? 'bg-[#3D7A64] text-white'
                      : isCurrent
                      ? 'bg-[#4A6FA5] text-white shadow-sm ring-4 ring-[#4A6FA5]/20'
                      : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
                  }`}
                >
                  {isCompleted ? <Check className="w-3.5 h-3.5 stroke-[2.5]" /> : step.id}
                </div>

                <div className="hidden sm:block">
                  <p
                    className={`text-xs font-semibold leading-tight ${
                      isCurrent
                        ? 'text-[#4A6FA5] dark:text-[#A8C5DA]'
                        : isCompleted
                        ? 'text-slate-700 dark:text-slate-200'
                        : 'text-slate-400 dark:text-slate-500'
                    }`}
                  >
                    {step.title}
                  </p>
                  <p className="text-[11px] text-slate-400 dark:text-slate-500 font-normal">
                    {step.subtitle}
                  </p>
                </div>
              </button>

              {/* Connecting line */}
              {index < FORM_STEPS.length - 1 && (
                <div
                  className={`flex-1 h-[2px] mx-2 hidden md:block transition-colors ${
                    completedSteps.includes(step.id)
                      ? 'bg-[#3D7A64]/60'
                      : step.id < currentStep
                      ? 'bg-[#4A6FA5]/40'
                      : 'bg-slate-200 dark:bg-slate-800'
                  }`}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Mobile step label display */}
      <div className="mt-2.5 sm:hidden flex items-center justify-between px-1">
        <span className="text-xs font-bold text-[#4A6FA5] dark:text-[#A8C5DA]">
          Step {currentStep} of {FORM_STEPS.length}: {FORM_STEPS[currentStep - 1]?.title}
        </span>
        <span className="text-[11px] text-slate-400">
          {FORM_STEPS[currentStep - 1]?.subtitle}
        </span>
      </div>
    </div>
  );
};
