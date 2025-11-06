"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import NoticeTwo from "@/svg/notice-2";
import header_img from "@/assets/img/price/price-4.1.png";

const pricing_data_monthly = {
  header_text: (
    <>
      Start building your video learning platform <br /> Choose the plan that
      fits your needs
    </>
  ),
  price_header: [
    {
      id: 1,
      title: "STARTER",
      description: <>Perfect for <br /> getting started</>,
      price: 29,
      price_yearly: 24,
      date: "Billed monthly",
      active: "",
    },
    {
      id: 2,
      title: "PROFESSIONAL",
      description: <>For growing <br /> businesses</>,
      price: 79,
      price_yearly: 66,
      date: "Billed monthly",
      active: "active",
    },
    {
      id: 3,
      title: "ENTERPRISE",
      description: <>For large <br /> organizations</>,
      price: 199,
      price_yearly: 166,
      date: "Billed monthly",
      active: "",
    },
  ],
  price_feature: [
    { id: 1, title: "Courses", notice: <>Number of courses you can create</> },
    { id: 2, title: "Websites", notice: <>Website builders with custom templates</> },
    { id: 3, title: "Students", notice: <>Maximum number of enrolled students</> },
    { id: 4, title: "Video Hosting", notice: <>Secure video hosting and streaming</> },
    { id: 5, title: "Support", notice: <>Customer support level</> },
  ],
  price_feature_info: [
    { id: 1, active: "", info: ["Up to 3", "1 Builder", "100", "Basic", "Email"] },
    { id: 2, active: "active", info: ["Unlimited", "5 Builders", "Unlimited", "Advanced", "Priority"] },
    { id: 3, active: "", info: ["Unlimited", "Unlimited", "Unlimited", "Enterprise", "Dedicated"] },
  ],
};

const { header_text, price_header, price_feature, price_feature_info } = pricing_data_monthly;

const PriceArea = () => {
  // Initially "USD" to match server render
  const [currency, setCurrency] = useState({ symbol: "$", rate: 1, country: "US" });

  useEffect(() => {
    //  Run only on client
    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (timeZone && timeZone.toLowerCase().includes("kolkata")) {
      // Update to INR after hydration
      setCurrency({ symbol: "₹", rate: 83, country: "IN" });
    } else {
      setCurrency({ symbol: "$", rate: 1, country: "US" });
    }
  }, []);

  const formatPrice = (usd) => {
    const value = Math.round(usd * currency.rate);
    return `${currency.symbol}${value.toLocaleString(currency.country === "IN" ? "en-IN" : "en-US")}`;
  };

  return (
    <div className="tp-price-area mb-120">
      <div className="container">
        <div className="price-tab-content">
          <div className="tab-content" id="nav-tabContent">
            {/* MONTHLY TAB */}
            <div
              className="tab-pane fade show active"
              id="nav-home"
              role="tabpanel"
              aria-labelledby="nav-home-tab"
            >
              <div className="tp-price-table price-inner-white-bg z-index-3">
                <div className="tp-price-table-wrapper">
                  <div className="row g-0 align-items-center">
                    {/* Left Header */}
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

                    {/* Right Price Cards */}
                    <div className="col-8">
                      <div className="tp-price-top-wrapper">
                        {price_header.map((item) => (
                          <div
                            key={item.id}
                            className={`tp-price-top-item text-center ${item.active}`}
                          >
                            <div className="tp-price-top-tag-wrapper">
                              <span>{item.title}</span>
                              <p>{item.description}</p>
                            </div>
                            <div className="tp-price-top-title-wrapper">
                              {/* Hydration-safe price rendering */}
                              <h4>
                                {formatPrice(item.price)} <span>/mo</span>
                              </h4>
                              <p>
                                {currency.country === "IN"
                                  ? "Billed monthly (INR)"
                                  : "Billed monthly (USD)"}
                              </p>
                              <Link className="tp-btn-service" href="#">
                                Get Started
                              </Link>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Feature Section */}
                  <div className="tp-price-feature-wrapper">
                    <div className="row g-0">
                      <div className="col-4">
                        <div className="tp-price-feature-box">
                          {price_feature.map((item) => (
                            <div
                              key={item.id}
                              className="tp-price-feature-item p-relative"
                            >
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
                          ))}
                        </div>
                      </div>

                      <div className="col-8">
                        {price_feature_info.map((item) => (
                          <div
                            key={item.id}
                            className={`tp-price-feature-info-item ${item.active}`}
                          >
                            {item.info.map((inf, idx) => (
                              <div
                                key={idx}
                                className="tp-price-feature-info text-center"
                              >
                                <span>{inf}</span>
                              </div>
                            ))}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* YEARLY TAB */}
            <div
              className="tab-pane fade"
              id="nav-profile"
              role="tabpanel"
              aria-labelledby="nav-profile-tab"
            >
              <div className="tp-price-table price-inner-white-bg z-index-3">
                <div className="tp-price-table-wrapper">
                  <div className="row g-0 align-items-center">
                    {/* Left Header */}
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

                    {/* Right Price Cards */}
                    <div className="col-8">
                      <div className="tp-price-top-wrapper">
                        {price_header.map((item) => (
                          <div
                            key={item.id}
                            className={`tp-price-top-item text-center ${item.active}`}
                          >
                            <div className="tp-price-top-tag-wrapper">
                              <span>{item.title}</span>
                              <p>{item.description}</p>
                            </div>
                            <div className="tp-price-top-title-wrapper">
                              <h4>
                                {formatPrice(item.price_yearly)} <span>/mo</span>
                              </h4>
                              <p>
                                {currency.country === "IN"
                                  ? "Billed yearly (INR)"
                                  : "Billed yearly (USD)"}
                              </p>
                              <Link className="tp-btn-service" href="#">
                                Get Started
                              </Link>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Feature Section */}
                  <div className="tp-price-feature-wrapper">
                    <div className="row g-0">
                      <div className="col-4">
                        <div className="tp-price-feature-box">
                          {price_feature.map((item) => (
                            <div
                              key={item.id}
                              className="tp-price-feature-item p-relative"
                            >
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
                          ))}
                        </div>
                      </div>

                      <div className="col-8">
                        {price_feature_info.map((item) => (
                          <div
                            key={item.id}
                            className={`tp-price-feature-info-item ${item.active}`}
                          >
                            {item.info.map((inf, idx) => (
                              <div
                                key={idx}
                                className="tp-price-feature-info text-center"
                              >
                                <span>{inf}</span>
                              </div>
                            ))}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {/* END YEARLY TAB */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PriceArea;
