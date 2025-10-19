import React, { useState } from 'react';
import RegisterForm from '@/forms/register-form';
import AppleIcon from '@/svg/apple-icon'; 

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';


// shape import here
import shape_1 from "@/assets/img/login/login-shape-1.png";
import shape_2 from "@/assets/img/login/login-2.png";
import shape_3 from "@/assets/img/login/login-1.png";
import shape_4 from "@/assets/img/login/login-3.png";
import shape_5 from "@/assets/img/login/login-4.png";


const register_content = {
   bg_img: "/assets/img/login/login-bg-shape.png",
   banner_title: <>Welcome To <br /> Your Softec System.</>, 
}
const {bg_img, banner_title, }  = register_content

const RegisterArea = () => {
    const router = useRouter();
    const [error, setError] = useState("");

    return (
        <>
            <div id="smooth-wrapper">
            <div id="smooth-content">
               <main>
               <div className="signin-banner-area signin-banner-main-wrap d-flex align-items-center">
                  <div className="signin-banner-left-box signin-banner-bg p-relative" 
                        style={{backgroundImage: `url(${bg_img})`}}>
                     <div className="signin-banner-bottom-shape">
                        <Image src={shape_1} alt="theme-pure"/>
                     </div>
                     <div className="signin-banner-left-wrap">
                        <div className="signin-banner-title-box mb-100">
                           <h4 className="signin-banner-title tp-char-animation">{banner_title}</h4>
                        </div>
                        <div className="signin-banner-img-box position-relative">
                           <div className="signin-banner-img signin-img-1 d-none d-md-block z-index-3">
                              <Image src={shape_2} alt="theme-pure"/>
                           </div>
                           <div className="signin-banner-img signin-img-2 d-none d-md-block">
                              <Image src={shape_3} alt="theme-pure"/>
                           </div>
                           <div className="signin-banner-img signin-img-3 d-none d-md-block z-index-5">
                              <Image src={shape_4} alt="theme-pure"/>
                           </div>
                           <div className="signin-banner-img signin-img-4 d-none d-sm-block">
                              <Image src={shape_5} alt="theme-pure"/>
                           </div>
                        </div>
                     </div>
                  </div>
                  <div className="signin-banner-from d-flex justify-content-center align-items-center">
                     <div className="signin-banner-from-wrap">
                        <div className="signin-banner-title-box">
                           <h4 className="signin-banner-from-title">Register Account</h4>
                        </div>
                        <div className="signin-banner-login-browser">
                           <a href="#" onClick={(e) => e.preventDefault()}> 
                              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                 <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"></path>
                                 <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"></path>
                                 <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"></path>
                                 <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"></path>
                              </svg>
                              Continue with Google
                           </a>
                           <Link href="#"> 
                              <AppleIcon />
                           </Link>
                        </div>
                        <div className="signin-banner-from-box">
                           <h5 className="signin-banner-from-subtitle">Or Sign In with email</h5>
                           {error && <div className="alert alert-danger mb-20">{error}</div>}
                           <RegisterForm />  
                        </div>
                     </div>
                  </div>
               </div>
               </main>
            </div>
         </div>
        </>
    );
};

export default RegisterArea;