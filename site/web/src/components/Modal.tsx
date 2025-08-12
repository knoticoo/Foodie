import React from 'react';

type ModalProps = {
  isOpen: boolean;
  title?: string;
  onClose: () => void;
  children: React.ReactNode;
  footer?: React.ReactNode;
};

export const Modal: React.FC<ModalProps> = ({ isOpen, title, onClose, children, footer }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative z-10 w-full max-w-lg mx-4 rounded bg-white shadow-lg">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <h3 className="font-semibold text-lg">{title || 'Dialog'}</h3>
          <button className="text-gray-500 hover:text-gray-700" onClick={onClose}>✕</button>
        </div>
        <div className="px-4 py-3">
          {children}
        </div>
        {footer && (
          <div className="border-t px-4 py-3 flex justify-end gap-2">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};