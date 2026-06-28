/**
 * Application form schemas (BU-06).
 *
 * The application form a volunteer fills in is chosen by the opportunity's
 * `category` (set by the business owner when posting it). Every category shares
 * a set of common fields; each adds its own category-specific questions so the
 * business owner collects exactly the details they need to vet an applicant.
 *
 * Standard fields (`message`, `relevant_skills`, `contact_email`,
 * `contact_phone`) map onto the dedicated columns of VolunteerApplication.
 * Everything else is submitted as `application_answers` — a self-describing
 * [{ key, label, value }] array the reviewer UI renders verbatim.
 */

import type { OpportunityCategory } from '@/types/business'

export type FieldType = 'text' | 'textarea' | 'tel' | 'email' | 'number' | 'select' | 'checkbox' | 'date'

export interface FormField {
  /** Stored answer key. Reserved keys map onto dedicated columns (see STANDARD_KEYS). */
  key: string
  label: string
  type: FieldType
  required?: boolean
  placeholder?: string
  helper?: string
  options?: string[]
  /** Min/max for number inputs. */
  min?: number
  max?: number
  maxLength?: number
}

/** Keys that map onto first-class VolunteerApplication columns, not application_answers. */
export const STANDARD_KEYS = ['contact_email', 'contact_phone', 'message', 'relevant_skills'] as const

// ─── Common fields shown for every category ──────────────────────────────────

const COMMON_FIELDS: FormField[] = [
  {
    key: 'contact_email',
    label: 'Contact email',
    type: 'email',
    required: true,
    placeholder: 'you@example.com',
  },
  {
    key: 'contact_phone',
    label: 'Contact phone',
    type: 'tel',
    placeholder: 'Optional — but speeds up coordination',
  },
  {
    key: 'availability',
    label: 'Your availability',
    type: 'text',
    required: true,
    placeholder: 'e.g. Weekday evenings & Saturdays',
  },
  {
    key: 'relevant_skills',
    label: 'Relevant skills',
    type: 'text',
    placeholder: 'Comma-separated, e.g. first-aid, driving, Spanish',
    helper: 'Separate each skill with a comma.',
  },
  {
    key: 'message',
    label: 'Why do you want to help?',
    type: 'textarea',
    required: true,
    placeholder: 'Tell the organiser a little about yourself and your motivation…',
    maxLength: 2000,
  },
]

// ─── Category-specific question sets ─────────────────────────────────────────

const CATEGORY_FIELDS: Record<OpportunityCategory, FormField[]> = {
  community_support: [
    { key: 'languages_spoken', label: 'Languages you speak', type: 'text', placeholder: 'e.g. English, Yoruba, French' },
    { key: 'has_own_transport', label: 'I have my own transport', type: 'checkbox' },
    { key: 'comfortable_physical', label: 'Comfortable with light physical work', type: 'checkbox' },
    {
      key: 'support_experience',
      label: 'Any community-support experience?',
      type: 'textarea',
      placeholder: 'Briefly describe any prior volunteering or caregiving experience.',
    },
  ],
  fundraising: [
    {
      key: 'fundraising_experience',
      label: 'Fundraising experience',
      type: 'select',
      required: true,
      options: ['None yet', 'Some (helped before)', 'Experienced', 'Professional'],
    },
    {
      key: 'network_reach',
      label: 'People you can realistically reach',
      type: 'number',
      min: 0,
      placeholder: 'e.g. 250',
      helper: 'Rough size of your personal/social network for outreach.',
    },
    {
      key: 'prior_amount_raised',
      label: 'Most you have helped raise before',
      type: 'text',
      placeholder: 'e.g. ₦150,000 / $500 / N/A',
    },
  ],
  event_staffing: [
    {
      key: 'available_dates',
      label: 'Dates you are available',
      type: 'text',
      required: true,
      placeholder: 'e.g. 12–14 July',
    },
    {
      key: 'role_preference',
      label: 'Preferred role',
      type: 'select',
      options: ['No preference', 'Registration / check-in', 'Crowd & guest support', 'Setup & teardown', 'Food & refreshments', 'Stage / tech'],
    },
    { key: 'tshirt_size', label: 'T-shirt size', type: 'select', options: ['XS', 'S', 'M', 'L', 'XL', 'XXL'] },
    { key: 'can_lift', label: 'I can lift up to 15kg / stand for long periods', type: 'checkbox' },
  ],
  skilled_professional: [
    { key: 'profession', label: 'Your profession / field', type: 'text', required: true, placeholder: 'e.g. Graphic designer' },
    {
      key: 'years_experience',
      label: 'Years of experience',
      type: 'number',
      min: 0,
      max: 60,
      required: true,
      placeholder: 'e.g. 5',
    },
    { key: 'portfolio_url', label: 'Portfolio / LinkedIn URL', type: 'text', placeholder: 'https://' },
    {
      key: 'certifications',
      label: 'Relevant certifications',
      type: 'textarea',
      placeholder: 'List any certifications or licences relevant to this role.',
    },
    {
      key: 'engagement_type',
      label: 'Engagement preference',
      type: 'select',
      options: ['Fully pro bono', 'Pro bono with expenses covered', 'Discounted rate'],
    },
  ],
  mentorship: [
    { key: 'area_of_expertise', label: 'Area of expertise', type: 'text', required: true, placeholder: 'e.g. Software, finance, careers' },
    {
      key: 'mentoring_experience',
      label: 'Mentoring experience',
      type: 'select',
      options: ['First time', 'Informal / occasional', 'Structured programmes before'],
    },
    {
      key: 'weekly_hours',
      label: 'Hours per week you can mentor',
      type: 'number',
      min: 0,
      max: 40,
      placeholder: 'e.g. 2',
    },
    {
      key: 'preferred_stage',
      label: 'Preferred mentee stage',
      type: 'select',
      options: ['No preference', 'Students', 'Early career', 'Founders / entrepreneurs', 'Career changers'],
    },
  ],
  logistics: [
    {
      key: 'drivers_license',
      label: 'Valid driver’s licence',
      type: 'select',
      required: true,
      options: ['No', 'Yes — car', 'Yes — van/truck', 'Yes — motorcycle'],
    },
    { key: 'can_operate_equipment', label: 'I can operate basic equipment (trolleys, pallet jacks)', type: 'checkbox' },
    { key: 'warehouse_experience', label: 'I have warehouse / inventory experience', type: 'checkbox' },
    {
      key: 'logistics_notes',
      label: 'Anything else about your logistics capability?',
      type: 'textarea',
      placeholder: 'Optional',
    },
  ],
  administrative: [
    {
      key: 'software_proficiency',
      label: 'Software you’re comfortable with',
      type: 'text',
      placeholder: 'e.g. Excel, Google Workspace, Canva',
    },
    {
      key: 'remote_setup',
      label: 'I have a reliable computer & internet for remote work',
      type: 'checkbox',
    },
    {
      key: 'hours_available',
      label: 'Hours per week available',
      type: 'number',
      min: 0,
      max: 40,
      placeholder: 'e.g. 6',
    },
    {
      key: 'admin_experience',
      label: 'Relevant administrative experience',
      type: 'textarea',
      placeholder: 'Optional — describe any prior admin/coordination work.',
    },
  ],
  other: [
    {
      key: 'additional_info',
      label: 'Anything else the organiser should know?',
      type: 'textarea',
      placeholder: 'Optional',
    },
  ],
}

/**
 * Full ordered field list for an opportunity category: common fields first,
 * then the category-specific questions.
 */
export function getApplicationForm(category: OpportunityCategory | undefined): FormField[] {
  const extra = (category && CATEGORY_FIELDS[category]) || CATEGORY_FIELDS.other
  return [...COMMON_FIELDS, ...extra]
}

export function isStandardKey(key: string): boolean {
  return (STANDARD_KEYS as readonly string[]).includes(key)
}
