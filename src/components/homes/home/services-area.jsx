import useTitleAnimation from '@/hooks/useTitleAnimation';
import service_data from '@/data/service-data';

import Image from 'next/image';
import Link from 'next/link';
import React, { useRef } from 'react';



const service_content = {
    title: "Explore Our Features",
    sub_title: <>More than 15,000 companies trust and choose Itech</>,

    bg_img: "/assets/img/service/sv-bg.jpg",
    title_2: <>Data Analysis <br /> Tools & Methods</>,
    des: <>Lorem Ipsum is simply dummy text <br /> of the printing</>,
    btn_text: "Work with Us",

    

}
const {title, sub_title}  = service_content

const ServicesArea = () => {
    let titleRef = useRef(null)

   useTitleAnimation(titleRef)
    return (
        <>
            <div className="tp-service__area p-relative fix pt-165 pb-170 p-relative">
               <div className="tp-service__grey-shape grey-bg"></div>
               <div className="container">
                  <div className="row justify-content-center">
                     <div className="col-lg-8">
                        <div ref={titleRef} className="tp-service__section-box tp__title_anime mb-50 text-center tp-title-anim">
                           <h2 className="tp-section-title">{title}</h2>
                           <p>{sub_title}</p>
                        </div>
                     </div>
                  </div>
                  <div className="row">

                    {service_data.slice(0,9).map((item, i)  => 
                        <div key={i} className="col-xl-4 col-lg-4 col-md-6 wow tpfadeUp" data-wow-duration=".9s" data-wow-delay={item.delay}>
                            <div className="tp-service__item mb-30">
                                <div className="tp-service__icon">
                                    <Image src={item.img} alt="theme-pure" />
                                </div>
                                <div className="tp-service__content">
                                    <h3 className="tp-service__title-sm tp-yellow-color"><Link href="/service-details">{item.title}</Link></h3>
                                    <p>{item.description}</p>
                                </div>
                               
                            </div>
                        </div>
                    )}

                     
                  </div>
               </div>
            </div>
        </>
    );
};

export default ServicesArea;