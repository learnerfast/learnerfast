import service_data from '@/data/service-data';
import Image from 'next/image';
import Link from 'next/link';
import React from 'react';

import service_icon_1 from "@/assets/img/service/sv-icon-3-1.png"
import service_icon_2 from "@/assets/img/service/service-shape-3-1.png"


const service_content = {
    title: <>Best Online Course Platform <br/>to Create and Sell Courses</>,
    btn_text: <>Explore All Features</>,
 
    bg_img: "/assets/img/service/service-3-bg.png",
    service_title: "Drag & Drop Builder",
    service_info: <>Create professional learning websites <br /> without any coding knowledge</>,
 }
 const {title, btn_text, bg_img, service_title, service_info}  = service_content


const ServiceArea = () => {
    return (
        <>
            <div className="tp-service-area pb-120 z-index">
               <div className="container">
                  <div className="row">
                     <div className="col-xl-12">
                        <div className="tp-service-section-wrapper mb-60 d-flex justify-content-between align-items-end">
                           <h3 className="tp-section-title tp-title-anim">{title}</h3>
                              {/* <Link className="tp-btn-inner tp-btn-hover alt-color-black wow tpfadeRight" 
                                 data-wow-duration=".9s" 
                                 data-wow-delay=".3s" 
                                 href="/service-details">
                                 <span>{btn_text}</span>
                                 <b></b>
                              </Link> */}
                        </div>
                     </div>
                  </div>
                  <div className="row">

                     <div className="col-xl-12 wow tpfadeUp" data-wow-duration=".9s" data-wow-delay=".3s">
                        <div className="tp-service-3-item mb-30 p-relative z-index" style={{backgroundImage: `url(${bg_img})`}}>
                           <div className="tp-service-3-icon">
                              <Image src={service_icon_1} alt="theme-pure" />
                           </div>
                           <div className="tp-service-3-content">
                              <span>{service_title}</span>
                              <h4 className="tp-service-3-title-sm">
                                {service_info}</h4>
                           </div>
                           {/* <div className="tp-service-3-btn">
                              <Link className="tp-btn-white-solid" href="/service-details">Learn More</Link>
                           </div> */}
                           <div className="tp-service-3-shape">
                              <Image src={service_icon_2} alt="theme-pure" />
                           </div>
                        </div>
                     </div>

                     {service_data.slice(0,9).map((item, i)  => 
                        <div key={i} className="col-xl-4 col-lg-6 col-md-6 wow tpfadeUp" data-wow-duration=".9s" data-wow-delay=".5s">
                        <div className="tp-service-sm-item mb-30 d-flex flex-column justify-content-between">
                           <div className="tp-service-sm-icon">
                               {typeof item.icon === 'object' && item.icon.src ? <Image src={item.icon} alt={item.title} /> : item.icon}
                           </div>
                           <div className="tp-service-sm-content">
                              <span>{item.title}</span>
                              <p>{item.description}</p>
                             
                           </div>
                        </div>
                     </div>
                        )
                     } 
                  </div>
               </div>
            </div>
        </>
    );
};

export default ServiceArea;