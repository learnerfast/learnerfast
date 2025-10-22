'use client';
import FooterFive from "@/layout/footers/footer-5";
import HeaderSix from "@/layout/headers/header-6";
import RegisterArea from "./register-area";
import { Toaster } from "react-hot-toast";

const Register = () => {
  return (
    <>
      <Toaster position="top-center" />
      <HeaderSix hideNav={true} />
      <RegisterArea />
    </>
  );
};

export default Register;
