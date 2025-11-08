import React, { useEffect, useRef } from "react";
import Image from "next/image";

import graph01 from "@/assets/img/service/graph1.png";
import graph02 from "@/assets/img/service/graph2.png";
import graph03 from "@/assets/img/service/graph3.png";

const VerticalScrollGraphs = () => {
  const scrollRef = useRef(null);

  const styles = {
    scrollContainer: {
      width: "100%",
      overflow: "hidden",
      backgroundColor: "#f9f9f9",
      padding: "20px 0",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
    },
    scrollTrack: {
      display: "flex",
      alignItems: "center",
      gap: "40px",
      animation: "scroll 15s linear infinite", // speed controlled here
    },
    scrollImage: {
      width: "600px",
      height: "auto",
      borderRadius: "16px",
      boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
      transition: "transform 0.3s ease",
      flexShrink: 0,
    },
    "@keyframes scroll": {
      "0%": { transform: "translateX(0)" },
      "100%": { transform: "translateX(-50%)" },
    },
  };

  // Inject keyframes dynamically for smooth scroll
  useEffect(() => {
    const styleSheet = document.styleSheets[0];
    const keyframes = `
      @keyframes scroll {
        0% { transform: translateX(0); }
        100% { transform: translateX(-50%); }
      }
    `;
    styleSheet.insertRule(keyframes, styleSheet.cssRules.length);
  }, []);

  const handleMouseEnter = (e) => {
    e.target.style.transform = "scale(1.03)";
  };

  const handleMouseLeave = (e) => {
    e.target.style.transform = "scale(1)";
  };

  return (
    <div style={styles.scrollContainer} ref={scrollRef}>
      <div style={styles.scrollTrack}>
        {/* Repeat images twice for seamless infinite scroll */}
        {[graph01, graph02, graph03, graph01, graph02, graph03].map((img, i) => (
          <Image
            key={i}
            src={img}
            alt={`Graph ${i + 1}`}
            style={styles.scrollImage}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          />
        ))}
      </div>
    </div>
  );
};

export default VerticalScrollGraphs;
