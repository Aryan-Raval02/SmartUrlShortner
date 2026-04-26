import React from 'react';
import { useToastStore, type ToastType } from '../../store/useToastStore';
import { 
  CheckCircleIcon, 
  XCircleIcon, 
  InformationCircleIcon, 
  ExclamationTriangleIcon,
  XMarkIcon 
} from '@heroicons/react/24/outline';

const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useToastStore();

  const getIcon = (type: ToastType) => {
    switch (type) {
      case 'success': return <CheckCircleIcon className="h-6 w-6 text-green-500" />;
      case 'error': return <XCircleIcon className="h-6 w-6 text-red-500" />;
      case 'warning': return <ExclamationTriangleIcon className="h-6 w-6 text-yellow-500" />;
      case 'info': return <InformationCircleIcon className="h-6 w-6 text-blue-500" />;
    }
  };

  const getBgColor = (type: ToastType) => {
    switch (type) {
      case 'success': return 'bg-green-50 border-green-200';
      case 'error': return 'bg-red-50 border-red-200';
      case 'warning': return 'bg-yellow-50 border-yellow-200';
      case 'info': return 'bg-blue-50 border-blue-200';
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full">
      {toasts.map((toast) => (
        <div 
          key={toast.id}
          className={`flex items-start p-4 rounded-lg border shadow-lg animate-slide-in ${getBgColor(toast.type)}`}
        >
          <div className="flex-shrink-0">
            {getIcon(toast.type)}
          </div>
          <div className="ml-3 flex-1">
            <p className="text-sm font-medium text-gray-900">
              {toast.message}
            </p>
          </div>
          <div className="ml-4 flex-shrink-0 flex">
            <button
              onClick={() => removeToast(toast.id)}
              className="inline-flex text-gray-400 hover:text-gray-500 focus:outline-none"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ToastContainer;
