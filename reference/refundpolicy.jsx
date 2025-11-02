import React from "react";
import "./RefundPolicy.css";

const RefundPolicy = () => {
  return (
    <div className="refund-wrapper">
      <div className="refund-container">
        <h1>Refund Policy – LearnerFast</h1>
        <p><strong>Last Updated:</strong> November 2025</p>

        <p>
          Thank you for choosing <strong>LearnerFast</strong>. We aim to provide a seamless learning experience.
          This Refund Policy explains how refunds are handled for purchases made through our platform
          <a href="https://www.learnerfast.com" target="_blank" rel="noreferrer"> https://www.learnerfast.com</a>.
        </p>

        <h2>1. Payment Gateway</h2>
        <p>
          All payments are securely processed via <strong>PhonePe Payment Gateway</strong>. PhonePe supports
          UPI, Debit/Credit Cards, Net Banking, and Wallets with RBI-compliant encryption.
        </p>

        <h2>2. Refund Eligibility</h2>
        <ul>
          <li>You were charged but did not receive access to the purchased course.</li>
          <li>Course content is defective or inaccessible due to technical errors on our platform.</li>
          <li>Duplicate payment was made for the same course.</li>
          <li>Course was purchased by mistake and not accessed (within 7 days of purchase).</li>
        </ul>

        <p><strong>Refunds are not applicable if:</strong></p>
        <ul>
          <li>You’ve already accessed or completed most of the course.</li>
          <li>Issues are caused by your internet or device.</li>
          <li>Refund is requested after 7 days of purchase.</li>
          <li>Course was bought during discounted offers or promotions.</li>
        </ul>

        <h2>3. Refund Request Procedure</h2>
        <p>To request a refund:</p>
        <ol>
          <li>Send an email to <a href="mailto:support@learnerfast.com">support@learnerfast.com</a> with:
            <ul>
              <li>Your full name</li>
              <li>Registered email ID</li>
              <li>Transaction ID</li>
              <li>Course name and reason for refund</li>
            </ul>
          </li>
          <li>Our team will verify your request within <strong>2–3 business days</strong>.</li>
          <li>Approved refunds will be processed within <strong>7–10 business days</strong> to your original payment method.</li>
        </ol>

        <h2>4. Technical Failures</h2>
        <p>
          If a transaction fails but money is debited, the amount will be automatically refunded by PhonePe
          within <strong>5–7 working days</strong>. If not received, contact your bank or PhonePe with your transaction ID.
        </p>

        <h2>5. Course Access After Refund</h2>
        <p>
          After a refund is processed, course access will be revoked immediately. Any materials downloaded must
          be deleted to comply with our <strong>Terms of Service</strong>.
        </p>

        <h2>6. Contact Us</h2>
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

export default RefundPolicy;
