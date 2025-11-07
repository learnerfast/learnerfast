import VideoPopup from '@/components/modals/video-popup';
import React,{useState} from 'react';

const company_content ={
    sub_title:  "ABOUT THE PLATFORM",
    title: <>Create Courses. Engage Students. Grow Your Online Learning Business.</>,
    info_1: <>LearnerFast is your all-in-one platform to create, launch, and monetize online courses with ease. Whether you're a trainer, coach, institute, or business, LearnerFast helps you build an interactive learning environment that keeps your students engaged and learning effectively.</>,
    info_2: <>Designed for educators, entrepreneurs, and organizations, LearnerFast offers powerful tools to deliver online training, manage students, track progress, and grow your e-learning business — all from a single dashboard.</>,
}
const {sub_title, title, info_1, info_2}  = company_content


const CompanyArea = () => {
  const [isVideoOpen, setIsVideoOpen] = useState(false);

    return (
        <>
            <div className="ab-company-area pt-30 pb-100">
               <div className="container">
                
                  <div className="row align-items-center">
                     <div className="col-xl-4">
                        <div className="ab-company-video">
                           <a className="popup-video" 
                           onClick={() => setIsVideoOpen(true)} 
                           ><i className="fas fa-play"></i></a>
                           <span>Watch Demo</span>
                        </div>
                     </div>
                     <div className="col-xl-8">
                        <div className="row">

                           <div className="col-md-4 col-sm-4 mb-40">
                              <div className="ab-company-fun-fact-wrap d-flex justify-content-start">
                                 <div className="ab-company-fun-fact">
                                    <span>TRUSTED BY</span>
                                    <h4>5,000<em>+</em></h4>
                                    <p>Teachers, Institutes & Trainers</p>
                                 </div>
                              </div>
                           </div>
                           
                           <div className="col-md-4 col-sm-4 mb-40">
                              <div className="ab-company-fun-fact-wrap d-flex justify-content-md-center justify-content-left">
                                 <div className="ab-company-fun-fact">
                                    <span>HOSTED</span>
                                    <h4>2<em>M+</em></h4>
                                    <p>Learning Minutes Delivered</p>
                                 </div>
                              </div>
                           </div>
                           <div className="col-md-4 col-sm-4 mb-40">
                              <div className="ab-company-fun-fact-wrap ab-company-border-none d-flex justify-content-md-center justify-content-left">
                                 <div className="ab-company-fun-fact">
                                    <span>USED IN</span>
                                    <h4>80<em>+</em></h4>
                                    <p>Cities & Countries Worldwide</p>
                                 </div>
                              </div>
                           </div>
                        </div>
                     </div>
                  </div>
               </div>
            </div>

             {/* video modal start */}
      <VideoPopup
        isVideoOpen={isVideoOpen}
        setIsVideoOpen={setIsVideoOpen}
        videoId={"EW4ZYb3mCZk"}
      />
      {/* video modal end */}
        </>
    );
};

export default CompanyArea;