import { z } from 'zod'

/**
 * Authentication Validation Schemas
 * All schemas use Zod for client-side validation
 */

// Helper schemas
const emailSchema = z.string().email('Invalid email address').toLowerCase()

const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/\d/, 'Password must contain at least one digit')
  .regex(/[!@#$%^&*]/, 'Password must contain at least one special character (!@#$%^&*)')

const nameSchema = z
  .string()
  .min(2, 'Name must be at least 2 characters')
  .max(100, 'Name must not exceed 100 characters')
  .trim()

// ============================================
// LOGIN SCHEMA
// ============================================
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
})

export type LoginFormData = z.infer<typeof loginSchema>

// ============================================
// REGISTER SCHEMA
// ============================================
export const registerSchema = z
  .object({
    email: emailSchema,
    displayName: nameSchema,
    password: passwordSchema,
    confirmPassword: z.string(),
    acceptTerms: z.boolean().refine((val) => val === true, {
      message: 'You must accept the terms and conditions',
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

export type RegisterFormData = z.infer<typeof registerSchema>

// ============================================
// FORGOT PASSWORD SCHEMA
// ============================================
export const forgotPasswordSchema = z.object({
  email: emailSchema,
})

export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>

// ============================================
// RESET PASSWORD SCHEMA
// ============================================
export const resetPasswordSchema = z
  .object({
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>

// ============================================
// PASSWORD STRENGTH CHECKER
// ============================================
export interface PasswordStrength {
  score: number // 0-4 (weak, fair, good, strong, very strong)
  label: string
  color: string
  feedback: string
}

export function evaluatePasswordStrength(password: string): PasswordStrength {
  let score = 0
  const feedback: string[] = []

  if (!password) {
    return {
      score: 0,
      label: 'No password',
      color: 'bg-gray-300',
      feedback: 'Enter a password',
    }
  }

  // Length check
  if (password.length >= 8) score++
  if (password.length >= 12) score++
  else feedback.push('Use at least 12 characters')

  // Character variety checks
  if (/[a-z]/.test(password)) score++
  else feedback.push('Add lowercase letters')

  if (/[A-Z]/.test(password)) score++
  else feedback.push('Add uppercase letters')

  if (/\d/.test(password)) score++
  else feedback.push('Add numbers')

  if (/[!@#$%^&*]/.test(password)) score++
  else feedback.push('Add special characters')

  // Cap the score at 5 for our 0-4 scale
  const finalScore = Math.min(Math.floor(score / 1.5), 4)

  const strengthLevels: PasswordStrength[] = [
    {
      score: 0,
      label: 'Very Weak',
      color: 'bg-red-500',
      feedback: feedback.join(', ') || 'Password is too weak',
    },
    {
      score: 1,
      label: 'Weak',
      color: 'bg-orange-500',
      feedback: feedback.join(', ') || 'Password is weak',
    },
    {
      score: 2,
      label: 'Fair',
      color: 'bg-yellow-500',
      feedback: feedback.join(', ') || 'Password is fair',
    },
    {
      score: 3,
      label: 'Good',
      color: 'bg-blue-500',
      feedback: 'Password is good',
    },
    {
      score: 4,
      label: 'Strong',
      color: 'bg-green-500',
      feedback: 'Password is strong',
    },
  ]

  return strengthLevels[finalScore]
}

// ============================================
// CAMPAIGN CREATION SCHEMAS
// ============================================

// Campaign Type (Step 1)
export const campaignTypeSchema = z.enum(['fundraising', 'sharing'])
export type CampaignType = z.infer<typeof campaignTypeSchema>

// Basic Info (Step 2)
export const campaignBasicInfoSchema = z.object({
  title: z
    .string()
    .min(5, 'Title must be at least 5 characters')
    .max(200, 'Title must not exceed 200 characters')
    .trim(),
  description: z
    .string()
    .min(20, 'Description must be at least 20 characters')
    .max(30000, 'Description must not exceed 30000 characters')
    .trim(),
  category: z.string().min(1, 'Category is required'),
  location: z.string().optional().default(''),
  imageFile: z
    .instanceof(File)
    .optional()
    .refine(
      (file) => !file || file.size <= 10 * 1024 * 1024,
      'Image must be less than 10MB'
    )
    .refine(
      (file) => !file || ['image/jpeg', 'image/png', 'image/webp'].includes(file.type),
      'Image must be JPEG, PNG, or WebP'
    ),
})

export type CampaignBasicInfoFormData = z.infer<typeof campaignBasicInfoSchema>

// Payment Methods (for Fundraising)
export const paymentMethodSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('venmo'),
    username: z.string().min(1, 'Venmo username is required').regex(/^@/, 'Must start with @'),
  }),
  z.object({
    type: z.literal('paypal'),
    email: z.string().email('Valid PayPal email is required'),
  }),
  z.object({
    type: z.literal('cashapp'),
    cashtag: z.string().min(1, 'CashApp tag is required').regex(/^\$/, 'Must start with $'),
  }),
  z.object({
    type: z.literal('bank'),
    routingNumber: z.string().regex(/^\d{9}$/, 'Routing number must be 9 digits'),
    accountNumber: z.string().regex(/^\d{9,17}$/, 'Account number must be 9-17 digits'),
  }),
  z.object({
    type: z.literal('crypto'),
    walletAddress: z.string().min(10, 'Valid crypto wallet address required'),
    cryptoType: z.enum(['bitcoin', 'ethereum', 'usdc', 'other']),
  }),
  z.object({
    type: z.literal('other'),
    details: z.string().min(5, 'Payment details must be at least 5 characters'),
  }),
])

export type PaymentMethod = z.infer<typeof paymentMethodSchema>

// Fundraising Campaign (Step 3)
export const fundraisingCampaignSchema = z.object({
  campaignType: z.literal('fundraising'),
  goalAmount: z
    .number()
    .min(1, 'Goal amount must be at least $1')
    .max(1000000, 'Goal amount cannot exceed $1,000,000'),
  category: z.string().min(1, 'Category is required'),
  tags: z
    .array(z.string())
    .max(10, 'Maximum 10 tags allowed')
    .optional()
    .default([]),
  duration: z
    .number()
    .min(7, 'Campaign duration must be at least 7 days')
    .max(365, 'Campaign duration cannot exceed 365 days'),
  paymentMethods: z
    .array(paymentMethodSchema)
    .min(1, 'At least one payment method is required')
    .max(6, 'Maximum 6 payment methods allowed'),
})

export type FundraisingCampaignFormData = z.infer<typeof fundraisingCampaignSchema>

// Sharing Campaign (Step 3)
export const sharingCampaignSchema = z.object({
  campaignType: z.literal('sharing'),
  meterType: z
    .enum(['impression_meter', 'engagement_meter', 'conversion_meter', 'custom_meter'])
    .refine((val) => val, { message: 'Please select a sharing meter' }),
  platforms: z
    .array(z.string())
    .min(1, 'Select at least one platform')
    .max(8, 'Maximum 8 platforms allowed'),
  rewardPerShare: z
    .number()
    .min(0.1, 'Reward per share must be at least $0.10')
    .max(100, 'Reward per share cannot exceed $100'),
  budget: z
    .number()
    .min(10, 'Budget must be at least $10')
    .max(1000000, 'Budget cannot exceed $1,000,000'),
  maxShares: z.number().int('Max shares must be a whole number').optional(),
})

export type SharingCampaignFormData = z.infer<typeof sharingCampaignSchema>

// Complete Campaign Creation (for final submission)
export const campaignCreationSchema = z.object({
  title: z
    .string()
    .min(5, 'Title must be at least 5 characters')
    .max(200, 'Title must not exceed 200 characters'),
  description: z
    .string()
    .min(20, 'Description must be at least 20 characters')
    .max(30000, 'Description must not exceed 30000 characters'),
  category: z.string().min(1, 'Category is required'),
  location: z.string().optional().default(''),
})

// Discriminated union for campaign type-specific fields
export const completeCampaignSchema = campaignCreationSchema.and(
  z.discriminatedUnion('campaignType', [fundraisingCampaignSchema, sharingCampaignSchema])
)

export type CompleteCampaignFormData = z.infer<typeof completeCampaignSchema>

// ============================================
// CAMPAIGN HELPER FUNCTIONS
// ============================================
// CAMPAIGN CATEGORIES (100+ organized in 10 groups)
// ============================================

export interface CategoryGroup {
  id: string
  name: string
  description: string
  icon: string
  categories: Array<{
    id: string
    name: string
    description: string
  }>
}

export const CAMPAIGN_CATEGORY_GROUPS: CategoryGroup[] = [
  {
    id: 'health-medical',
    name: 'Health & Medical',
    description: 'Medical treatments, health emergencies, wellness initiatives',
    icon: 'Heart',
    categories: [
      { id: 'medical-emergency', name: 'Medical Emergency', description: 'Urgent medical treatment or surgery' },
      { id: 'cancer-treatment', name: 'Cancer Treatment', description: 'Cancer diagnosis and treatment costs' },
      { id: 'mental-health', name: 'Mental Health', description: 'Mental health treatment and therapy' },
      { id: 'physical-therapy', name: 'Physical Therapy', description: 'Physical rehabilitation and therapy' },
      { id: 'dental-care', name: 'Dental Care', description: 'Dental procedures and orthodontics' },
      { id: 'vision-care', name: 'Vision Care', description: 'Eye surgery, glasses, contacts' },
      { id: 'disability-support', name: 'Disability Support', description: 'Equipment and support for disabilities' },
      { id: 'medication-costs', name: 'Medication Costs', description: 'Essential prescription medications' },
      { id: 'hospital-bills', name: 'Hospital Bills', description: 'Hospital and emergency room bills' },
      { id: 'reproductive-health', name: 'Reproductive Health', description: 'Fertility, pregnancy, and related care' },
      { id: 'mobility-aids', name: 'Mobility Aids', description: 'Wheelchairs, walkers, and mobility equipment' },
      { id: 'hearing-aids', name: 'Hearing Aids', description: 'Hearing aids and audiology services' },
    ],
  },
  {
    id: 'education-learning',
    name: 'Education & Learning',
    description: 'Tuition, school supplies, educational programs',
    icon: 'BookOpen',
    categories: [
      { id: 'tuition-college', name: 'College Tuition', description: 'University and college education costs' },
      { id: 'tuition-k12', name: 'K-12 Tuition', description: 'Private school and elementary tuition' },
      { id: 'vocational-training', name: 'Vocational Training', description: 'Trade schools and certification programs' },
      { id: 'student-loans', name: 'Student Loans', description: 'School debt and student loan repayment' },
      { id: 'school-supplies', name: 'School Supplies', description: 'Books, uniforms, and classroom supplies' },
      { id: 'study-abroad', name: 'Study Abroad', description: 'International education programs' },
      { id: 'exam-prep', name: 'Exam Prep', description: 'Test preparation courses and tutoring' },
      { id: 'art-music-lessons', name: 'Art & Music Lessons', description: 'Private lessons and artistic training' },
      { id: 'language-courses', name: 'Language Courses', description: 'Language learning programs' },
      { id: 'online-education', name: 'Online Education', description: 'Online courses and certifications' },
      { id: 'special-education', name: 'Special Education', description: 'Specialized learning support and therapy' },
      { id: 'tech-bootcamp', name: 'Tech Bootcamp', description: 'Coding and technology training programs' },
    ],
  },
  {
    id: 'housing-living',
    name: 'Housing & Living',
    description: 'Housing support, rent, homelessness prevention',
    icon: 'Home',
    categories: [
      { id: 'emergency-rent', name: 'Emergency Rent', description: 'Immediate rental assistance' },
      { id: 'mortgage-help', name: 'Mortgage Help', description: 'Mortgage payment assistance' },
      { id: 'security-deposit', name: 'Security Deposit', description: 'First month rent and security deposit' },
      { id: 'homelessness-prevention', name: 'Homelessness Prevention', description: 'Housing security programs' },
      { id: 'home-repair', name: 'Home Repair', description: 'Essential home repairs and maintenance' },
      { id: 'home-improvement', name: 'Home Improvement', description: 'Housing upgrades and renovations' },
      { id: 'utilities', name: 'Utilities', description: 'Electricity, water, heating bills' },
      { id: 'internet-phone', name: 'Internet & Phone', description: 'Connectivity services' },
      { id: 'furniture-appliances', name: 'Furniture & Appliances', description: 'Household furniture and appliances' },
      { id: 'moving-costs', name: 'Moving Costs', description: 'Moving and relocation expenses' },
      { id: 'temporary-housing', name: 'Temporary Housing', description: 'Transitional housing support' },
      { id: 'accessible-housing', name: 'Accessible Housing', description: 'Accessible living modifications' },
    ],
  },
  {
    id: 'food-nutrition',
    name: 'Food & Nutrition',
    description: 'Food security, meals, nutrition programs',
    icon: 'Apple',
    categories: [
      { id: 'emergency-food', name: 'Emergency Food', description: 'Immediate food assistance' },
      { id: 'food-security', name: 'Food Security', description: 'Long-term food assistance programs' },
      { id: 'school-meals', name: 'School Meals', description: 'Free and reduced lunch programs' },
      { id: 'senior-meals', name: 'Senior Meals', description: 'Meals for seniors' },
      { id: 'community-kitchen', name: 'Community Kitchen', description: 'Communal cooking facilities' },
      { id: 'nutrition-program', name: 'Nutrition Program', description: 'Nutrition education and support' },
      { id: 'farmers-market', name: 'Farmers Market', description: 'Access to fresh produce' },
      { id: 'restaurant-support', name: 'Restaurant Support', description: 'Local restaurant support initiatives' },
      { id: 'food-delivery-elderly', name: 'Food Delivery for Elderly', description: 'Meal delivery for seniors' },
      { id: 'food-allergy-support', name: 'Food Allergy Support', description: 'Special dietary needs support' },
    ],
  },
  {
    id: 'family-personal',
    name: 'Family & Personal',
    description: 'Family support, childcare, personal needs',
    icon: 'Users',
    categories: [
      { id: 'childcare', name: 'Childcare', description: 'Daycare and childcare services' },
      { id: 'after-school-programs', name: 'After-School Programs', description: 'Youth programs and activities' },
      { id: 'emergency-childcare', name: 'Emergency Childcare', description: 'Emergency child supervision' },
      { id: 'funeral-expenses', name: 'Funeral Expenses', description: 'Burial and memorial services' },
      { id: 'adoption-costs', name: 'Adoption Costs', description: 'Family adoption expenses' },
      { id: 'parenting-support', name: 'Parenting Support', description: 'Parenting classes and counseling' },
      { id: 'child-support', name: 'Child Support', description: 'Dependent child support' },
      { id: 'senior-care', name: 'Senior Care', description: 'Elder care and assisted living' },
      { id: 'caregiver-support', name: 'Caregiver Support', description: 'Support for family caregivers' },
      { id: 'pet-care', name: 'Pet Care', description: 'Pet medical care and support' },
      { id: 'domestic-violence-support', name: 'Domestic Violence Support', description: 'Shelter and support services' },
      { id: 'lgbtq-support', name: 'LGBTQ+ Support', description: 'LGBTQ+ community resources' },
    ],
  },
  {
    id: 'community-social',
    name: 'Community & Social',
    description: 'Community organizations, social services, civic projects',
    icon: 'Users',
    categories: [
      { id: 'food-bank', name: 'Food Bank', description: 'Community food pantry operations' },
      { id: 'homeless-shelter', name: 'Homeless Shelter', description: 'Homeless services and housing' },
      { id: 'community-center', name: 'Community Center', description: 'Local community facilities' },
      { id: 'youth-programs', name: 'Youth Programs', description: 'Youth development initiatives' },
      { id: 'senior-programs', name: 'Senior Programs', description: 'Senior citizen programming' },
      { id: 'immigrant-support', name: 'Immigrant Support', description: 'Immigration and integration services' },
      { id: 'refugee-support', name: 'Refugee Support', description: 'Refugee resettlement and support' },
      { id: 'tutoring-mentoring', name: 'Tutoring & Mentoring', description: 'Academic support and mentorship' },
      { id: 'sports-recreation', name: 'Sports & Recreation', description: 'Community sports and recreation' },
      { id: 'environmental-projects', name: 'Environmental Projects', description: 'Community environmental initiatives' },
      { id: 'cultural-events', name: 'Cultural Events', description: 'Community cultural programming' },
      { id: 'disaster-relief', name: 'Disaster Relief', description: 'Emergency disaster assistance' },
    ],
  },
  {
    id: 'business-entrepreneurship',
    name: 'Business & Entrepreneurship',
    description: 'Business startups, entrepreneurship, small business support',
    icon: 'Briefcase',
    categories: [
      { id: 'startup-funding', name: 'Startup Funding', description: 'New business venture capital' },
      { id: 'business-equipment', name: 'Business Equipment', description: 'Tools and machinery for business' },
      { id: 'business-training', name: 'Business Training', description: 'Entrepreneurship education' },
      { id: 'franchise-startup', name: 'Franchise Startup', description: 'Franchise business investment' },
      { id: 'small-business-loan', name: 'Small Business Loan', description: 'Business loans and financing' },
      { id: 'retail-store-setup', name: 'Retail Store Setup', description: 'Retail business establishment' },
      { id: 'online-store', name: 'Online Store', description: 'E-commerce business launch' },
      { id: 'restaurant-cafe', name: 'Restaurant/Café', description: 'Food business startup' },
      { id: 'service-business', name: 'Service Business', description: 'Service industry startup' },
      { id: 'farming-agriculture', name: 'Farming & Agriculture', description: 'Agricultural business operations' },
      { id: 'women-entrepreneurs', name: 'Women Entrepreneurs', description: 'Support for women-owned businesses' },
      { id: 'minority-business', name: 'Minority Business', description: 'Support for minority entrepreneurs' },
    ],
  },
  {
    id: 'creative-arts',
    name: 'Creative & Arts',
    description: 'Art, music, film, creative projects',
    icon: 'Palette',
    categories: [
      { id: 'music-album', name: 'Music Album', description: 'Music recording and production' },
      { id: 'film-production', name: 'Film Production', description: 'Documentary or film project' },
      { id: 'art-exhibition', name: 'Art Exhibition', description: 'Art show and gallery space' },
      { id: 'theater-production', name: 'Theater Production', description: 'Theater show and performance' },
      { id: 'podcast-production', name: 'Podcast Production', description: 'Podcast creation and distribution' },
      { id: 'book-publishing', name: 'Book Publishing', description: 'Self-publishing a book' },
      { id: 'artist-residency', name: 'Artist Residency', description: 'Creative residency program' },
      { id: 'craft-project', name: 'Craft Project', description: 'Handmade crafts and goods' },
      { id: 'photography-exhibit', name: 'Photography Exhibit', description: 'Photography show and prints' },
      { id: 'video-series', name: 'Video Series', description: 'Digital video content creation' },
      { id: 'game-development', name: 'Game Development', description: 'Indie video game creation' },
      { id: 'graphic-design', name: 'Graphic Design', description: 'Design services and projects' },
    ],
  },
  {
    id: 'environment-causes',
    name: 'Environment & Causes',
    description: 'Environmental conservation, activism, social causes',
    icon: 'Leaf',
    categories: [
      { id: 'environmental-conservation', name: 'Environmental Conservation', description: 'Wildlife and habitat protection' },
      { id: 'clean-energy', name: 'Clean Energy', description: 'Renewable energy initiatives' },
      { id: 'ocean-cleanup', name: 'Ocean Cleanup', description: 'Marine pollution and cleanup' },
      { id: 'forest-restoration', name: 'Forest Restoration', description: 'Reforestation and tree planting' },
      { id: 'animal-rescue', name: 'Animal Rescue', description: 'Animal welfare and rescue' },
      { id: 'climate-action', name: 'Climate Action', description: 'Climate change initiatives' },
      { id: 'sustainability', name: 'Sustainability', description: 'Sustainable living programs' },
      { id: 'human-rights', name: 'Human Rights', description: 'Human rights advocacy' },
      { id: 'social-justice', name: 'Social Justice', description: 'Social justice movements' },
      { id: 'animal-sanctuaries', name: 'Animal Sanctuaries', description: 'Wildlife protection and sanctuaries' },
      { id: 'advocacy-campaigns', name: 'Advocacy Campaigns', description: 'Social and political advocacy' },
      { id: 'international-aid', name: 'International Aid', description: 'Global aid and development' },
    ],
  },
  {
    id: 'technology-innovation',
    name: 'Technology & Innovation',
    description: 'Tech startups, innovation projects, digital transformation',
    icon: 'Zap',
    categories: [
      { id: 'software-development', name: 'Software Development', description: 'Tech application development' },
      { id: 'hardware-startup', name: 'Hardware Startup', description: 'Physical technology products' },
      { id: 'iot-project', name: 'IoT Project', description: 'Internet of Things development' },
      { id: 'ai-ml-research', name: 'AI/ML Research', description: 'Artificial intelligence projects' },
      { id: 'cybersecurity', name: 'Cybersecurity', description: 'Security software and services' },
      { id: 'blockchain-crypto', name: 'Blockchain/Crypto', description: 'Blockchain technology projects' },
      { id: 'web3-nft', name: 'Web3/NFT', description: 'Web3 and NFT projects' },
      { id: 'vr-ar-tech', name: 'VR/AR Technology', description: 'Virtual and augmented reality' },
      { id: 'drone-technology', name: 'Drone Technology', description: 'Drone and robotics projects' },
      { id: 'health-tech', name: 'Health Tech', description: 'Digital health and medical tech' },
    ],
  },
]

// Flat list for easy category validation (all flattened IDs)
export const CAMPAIGN_CATEGORIES = CAMPAIGN_CATEGORY_GROUPS.flatMap((group) =>
  group.categories.map((cat) => cat.id)
)

// Alphabetized, human-readable category options for dropdowns/search, with a
// catch-all 'Other' kept at the end. Used by the campaign wizard basic-info step.
export const CAMPAIGN_CATEGORY_OPTIONS: Array<{ id: string; name: string }> = [
  ...CAMPAIGN_CATEGORY_GROUPS.flatMap((group) =>
    group.categories.map((cat) => ({ id: cat.id, name: cat.name }))
  ).sort((a, b) => a.name.localeCompare(b.name)),
  { id: 'other', name: 'Other' },
]

export const PAYMENT_METHOD_TYPES = [
  { id: 'venmo', name: 'Venmo', description: '@username' },
  { id: 'paypal', name: 'PayPal', description: 'email@example.com' },
  { id: 'cashapp', name: 'Cash App', description: '$cashtag' },
  { id: 'bank', name: 'Bank Transfer', description: 'Routing & Account' },
  { id: 'crypto', name: 'Cryptocurrency', description: 'Wallet address' },
  { id: 'other', name: 'Other', description: 'Custom payment method' },
]

export const SHARING_PLATFORMS = [
  { id: 'facebook', name: 'Facebook', icon: 'Facebook' },
  { id: 'twitter', name: 'Twitter/X', icon: 'Twitter' },
  { id: 'instagram', name: 'Instagram', icon: 'Instagram' },
  { id: 'tiktok', name: 'TikTok', icon: 'Music' },
  { id: 'linkedin', name: 'LinkedIn', icon: 'Linkedin' },
  { id: 'whatsapp', name: 'WhatsApp', icon: 'MessageCircle' },
  { id: 'telegram', name: 'Telegram', icon: 'Send' },
  { id: 'email', name: 'Email', icon: 'Mail' },
]

export const CRYPTO_TYPES = [
  { id: 'bitcoin', name: 'Bitcoin', symbol: 'BTC' },
  { id: 'ethereum', name: 'Ethereum', symbol: 'ETH' },
  { id: 'usdc', name: 'USDC', symbol: 'USDC' },
  { id: 'other', name: 'Other', symbol: 'OTHER' },
]

// ============================================
// DONATION SCHEMAS
// ============================================

// Step 1: Amount Selection
export const donationAmountSchema = z.object({
  amount: z
    .number()
    .min(1, 'Donation amount must be at least $1')
    .max(10000, 'Donation amount cannot exceed $10,000'),
})

export type DonationAmountFormData = z.infer<typeof donationAmountSchema>

// Step 2: Payment Method Selection
export const donationPaymentMethodSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('venmo'),
    username: z
      .string()
      .min(1, 'Venmo username is required')
      .regex(/^@?[\w-]+$/, 'Invalid Venmo username format'),
  }),
  z.object({
    type: z.literal('paypal'),
    email: z.string().email('Valid PayPal email is required'),
  }),
  z.object({
    type: z.literal('cashapp'),
    cashtag: z
      .string()
      .min(1, 'CashApp tag is required')
      .regex(/^\$?[\w-]+$/, 'Invalid CashApp tag format'),
  }),
  z.object({
    type: z.literal('bank'),
    routingNumber: z.string().regex(/^\d{9}$/, 'Routing number must be 9 digits'),
    accountNumber: z.string().regex(/^\d{9,17}$/, 'Account number must be 9-17 digits'),
  }),
  z.object({
    type: z.literal('crypto'),
    walletAddress: z.string().min(10, 'Valid crypto wallet address required'),
    cryptoType: z.enum(['bitcoin', 'ethereum', 'usdc', 'other']),
  }),
  z.object({
    type: z.literal('other'),
    details: z.string().min(5, 'Payment details must be at least 5 characters'),
  }),
])

export type DonationPaymentMethod = z.infer<typeof donationPaymentMethodSchema>

// Step 3: Confirmation
export const donationConfirmationSchema = z.object({
  screenshotProof: z
    .instanceof(File)
    .optional()
    .refine(
      (file) => !file || file.size <= 5 * 1024 * 1024,
      'Screenshot must be less than 5MB'
    )
    .refine(
      (file) => !file || ['image/jpeg', 'image/png', 'image/webp'].includes(file.type),
      'Screenshot must be JPEG, PNG, or WebP'
    ),
  agreePaymentSent: z.boolean().refine((val) => val === true, {
    message: 'You must confirm that you have sent the payment',
  }),
})

export type DonationConfirmationFormData = z.infer<typeof donationConfirmationSchema>

// Complete Donation (for final submission)
export const completeDonationSchema = z.object({
  campaignId: z.string().min(1, 'Campaign ID is required'),
  amount: z.number().min(1).max(10000),
  paymentMethod: donationPaymentMethodSchema,
  screenshotProof: z.instanceof(File).optional(),
  agreePaymentSent: z.boolean(),
})

export type CompleteDonationFormData = z.infer<typeof completeDonationSchema>

// ── Canonical donation fee rate (F-9) ──────────────────────────────────────
// Mirrors the backend feeEngine.DONATION_FEE_RATE. Keep these in sync; this is
// the single place the frontend defines the donation fee percentage.
export const DONATION_FEE_RATE = 0.05
export const DONATION_FEE_PERCENT = Math.round(DONATION_FEE_RATE * 100)

// Currency Utility Functions
export const currencyUtils = {
  formatCurrency: (cents: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(cents / 100)
  },

  parseCurrency: (dollars: number): number => {
    return Math.round(dollars * 100)
  },

  calculateFee: (amountInDollars: number): { gross: number; fee: number; net: number } => {
    const gross = amountInDollars
    const fee = Number((gross * DONATION_FEE_RATE).toFixed(2))
    const net = Number((gross - fee).toFixed(2))
    return { gross, fee, net }
  },

  parseFromString: (valueStr: string): number => {
    const num = parseFloat(valueStr.replace(/[^\d.]/g, ''))
    return isNaN(num) ? 0 : num
  },
}

// ============================================
// SWEEPSTAKES SCHEMAS
// ============================================

export const claimPrizeSchema = z.object({
  drawingId: z.string().optional(),
  paymentMethod: donationPaymentMethodSchema,
})

export type ClaimPrizeFormData = z.infer<typeof claimPrizeSchema>

export const sweepstakesEntrySchema = z.object({
  campaignId: z.string().optional(),
  entryType: z.enum(['campaign_creation', 'donation', 'share']),
  amount: z.number().positive().optional(),
})

export type SweepstakesEntryFormData = z.infer<typeof sweepstakesEntrySchema>

// ============================================
// SWEEPSTAKES CONSTANTS
// ============================================

export const SWEEPSTAKES_ENTRY_VALUES = {
  campaign_creation: 1,
  donation: 1, // 1 entry per $10 donated (handled server-side for display)
  share: 1, // 1 entry per share
} as const

export const SWEEPSTAKES_STATUS = [
  { id: 'active', label: 'Active', color: 'bg-blue-100 text-blue-800' },
  { id: 'not_won', label: 'Not Won', color: 'bg-gray-100 text-gray-800' },
  { id: 'won_unclaimed', label: 'Won (Unclaimed)', color: 'bg-yellow-100 text-yellow-800' },
  { id: 'won_claimed', label: 'Won (Claimed)', color: 'bg-green-100 text-green-800' },
] as const

// ============================================
// VOLUNTEER / HELPING HANDS SCHEMAS
// ============================================

// Volunteer Skill Entry
export const volunteerSkillSchema = z.object({
  name: z
    .string()
    .min(2, 'Skill name must be at least 2 characters')
    .max(50, 'Skill name must not exceed 50 characters'),
  yearsOfExperience: z
    .any()
    .transform((val) => {
      if (val === null || val === undefined || val === '') return undefined
      const num = typeof val === 'string' ? parseInt(val, 10) : Number(val)
      return isNaN(num) ? undefined : num
    })
    .refine((val) => val === undefined || (typeof val === 'number' && val >= 0 && val <= 70), {
      message: 'Years must be between 0 and 70',
    })
    .optional(),
})

export type VolunteerSkill = z.infer<typeof volunteerSkillSchema>

// Volunteer Availability
export const volunteerAvailabilitySchema = z.object({
  startDate: z
    .string()
    .refine((date) => new Date(date) > new Date(), 'Start date must be in the future'),
  endDate: z.string(),
  hoursPerWeek: z
    .any()
    .transform((val) => {
      if (val === null || val === undefined || val === '') return 1
      const num = typeof val === 'string' ? parseInt(val, 10) : Number(val)
      return isNaN(num) ? 1 : num
    })
    .refine((val) => typeof val === 'number' && val >= 1 && val <= 168, {
      message: 'Hours must be between 1 and 168',
    }),
}).refine(
  (data) => new Date(data.endDate) > new Date(data.startDate),
  { message: 'End date must be after start date', path: ['endDate'] }
)

export type VolunteerAvailability = z.infer<typeof volunteerAvailabilitySchema>

// Volunteer Offer Schema
export const volunteerOfferSchema = z.object({
  title: z
    .string()
    .min(5, 'Title must be at least 5 characters')
    .max(100, 'Title must not exceed 100 characters'),
  description: z
    .string()
    .min(20, 'Description must be at least 20 characters')
    .max(1000, 'Description must not exceed 1000 characters'),
  offerType: z
    .enum(['fundraising', 'community_support', 'direct_assistance', 'other'])
    .refine((val) => val, { message: 'Please select an offer type' }),
  skillsOffered: z
    .array(volunteerSkillSchema)
    .min(1, 'Please add at least one skill')
    .max(10, 'Maximum 10 skills allowed'),
  availability: volunteerAvailabilitySchema,
  estimatedHours: z
    .any()
    .transform((val) => {
      if (val === null || val === undefined || val === '') return undefined
      const num = typeof val === 'string' ? parseFloat(val) : Number(val)
      return isNaN(num) ? undefined : num
    })
    .refine((val) => val !== undefined && val >= 0.5 && val <= 500, {
      message: 'Estimated hours must be between 0.5 and 500',
    }),
  experienceLevel: z
    .enum(['beginner', 'intermediate', 'expert'])
    .refine((val) => val, { message: 'Please select your experience level' }),
  contactDetails: z.object({
    email: z
      .string()
      .email('Invalid email address')
      .min(1, 'Email is required')
      .max(255, 'Email must not exceed 255 characters'),
    phone: z
      .string()
      .min(10, 'Phone number must be at least 10 digits')
      .max(20, 'Phone number must not exceed 20 characters')
      .refine((val) => /^[\d\s\-\+\(\)]+$/.test(val), 'Invalid phone number format'),
  }),
})

export type VolunteerOfferFormData = z.infer<typeof volunteerOfferSchema>

// Volunteer Status
export const VOLUNTEER_STATUSES = [
  { id: 'pending', label: 'Pending', color: 'bg-yellow-100 text-yellow-800', icon: 'Clock' },
  { id: 'accepted', label: 'Accepted', color: 'bg-green-100 text-green-800', icon: 'CheckCircle' },
  { id: 'declined', label: 'Declined', color: 'bg-red-100 text-red-800', icon: 'XCircle' },
  { id: 'completed', label: 'Completed', color: 'bg-purple-100 text-purple-800', icon: 'Zap' },
] as const

// ============================================
// GEOGRAPHIC SCOPE SYSTEM
// ============================================

export type GeographicScope = 'local' | 'regional' | 'national' | 'global'

export const geographicScopeSchema = z.enum(['local', 'regional', 'national', 'global'])

export const GEOGRAPHIC_SCOPES = [
  {
    id: 'local',
    label: 'Local',
    description: 'Community/neighborhood level (5-10 mile radius)',
    icon: 'MapPin',
    radius: 5,
  },
  {
    id: 'regional',
    label: 'Regional',
    description: 'City/county level (25-50 mile radius)',
    icon: 'Map',
    radius: 25,
  },
  {
    id: 'national',
    label: 'National',
    description: 'State or multi-state level',
    icon: 'Globe',
    radius: null,
  },
  {
    id: 'global',
    label: 'Global',
    description: 'Anywhere worldwide',
    icon: 'Planet',
    radius: null,
  },
] as const

export type GeographicScopeOption = (typeof GEOGRAPHIC_SCOPES)[number]

// Campaign Geographic Info Schema
export const campaignGeographicSchema = z.object({
  geographicScope: geographicScopeSchema,
  location: z
    .string()
    .min(2, 'Location must be at least 2 characters')
    .max(100, 'Location must not exceed 100 characters')
    .optional()
    .default(''),
  scopeDescription: z
    .string()
    .max(200, 'Scope description must not exceed 200 characters')
    .optional()
    .default(''),
})
