'use client';

import PolicyLayout from '@/components/layout/PolicyLayout';

export default function CookiePolicy() {
  return (
    <PolicyLayout title="Cookie Policy" lastUpdated="May 2026">
      <h2>1. What Are Cookies</h2>
      <p>
        Cookies are small text files placed on your device by websites you visit. They are widely used to make websites work more efficiently, as well as to provide reporting information to site owners.
      </p>

      <h2>2. Types of Cookies We Use</h2>
      <ul>
        <li>
          <strong>Essential Cookies:</strong> These are strictly necessary for the core functionality of Honest Need, such as user authentication, session security, and preferences setup. The site cannot function properly without these cookies.
        </li>
        <li>
          <strong>Performance &amp; Analytics Cookies:</strong> We use analytical tools to understand how users interact with our platform, track page performance, and detect loading issues. This data is fully aggregated and anonymous.
        </li>
        <li>
          <strong>Functional Cookies:</strong> These remember your selections and preferences, such as saved filters, preferred views, or whether you have acknowledged specific alerts, providing a smoother experience.
        </li>
      </ul>

      <h2>3. Third-Party Services</h2>
      <p>
        Some third-party integrations we use, such as Stripe for payment processing and analytics providers, may place cookies on your browser. These third-party cookies are governed by the respective privacy policies of those providers.
      </p>

      <h2>4. Managing and Disabling Cookies</h2>
      <p>
        Most web browsers allow you to control or block cookies through their settings menu. Please note that disabling essential cookies may impact your ability to log in or use certain parts of the Honest Need platform.
      </p>

      <h2>5. Updates to this Policy</h2>
      <p>
        We may update this Cookie Policy from time to time. We encourage you to check this page periodically for updates.
      </p>

      <h2>6. Contact Us</h2>
      <p>
        If you have any questions about our use of cookies, please contact us:<br />
        Email: <strong>jbowser727@gmail.com</strong><br />
        Phone: <strong>(209) 622-9391</strong>
      </p>
    </PolicyLayout>
  );
}
