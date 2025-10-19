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
        icon: img_14,
        img: img_14,
        title: "Real-time Preview",
        description: <>
Preview course changes instantly as you build, ensuring flawless lesson layouts, accurate content updates, and efficient course development without delays or repeated publishing.</>,
        delay: ".4s",
    },
    {
        id: 2,
        icon: img_13,
        img: img_13,
        title: "Typography Management & Customization",
        description: <>
Customize fonts, colors, and styles to maintain brand consistency, improve readability, and create visually appealing, professional course materials that engage learners effectively.</>,
        delay: ".6s",
    },
    {
        id: 3,
        icon: img_11,
        img: img_11,
        title: "Course Management",
        description: <>
Effortlessly organize, schedule, and monitor courses from a centralized dashboard, track learner progress, assign instructors, and ensure a structured, seamless learning experience.</>,
        delay: ".7s",
    },
    {
        id: 4,
        icon: img_15,
        img: img_15,
        title: "Course Creation & Organization",
        description: <>
Build and structure courses with intuitive tools, arranging lessons, modules, and topics logically for a smooth, guided learning journey that enhances comprehension.</>,
        delay: ".8s",
    },
    {
        id: 5,
        icon: img_12,
        img: img_12,
        title: "Video Content Management",
        description: <>
Upload, categorize, and secure video lessons with privacy settings, captions, and playback options, offering a rich multimedia experience that boosts learner engagement.</>,
        delay: ".9s",
    },

       {
        id: 6,
        icon: img_16,
        img: img_16,
       title: "Course Sections & Activities",
        description: <>
Break courses into modules with lessons, quizzes, and interactive exercises, helping learners apply knowledge, practice skills, and track their progress effectively.</>,
        delay: ".9s",
    }, 
       {
        id: 7,
        icon: img_17,
        img: img_17,
       title: "Student Enrollment Tracking",
        description: <>
Break courses into modules with lessons, quizzes, and interactive exercises, helping learners apply knowledge, practice skills, and track their progress effectively.</>,
        delay: ".9s",
    }, 

       {
        id: 8,
        icon: img_18,
        img: img_18,
       title: "Student/User Administration",
        description: <>
Manage accounts, profiles, and learner roles easily, ensuring smooth administration, personalized support, and an organized learning environment for students and instructors.</>,
        delay: ".9s",
    }, 

       {
        id: 9,
        icon: img_5,
        img: img_5,
         title: "Access Control & Permissions",
        description: <>
Set role-based permissions to control who can view, edit, or manage course content, keeping your learning platform secure and organized.</>,
        delay: ".9s",
    }, 
       {
        id: 8,
        icon: img_5,
        img: img_5,
         title: "Access Control & Permissions",
        description: <>
Set role-based permissions to control who can view, edit, or manage course content, keeping your learning platform secure and organized.</>,
        delay: ".9s",
    }, 

    // for home 03
    {
        id: 6,
        icon: img_16,
        img: img_16,
        title: "Course Sections & Activities",
        description: <>
Track student registrations, monitor participation, analyze completion rates, and gain actionable insights to optimize course delivery and improve learning outcomes.</>,
        delay: ".9s",
    },
    {
        id: 7,
        icon: <ServiceIconTwo />,
        img: <ServiceIconTwo />,
        title: "Student Enrollment Tracking",
        description: <>
Track student registrations, monitor participation, analyze completion rates, and gain actionable insights to optimize course delivery and improve learning outcomes.</>,
        delay: ".9s",
    },
    {
        id: 8,
        icon: <ServiceIconThree />,
        img: <ServiceIconThree />,
        title: "Student/User Administration",
        description: <>
Manage accounts, profiles, and learner roles easily, ensuring smooth administration, personalized support, and an organized learning environment for students and instructors.</>,
        delay: ".9s",
    },
    {
        id: 9,
        icon: <ServiceIconFoure/>,
        img: <ServiceIconFoure />,
        title: "Access Control & Permissions",
        description: <>
Set role-based permissions to control who can view, edit, or manage course content, keeping your learning platform secure and organized.</>,
        delay: ".9s",
    },
    
    // for home 04
    {
        id: 10,
        icon: icon_1,
        img: icon_1,
        title: "Communication Tools",
        sub_title: "Cloud Backup",
        cls: "1",
        description: <>Engage learners with messaging, announcements, and discussion boards, fostering collaboration, timely feedback, and interactive learning for better knowledge retention.</>,
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