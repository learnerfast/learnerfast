

// images import  
import img_1 from "../../public/assets/img/service/sv-icon-1.png";
import img_2 from "../../public/assets/img/service/sv-icon-2.png";
import img_3 from "../../public/assets/img/service/sv-icon-3.png";
import img_4 from "../../public/assets/img/service/sv-icon-4.png";
import img_5 from "../../public/assets/img/service/sv-icon-5.png";
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
        icon: img_1,
        img: img_1,
        title: "Drag & Drop Builder",
        description: <>Create professional websites <br /> without coding skills</>,
        delay: ".4s",
    },
    {
        id: 2,
        icon: img_2,
        img: img_2,
        title: "Secure Video Embedding",
        description: <>DRM protection and watermarking <br /> for your content</>,
        delay: ".6s",
    },
    {
        id: 3,
        icon: img_3,
        img: img_3,
        title: "Custom Domains",
        description: <>Brand your learning platform <br /> with your own domain</>,
        delay: ".7s",
    },
    {
        id: 4,
        icon: img_4,
        img: img_4,
        title: "Analytics Dashboard",
        description: <>Track student engagement <br /> and video performance</>,
        delay: ".8s",
    },
    {
        id: 5,
        icon: img_5,
        img: img_5,
        title: "White-Label Solution",
        description: <>Complete branding control <br /> for your academy</>,
        delay: ".9s",
    },

    // for home 03
    {
        id: 6,
        icon: img_1,
        img: img_1,
        title: "Project management jamil",
        description: <>Automate Workflows <br /> and Monitor your Sales.</>,
        delay: ".9s",
    },
    {
        id: 7,
        icon: img_2,
        img: img_2,
        title: "Sales analytics",
        description: <>Track your Marketing to see the best Results.</>,
        delay: ".9s",
    },
    {
        id: 8,
        icon: img_3,
        img: img_3,
        title: "Easy Invoicing",
        description: <>Automate recurring invoices and save time.</>,
        delay: ".9s",
    },
    {
        id: 9,
        icon: img_4,
        img: img_4,
        title: "Complete Visibility",
        description: <>Get real-time visibility into every expense.</>,
        delay: ".9s",
    },
    
    // for home 04
    {
        id: 10,
        icon: icon_1,
        img: icon_1,
        title: "Cyber Security Solustions jamil",
        sub_title: "Cloud Backup",
        cls: "1",
        description: <>Lorem Ipsum is simply dummy text <br /> of the printing</>,
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
        icon: img_1,
        img: img_1,
        title: "Website Builder",
        description: <>Drag-and-drop interface <br /> for creating learning sites</>,
        delay: ".9s",
    },
    {
        id: 19,
        icon: img_2,
        img: img_2,
        title: "Video Integration",
        description: <>Embed videos from Vimeo, <br /> VdoCipher, and more</>,
        delay: ".9s",
    },
    {
        id: 20,
        icon: img_3,
        img: img_3,
        title: "Student Management",
        description: <>Track learner progress <br /> and engagement</>,
        delay: ".9s",
    },
    {
        id: 21,
        icon: img_4,
        img: img_4,
        title: "Content Protection",
        description: <>DRM and watermarking <br /> for secure delivery</>,
        delay: ".9s",
    },
    
    {
        id: 22,
        icon: img_5,
        img: img_5,
        title: "Monetization Tools",
        description: <>Payment integration <br /> for course sales</>,
        delay: ".9s",
    },
    
    {
        id: 23,
        icon: img_1,
        img: img_1,
        title: "Custom Branding",
        description: <>White-label solution <br /> with your brand</>,
        delay: ".9s",
    },
    
    {
        id: 24,
        icon: img_2,
        img: img_2,
        title: "Analytics & Reports",
        description: <>Detailed insights on <br /> student performance</>,
        delay: ".9s",
    },


]
export default service_data