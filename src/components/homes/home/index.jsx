'use client';
import ScrollToTop from "@/hooks/scroll-to-top";
import Header from "@/layout/headers/header";
import AboutArea from "../../../common/about-area";
import FeatureArea from "./feature-area";
import HeroSlider from "./hero-slider";
import PriceArea from "./price-area";
import Preloader from "../../../common/preloader";

import RankArea from "./rank-area";
import ServicesArea from "./services-area";
import TestimonialArea from "./testimonial-area";
import Footer from "@/layout/footers/footer";

const HomeOne = () => {
	return (
		<>
			<Preloader />
			<Header />
			<div id="smooth-wrapper">
				<div id="smooth-content">
					<main className="fix">
						<HeroSlider />
						<FeatureArea />
						<AboutArea />
						<ServicesArea />

						<TestimonialArea />
						<RankArea />
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
