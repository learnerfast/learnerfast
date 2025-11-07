import React from "react";

const company_content = {

  title: (
    <>
      Company Story
    </>
  ),
  info_1: (
    <>
      The story of <strong>LearnerFast</strong> began 5 years ago, when a passionate team of
      educators, trainers, and software developers came together with one mission —
      to make online learning simple, accessible, and impactful.
    </>
  ),
  info_2: (
    <>
      Led by <strong>Mrs. Mohita Kashyap (Founder & CEO)</strong>, the team realized that most
      e-learning platforms were complicated, difficult to manage, and focused more
      on system management than the actual learning experience. They wanted to change that.
    </>
  ),
  info_3: (
    <>
      With this vision, LearnerFast was created — a platform designed not just to host courses,
      but to enhance the way people learn and teach online. By combining modern technology
      with a deep understanding of digital education, LearnerFast empowers educators,
      institutes, and businesses to build engaging, interactive, and result-driven learning experiences.
    </>
  ),
  info_4: (
    <>
      Today, LearnerFast continues to evolve, guided by real user feedback and continuous research.
      Our team is committed to staying ahead of learning technology trends and delivering a platform
      that grows with its educators and learners. <br /><br />
      <strong>At LearnerFast, we don’t just support e-learning — we help shape its future.</strong>
    </>
  ),
};

const {title, info_1, info_2, info_3, info_4} = company_content;

const CompanyStory = () => {
  return (
    <div className="ab-brand-area">
      <div className="container">
        <div className="ab-brand-border-bottom pb-90">
          <div className="row justify-content-center">
            <div className="col-xl-10">
              <div className="text-center mb-50 mt-50">
                <h1 className="fw-bold mb-4">{title}</h1>
              </div>
              <div className="text-center">
                <p className="pb-10">{info_1}</p>
                <p className="pb-10">{info_2}</p>
                <p className="pb-10">{info_3}</p>
                <p className="pb-10">{info_4}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompanyStory;
