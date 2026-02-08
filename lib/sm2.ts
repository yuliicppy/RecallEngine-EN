export type Sm2State = {
  easeFactor: number;
  intervalDays: number;
  repetitions: number;
};

export type Sm2Result = Sm2State & {
  nextReviewAt: Date;
};

export function applySm2(state: Sm2State, rating: number, now = new Date()): Sm2Result {
  const clamped = Math.max(0, Math.min(5, rating));
  let easeFactor = state.easeFactor;
  let intervalDays = state.intervalDays;
  let repetitions = state.repetitions;

  if (clamped < 3) {
    repetitions = 0;
    intervalDays = 1;
  } else {
    if (repetitions === 0) {
      intervalDays = 1;
    } else if (repetitions === 1) {
      intervalDays = 6;
    } else {
      intervalDays = Math.round(intervalDays * easeFactor);
    }
    repetitions += 1;
  }

  easeFactor = Math.max(
    1.3,
    easeFactor + (0.1 - (5 - clamped) * (0.08 + (5 - clamped) * 0.02))
  );

  const nextReviewAt = new Date(now);
  nextReviewAt.setDate(nextReviewAt.getDate() + intervalDays);

  return { easeFactor, intervalDays, repetitions, nextReviewAt };
}
