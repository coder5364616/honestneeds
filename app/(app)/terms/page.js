'use client';

import PolicyLayout from '@/components/layout/PolicyLayout';

export default function TermsOfService() {
  return (
    <PolicyLayout title="Terms of Service" lastUpdated="May 2026">
      <h2>1. Acceptance of Terms</h2>
      <p>
        By accessing or using Honest Need (honestneed.com), you agree to be bound by these Terms of Service and all applicable laws. If you do not agree, do not use this platform.
      </p>

      <h2>2. Description of Service</h2>
      <p>
        Honest Need is a community crowdfunding and peer-support platform that allows users to create campaigns for financial support, volunteer help, business customer growth, and prayer support. The platform displays payment options; all financial transactions occur directly between users via third-party payment apps.
      </p>

      <h2>3. Platform Fees</h2>
      <ul>
        <li>Campaign creation: $20 per campaign</li>
        <li>Platform commission: 20% on share reward budgets and applicable transactions</li>
        <li>Withdrawal fee: 7% on fund withdrawals</li>
        <li>All fees are non-refundable unless otherwise stated in our Refund Policy</li>
      </ul>

      <h2>4. User Responsibilities</h2>
      <p>
        Users agree to: provide accurate information, use the platform lawfully, not create fraudulent campaigns, not harass other users, and comply with all applicable laws.
      </p>

      <h2>5. Payment Terms</h2>
      <p>
        Honest Need does not hold or process peer-to-peer donations. Campaign creation fees are processed via Stripe. Users are responsible for completing their own payment transactions via chosen third-party apps.
      </p>

      <h2>6. Prohibited Activities</h2>
      <p>
        Users may not use the platform for: fraud, money laundering, illegal activities, harassment, or any activity that violates Stripe&apos;s terms of service or applicable law.
      </p>

      <h2>7. Limitation of Liability</h2>
      <p>
        Honest Need Inc. is not responsible for the outcome of any peer-to-peer transaction. We are not liable for indirect, incidental, or consequential damages arising from use of the platform.
      </p>

      <h2>8. Termination</h2>
      <p>
        We reserve the right to suspend or terminate accounts that violate these terms at any time without notice.
      </p>

      <h2>9. Governing Law</h2>
      <p>
        These terms are governed by the laws of the State of California, USA.
      </p>

      <h2>10. Contact</h2>
      <p>
        Legal questions can be directed to:<br />
        Email: <strong>jbowser727@gmail.com</strong> | Phone: <strong>(209) 622-9391</strong><br />
        Honest Need Inc. | honestneed.com
      </p>
    </PolicyLayout>
  );
}
