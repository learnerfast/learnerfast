"use client";
import Image from 'next/image';
import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Scrollbar } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/scrollbar';

const testimonial_data = [
  {
    img: "/assets/img/testimonial/testimonial.jpg",
    name: "Nikolas Nuñez",
    role: "Academy Founder",
    text: "Learnworlds made it so easy to set up my academy. Support is top-notch!",
  },
  {
    img: "/assets/img/testimonial/testimonial2.jpg",
    name: "Samantha Lee",
    role: "Online Coach",
    text: "The templates are beautiful and easy to customize. Highly recommended!",
  },
  {
    img: "/assets/img/testimonial/testimonial3.jpg",
    name: "David Miller",
    role: "Trainer",
    text: "My business grew 3x after moving to this platform. Love it!",
  },
  {
   img: "/assets/img/testimonial/testimonial5.jpg",
    name: "Emily Carter",
    role: "Education Consultant",
    text: "A powerful tool that helped me reach more students with ease.",
  },
];

const CustomerReview = () => {
  return (
    <div className="tp-testimonial__area grey-bg pt-150 pb-110 fix">
      <div className="container">
        <div className="row">
          <div className="col-xl-8">
            <div className="tp-testimonial__section-box">
              <h3 className="tp-section-title">What our customers are saying</h3>
              <p>Real stories from trainers, coaches & academies who built their business with us.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container-fluid gx-0">
        <div className="row gx-0">
          <div className="col-xl-12">
            <div className="tp-testimonial__slider-section">
              <Swiper
                modules={[Scrollbar]}
                loop={false}                  
                grabCursor={true}
                centeredSlides={false}       
                spaceBetween={30}
     
                scrollbar={{
                  el: ".tp-scrollbar",
                  draggable: true,
                  clickable: true,
                }}
                breakpoints={{
                  0: { slidesPerView: 1 },
                  768: { slidesPerView: 2 },
                  1200: { slidesPerView: 3 },
                }}
                className="tp-testimonial__slider-active"
              >
                {testimonial_data.map((item, i) => (
                  <SwiperSlide key={i}>
                    <div className="tp-testimonial__slider-wrapper">
                      <div className="tp-testimonial-card">
                        <div className="tp-testimonial-thumb">
                          <Image
                            src={item.img || "/assets/img/review/dummy.jpg"}
                            alt={item.name}
                            width={500}
                            height={400}
                            className="testimonial-img "
                          />
                        </div>
                        <div className="tp-testimonial-content">
                          <p className="tp-testimonial-text">“{item.text}”</p>
                          <h4 className="tp-testimonial-name">{item.name}</h4>
                          <span className="tp-testimonial-role">{item.role}</span>
                        </div>
                      </div>
                    </div>
                  </SwiperSlide>
                ))}
              </Swiper>
              <div className="tp-scrollbar"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerReview;
