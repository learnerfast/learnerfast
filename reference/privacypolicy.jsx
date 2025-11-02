import React from "react";
import "./PrivacyPolicy.css";

const PrivacyPolicy = () => {
  return (
    <div className="privacy-wrapper">
      <div className="privacy-container">
        <h1>Privacy Policy – LearnerFast</h1>
        <p><strong>Last Updated:</strong> November 2025</p>

        <p>
          LearnerFast (“Company”, “We”, “Us”, or “Our”) values your privacy and is committed to
          protecting your personal information. This Privacy Policy explains how we collect,
          use, and safeguard your data when you use our website and services.
        </p>

        <h2>1. Information We Collect</h2>
        <ul>
          <li><strong>Personal Information:</strong> Name, email, phone number, payment details, course data.</li>
          <li><strong>Technical Information:</strong> IP address, browser type, cookies, usage logs.</li>
          <li><strong>Instructor Information:</strong> Business name, GST/PAN, payment information.</li>
        </ul>

        <h2>2. How We Use Your Information</h2>
        <ul>
          <li>Provide and improve our platform and services.</li>
          <li>Process registrations, payments, and subscriptions.</li>
          <li>Personalize your learning experience.</li>
          <li>Communicate updates, offers, and course information.</li>
          <li>Ensure legal and security compliance.</li>
        </ul>

        <h2>3. How We Protect Your Data</h2>
        <p>
          Your information is stored securely using encryption and access control. All payments are
          processed through RBI-approved payment gateways. We comply with the <strong>Digital Personal
          Data Protection Act, 2023 (DPDP)</strong> and IT Act, 2000.
        </p>

        <h2>4. Sharing of Information</h2>
        <p>
          We may share limited data with trusted partners for payment processing, analytics, or
          communication services. We never sell or rent your personal information.
        </p>

        <h2>5. Cookies and Tracking</h2>
        <p>
          We use cookies to improve user experience and analyze traffic. You can disable cookies in
          your browser settings, though some features may not function properly.
        </p>

        <h2>6. Your Rights</h2>
        <ul>
          <li>Right to Access</li>
          <li>Right to Correction</li>
          <li>Right to Deletion (Erasure)</li>
          <li>Right to Withdraw Consent</li>
          <li>Right to File a Complaint</li>
        </ul>

        <p>
          You can contact us at{" "}
          <a href="mailto:support@learnerfast.com">support@learnerfast.com</a> to exercise these rights.
        </p>

        <h2>7. Data Retention</h2>
        <p>
          We retain your data only as long as necessary for providing our services and legal compliance.
          After that, data is securely deleted or anonymized.
        </p>

        <h2>8. Data of Children</h2>
        <p>
          LearnerFast is intended for users above 18 years of age. We do not knowingly collect data from minors.
        </p>

        <h2>9. Third-Party Links</h2>
        <p>
          Our platform may contain external links. We are not responsible for the privacy practices of third-party sites.
        </p>

        <h2>10. Changes to This Policy</h2>
        <p>
          This Privacy Policy may be updated from time to time. Continued use of our platform indicates acceptance of changes.
        </p>

        <h2>11. Contact Us</h2>
        <address>
          <strong>LearnerFast (India)</strong><br />
          📍 1B 221 BP Neelam Bata Road, NIT Faridabad, Haryana – 121001<br />
          📧 <a href="mailto:support@learnerfast.com">support@learnerfast.com</a><br />
          🌐 <a href="https://www.learnerfast.com" target="_blank" rel="noreferrer">
            https://www.learnerfast.com
          </a>
        </address>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
