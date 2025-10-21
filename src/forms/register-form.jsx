import React, { useState } from "react";
import EyeOff from "../svg/eye-off";
import EyeOn from "../svg/eye-on";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup"; 
import Link from "next/link";
import { supabase } from "../lib/supabase";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";


const schema = yup
  .object({
    fullname: yup.string().required().label("FullName"),
    email: yup.string().required().email().label("Email"),
    password: yup.string().required().min(6).label("Password"),

  })
  .required();


const RegisterForm = () => {

  const {
    register,
    handleSubmit, reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  
  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const { data: signUpData, error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            full_name: data.fullname
          }
        }
      });
      
      if (error) {
        if (error.message.includes('429') || error.status === 429) {
          throw new Error('Too many requests. Please wait a few minutes and try again.');
        }
        throw error;
      }
      
      if (signUpData?.user && signUpData?.user?.identities?.length === 0) {
        throw new Error('This email is already registered. Please sign in instead.');
      }
      
      toast.success('Registration successful! Please check your email inbox (and spam folder) to verify your account before signing in.', {
        duration: 5000,
        style: {
          background: '#4f46e5',
          color: '#ffffff',
          padding: '16px 24px',
          borderRadius: '0.75rem',
          fontSize: '15px',
          fontWeight: '500',
          maxWidth: '500px',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)'
        },
        iconTheme: {
          primary: '#ffffff',
          secondary: '#4f46e5'
        }
      });
      reset();
      setTimeout(() => router.push('/sign-in'), 5000);
    } catch (error) {
      let errorMessage = 'Registration failed';
      if (error.message.includes('already registered') || error.message.includes('User already registered')) {
        errorMessage = 'This email is already registered. Please sign in instead.';
      } else if (error.message.includes('Too many requests')) {
        errorMessage = error.message;
      } else {
        errorMessage = error.message || 'Registration failed';
      }
      toast.error(errorMessage, {
        duration: 5000,
        style: {
          background: '#ef4444',
          color: '#ffffff',
          padding: '16px 24px',
          borderRadius: '0.75rem',
          fontSize: '15px',
          fontWeight: '500',
          maxWidth: '500px',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)'
        }
      });
    } finally {
      setLoading(false);
    }
  };

  // password show & hide
  const [passwordType, setPasswordType] = useState("password");
  const togglePassword = () => {
    if (passwordType === "password") {
      setPasswordType("text");
    } else {
      setPasswordType("password");
    }
  };
  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="row">
          <div className="col-12">
            <div className="postbox__comment-input mb-30">
              <input 
              name="fullname"
              {...register("fullname")}
              className="inputText" 
              />
              <span className="floating-label">Full Name</span>
              <p className="form_error">{errors.fullname?.message}</p>
            </div>
          </div>
          <div className="col-12">
            <div className="postbox__comment-input mb-30"> 
              <input
                name="email"
                className="inputText"
                {...register("email")}
              />
              <span className="floating-label">Your Email</span>
              <p className="form_error">{errors.email?.message}</p>
            </div>
          </div>
          <div className="col-12">
            <div className="mb-30">
            <div className="postbox__comment-input"> 
              <input
                id="myInput"
                className="inputText password"
                type={passwordType}
                name="password"
                autoComplete="new-password"
                {...register("password")}
              />
              <span className="floating-label">Password</span>
              <span id="click" className="eye-btn" onClick={togglePassword}>
                {passwordType === "password" ? (
                  <span className="eye-off">
                    <EyeOff />
                  </span>
                ) : (
                  <span className="eye-off">
                    <EyeOn />
                  </span>
                )}
              </span>
            </div>
              <p className="form_error">{errors.password?.message}</p>
            </div>
          </div> 
        </div>

        <div className="signin-banner-form-remember">
          <div className="row">
            <div className="col-6">
              <div className="postbox__comment-agree">
                <div className="form-check">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    value=""
                    id="flexCheckDefault"
                  />
                  <label
                    className="form-check-label"
                    htmlFor="flexCheckDefault"
                  >
                    Remember me
                  </label>
                </div>
              </div>
            </div>
            <div className="col-6">
              <div className="postbox__forget text-end">
                <Link href="#">Forgot password ?</Link>
              </div>
            </div>
          </div>
        </div>
        <div className="signin-banner-from-btn mb-20">
          <button type="submit" className="signin-btn" disabled={loading}>
            {loading ? 'Registering...' : 'Register'}
          </button>
        </div>
        <div className="signin-banner-from-register">
          <Link href="/sign-in">
            Already have an account ? <span>Sign In</span>
          </Link>
        </div>
      </form>
    </>
  );
};

export default RegisterForm;
