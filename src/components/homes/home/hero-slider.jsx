"use client";
import React, { useEffect, useRef } from "react";
import { gsap } from "gsap";
import useCharAnimation from "@/hooks/useCharAnimation";
import Image from "next/image";

// image imports
import hero_frame from "@/assets/img/hero/hero-frame.png";
import shape_1 from "@/assets/img/hero/hero-line-shape.png";
import shape_2 from "@/assets/img/hero/hero-line-shape-2.png";
import shape_img_1 from "@/assets/img/hero/hero-shape-1.png";
import shape_img_2 from "@/assets/img/hero/hero-shape-2.png";
import thumb_1 from "@/assets/img/hero/hero-sm-3.png";
import thumb_2 from "@/assets/img/hero/hero-sm-4.jpg";
import hero_thumb_2 from "@/assets/img/hero/hero-sm-2.jpg";
import HeroForm from "@/forms/hero-form";
import LineShape from "@/svg/line-shape";

const hero_content = {
  hero_shape: [
    { id: 1, cls: "tp-hero-shape-1", img: shape_1 },
    { id: 2, cls: "tp-hero-shape-2", img: shape_2 },
  ],
  hero_title: (
    <>
      <span className="tp_title">
        <span className="child">The Leading Customer</span>
      </span>
      <br />
      <span>
        <span className="child">Data Platform</span>
      </span>
    </>
  ),
  sub_title: <>We are not going to save your data</>,
  hero_shape_img: [
    { id: 1, cls: "1", img: shape_img_1 },
    { id: 2, cls: "2", img: shape_img_2 },
  ],
  hero_thumbs: [
    { id: 1, col: "4", cls: "tp-hero__sm-img", img: thumb_1 },
    { id: 2, col: "8", cls: "", img: thumb_2 },
  ],
};

const { hero_shape, hero_title, sub_title, hero_shape_img } = hero_content;

const HeroSlider = () => {
  const hero_bg = useRef(null);

  useEffect(() => {
    gsap.from(hero_bg.current, {
      opacity: 0,
      scale: 1.2,
      duration: 1.5,
    });
    gsap.to(hero_bg.current, {
      opacity: 1,
      scale: 1,
      duration: 1.5,
    });
  }, []);

  useCharAnimation(".tp-hero__hero-title span.child");

  return (
    <>
      <div className="tp-hero__area tp-hero__pl-pr">
        <div className="tp-hero__bg p-relative">
          <div className="tp-hero-bg tp-hero-bg-single" ref={hero_bg}>
            <Image src={hero_frame} alt="theme-pure" />
          </div>

          {/* Hero background shapes */}
          <div className="tp-hero-shape">
            {hero_shape.map((item, i) => (
              <Image key={i} className={item.cls} src={item.img} alt="shape" />
            ))}
          </div>

          {/* Hero content */}
          <div className="container">
            <div className="row justify-content-center">
              <div className="col-xl-10">
                <div className="tp-hero__content-box text-center z-index-3">
                  <div className="tp-hero__title-box p-relative">
                    <h2 className="tp-hero__hero-title tp-title-anim">
                      {hero_title}
                    </h2>
                    {/* <div className="tp-hero__title-shape d-none d-sm-block">
                      <LineShape />
                    </div> */}
                  </div>

                  {/* <div
                    className="tp-hero__input p-relative wow tpfadeUp"
                    data-wow-duration=".9s"
                    data-wow-delay=".5s"
                  >
                    <HeroForm />
                  </div> */}

                  <p
                    className="wow tpfadeUp"
                    data-wow-duration=".9s"
                    data-wow-delay=".7s"
                  >
                    {sub_title}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section with Video */}
        <div className="tp-hero__bottom z-index-5">
          <div className="container">
            <div className="row justify-content-center">
              <div className="col-xl-10">
                <div className="tp-hero__thumb-wrapper-main p-relative">
                  {hero_shape_img.map((item, i) => (
                    <div
                      key={i}
                      className={`tp-hero__shape-img-${item.cls} d-none d-xl-block`}
                    >
                      <Image src={item.img} alt="shape" />
                    </div>
                  ))}

                  <div className="tp-hero__thumb-wrapper d-none d-md-block p-relative">
                    <div className="row">
                      <div className="col-md-12">
                        {/* ✅ Responsive Video Embed */}
                        <div className="video-container">
<video
  autoPlay
  loop
  muted
  playsInline

>
  <source src="/assets/img/hero/hero.mp4" type="video/mp4" />
  Your browser does not support the video tag.
</video>
{/* src="/Users/vdocipher/Desktop/deepak/learning-next-js/public/assets/img/hero/hero.mp4" */}
{/* <div style={{ position: "relative", paddingTop: "56.25%" }}>
  <iframe
    src="https://player.vdocipher.com/v2/?playbackInfo=eyJ2aWRlb0lkIjoiZGQyNTg0ODE2OTMyNGRhNGFiNTcxOGViNGNkMmYzMGEifQ=="
    style={{
      border: 0,
      position: "absolute",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
    }}
    allowFullScreen
    allow="encrypted-media"
  ></iframe>
</div> */}












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

export default HeroSlider;


// import React from "react";

// const HeroSection = () => {
//   return (
//     <section className="hero-section container py-5">
//       <div className="row align-items-center">
        
//         {/* Left Content */}
//         <div className="col-md-6 hero-text">
//           <h1 className="display-4 fw-bold mb-3">
//             The learning platform for <br /> AI skills and business transformation
//           </h1>
//           <p className="lead mb-4">When people grow, business does too.</p>
        
//         </div>

//         {/* Right Content */}
//         <div className="col-md-6 hero-media text-center mt-4 mt-md-0">
//            <div className="d-flex gap-3">
//             <button className="btn btn-dark btn-lg">Get started</button>
//             <button className="btn btn-outline-dark btn-lg">Compare plans</button>
//           </div>
//         </div>



// <div className="row align-items-center">
	
//  <div className="col-md-12 hero-media text-center mt-4 mt-md-0">
//           <div className="gradient-box position-relative overflow-hidden rounded-4 shadow">
//             {/* Play Button + Text */}
//             <div className="video-overlay d-flex align-items-center position-absolute bottom-0 start-0 p-3">
//               <button className="play-btn me-2">
//                 ▶
//               </button>
//               <div className="text-white">
//                 <span className="d-block fw-semibold">An AI learning journey like no other</span>
//                 <small>0:30</small>
//               </div>
//             </div>
//             {/* Background + Image */}
//             <img
//               src="/path/to/woman-image.png"
//               alt="Smiling Woman"
//               className="img-fluid hero-img"
//             />
//           </div>
//         </div>


// </div>
//       </div>
//     </section>
//   );
// };

// export default HeroSection;
