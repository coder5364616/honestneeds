/**
 * Volunteer badge catalogue — mirrors backend `config/volunteerProgram.js`
 * VOLUNTEER_BADGES so we can render a badge code (string) with its name + icon.
 */

export interface VolunteerBadgeMeta {
  code: string
  name: string
  icon: string
  criteria: string
}

export const VOLUNTEER_BADGE_CATALOG: Record<string, VolunteerBadgeMeta> = {
  first_hour: { code: 'first_hour', name: 'First Hour', icon: '⏱️', criteria: '1 verified hour' },
  milestone_10_hours: { code: 'milestone_10_hours', name: '10 Hour Helper', icon: '🤝', criteria: '10 verified hours' },
  milestone_50_hours: { code: 'milestone_50_hours', name: '50 Hour Devotee', icon: '🌟', criteria: '50 verified hours' },
  milestone_100_hours: { code: 'milestone_100_hours', name: 'Century of Service', icon: '💯', criteria: '100 verified hours' },
  proof_of_kindness: { code: 'proof_of_kindness', name: 'Proven Kindness', icon: '💗', criteria: '1 verified proof of kindness' },
  kindness_champion: { code: 'kindness_champion', name: 'Kindness Champion', icon: '🏅', criteria: '10 verified proofs of kindness' },
  top_rated: { code: 'top_rated', name: 'Top Rated', icon: '⭐', criteria: 'avg rating ≥ 4.5 with ≥ 5 reviews' },
  consistent_volunteer: { code: 'consistent_volunteer', name: 'Consistent Volunteer', icon: '📆', criteria: '5 completed assignments' },
  hope_responder: { code: 'hope_responder', name: 'Hope Responder', icon: '🚨', criteria: 'verified Hope Responder' },
  community_champion: { code: 'community_champion', name: 'Community Champion', icon: '👑', criteria: 'reached Champion level' },
}

export function badgeMeta(code: string): VolunteerBadgeMeta {
  return VOLUNTEER_BADGE_CATALOG[code] ?? { code, name: code.replace(/_/g, ' '), icon: '🎖️', criteria: '' }
}
