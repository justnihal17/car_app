import React from 'react';
import { ConfirmationModal } from './ConfirmationModal';

interface BlockConfirmationModalProps {
  isOpen: boolean;
  name: string;
  isCurrentlyBlocked: boolean;
  onCancel: () => void;
  onConfirm: () => void | Promise<void>;
}

export function BlockConfirmationModal({ 
  isOpen, 
  name, 
  isCurrentlyBlocked,
  onCancel, 
  onConfirm
}: BlockConfirmationModalProps) {
  return (
    <ConfirmationModal
      isOpen={isOpen}
      actionType={isCurrentlyBlocked ? "unblock" : "block"}
      name={name}
      onCancel={onCancel}
      onConfirm={onConfirm}
    />
  );
}
