import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import RequestForm from "./RequestForm";

interface NewRequestModalProps {
  isOpen?: boolean;
  onClose?: () => void;
  onSubmit?: (data: {
    title: string;
    description: string;
    tags: string[];
  }) => void;
  isSubmitting?: boolean;
}

const NewRequestModal = ({
  isOpen = true,
  onClose = () => {},
  onSubmit = () => {},
  isSubmitting = false,
}: NewRequestModalProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] bg-background">
        <DialogHeader>
          <DialogTitle>Submit New Product Request</DialogTitle>
        </DialogHeader>
        <RequestForm onSubmit={onSubmit} isSubmitting={isSubmitting} />
      </DialogContent>
    </Dialog>
  );
};

export default NewRequestModal;
