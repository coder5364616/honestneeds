/**
 * Cause / Interest Catalogue (frontend mirror of backend src/config/causes.js).
 *
 * Powers the "Select interests/causes" onboarding step. `code` must stay in
 * sync with the backend — it is persisted on the user (preferences.interests)
 * and drives interest-based campaign matching.
 */

export interface Cause {
  code: string
  label: string
  icon: string
}

export const CAUSES: Cause[] = [
  { code: 'emergency', label: 'Emergency Relief', icon: '🚨' },
  { code: 'medical', label: 'Medical & Health', icon: '🏥' },
  { code: 'education', label: 'Education', icon: '🎓' },
  { code: 'family', label: 'Family & Children', icon: '👨‍👩‍👧' },
  { code: 'community', label: 'Community & Environment', icon: '🌍' },
  { code: 'business', label: 'Small Business', icon: '💼' },
  { code: 'individual', label: 'Individual Support', icon: '🤝' },
  { code: 'animals', label: 'Animals & Wildlife', icon: '🐾' },
]

export const CAUSE_CODES = CAUSES.map((c) => c.code)
