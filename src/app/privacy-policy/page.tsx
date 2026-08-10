import type { Metadata } from "next";
import LegalPage from "../../components/common/LegalPage";

export const metadata: Metadata = {
  description:
    "Read the Privacy Policy of BELOVI. Learn how we collect, use, and protect your data.",
};

export default function PrivacyPolicyPage() {
  return (
    <LegalPage eyebrow="Legal" title="Privacy Policy" updated="11 July 2026">
      <p>
        At BELOVI, we value your privacy and are committed to
        protecting your personal information. This Privacy Policy explains how we
        collect, use, store, and protect your information when you visit our
        website or purchase our products. This policy is governed by the
        Information Technology Act, 2000, the Digital Personal Data Protection Act,
        2023, and other applicable laws of India.
      </p>

      <h2>1. Information We Collect</h2>
      <p>We may collect:</p>
      <ul>
        <li>Name</li>
        <li>Mobile number</li>
        <li>Email address</li>
        <li>Billing and shipping address</li>
        <li>Order and purchase details</li>
        <li>Payment information (processed through secure payment providers)</li>
      </ul>

      <h2>2. How We Use Your Information</h2>
      <p>Your information is used to:</p>
      <ul>
        <li>Process and deliver your orders</li>
        <li>Confirm COD orders</li>
        <li>Provide customer support and warranty services</li>
        <li>Send order updates and important notifications</li>
        <li>Improve our products and services</li>
        <li>Prevent fraud and comply with legal obligations</li>
      </ul>

      <h2>3. Information Sharing</h2>
      <p>We do not sell or rent your personal information.</p>
      <p>Your information may be shared only with:</p>
      <ul>
        <li>Courier and logistics partners</li>
        <li>Payment gateway providers</li>
        <li>Service providers assisting our business</li>
        <li>Government authorities when required by law</li>
      </ul>

      <h2>4. Data Security</h2>
      <p>
        We use reasonable security measures to protect your personal information.
        However, no online system is completely secure, and absolute security
        cannot be guaranteed.
      </p>

      {/* The footer's "Cookie Preferences" link targets this id. */}
      <h2 id="cookies">5. Cookies</h2>
      <p>
        Our website may use cookies to improve your browsing experience and analyze
        website traffic. You may disable cookies through your browser settings if
        you prefer.
      </p>

      <h2>6. Your Rights</h2>
      <p>Subject to applicable law, you may request to:</p>
      <ul>
        <li>Access your personal information</li>
        <li>Correct inaccurate information</li>
        <li>Request deletion where legally permitted</li>
        <li>Withdraw consent for marketing communications</li>
      </ul>

      <h2>7. Third-Party Websites</h2>
      <p>
        Our website may contain links to third-party websites. BELOVI
        is not responsible for their privacy practices or content.
      </p>

      <h2>8. Policy Updates</h2>
      <p>
        We may update this Privacy Policy from time to time. Any changes will be
        published on this page with the revised effective date.
      </p>

      <h2>Contact Us</h2>
      <p>
        <strong>BELOVI Private Limited</strong>
        <br />
        Registered in Kochi, Ernakulam
        <br />
        Kerala, India
      </p>
      <p>
        Email:{" "}
        <a href="mailto:care@belovi.in">care@belovi.in</a>
      </p>
    </LegalPage>
  );
}
