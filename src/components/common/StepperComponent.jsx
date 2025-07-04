import React from 'react';

const StepperComponent = ({ steps, currentStep }) => (
  <div className="flex items-center justify-center mb-8">
    {steps.map((step, idx) => (
      <div key={step} className="flex items-center">
        <div className={`rounded-full w-8 h-8 flex items-center justify-center font-bold
          ${idx <= currentStep ? 'bg-emerald-600 text-white' : 'bg-gray-200 text-gray-400'}
        `}>
          {idx + 1}
        </div>
        {idx < steps.length - 1 && (
          <div className={`h-1 w-8 ${idx < currentStep ? 'bg-emerald-600' : 'bg-gray-200'}`}></div>
        )}
      </div>
    ))}
  </div>
);

export default StepperComponent; 