const menu_data = [
  {
    id: 1,
    mega_menu: false,
    has_dropdown: false,
    title: "Home",
    link: "/",
    active: "active",
  },
  {
    id: 2,
    mega_menu: false,
    has_dropdown: true,
    title: "Pages",
    link: "/about",
    active: "",
    sub_menus: [
      { link: "/about", title: "About" },
      { link: "/service", title: "Features" },
      { link: "/service-details", title: "Platform Demo" },
      { link: "/price", title: "Pricing" },
      { link: "/sign-in", title: "Login" },
      { link: "/register", title: "Register" },
    ],
  },
  
  {
    id: 3,
    mega_menu: false,
    has_dropdown: false,
    title: "Contact",
    link: "/contact",
    active: "",
  },
  

];
export default menu_data;
