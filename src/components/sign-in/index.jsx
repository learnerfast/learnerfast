'use client';
import HeaderSix from "@/layout/headers/header-6"; 
import SingnInArea from "./singn-in-area";
import { Toaster } from 'react-hot-toast';

const SignIn = () => {
  return (
    <>
      <Toaster position="top-center" toastOptions={{ style: { zIndex: 9999 } }} />
      <HeaderSix hideNav={true} />
      <SingnInArea />
    </>
  );
};

export default SignIn;
