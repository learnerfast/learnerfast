import React, { useState } from 'react';
import RegisterForm from '@/forms/register-form';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';


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

    const handleGoogleSignIn = async () => {
        setError("");
        try {
            const { data, error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: `${window.location.origin}/dashboard`
                }
            });
            if (error) {
                throw error;
            }
        } catch (error) {
            setError(error.message || 'Failed to sign in with Google');
        }
    };

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
                           <h4 className="signin-banner-title tp-char-animation">Welcome To LearnerFast</h4>
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
                  <div className="signin-banner-from d-flex justify-content-center align-items-center" style={{animation: 'fadeSlideIn 0.5s ease-in-out'}}>
                     <div className="signin-banner-from-wrap">
                        <div className="signin-banner-title-box">
                           <h4 className="signin-banner-from-title">Create Your Account</h4>
                        </div>
                        <div className="signin-banner-from-box">
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