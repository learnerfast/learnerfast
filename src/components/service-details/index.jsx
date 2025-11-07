'use client';
import BreadcrumbTwo from "@/common/breadcrumbs/breadcrumb-2";
import TestimonialArea from "@/common/testimonial-area";
import FooterFive from "@/layout/footers/footer";
import HeaderSix from "@/layout/headers/header-6";

const ServiceDetails = () => {
  return (
    <>
      <HeaderSix />
      <div id="smooth-wrapper">
        <div id="smooth-content">
          <main>
            <BreadcrumbTwo title="Web Design" innertitle="Help Desk Service Details" />
           
            <TestimonialArea />
          </main>
          <FooterFive style_contact={true} style_team={true} bg_style={false} />
        </div>
      </div>
    </>
  );
};

export default ServiceDetails;
