import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import VerticalScrollGraphs from '../common/graphslider.jsx';

import card_img_1 from "../../public/assets/img/card/card-bg.png";
import card_img_2 from "../../public/assets/img/card/card-shape-1.png";
import card_img_3 from "../../public/assets/img/card/card-img-1.png";
import card_img_4 from "../../public/assets/img/card/card-img-2.png";
import card_img_5 from "../../public/assets/img/card/card-img-3.png";
import card_img_6 from "../../public/assets/img/card/card-img-4.png" ;
import { bottom } from '@popperjs/core';


const card_content = {
    card_images: [
        {
            id: 1,
            cls: "main-img",
            data_parallax: "",
            img: card_img_1,
        },
        {
            id: 2,
            cls: "img-1 d-none d-sm-block",
            data_parallax: "",
            img: card_img_2,
        },
        {
            id: 3,
            cls: "img-2 d-none d-sm-block",
            data_parallax: '{"x": 50, "smoothness": 30}',
            img: card_img_3,
        },
        {
            id: 4,
            cls: "img-3 d-none d-sm-block",
            data_parallax: '{"x": -50, "smoothness": 30}',
            img: card_img_4,
        },
        {
            id: 5,
            cls: "img-4 d-none d-sm-block",
            data_parallax: "",
            img: card_img_5,
        },
        {
            id: 6,
            cls: "img-5 d-none d-sm-block",
            data_parallax: "",
            img: card_img_6,
        },
    ],

    title: <>Manage with Ease </>,
    description: <>Simplify your online coaching operations with ease using smart automation and easy-to-use controls. Manage everything smoothly — from course uploads and live classes to student enrollment and performance tracking. Plus, enjoy flexible access roles and seamless integration with your existing tools.</>,
    // btn_text: "Get Started Free"
}
const {card_images, title, description, btn_text}  = card_content

const features = [
  {
    id: "integrations",
    title: "Integrations",
    text:
      "Easily connect with your favorite apps and continue working with your existing tech setup — no need to switch tools.",
    // inline SVG name for clarity; we render actual SVG below
    icon: "plug",
  },
  {
    id: "analytics",
    title: "Analytics & Reports",
    text:
      "Get detailed performance insights and track progress with powerful analytics to improve learning outcomes.",
    icon: "chart",
  },
  {
    id: "roles",
    title: "Custom User Roles",
    text:
      "Assign access levels based on roles — ensuring every user gets just the permissions they need.",
    icon: "users",
  },
];

const Icon = ({ name, size = 20 }) => {
  // returns inline SVGs for each icon name
  const commonProps = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg",
    "aria-hidden": true,
    focusable: false,
  };

  switch (name) {
    case "plug":
      return (
        <svg {...commonProps} stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 7V3a1 1 0 0 0-1-1h-2a1 1 0 0 0-1 1v4" />
          <path d="M7 11v4a5 5 0 0 0 10 0v-4" />
          <path d="M10 7h4" />
        </svg>
      );
    case "chart":
      return (
        <svg {...commonProps} stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 3v18h18" />
          <path d="M7 14v-4" />
          <path d="M12 14v-8" />
          <path d="M17 14v-2" />
        </svg>
      );
    case "users":
      return (
        <svg {...commonProps} stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M17 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      );
    default:
      return null;
  }
};

const CardArea = ({style_service,spacing='pt-175 pb-185'}) => {
    return (
        <>
        <div className={`tp-card-area tp-card-space ${spacing}`}>
               <div className="container">
                  <div className="row">
                     <div className="col-xl-6 col-lg-6 wow tpfadeLeft" data-wow-duration=".9s" data-wow-delay=".5s">
                        <div className="tp-card-thumb-wrapper p-relative">
                           <VerticalScrollGraphs/>
                        </div>
                     </div>
                     <div className="col-xl-6 col-lg-6 wow tpfadeRight" data-wow-duration=".9s" data-wow-delay=".7s">
                        <div className="tp-card-title-box">
                           <h3 className="tp-section-title-3 pb-15">{title}</h3>
                           <p className="">{description}</p>
                              {/* <Link className={`${style_service ? "tp-btn-inner" : "tp-btn-blue-lg"} tp-btn-hover alt-color-black`} 
                                 href="/service-details">
                                 <span>{btn_text}</span> 
                                 <b></b>
                              </Link> */}
                        </div>
                        <section aria-label="Key features" className="features-section" style={{ maxWidth: 900, margin: "0 auto"}}>
      <ul>
        {features.map((f) => (
          <li
            key={f.id}
            className="feature-card"
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "0.5rem",
              paddingBottom: "1rem",
              borderRadius: 8,

              background: "#fff",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div
                className="icon-wrap"
                style={{
                  width: 44,
                  height: 44,
                  display: "grid",
                  placeItems: "center",
                  borderRadius: 8,
                  background: "#f5f7fa",
                }}
                aria-hidden="true"
              >
                <Icon name={f.icon} size={20} />
              </div>

              <h3 style={{ margin: 0, fontSize: 18 }}>{f.title}</h3>
            </div>

            <p style={{ margin: 0, color: "#444", lineHeight: 1.5 }}>{f.text}</p>
          </li>
        ))}
      </ul>
    </section>
                     </div>
                     
                  </div>
               </div>
            </div>
            
        </>
    );
};

export default CardArea;