"use client";
import BreadcrumbFive from "@/common/breadcrumbs/breadcrumb-5";
import TestimonialArea from "@/common/testimonial-area";
import FooterFive from "@/layout/footers/footer";
import HeaderSix from "@/layout/headers/header-6";
import Brand from "../about/brand";
import CtaArea from "../contact/cta-area";
import AnswerQuestion from "@/common/answer-question";
import PlanArea from "./plan-area";
import PriceArea from "./price-area";

const Price = () => {
  return (
    <>
      <HeaderSix />
      <div id="smooth-wrapper">
        <div id="smooth-content">
          <main>
            <BreadcrumbFive />
            <PriceArea />
            <PlanArea />
            <Brand />
       
            <CtaArea />
          </main>
          <FooterFive style_contact={true} style_team={true} />
        </div>
      </div>
    </>
  );
};

export default Price;
