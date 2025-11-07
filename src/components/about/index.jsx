'use client';
import AboutArea from "@/common/about-area";
import FooterFive from "@/layout/footers/footer";
import HeaderSix from "@/layout/headers/header-6";
import Breadcrumb from "../../common/breadcrumbs/breadcrumb";
import HeroBanner from "../../common/hero-banner";
import CtaArea from "../contact/cta-area";

import Brand from "./brand";
import CompanyArea from "./company-area";
import JobArea from "./job-area";
import JourneyArea from "./journey-area";
import ShortTitle from "./short-title"
import CompanyStory from "./company-story"

 
const About = () => {
  return (
    <>
      <HeaderSix />
      <Breadcrumb title_top="About"  title_bottom="LearnerFast" />
      <HeroBanner title="About" subtitle="LearnerFast" bg_img="/assets/img/breadcrumb/breadcrumb-2.jpg" />
      <ShortTitle/>
      <Brand />
      <CompanyStory/>
      <CompanyArea />
      {/* <AboutArea /> */}


      <CtaArea />
      <FooterFive style_contact={true} style_team={true} />
    </>
  );
};

export default About;
