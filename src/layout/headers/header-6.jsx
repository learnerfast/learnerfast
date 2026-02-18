'use client';
import useSticky from '@/hooks/use-sticky';
import Offcanvus from '@/common/offcanvus';
import UserIcon from '@/svg/user-icon';
import Link from 'next/link';
import Image from 'next/image';
import React, { useState, useEffect } from 'react';
import NavMenu from './nav-menu';
import { supabase } from '@/lib/supabase';
import UserDropdown from '@/components/UserDropdown';
import '@/styles/user-dropdown.css';

import logo_black from "@/../public/learnerfast-logo.png";
import logo_white from "@/../public/white-logo.png";


const HeaderSix = ({ style_2 = false, hideNav = false }) => {
   const { sticky } = useSticky()
   const [sidebarOpen, setSidebarOpen] = useState(false)
   const [user, setUser] = useState(null)
   const [loading, setLoading] = useState(true)
   const [showDropdown, setShowDropdown] = useState(false)
   const [dropdownTimeout, setDropdownTimeout] = useState(null)
   const [sites, setSites] = useState([])

   const loadUserSites = async (userId) => {
      try {
         const { data, error } = await supabase
            .from('sites')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
            .limit(3)
         
         if (error) throw error
         
         setSites((data || []).slice(0, 3))
      } catch (error) {
         setSites([])
      }
   }

   useEffect(() => {
      const getUser = async () => {
         const { data: { user } } = await supabase.auth.getUser()
         setUser(user)
         if (user) {
            loadUserSites(user.id)
         }
         setLoading(false)
      }
      getUser()
      
      const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
         const currentUser = session?.user || null
         setUser(currentUser)
         setLoading(false)
         if (currentUser) {
            loadUserSites(currentUser.id)
         } else {
            setSites([])
         }
      })
      
      return () => subscription.unsubscribe()
   }, [])

   const handleLogout = async () => {
      await supabase.auth.signOut()
   }

   return (
      <>
         <header>
            <div id="header-sticky" className={`header-bottom__area header-sticky-bg-2 header-bottom__transparent z-index-5 ${style_2 ? 'inner-header-2' : ''} ${sticky ? "header-sticky" : ''}`} style={hideNav ? {paddingTop: '20px', paddingBottom: '20px'} : {}}>
               <div className="container">
                  <div className="row g-0 align-items-center">
                     <div className="col-xxl-2 col-xl-2 col-lg-2 col-md-4 col-6">
                        <div className="header-bottom__logo" style={{marginLeft: hideNav ? '-80px' : '-20px'}}>
                           {style_2 ? <Link href="/">
                              <Image src={logo_black} alt="theme-pure" style={{maxWidth: '150px', height: 'auto'}} />
                           </Link> : <><Link className="white-logo" href="/">
                              <Image src={logo_white} alt="theme-pure" style={{maxWidth: '150px', height: 'auto'}} />
                           </Link>
                              <Link className="black-logo" href="/">
                                 <Image src={logo_black} alt="" style={{maxWidth: '150px', height: 'auto'}} />
                              </Link></>
                           }
                        </div>
                     </div>
                     {!hideNav && (
                        <div className="col-xxl-7 col-xl-7 col-lg-7 d-none d-lg-block">
                           <div className="header-bottom__main-menu header-bottom__main-menu-4 header-bottom__main-menu-inner">
                              <nav id="mobile-menu">
                                 <NavMenu />
                              </nav>
                           </div>
                        </div>
                     )}
                     {hideNav && <div className="col-xxl-7 col-xl-7 col-lg-7 d-none d-lg-block"></div>}
                     <div className="col-xxl-3 col-xl-3 col-lg-3 col-md-8 col-6">
                        <div className="header-bottom__right d-flex align-items-center justify-content-end">
                           <div className="header-bottom__action header-bottom__action-4">
                              {loading ? null : user ? (
                                 <div className="d-none d-lg-inline-block last-child position-relative"
                                      onMouseEnter={() => {
                                         if (dropdownTimeout) clearTimeout(dropdownTimeout)
                                         setShowDropdown(true)
                                      }}
                                      onMouseLeave={() => {
                                         const timeout = setTimeout(() => setShowDropdown(false), 300)
                                         setDropdownTimeout(timeout)
                                      }}>
                                    <div className="d-flex align-items-center cursor-pointer tp-header-action-item" style={{color: 'white'}}>
                                       <UserIcon /> 
                                       <span className="ms-2">{user.user_metadata?.full_name || user.email}</span>
                                       <svg className="ms-1" width="8" height="5" viewBox="0 0 8 5" fill="none">
                                          <path d="M1 1L4 4L7 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                       </svg>
                                    </div>
                                    {showDropdown && (
                                       <UserDropdown sites={sites} onLogout={handleLogout} />
                                    )}
                                 </div>
                              ) : (
                                 <Link className="d-inline-block header-bottom__action-2 border-none" href="/sign-in" style={{color: 'black', fontWeight: 'bold'}}>
                                    <UserIcon />
                                    <span>Log In</span>
                                 </Link>
                              )}
                           </div>
                           <div className="header-bottom__btn d-flex align-items-center">
                              {!loading && !user && (
                                 <Link className={`${style_2 ? 'tp-btn-inner alt-color-orange' : 'tp-btn-white alt-color-black'} tp-btn-hover d-none d-md-inline-block`} href="/register">
                                    <span className="white-text">Get Started</span>
                                    <b></b>
                                 </Link>
                              )}
                              <a className="header-bottom__bar tp-menu-bar d-lg-none" onClick={() => setSidebarOpen(true)}>
                                 <i className="fal fa-bars"></i>
                              </a>
                           </div>
                        </div>
                     </div>
                  </div>
               </div>
            </div>
         </header>
         <Offcanvus sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      </>
   );
};

export default HeaderSix;