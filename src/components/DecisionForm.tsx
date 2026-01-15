'use client';

import { useState } from 'react';
import { Decision, DecisionCategory } from '@/types';
import { generateId } from '@/lib/storage';
import { X } from 'lucide-react';
import { format } from 'date-fns';

interface DecisionFormProps {
  onSubmit: (decision: Decision) => void;
  onCancel: () => void;
  initialData?: Partial<Decision>;
}

const categoryOptions: { value: DecisionCategory; label: string; description: string }[] = [
  {
    value: 'status',
    label: 'Status Change',
    description: 'Changes to account status (active, on hold, collections, etc.)',
  },
  {
    value: 'action_plan',
    label: 'Action Plan',
    description: 'Strategic decisions about how to approach the account',
  },
  {
    value: 'risk_urgency',
    label: 'Risk/Urgency',
    description: 'Changes to risk level or urgency classification',
  },
  {
    value: 'special_arrangement',
    label: 'Special Arrangement',
    description: 'Payment plans, prepayment requirements, or other special terms',
  },
];

export function DecisionForm({ onSubmit, onCancel, initialData }: DecisionFormProps) {
  const [formData, setFormData] = useState({
    category: initialData?.category || ('action_plan' as DecisionCategory),
    title: initialData?.title || '',
    description: initialData?.description || '',
    rationale: initialData?.rationale || '',
    expectedOutcome: initialData?.expectedOutcome || '',
    date: initialData?.date || format(new Date(), 'yyyy-MM-dd'),
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }
    if (!formData.rationale.trim()) {
      newErrors.rationale = 'Rationale is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    const decision: Decision = {
      id: initialData?.id || generateId(),
      date: formData.date,
      category: formData.category,
      title: formData.title.trim(),
      description: formData.description.trim(),
      rationale: formData.rationale.trim(),
      expectedOutcome: formData.expectedOutcome.trim() || undefined,
    };

    onSubmit(decision);
  };

  return (
    <form onSubmit={handleSubmit} className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold">Record Decision</h3>
        <button
          type="button"
          onClick={onCancel}
          className="p-2 hover:bg-[var(--secondary)] rounded-lg transition-colors"
        >
          <X className="w-5 h-5 text-[var(--muted)]" />
        </button>
      </div>

      <div className="space-y-4">
        {/* Date */}
        <div>
          <label className="block text-sm font-medium text-[var(--foreground)] mb-1">
            Date
          </label>
          <input
            type="date"
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            className="w-full px-3 py-2 border border-[var(--border)] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent"
          />
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm font-medium text-[var(--foreground)] mb-1">
            Category
          </label>
          <div className="space-y-2">
            {categoryOptions.map((option) => (
              <label
                key={option.value}
                className={`flex items-start gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${
                  formData.category === option.value
                    ? 'border-[var(--primary)] bg-blue-50'
                    : 'border-[var(--border)] hover:border-gray-300'
                }`}
              >
                <input
                  type="radio"
                  name="category"
                  value={option.value}
                  checked={formData.category === option.value}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      category: e.target.value as DecisionCategory,
                    })
                  }
                  className="mt-1"
                />
                <div>
                  <div className="font-medium text-sm">{option.label}</div>
                  <div className="text-xs text-[var(--muted)]">{option.description}</div>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-[var(--foreground)] mb-1">
            Title <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="Brief summary of the decision"
            className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent ${
              errors.title ? 'border-red-500' : 'border-[var(--border)]'
            }`}
          />
          {errors.title && (
            <p className="mt-1 text-xs text-red-500">{errors.title}</p>
          )}
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-[var(--foreground)] mb-1">
            Description <span className="text-red-500">*</span>
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="What was decided?"
            rows={3}
            className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent resize-none ${
              errors.description ? 'border-red-500' : 'border-[var(--border)]'
            }`}
          />
          {errors.description && (
            <p className="mt-1 text-xs text-red-500">{errors.description}</p>
          )}
        </div>

        {/* Rationale */}
        <div>
          <label className="block text-sm font-medium text-[var(--foreground)] mb-1">
            Rationale <span className="text-red-500">*</span>
          </label>
          <textarea
            value={formData.rationale}
            onChange={(e) => setFormData({ ...formData, rationale: e.target.value })}
            placeholder="Why was this decision made? What factors were considered?"
            rows={3}
            className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent resize-none ${
              errors.rationale ? 'border-red-500' : 'border-[var(--border)]'
            }`}
          />
          {errors.rationale && (
            <p className="mt-1 text-xs text-red-500">{errors.rationale}</p>
          )}
        </div>

        {/* Expected Outcome */}
        <div>
          <label className="block text-sm font-medium text-[var(--foreground)] mb-1">
            Expected Outcome
          </label>
          <textarea
            value={formData.expectedOutcome}
            onChange={(e) =>
              setFormData({ ...formData, expectedOutcome: e.target.value })
            }
            placeholder="What outcome do you expect from this decision?"
            rows={2}
            className="w-full px-3 py-2 border border-[var(--border)] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent resize-none"
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-[var(--border)]">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm font-medium text-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-[var(--primary)] text-white text-sm font-medium rounded-lg hover:bg-[var(--primary-hover)] transition-colors"
        >
          Save Decision
        </button>
      </div>
    </form>
  );
}
