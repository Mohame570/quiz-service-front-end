import {
  getAnswerDisplayStatus,
  hasPendingManualGrading,
  hasTextAnswers,
} from '@/lib/answer-status';
import type { AttemptAnswerDto } from '@/types/attempt/attempt';

function makeAnswer(overrides: Partial<AttemptAnswerDto> = {}): AttemptAnswerDto {
  return {
    id: 'ans_1',
    attemptId: 'attempt_1',
    questionId: 'q_1',
    selectedOptionId: null,
    textAnswer: null,
    isCorrect: null,
    answeredAt: new Date().toISOString(),
    ...overrides,
  };
}

describe('getAnswerDisplayStatus', () => {
  it('returns skipped when nothing was answered', () => {
    expect(getAnswerDisplayStatus(makeAnswer())).toBe('skipped');
  });

  it('returns correct for a graded-correct text answer (FILL_BLANK / CODE_CONTEXT)', () => {
    expect(
      getAnswerDisplayStatus(makeAnswer({ textAnswer: 'Paris', isCorrect: true })),
    ).toBe('correct');
  });

  it('returns incorrect for an auto-graded wrong text answer', () => {
    expect(
      getAnswerDisplayStatus(makeAnswer({ textAnswer: 'London', isCorrect: false })),
    ).toBe('incorrect');
  });

  it('returns pending for an ungraded essay answer', () => {
    expect(
      getAnswerDisplayStatus(makeAnswer({ textAnswer: 'My essay', isCorrect: null })),
    ).toBe('pending');
  });

  it('returns correct for an answered multi-select graded correct', () => {
    expect(
      getAnswerDisplayStatus(
        makeAnswer({ selectedOptionIds: ['A', 'C'], isCorrect: true }),
      ),
    ).toBe('correct');
  });

  it('returns incorrect for an answered multi-select graded wrong', () => {
    expect(
      getAnswerDisplayStatus(
        makeAnswer({ selectedOptionIds: ['A'], isCorrect: false }),
      ),
    ).toBe('incorrect');
  });

  it('returns skipped for multi-select with an empty selection', () => {
    expect(
      getAnswerDisplayStatus(
        makeAnswer({ selectedOptionIds: [], isCorrect: false }),
      ),
    ).toBe('skipped');
  });

  it('returns correct for a choice answer graded correct', () => {
    expect(
      getAnswerDisplayStatus(
        makeAnswer({ selectedOptionId: 'Paris', isCorrect: true }),
      ),
    ).toBe('correct');
  });
});

describe('hasPendingManualGrading', () => {
  it('is false when auto-graded text answers are wrong (not pending)', () => {
    expect(
      hasPendingManualGrading([
        makeAnswer({ textAnswer: 'London', isCorrect: false }),
      ]),
    ).toBe(false);
  });

  it('is true only for genuinely unscored answers', () => {
    expect(
      hasPendingManualGrading([
        makeAnswer({ textAnswer: 'My essay', isCorrect: null }),
      ]),
    ).toBe(true);
  });

  it('is false when every answer is graded', () => {
    expect(
      hasPendingManualGrading([
        makeAnswer({ textAnswer: 'Paris', isCorrect: true }),
        makeAnswer({ selectedOptionId: 'True', isCorrect: true }),
      ]),
    ).toBe(false);
  });
});

describe('hasTextAnswers', () => {
  it('detects text answers regardless of grading state', () => {
    expect(
      hasTextAnswers([makeAnswer({ textAnswer: ' hi ', isCorrect: false })]),
    ).toBe(true);
    expect(hasTextAnswers([makeAnswer()])).toBe(false);
  });
});
