'use client';
import ScrollToTop from "@/hooks/scroll-to-top";
import Header from "@/layout/headers/header";
import AboutArea from "../../../common/about-area";
import FeatureArea from "./feature-area";
import HeroSlider from "./hero-slider";
import PriceArea from "./price-area";
import ProjectArea from "./project-area";
import RankArea from "./rank-area";
import ServicesArea from "./services-area";
import TestimonialArea from "./testimonial-area";
import Footer from "@/layout/footers/footer";
import CustomerReview from "@/components/customer-review/customer-review";
import CtaAreaOther from "./cta-area-other";

const HomeOne = () => {
	return (
		<>
			<Header />
			<div id="smooth-wrapper">
				<div id="smooth-content">
					<main className="fix">
						<HeroSlider />
						<CustomerReview />
						<ServicesArea />
						
						<ProjectArea />
						
						
					
						<CtaAreaOther/>
					
						<PriceArea />
					</main>
					<Footer />
					<ScrollToTop />
				</div>
			</div>
		</>
	);
};

export default HomeOne;
