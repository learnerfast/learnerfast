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

const hero_content = {
  hero_shape: [
    { id: 1, cls: "tp-hero-shape-1", img: shape_1 },
    { id: 2, cls: "tp-hero-shape-2", img: shape_2 },
  ],
  hero_title: (
    <>
      <span className="tp_title">
        <span className="child">Create And Sell </span>
      </span>
      <br />
      <span>
        <span className="child">Courses</span>
      </span>
    </>
  ),
  sub_title: <>Deliver a smooth and secure learning experience</>,
  hero_shape_img: [
    { id: 1, cls: "1", img: shape_img_1 },
    { id: 2, cls: "2", img: shape_img_2 },
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
            <Image src={hero_frame} alt="theme-pure" priority />
          </div>

          {/* Hero background shapes */}
          <div className="tp-hero-shape">
            {hero_shape.map((item) => (
              <Image key={item.id} className={item.cls} src={item.img} alt="shape" />
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
                  </div>

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
                  {hero_shape_img.map((item) => (
                    <div
                      key={item.id}
                      className={`tp-hero__shape-img-${item.cls} d-none d-xl-block`}
                    >
                      <Image src={item.img} alt="shape" />
                    </div>
                  ))}

                  <div className="tp-hero__thumb-wrapper d-none d-md-block p-relative">
                    <div className="row">
                      <div className="col-md-12">
                        {/* Responsive Video Embed */}
                        <div className="video-container">
                          <video
                            autoPlay
                            loop
                            muted
                            playsInline
                            style={{
                              width: "100%",
                              height: "530px",
                              borderRadius: "10px",
                              objectFit: "cover",
                            }}
                          >
                            <source
                              src="/assets/img/hero/learnerfastdemo.mp4"
                              type="video/mp4"
                            />
                            Your browser does not support the video tag.
                          </video>
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
