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
import LoadingScreen from "../components/LoadingScreen";

const schema = yup
  .object({
    email: yup.string().required().email().label("Email"),
    password: yup.string().required().min(6).label("Password"),

  })
  .required();

const LogingForm = () => { 
  const {
    register,
    handleSubmit, 
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  
  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const { data: signInData, error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password
      });
      
      if (error) {
        if (error.message.includes('Email not confirmed')) {
          throw new Error('Please verify your email before signing in. Check your inbox.');
        }
        if (error.message.includes('Invalid login credentials')) {
          throw new Error('Invalid email or password. Please try again.');
        }
        throw error;
      }
      
      toast.success('Signed in successfully!');
      reset();
      router.push('/dashboard');
    } catch (error) {
      toast.error(error.message || 'Sign in failed');
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

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    if (!resetEmail) {
      toast.error('Please enter your email');
      return;
    }
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
        redirectTo: `${window.location.origin}/sign-in`,
      });
      if (error) throw error;
      toast.success('Password reset link sent! Check your email.');
      setShowForgotPassword(false);
      setResetEmail('');
    } catch (error) {
      toast.error(error.message || 'Failed to send reset link');
    }
  };

  if (loading) return <LoadingScreen />;

  if (showForgotPassword) {
    return (
      <form onSubmit={handleForgotPassword}>
        <div className="row">
          <div className="col-12">
            <div className="postbox__comment-input mb-30"> 
              <input
                type="email"
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                className="inputText"
                required
              />
              <span className="floating-label">Your Email</span>
            </div>
          </div>
        </div>
        <div className="signin-banner-from-btn mb-20">
          <button type="submit" className="signin-btn">
            Send Reset Link
          </button>
        </div>
        <div className="signin-banner-from-register">
          <a href="#" onClick={(e) => { e.preventDefault(); setShowForgotPassword(false); }}>
            Back to <span>Sign In</span>
          </a>
        </div>
      </form>
    );
  }

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="row">
          <div className="col-12">
            <div className="postbox__comment-input mb-30"> 
              <input
                name="email"
                type="email"
                autoComplete="username"
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
                autoComplete="current-password"
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
                <a href="#" onClick={(e) => { e.preventDefault(); setShowForgotPassword(true); }}>Forgot password ?</a>
              </div>
            </div>
          </div>
        </div>
        <div className="signin-banner-from-btn mb-20">
          <button type="submit" className="signin-btn" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </div>
        <div className="signin-banner-from-register">
          <Link href="/register">
            Don't have account ? <span>Register</span>
          </Link>
        </div>
      </form>
    </>
  );
};

export default LogingForm;
