import React from "react";

const company_content = {

  title: (
    <>
      Create Courses. Engage Students. Grow Your Online Learning Business.
    </>
  ),
  info_1: (
    <>
      LearnerFast is your all-in-one platform to create, launch, and monetize
      online courses with ease. Whether you're a trainer, coach, institute, or
      business, LearnerFast helps you build an interactive learning environment
      that keeps your students engaged and learning effectively.
    </>
  ),
  info_2: (
    <>
      Designed for educators, entrepreneurs, and organizations, LearnerFast
      offers powerful tools to deliver online training, manage students, track
      progress, and grow your e-learning business — all from a single dashboard.
    </>
  ),

};

const {title, info_1, info_2} = company_content;

const ShortTitle = () => {
  return (
    <div className="ab-brand-area">
      <div className="container">
        <div className="ab-brand-border-bottom pb-90">
          <div className="row justify-content-center">
            <div className="col-xl-10">
              <div className="text-center mb-50">
               
                <h1 className="fw-bold mb-4">{title}</h1>
              </div>
              <div className="text-center">
                <p className="pb-10">{info_1}</p>
                <p className="pb-10">{info_2}</p>
               
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShortTitle;
