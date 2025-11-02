import React from "react";
import Wrapper from "@/layout/wrapper";
import HeaderOne from "@/layout/headers/header";
import FooterFive from "@/layout/footers/footer-5";
import "./terms-conditions.css";

export const metadata = {
  title: "Terms and Conditions - LearnerFast",
};

const TermsConditionsPage = () => {
  return (
    <Wrapper>
      <HeaderOne />
      <div className="terms-wrapper">
        <div className="terms-container">
          <h1>LearnerFast – Terms and Conditions</h1>
          <p><strong>Last Updated:</strong> November 2025</p>

          <p>
            Welcome to <strong>LearnerFast</strong> ("Company", "We", "Us", or "Our"). 
            These Terms and Conditions ("Terms") govern your access to and use of our website — 
            <a href="https://www.learnerfast.com" target="_blank" rel="noreferrer">
              https://www.learnerfast.com
            </a> — and our online learning platform ("Platform"), where educators ("Instructors") 
            can create, host, and sell online courses, and users ("Students") can register and learn through those courses.
          </p>

          <p>
            By accessing or using LearnerFast, you agree to comply with and be bound by these Terms, 
            our <strong>Privacy Policy</strong>, and any other policies posted on our website. 
            If you do not agree, please do not use our Platform.
          </p>

          <h2>1. Definitions</h2>
          <ul>
            <li><strong>Account</strong> – Your registered LearnerFast profile used to access courses or teaching tools.</li>
            <li><strong>Instructor</strong> – A person or organization that creates and sells courses on our Platform.</li>
            <li><strong>Student</strong> – A user who registers and enrolls in a course.</li>
            <li><strong>Content</strong> – Includes text, images, audio, video, code, and course materials uploaded on the Platform.</li>
            <li><strong>Services</strong> – The online tools and services provided by LearnerFast to enable learning and teaching.</li>
          </ul>

          <h2>2. Eligibility</h2>
          <p>
            You must be at least <strong>18 years old</strong> to use our Platform. 
            If you are under 18, you may use the Platform only under the supervision of a parent or legal guardian who agrees to these Terms.
          </p>

          <h2>3. Our Services</h2>
          <p>
            LearnerFast provides an online platform for creating and managing online courses, 
            selling and promoting educational content, and learning from expert instructors. 
            LearnerFast acts only as a <strong>technology service provider</strong> and 
            does not own, manage, or endorse any course content.
          </p>

          <h2>4. User Accounts</h2>
          <p>
            To use certain features, you must create an account by providing accurate and complete information. 
            You are responsible for maintaining the confidentiality of your credentials and for all activities under your account.
          </p>

          <h2>5. Payments and Subscriptions</h2>
          <ul>
            <li>Payments are made through secure payment gateways.</li>
            <li>All prices are shown in <strong>Indian Rupees (INR)</strong> and include applicable GST.</li>
            <li>Refunds are governed by our Refund Policy.</li>
            <li>Prices may change with prior notice.</li>
          </ul>

          <h2>6. Refund Policy</h2>
          <ul>
            <li>Refunds are available only if a course is inaccessible, defective, or misrepresented.</li>
            <li>Requests must be raised within <strong>7 days</strong> of purchase at 
              <a href="mailto:support@learnerfast.com"> support@learnerfast.com</a>.
            </li>
            <li>Refunds are processed within <strong>10–14 business days</strong>.</li>
          </ul>

          <h2>7. Instructor Responsibilities</h2>
          <p>
            Instructors must ensure their content complies with Indian laws (Copyright Act, 1957, IT Act, 2000). 
            Content must not be unlawful, obscene, or infringe intellectual property rights. 
            Instructors retain full ownership but grant LearnerFast a limited license to host and display the content.
          </p>

          <h2>8. Acceptable Use Policy</h2>
          <p>
            You agree not to misuse the Platform. Prohibited actions include:
          </p>
          <ul>
            <li>Using the Platform for illegal activities.</li>
            <li>Uploading harmful or misleading content.</li>
            <li>Copying other users' content without permission.</li>
            <li>Attempting to hack, reverse engineer, or damage the Platform.</li>
          </ul>

          <h2>9. Intellectual Property</h2>
          <p>
            All software, designs, trademarks, and content related to LearnerFast are owned by 
            <strong>LearnerFast Pvt. Ltd.</strong> and cannot be used without permission.
          </p>

          <h2>10. Third-Party Services</h2>
          <p>
            LearnerFast may use third-party services (payment gateways, analytics, etc.). 
            We are not responsible for third-party actions or failures.
          </p>

          <h2>11. Limitation of Liability</h2>
          <p>
            LearnerFast shall not be liable for any indirect or consequential damages. 
            Total liability is limited to the amount paid in the last 12 months.
          </p>

          <h2>12. Suspension and Termination</h2>
          <p>
            We may suspend or terminate your account for violation of Terms or misuse of the Platform. 
            You may terminate your account anytime by contacting us. Data retention will follow Indian legal requirements.
          </p>

          <h2>13. Data Protection and Privacy</h2>
          <p>
            LearnerFast processes data as per the <strong>Information Technology Act, 2000</strong> and 
            <strong>Digital Personal Data Protection Act, 2023 (DPDP Act)</strong>. 
            Refer to our <strong>Privacy Policy</strong> for details on how we manage your personal data.
          </p>

          <h2>14. Disclaimers</h2>
          <p>
            LearnerFast only provides a technology platform. We do not guarantee accuracy or results from any course. 
            All content is the responsibility of the Instructor.
          </p>

          <h2>15. Governing Law and Jurisdiction</h2>
          <p>
            These Terms are governed by the laws of India.  
            All disputes shall be subject to the exclusive jurisdiction of the courts of 
            <strong>Faridabad, Haryana, India</strong>.
          </p>

          <h2>16. Changes to Terms</h2>
          <p>
            LearnerFast reserves the right to modify these Terms at any time. 
            Updated Terms will be posted on this page. Continued use implies acceptance.
          </p>

          <h2>17. Contact Us</h2>
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
      <FooterFive />
    </Wrapper>
  );
};

export default TermsConditionsPage;
