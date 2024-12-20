import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface InviteCodeModalProps {
  isOpen: boolean;
  onClose?: () => void;
  onVerify?: () => void;
}

export function InviteCodeModal({ isOpen, onClose, onVerify }: InviteCodeModalProps) {
  const [inviteCode, setInviteCode] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (inviteCode.toUpperCase() === 'FIRST100') {
      onVerify?.();
      onClose?.();
    } else {
      setError('Invalid invite code. Please try again.');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Invite Only Access</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="inviteCode" className="block mb-2 text-sm font-medium">
              Enter Invite Code
            </label>
            <input
              type="text"
              id="inviteCode"
              value={inviteCode}
              onChange={(e) => {
                setInviteCode(e.target.value);
                setError('');
              }}
              className="w-full px-3 py-2 border rounded-md"
              placeholder="Enter your invite code"
              required
            />
            {error && (
              <p className="text-red-500 text-sm mt-2">{error}</p>
            )}
          </div>
          <button
            type="submit"
            className="w-full bg-primary text-white py-2 rounded-md hover:bg-primary-dark transition"
          >
            Submit
          </button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
