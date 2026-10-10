import { config } from '../../config/env.js';

export function buildReviewOptions(overrides = {}) {
  const fastMode = config.review.mode === 'fast';

  return {
    includeAiReview: fastMode ? false : config.review.includeAiReview,
    includeSemanticContext: fastMode
      ? false
      : config.review.includeSemanticContext,
    ensureContextIndexed: !fastMode,
    failOnAiReviewError: false,
    publishGithubReview: true,
    ...overrides,
  };
}
