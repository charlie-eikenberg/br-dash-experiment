'use client';

import { useState } from 'react';
import { StaticContext } from '@/types';
import {
  FileText,
  DollarSign,
  User,
  Users,
  Edit3,
  Save,
  X,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface EditableStaticContextProps {
  context: StaticContext;
  onSave: (context: StaticContext) => void;
  lastUpdated: string;
}

type ContextField = keyof StaticContext;

const fieldConfig: Record<
  ContextField,
  { label: string; icon: React.ReactNode; placeholder: string }
> = {
  background: {
    label: 'Background',
    icon: <FileText className="w-4 h-4" />,
    placeholder:
      'Company history, ownership structure, key business changes, industry context...',
  },
  paymentPatterns: {
    label: 'Payment Patterns',
    icon: <DollarSign className="w-4 h-4" />,
    placeholder:
      'Historical payment frequency, typical payment amounts, seasonal patterns, triggers for payment...',
  },
  relationshipNotes: {
    label: 'Relationship Notes',
    icon: <User className="w-4 h-4" />,
    placeholder:
      'Communication preferences, key stakeholder dynamics, best times to contact, rapport notes...',
  },
  keyContacts: {
    label: 'Key Contacts',
    icon: <Users className="w-4 h-4" />,
    placeholder:
      'Name (Title) - email - phone\nName (Title) - email - phone',
  },
};

export function EditableStaticContext({
  context,
  onSave,
  lastUpdated,
}: EditableStaticContextProps) {
  const [editingField, setEditingField] = useState<ContextField | null>(null);
  const [editValue, setEditValue] = useState('');
  const [expandedField, setExpandedField] = useState<ContextField | null>(null);

  const handleEdit = (field: ContextField) => {
    setEditingField(field);
    setEditValue(context[field]);
    setExpandedField(field);
  };

  const handleSave = () => {
    if (!editingField) return;

    const updatedContext = {
      ...context,
      [editingField]: editValue,
    };
    onSave(updatedContext);
    setEditingField(null);
    setEditValue('');
  };

  const handleCancel = () => {
    setEditingField(null);
    setEditValue('');
  };

  const toggleExpand = (field: ContextField) => {
    if (editingField === field) return; // Don't collapse while editing
    setExpandedField(expandedField === field ? null : field);
  };

  const fields: ContextField[] = ['background', 'paymentPatterns', 'relationshipNotes', 'keyContacts'];

  return (
    <div className="space-y-3">
      <p className="text-sm text-[var(--muted)]">
        Static context is persistent information about the account that doesn&apos;t change week
        to week. Click edit to update any field.
      </p>

      {fields.map((field) => {
        const config = fieldConfig[field];
        const isEditing = editingField === field;
        const isExpanded = expandedField === field;
        const value = context[field];

        return (
          <div
            key={field}
            className="border border-[var(--border)] rounded-lg overflow-hidden"
          >
            {/* Header */}
            <div
              className={`flex items-center justify-between p-4 ${
                isExpanded ? 'bg-[var(--secondary)]' : 'bg-[var(--secondary)]'
              } ${!isEditing ? 'cursor-pointer hover:bg-gray-100' : ''}`}
              onClick={() => !isEditing && toggleExpand(field)}
            >
              <div className="flex items-center gap-2">
                <span className="text-[var(--muted)]">{config.icon}</span>
                <span className="font-medium">{config.label}</span>
                {!value && (
                  <span className="text-xs text-amber-600 bg-amber-100 px-2 py-0.5 rounded">
                    Not set
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                {!isEditing && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEdit(field);
                    }}
                    className="p-1.5 text-[var(--muted)] hover:text-[var(--primary)] hover:bg-white rounded transition-colors"
                    title="Edit"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                )}
                {isExpanded ? (
                  <ChevronUp className="w-4 h-4 text-[var(--muted)]" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-[var(--muted)]" />
                )}
              </div>
            </div>

            {/* Content */}
            {isExpanded && (
              <div className="p-4 bg-white">
                {isEditing ? (
                  <div className="space-y-3">
                    <textarea
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      placeholder={config.placeholder}
                      rows={field === 'keyContacts' ? 4 : 6}
                      className="w-full px-3 py-2 border border-[var(--border)] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent resize-none"
                      autoFocus
                    />
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={handleCancel}
                        className="flex items-center gap-1 px-3 py-1.5 text-sm text-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
                      >
                        <X className="w-4 h-4" />
                        Cancel
                      </button>
                      <button
                        onClick={handleSave}
                        className="flex items-center gap-1 px-3 py-1.5 text-sm bg-[var(--primary)] text-white rounded-lg hover:bg-[var(--primary-hover)] transition-colors"
                      >
                        <Save className="w-4 h-4" />
                        Save
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    {value ? (
                      <p className="text-sm whitespace-pre-wrap">{value}</p>
                    ) : (
                      <p className="text-sm text-[var(--muted)] italic">
                        No {config.label.toLowerCase()} recorded. Click edit to add.
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}

      {/* Last Updated */}
      <div className="text-xs text-[var(--muted)] pt-2">
        Last updated: {new Date(lastUpdated).toLocaleString()}
      </div>
    </div>
  );
}
