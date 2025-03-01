import React from 'react';
import { create, props } from '@stylexjs/stylex';

// Define types for Classifier
export interface Classifier {
  id: number;
  uuid: string;
  referredToAs: string;
  aliases: string[];
  createdAt: string;
  updatedAt: string;
}

interface ClassifierTagChipProps {
  classifier: Classifier;
  onRemove: (classifierId: number) => void;
}

// Styles for the component
const styles = create({
  chip: {
    display: 'inline-flex',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    border: '1px solid #e5e7eb',
    borderRadius: '9999px',
    padding: '0.25rem 0.5rem',
    fontSize: '0.75rem',
    margin: '0.25rem 0.25rem 0.25rem .25rem',
    gap: '0.25rem',
    transition: 'all 0.2s ease',
    ':hover': {
      backgroundColor: '#f3f4f6',
      borderColor: '#d1d5db',
    },
  },
  text: {
    fontWeight: 'medium',
    color: '#374151',
  },
  removeButton: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '16px',
    height: '16px',
    borderRadius: '50%',
    marginLeft: '0.25rem',
    color: '#6b7280',
    cursor: 'pointer',
    ':hover': {
      backgroundColor: '#f3f4f6',
      color: '#ef4444',
    },
  },
});

const ClassifierTagChip: React.FC<ClassifierTagChipProps> = ({ classifier, onRemove }) => {
  return (
    <div {...props(styles.chip)}>
      <span {...props(styles.text)}>{classifier.referredToAs}</span>
      <span 
        {...props(styles.removeButton)}
        onClick={() => onRemove(classifier.id)}
        title="Remove classifier"
      >
        ×
      </span>
    </div>
  );
};

export default ClassifierTagChip;
