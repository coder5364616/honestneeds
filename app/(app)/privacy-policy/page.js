'use client';

import PolicyLayout from '@/components/layout/PolicyLayout';

export default function PrivacyPolicy() {
  return (
    <PolicyLayout title="Privacy Policy" lastUpdated="May 2026">
      <h2>1. Information We Collect</h2>
      <ul>
        <li>Account information: name, email address, location</li>
        <li>Campaign data: titles, descriptions, goals, images</li>
        <li>Payment method display info: usernames, handles (NOT card numbers or bank details)</li>
        <li>Usage data: pages visited, actions taken, device type</li>
        <li>Communications: messages sent through the platform</li>
      </ul>

      <h2>2. How We Use Your Information</h2>
      <ul>
        <li>To operate and improve the Honest Need platform</li>
        <li>To display campaign information to the community</li>
        <li>To send transactional and promotional emails (you can opt out at any time)</li>
        <li>To detect fraud and maintain platform security</li>
        <li>To comply with legal obligations</li>
      </ul>

      <h2>3. Payment Information</h2>
      <p>
        Honest Need does NOT store, process, or transmit payment card numbers or full bank account details. The platform displays payment method usernames and handles (e.g., @username, $cashtag) to facilitate peer-to-peer transactions. All actual payments occur outside the Honest Need platform via third-party apps.
      </p>

      <h2>4. Information Sharing</h2>
      <p>
        We do not sell your personal information. We may share data with:
      </p>
      <ul>
        <li>Service providers who help us operate the platform (hosting, email)</li>
        <li>Law enforcement when required by law</li>
        <li>Other users as part of normal platform functionality (e.g., your campaign is visible to other users)</li>
      </ul>

      <h2>5. Data Retention</h2>
      <p>
        We retain your data for as long as your account is active or as needed to provide services. You may request deletion of your account and data at any time by emailing jbowser727@gmail.com.
      </p>

      <h2>6. Your Rights (GDPR/CCPA)</h2>
      <p>
        You have the right to: access, correct, delete, or export your data. To exercise these rights, contact jbowser727@gmail.com.
      </p>

      <h2>7. Cookies</h2>
      <p>
        We use essential cookies to operate the platform and analytics cookies to understand usage. You can disable cookies in your browser settings.
      </p>

      <h2>8. Children&apos;s Privacy</h2>
      <p>
        Honest Need is not intended for users under 13 years of age. We do not knowingly collect data from children under 13.
      </p>

      <h2>9. Contact</h2>
      <p>
        Privacy questions can be directed to:<br />
        Email: <strong>jbowser727@gmail.com</strong><br />
        Phone: <strong>(209) 622-9391</strong>
      </p>
    </PolicyLayout>
  );
}
