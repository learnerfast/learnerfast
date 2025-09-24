'use client';
import FooterFive from "@/layout/footers/footer-5";
import HeaderSix from "@/layout/headers/header-6"; 
import SingnInArea from "./singn-in-area";

const SignIn = () => {
  return (
    <>
      <HeaderSix />
      <SingnInArea />
      <FooterFive style_contact={true} style_team={true} />
    </>
  );
};

export default SignIn;
