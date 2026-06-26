import React from 'react';
import { AddTaskComponent, AddTaskComponentProps } from './AddTaskComponent';

export interface EditTaskComponentProps extends AddTaskComponentProps {
  id: string; // id is required for editing
}

export function EditTaskComponent({
  id,
  leadId,
  leadName,
  isEmbedded = false,
  onSuccess,
  onCancel,
}: EditTaskComponentProps) {
  return (
    <AddTaskComponent
      id={id}
      leadId={leadId}
      leadName={leadName}
      isEmbedded={isEmbedded}
      onSuccess={onSuccess}
      onCancel={onCancel}
    />
  );
}
