import ServiceIconOne from "../svg/service/service-icon-1"
import ServiceIconTwo from "../svg/service/service-icon-2"
import ServiceIconThree from "../svg/service/service-icon-3"
import ServiceIconFoure from "../svg/service/service-icon-4"
import ServiceIconFive from "../svg/service/service-icon-5"
import ServiceIconsix from "../svg/service/service-icon-6"
import ServiceIconSeven from "../svg/service/service-icon-7"

// images import  
//import img_1 from "../../public/assets/img/service/sv-icon-1.png";
//import img_2 from "../../public/assets/img/service/sv-icon-2.png";
//import img_3 from "../../public/assets/img/service/sv-icon-3.png";
//import img_4 from "../../public/assets/img/service/sv-icon-4.png";
import img_5 from "../../public/assets/img/service/sv-icon-5.png";
import img_11 from "../../public/assets/img/feature/course-management.png"
import img_12 from "../../public/assets/img/feature/video-content.png";
import img_13 from "../../public/assets/img/service/typography.png";
import img_14 from "../../public/assets/img/feature/realtime.png";
import img_15 from "../../public/assets/img/feature/coursecreation.png";
import img_16 from "../../public/assets/img/feature/online-section.png";
import img_17 from "../../public/assets/img/feature/open-enrollment.png";
import img_18 from "../../public/assets/img/feature/admin-panel.png";



// for home 04
import icon_1 from "../../public/assets/img/service/sv-icon-4-1.png"
import icon_2 from "../../public/assets/img/service/sv-icon-4-2.png"
import icon_3 from "../../public/assets/img/service/sv-icon-4-3.png"
import icon_4 from "../../public/assets/img/service/sv-icon-4-4.png"

// for home 05
import img_6 from "../../public/assets/img/service/sv-icon-5-1.png";
import img_7 from "../../public/assets/img/service/sv-icon-5-2.png";
import img_8 from "../../public/assets/img/service/sv-icon-5-3.png";
import img_9 from "../../public/assets/img/service/sv-icon-5-4.png";

// import img_10 from "../../public/";
// import img_11 from "../../public/";
// import img_12 from "../../public/";
// import img_13 from "../../public/";
// import img_14 from "../../public/";
// import img_15 from "../../public/";




const  service_data = [
    // for home 01 
    {
        id: 1,
        icon: img_11,
        img: img_11,
        title: "Course Builder",
        description: <>
Create unlimited courses with sections and activities. Organize lessons, videos, and quizzes with drag-and-drop interface for seamless course structure.</>,
        delay: ".4s",
    },
    {
        id: 2,
        icon: img_15,
        img: img_15,
        title: "Website Builder",
        description: <>
Build professional learning websites with customizable templates. No coding required - just select a template, customize, and publish your branded platform.</>,
        delay: ".6s",
    },
    {
        id: 3,
        icon: img_12,
        img: img_12,
        title: "Video Hosting",
        description: <>
Secure video hosting with YouTube and Vimeo integration. Upload and embed videos directly into your courses with automatic player optimization.</>,
        delay: ".7s",
    },
    {
        id: 4,
        icon: img_18,
        img: img_18,
        title: "Student Management",
        description: <>
Track enrollments, monitor progress, and manage student accounts from a centralized dashboard. View analytics on engagement and completion rates.</>,
        delay: ".8s",
    },
    {
        id: 5,
        icon: img_14,
        img: img_14,
        title: "Real-time Preview",
        description: <>
Preview your courses and websites instantly as you build. See exactly how students will experience your content before publishing.</>,
        delay: ".9s",
    },

       {
        id: 6,
        icon: img_16,
        img: img_16,
       title: "Payment Integration",
        description: <>
Monetize your courses with PhonePe payment gateway integration. Set course prices and accept payments directly through your website.</>,
        delay: ".9s",
    }, 
       {
        id: 7,
        icon: img_17,
        img: img_17,
       title: "Analytics Dashboard",
        description: <>
Comprehensive analytics showing total students, active users, enrollment trends, and course completion rates to optimize your platform.</>,
        delay: ".9s",
    }, 

       {
        id: 8,
        icon: img_13,
        img: img_13,
       title: "Custom Branding",
        description: <>
Customize colors, fonts, logos, and layouts to match your brand identity. Create a professional learning experience with your unique style.</>,
        delay: ".9s",
    }, 

       {
        id: 9,
        icon: img_5,
        img: img_5,
         title: "User Authentication",
        description: <>
Secure login and registration system with email verification. Manage user roles and permissions for instructors and students.</>,
        delay: ".9s",
    }, 

    // for home 03
    {
        id: 10,
        icon: <ServiceIconOne />,
        img: <ServiceIconOne />,
        title: "Course Sections & Activities",
        description: <>
Organize courses into sections with multiple activity types including videos, text lessons, and quizzes for structured learning paths.</>,
        delay: ".9s",
    },
    {
        id: 11,
        icon: <ServiceIconTwo />,
        img: <ServiceIconTwo />,
        title: "Enrollment Management",
        description: <>
Automatic enrollment system for free and paid courses. Track student registrations and manage access to course content.</>,
        delay: ".9s",
    },
    {
        id: 12,
        icon: <ServiceIconThree />,
        img: <ServiceIconThree />,
        title: "Multi-Website Support",
        description: <>
Create multiple learning websites from one dashboard. Each website can have its own courses, branding, and student base.</>,
        delay: ".9s",
    },
    {
        id: 13,
        icon: <ServiceIconFoure/>,
        img: <ServiceIconFoure />,
        title: "Template Library",
        description: <>
Choose from professional website templates designed for online learning. Customize layouts, colors, and content easily.</>,
        delay: ".9s",
    },
    
    // for home 04
    {
        id: 14,
        icon: icon_1,
        img: icon_1,
        title: "Course Player",
        sub_title: "Learning Experience",
        cls: "1",
        description: <>Dedicated course player with progress tracking, section navigation, and seamless video playback for optimal learning experience.</>,
        delay: ".9s",
    },
    {
        id: 11,
        icon: icon_2,
        img: icon_2,
        title: "AI Data Cloud Solution",
        sub_title: "Cloud Backup",
        cls: "2",
        description: <>Lorem Ipsum is simply dummy text <br /> of the printing</>,
        delay: ".9s",
    },
    {
        id: 12,
        icon: icon_3,
        img: icon_3,
        title: <>Managed <br /> Web Application</>,
        sub_title: "Cloud Backup",
        cls: "3",
        description: <>Lorem Ipsum is simply dummy text <br /> of the printing</>,
        delay: ".9s",
    },
    {
        id: 13,
        icon: icon_4,
        img: icon_4,
        title: "24//7 Customer Support",
        sub_title: "Cloud Backup",
        cls: "4",
        description: <>Lorem Ipsum is simply dummy text <br /> of the printing</>,
        delay: ".9s",
    },

    // for home 05
    {
        id: 14,
        icon: img_6,
        img: img_6,
        title: <>Live Inventory <br /> Management</>,
        sub_title: "Cloud Backup",
        cls: "4",
        description: <>Track materials and stock for outsourced purchase orders</>,
        delay: ".9s",
    },
    {
        id: 15,
        icon: img_7,
        img: img_7,
        title: <>Real-time Master <br />  Planning</>,
        sub_title: "Cloud Backup",
        cls: "4",
        description: <>Track materials and stock for outsourced purchase orders</>,
        delay: ".9s",
    },
    {
        id: 16,
        icon: img_8,
        img: img_8,
        title: <>Easy Contract <br /> Manufacturing</>,
        sub_title: "Cloud Backup",
        cls: "4",
        description: <>Track materials and stock for outsourced purchase orders</>,
        delay: ".9s",
    },
    {
        id: 17,
        icon: img_9,
        img: img_9,
        title: <>Omnichannel <br /> Order Management</>,
        sub_title: "Cloud Backup",
        cls: "4",
        description: <>Track materials and stock for outsourced purchase orders</>,
        delay: ".9s",
    },

    // service page
    {
        id: 18,
        icon: <ServiceIconOne />,
        img: <ServiceIconOne />,
        title: "Project management jamil",
        description: <>Automate Workflows <br /> and Monitor your Sales.</>,
        delay: ".9s",
    },
    {
        id: 19,
        icon: <ServiceIconTwo />,
        img: <ServiceIconTwo />,
        title: "Sales analytics",
        description: <>Track your Marketing to see the best Results.</>,
        delay: ".9s",
    },
    {
        id: 20,
        icon: <ServiceIconThree />,
        img: <ServiceIconThree />,
        title: "Easy Invoicing",
        description: <>Automate recurring invoices and save time.</>,
        delay: ".9s",
    },
    {
        id: 21,
        icon: <ServiceIconFoure/>,
        img: <ServiceIconFoure />,
        title: "Complete Visibility",
        description: <>Get real-time visibility into every expense.</>,
        delay: ".9s",
    },
    
    {
        id: 22,
        icon: <ServiceIconFive/>,
        img: <ServiceIconFive />,
        title: "FIELDS OPTION",
        description: <>Quick & Easy Repeater Fields Option</>,
        delay: ".9s",
    },
    
    {
        id: 23,
        icon: <ServiceIconsix/>,
        img: <ServiceIconsix />,
        title: "Safe Online Services",
        description: <>Online services to view company level.</>,
        delay: ".9s",
    },
    
    {
        id: 24,
        icon: <ServiceIconSeven/>,
        img: <ServiceIconSeven />,
        title: "Online marketing",
        description: <>Get real-time visibility into every expense.</>,
        delay: ".9s",
    },


]
export default service_data