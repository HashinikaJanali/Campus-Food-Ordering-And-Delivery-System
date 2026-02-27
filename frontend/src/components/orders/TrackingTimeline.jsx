//animated step progress for students

import { motion } from 'framer-motion';
import { CheckCircle } from 'lucide-react';
import { TRACKING_STEPS, STATUS_CONFIG } from '../../constants/orderConstants';

const TrackingTimeline = ({ status }) => {
  const currentStep = STATUS_CONFIG[status]?.step ?? 0;
  const isCancelled = status === 'cancelled';

  if (isCancelled) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
        <p className="text-4xl mb-2">❌</p>
        <p className="font-bold text-red-600">Order Cancelled</p>
        <p className="text-sm text-red-400 mt-1">This order has been cancelled.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6">
      <h3 className="font-bold text-gray-800 mb-6 text-base">Order Progress</h3>
      <div className="relative">
        {/* Progress Line */}
        <div className="absolute left-5 top-5 bottom-5 w-0.5 bg-gray-200" />
        <motion.div
          className="absolute left-5 top-5 w-0.5 bg-gradient-primary"
          initial={{ height: 0 }}
          animate={{ height: `${(currentStep / (TRACKING_STEPS.length - 1)) * 100}%` }}
          transition={{ duration: 0.8, ease: 'easeInOut' }}
        />

        <div className="space-y-6">
          {TRACKING_STEPS.map((step, index) => {
            const isCompleted = index <= currentStep;
            const isActive = index === currentStep;

            return (
              <motion.div
                key={step.key}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-start gap-4 relative"
              >
                {/* Step Icon */}
                <div className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all shrink-0
                  ${isCompleted
                    ? 'bg-gradient-primary border-primary-500 text-white shadow-lg'
                    : 'bg-white border-gray-300 text-gray-400'
                  }`}
                >
                  {isCompleted
                    ? <CheckCircle className="w-5 h-5" />
                    : <step.icon className="w-5 h-5" />
                  }
                  {isActive && (
                    <motion.div
                      className="absolute inset-0 rounded-full border-2 border-primary-400"
                      animate={{ scale: [1, 1.3, 1], opacity: [1, 0, 1] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    />
                  )}
                </div>

                {/* Step Content */}
                <div className="pt-1.5">
                  <p className={`font-semibold text-sm ${isCompleted ? 'text-gray-800' : 'text-gray-400'}`}>
                    {step.label}
                    {isActive && (
                      <span className="ml-2 text-xs bg-primary-100 text-primary-600 px-2 py-0.5 rounded-full font-medium">
                        Current
                      </span>
                    )}
                  </p>
                  <p className={`text-xs mt-0.5 ${isCompleted ? 'text-gray-500' : 'text-gray-300'}`}>
                    {step.desc}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default TrackingTimeline;
