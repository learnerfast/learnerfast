import NoticeTwo from '@/svg/notice-2';
import React from 'react';

import header_img from "@/assets/img/price/price-4.1.png";
import Image from 'next/image';
import Link from 'next/link';

const pricing_data_monthly = {
   header_text: <>Start building your video learning platform <br /> Choose the plan that fits your needs</>,
   // price header data 
   price_header: [
      {
         id: 1,
         title: "STARTER",
         description: <>Perfect for individual <br /> educators getting started</>,
         price: 29,
         price_yearly: 25,
         date: "Billed monthly",
         active: "",
      },
      {
         id: 2,
         title: "PROFESSIONAL",
         description: <>Best for growing academies <br /> with advanced features</>,
         price: 79,
         price_yearly: 69,
         date: "Billed monthly",
         active: "active",
      },
      {
         id: 3,
         title: "ENTERPRISE",
         description: <>For institutions and <br /> large organizations</>,
         price: 199,
         price_yearly: 179,
         date: "Billed monthly",
         active: "",
      },
   ],

   // price feature  
   price_feature: [
      {
         id: 1,
         title: "Custom Domains",
         notice: <>Connect your own domain for professional branding</>
      },
      {
         id: 2,
         title: "Video Embedding",
         notice: <>Secure video hosting with DRM protection and watermarking</>
      },
      {
         id: 3,
         title: "Student Analytics",
         notice: <>Track engagement, completion rates and learning progress</>
      },
      {
         id: 4,
         title: "Website Builder",
         notice: <>Drag and drop interface with professional templates</>
      },
      {
         id: 5,
         title: "24/7 Support",
         notice: <>Dedicated support for platform setup and maintenance</>
      },

   ],

   // price feature info
   price_feature_info: [
      {
         id: 1,
         active: "",
         info: [
            "1",
            "Basic",
            "Limited",
            "5 Pages",
            "Email",
         ]

      },
      {
         id: 2,
         active: "active",
         info: [
            "3",
            "Advanced",
            "Full",
            "Unlimited",
            "Priority",
         ]

      },
      {
         id: 3,
         active: "",
         info: [
            "Unlimited",
            "Enterprise",
            "Full",
            "Unlimited",
            "Dedicated",
         ]

      },
   ]


}
const {  header_text, price_header, price_feature, price_feature_info } = pricing_data_monthly




const PriceArea = () => {
   return (
      <>
         <div className="tp-price-area mb-120">
            <div className="container">
               <div className="price-tab-content">
                  <div className="tab-content" id="nav-tabContent">

                     <div className="tab-pane fade show active" id="nav-home" role="tabpanel" aria-labelledby="nav-home-tab" tabIndex="0">
                        <div className="tp-price-table price-inner-white-bg z-index-3">
                           <div className="tp-price-table-wrapper">
                              <div className="row g-0 align-items-center">
                                 <div className="col-4">
                                    <div className="tp-price-header">
                                       <div className="tp-price-header-img">
                                          <Image src={header_img} alt="theme-pure" />
                                       </div>
                                       <div className="tp-price-header-content">
                                          <p>{header_text}</p>
                                       </div>
                                    </div>
                                 </div>
                                 <div className="col-8">
                                    <div className="tp-price-top-wrapper">
                                       {price_header.map((item, i) =>
                                          <div key={i} className={`tp-price-top-item text-center ${item.active}`}>
                                             <div className="tp-price-top-tag-wrapper">
                                                <span>{item.title}</span>
                                                <p>{item.description}</p>
                                             </div>
                                             <div className="tp-price-top-title-wrapper">
                                                <h4>${item.price} <span>/mo</span></h4>
                                                <p>{item.date}</p>
                                                <Link className="tp-btn-service" href="#">Get Started</Link>
                                             </div>
                                          </div>
                                       )}
                                    </div>
                                 </div>
                              </div>
                              <div className="tp-price-feature-wrapper">
                                 <div className="row g-0">
                                    <div className="col-4">
                                       <div className="tp-price-feature-box">
                                          {price_feature.map((item, i) =>
                                             <div key={i} className="tp-price-feature-item p-relative">
                                                <div className="d-flex align-items-center">
                                                   <span>{item.title}</span>
                                                   <div className="tp-price-feature-tooltip-box p-relative">
                                                      <NoticeTwo />
                                                      <div className="tp-price-feature-tooltip">
                                                         <p>{item.notice}</p>
                                                      </div>
                                                   </div>
                                                </div>
                                             </div>
                                          )
                                          }
                                       </div>
                                    </div>
                                    <div className="col-8">
                                       {price_feature_info.map((item, i) =>
                                          <div key={i} className={`tp-price-feature-info-item ${item.active}`}>
                                             {item?.info?.map((inf, i) =>
                                                <div key={i} className="tp-price-feature-info text-center">
                                                   <span>{inf}</span>
                                                </div>
                                             )}
                                          </div>
                                       )}
                                    </div>
                                 </div>
                              </div>
                           </div>
                        </div>
                     </div>

                     <div className="tab-pane fade" id="nav-profile" role="tabpanel" aria-labelledby="nav-profile-tab" tabIndex="0">
                        <div className="tp-price-table price-inner-white-bg z-index-3">
                           <div className="tp-price-table-wrapper">
                              <div className="row g-0 align-items-center">
                                 <div className="col-4">
                                    <div className="tp-price-header">
                                       <div className="tp-price-header-img">
                                          <Image src={header_img} alt="theme-pure" />
                                       </div>
                                       <div className="tp-price-header-content">
                                          <p>{header_text}</p>
                                       </div>
                                    </div>
                                 </div>
                                 <div className="col-8">
                                    <div className="tp-price-top-wrapper">
                                       {price_header.map((item, i) =>
                                          <div key={i} className={`tp-price-top-item text-center ${item.active}`}>
                                             <div className="tp-price-top-tag-wrapper">
                                                <span>{item.title}</span>
                                                <p>{item.description}</p>
                                             </div>
                                             <div className="tp-price-top-title-wrapper">
                                                <h4>${item.price_yearly} <span>/mo</span></h4>
                                                <p>{item.date}</p>
                                                <Link className="tp-btn-service" href="#">Get Started</Link>
                                             </div>
                                          </div>
                                       )}
                                    </div>
                                 </div>
                              </div>
                              <div className="tp-price-feature-wrapper">
                                 <div className="row g-0">
                                    <div className="col-4">
                                       <div className="tp-price-feature-box">
                                          {price_feature.map((item, i) =>
                                             <div key={i} className="tp-price-feature-item p-relative">
                                                <div className="d-flex align-items-center">
                                                   <span>{item.title}</span>
                                                   <div className="tp-price-feature-tooltip-box p-relative">
                                                      <NoticeTwo />
                                                      <div className="tp-price-feature-tooltip">
                                                         <p>{item.notice}</p>
                                                      </div>
                                                   </div>
                                                </div>
                                             </div>
                                          )
                                          }
                                       </div>
                                    </div>
                                    <div className="col-8">
                                       {price_feature_info.map((item, i) =>
                                          <div key={i} className={`tp-price-feature-info-item ${item.active}`}>
                                             {item?.info?.map((inf, i) =>
                                                <div key={i} className="tp-price-feature-info text-center">
                                                   <span>{inf}</span>
                                                </div>
                                             )}
                                          </div>
                                       )}
                                    </div>
                                 </div>
                              </div>
                           </div>
                        </div>
                     </div>
                  </div>
               </div>
            </div>
         </div>
      </>
   );
};

export default PriceArea;