import React, { useEffect } from 'react';
import "./style.css";
interface FlashMessageProps {
  message: string;
  type: 'success' | 'error';
  onClose: () => void;
}

const FlashMessage: React.FC<FlashMessageProps> = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 5000);

    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`fixed top-20 right-4 p-4 rounded shadow-lg ${type === 'success' ? 'bg-green-700' : 'bg-red-700'} text-white border-4 ${type === 'success' ? 'border-green-500' : 'border-red-500'} font-medieval`}>
      <div className="flex items-center">
        <span className="mr-2">{type === 'success' ? '✓' : '✗'}</span>
        <span>{message}</span>
      </div>
      <div className="absolute top-0 right-0 mt-2 mr-2 cursor-pointer" onClick={onClose}>
        ✖
      </div>
    </div>
  );
};

export default FlashMessage;
