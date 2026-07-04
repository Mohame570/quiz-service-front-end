'use client';

import type { QuestionOption as QuestionOptionType } from '@/types/question/question';

type QuestionOptionProps = {
  option: QuestionOptionType;
  isSelected: boolean;
  onSelect: (optionId: string) => void;
  optionLabel: string;
  disabled?: boolean;
};

export default function QuestionOption({
  option,
  isSelected,
  onSelect,
  optionLabel,
  disabled = false,
}: QuestionOptionProps) {
  return (
    <button
      type="button"
      onClick={() => onSelect(option.id)}
      disabled={disabled}
      aria-pressed={isSelected}
      className={`flex w-full items-center gap-3 rounded-xl px-4 py-3.5 text-left text-body transition-all duration-150 ease-out focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-500 disabled:cursor-not-allowed disabled:opacity-60 ${
        isSelected
          ? 'border-2 border-accent-500 bg-accent-50'
          : 'border border-border bg-surface hover:border-accent-200 hover:bg-accent-50'
      }`}
    >
      <span
        aria-hidden
        className={`inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-caption font-semibold transition-colors duration-150 ease-out ${
          isSelected
            ? 'bg-accent-500 text-inverse'
            : 'bg-border text-foreground-secondary'
        }`}
      >
        {isSelected ? (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
        ) : (
          optionLabel
        )}
      </span>
      <span className="leading-relaxed text-foreground">{option.text}</span>
    </button>
  );
}
