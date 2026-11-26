/*
 * Pronomic site menu: structure, texts and links.
 *
 * This is the only file you normally need to edit.
 *
 * The menu has one job: get every visitor to the right page in as few clicks
 * as possible. Three kinds of visitors, three routes:
 *
 *  1. "I have a lifting problem"  → Find your solution (a 3-step guide in the
 *     menu, handed over to the Lifting Advisor with the answers filled in).
 *  2. "I know the product"         → Products, named the way people search
 *     (Lift&Drive, Easyhand, Mechrail…), one click to the product page.
 *  3. "My load is special"         → Tailor-made, how we adapt the solution
 *     to the load, with a direct route to an application expert.
 *
 * Links marked "verify" are best guesses and must be checked before go-live.
 * Every other pronomic.com link is taken from the Lifting Advisor config.
 */
window.PRONOMIC_MENU_CONFIG = {
  home: "https://www.pronomic.com/",
  logo: "../product-advisor/pronomic-logo.svg",
  logoAlt: "Pronomic",

  // The full Lifting Advisor page. The menu guide sends its answers there as
  // ?load=…&weight=…&movement=… so the visitor continues where they left off.
  advisorUrl: "../product-advisor/index.html", // verify: the advisor's URL on the website

  contact: {
    label: "Talk to an expert",
    shortLabel: "Contact us", // shown on laptop-width screens where space is tight
    url: "https://www.pronomic.com/contact", // verify: contact form URL
  },

  // The promise shown in the top bar on every page.
  promise: "Every lifting solution adapted to your load, by our application experts",

  search: {
    url: "https://www.pronomic.com/search?q=", // verify: site search URL; the query is appended
    placeholder: "Search products, applications, documents…",
    popular: ["Lift&Drive", "Vacuum tube lifter", "Jib crane", "Brochures"],
  },

  login: {
    label: "Log in",
    links: [
      { label: "ProBldr", detail: "Configure and save lifting trolleys", url: "https://probldr.pronomic.com/#/products" },
      { label: "Customer & partner login", detail: "Orders, documents and price lists", url: "https://www.pronomic.com/login.php" }, // verify
    ],
  },

  languages: {
    current: "EN",
    links: [
      { code: "EN", label: "English (International)", url: "https://www.pronomic.com/" },
      { code: "SV", label: "Svenska", url: "https://www.pronomic.com/se/" }, // verify
      { code: "DE", label: "Deutsch", url: "https://www.pronomic.com/de/" }, // verify
      { code: "FR", label: "Français", url: "https://www.pronomic.com/fr/" }, // verify
      { code: "FI", label: "Suomi", url: "https://www.pronomic.com/fi/" }, // verify
    ],
  },

  // Quick links in the top bar: the pages people come back for.
  utility: [
    { label: "Customer cases", url: "https://www.pronomic.com/knowledge/customer-cases" },
    { label: "Downloads", url: "https://www.pronomic.com/knowledge/downloads" }, // verify
  ],

  items: [
    // ------------------------------------------------------------------------
    {
      id: "guide",
      type: "guide",
      label: "Find your solution",
      title: "Find the right lifting solution",
      lede: "Three quick questions and we'll point you to the right type of solution.",
      // Questions taken from the Lifting Advisor config, in this order.
      questions: ["load", "weight", "movement"],
      steps: ["What", "How heavy", "Where to"],
      byNeed: {
        title: "Or start from what you need to do",
        // Each link opens the Lifting Advisor with the movement answered.
        links: [
          { label: "Lift at one workstation", movement: "station" },
          { label: "Move loads around the building", movement: "around" },
          { label: "Lift along a line or across an area", movement: "line" },
          { label: "Move goods between floors", movement: "floors" },
          { label: "Get a better working height", movement: "height" },
        ],
      },
    },

    // ------------------------------------------------------------------------
    {
      id: "products",
      type: "mega",
      label: "Products",
      groups: [
        {
          // The three ranges most visitors come for: shown first, with a benefit line.
          title: "Core range",
          links: [
            { label: "Lift&Drive lifting trolleys", detail: "Lift and move loads anywhere. No installation", url: "https://www.pronomic.com/products/lifting-trolleys", icon: "lifting-trolley" },
            { label: "Vacuum tube lifters", detail: "Grip and lift by suction, again and again", url: "https://www.pronomic.com/products/vacuum-tube-lifters", icon: "vacuum-tube-lifter" },
            { label: "Jib cranes", detail: "Precise lifting at the workstation", url: "https://www.pronomic.com/products/jib-cranes", icon: "jib-crane" },
          ],
        },
        {
          title: "More lifting solutions",
          links: [
            { label: "Manipulators", detail: "Turn, tilt and place. Up to 650 kg", url: "https://www.pronomic.com/products/manipulators/mechlift-pro", icon: "manipulator" },
            { label: "Mechrail overhead rails", detail: "Along a line or across an area", url: "https://www.pronomic.com/products/overhead-crane-system/mechrail", icon: "overhead-crane" },
            { label: "Hoists", detail: "Mechchain Pro II, Bal-Trol", url: "https://www.pronomic.com/products/hoists", icon: "hoist" },
            { label: "Lifting tables", detail: "The right working height", url: "https://www.pronomic.com/products/lifting-tables/static-lifting-tables", icon: "lifting-table" },
            { label: "Goods lifts", detail: "Between floors and to mezzanines", url: "https://www.pronomic.com/products/elevators-and-goods-lifts", icon: "goods-lift" },
            { label: "Server lifters", detail: "For data centres", url: "https://www.pronomic.com/data-center/products/server-lifters", icon: "server-lifter" },
          ],
        },
        {
          title: "Specialized",
          links: [
            { label: "Tools and accessories", detail: "Forks, Squeeze&Turn, Turn, Prong…", url: "https://www.pronomic.com/products/lifting-trolleys/tools-lifting-trolleys", icon: "parts" }, // verify
            { label: "Grippers", detail: "For sacks, rolls, kegs, panels and more", url: "https://www.pronomic.com/products/grippers", icon: "hoist" },
            { label: "Custom solutions", detail: "Designed for your load and workplace", tailor: true, icon: "tool" },
          ],
        },
      ],
      footer: [
        { label: "View all products", url: "https://www.pronomic.com/products" }, // verify
        { label: "Brochures and data sheets", url: "https://www.pronomic.com/knowledge/downloads" }, // verify
      ],
      feature: {
        kind: "probldr",
        eyebrow: "Configurator",
        title: "Build your lifting trolley in ProBldr",
        text: "Choose model, tool and options yourself, and send it to us for a quote.",
        link: { label: "Open ProBldr", url: "https://probldr.pronomic.com/#/products" },
      },
    },

    // ------------------------------------------------------------------------
    {
      id: "tailor",
      type: "tailor",
      label: "Tailor-made",
      title: "Tailored to your load",
      lede: "Our standard products are the starting point. Our application experts adapt the gripper, the tool and the set-up to your load, your workplace and your process.",
      steps: [
        { title: "Tell us what you lift", text: "Weight, shape and where it goes. A photo of the load helps." },
        { title: "We design the solution", text: "We choose the lifting device and design the gripper or tool your load needs." },
        { title: "Delivered and installed", text: "Your team gets a solution that fits the job, with training and service." }, // verify: wording with sales/service
      ],
      examples: {
        title: "Things we tailor",
        links: [
          { label: "Custom grippers", detail: "For sacks, rolls, kegs, panels and odd shapes", url: "https://www.pronomic.com/products/grippers" },
          { label: "Tools for Lift&Drive", detail: "Swap the front tool to suit the load", url: "https://www.pronomic.com/products/lifting-trolleys/tools-lifting-trolleys" }, // verify
          { label: "Customer cases", detail: "See solutions we have delivered", url: "https://www.pronomic.com/knowledge/customer-cases" },
        ],
      },
      primary: { label: "Describe your lift", topic: "tailor-made" }, // goes to contact.url?topic=tailor-made
      secondary: { label: "Start the lifting guide" },
    },

    // ------------------------------------------------------------------------
    {
      id: "applications",
      type: "mega",
      label: "Applications",
      groups: [
        {
          title: "By load",
          columns: 2,
          links: [
            { label: "Boxes, cartons and crates", url: "https://www.pronomic.com/applications/boxes-cartons-and-crates", icon: "boxes" },
            { label: "Bags and sacks", url: "https://www.pronomic.com/applications/bags-and-sacks", icon: "sacks" },
            { label: "Rolls and reels", url: "https://www.pronomic.com/applications/rolls-and-reels", icon: "rolls" },
            { label: "Panels, sheets and glass", url: "https://www.pronomic.com/applications/panels-sheets-and-glass", icon: "panels" },
            { label: "Components and tools", url: "https://www.pronomic.com/applications/components-and-tools", icon: "parts" },
            { label: "Wheels and tyres", url: "https://www.pronomic.com/applications/wheels-and-tyres", icon: "wheels" },
            { label: "Servers and batteries", url: "https://www.pronomic.com/data-center/products/server-lifters", icon: "servers" },
            { label: "Buckets, barrels and drums", url: "https://www.pronomic.com/applications", icon: "drums" }, // verify: no dedicated page found
          ],
        },
        {
          title: "By industry",
          links: [
            { label: "Food and beverage", detail: "Dry and ambient zones, stainless options", url: "https://www.pronomic.com/industries/food-and-beverage" }, // verify
            { label: "Manufacturing", url: "https://www.pronomic.com/industries/manufacturing" }, // verify
            { label: "Logistics and warehousing", url: "https://www.pronomic.com/industries/logistics" }, // verify
            { label: "Pharma and med tech", url: "https://www.pronomic.com/industries/pharma" }, // verify
            { label: "Data centres", url: "https://www.pronomic.com/data-center" }, // verify
          ],
        },
      ],
      footer: [{ label: "All applications", url: "https://www.pronomic.com/applications" }],
    },

    // ------------------------------------------------------------------------
    {
      id: "knowledge",
      type: "mega",
      label: "Knowledge",
      groups: [
        {
          title: "See it in use",
          links: [
            { label: "Customer cases", detail: "Arla Foods, SIA Glass, Wienerberger and more", url: "https://www.pronomic.com/knowledge/customer-cases" },
            { label: "Videos", url: "https://www.pronomic.com/knowledge/videos" }, // verify
          ],
        },
        {
          title: "Choose and comply",
          links: [
            { label: "How to choose a lifting solution", detail: "The Lifting Advisor", advisor: true },
            { label: "Lifting rules and safety", detail: "What the law says about manual handling", url: "https://www.pronomic.com/knowledge/manual-handling-regulations" }, // verify
          ],
        },
        {
          title: "Documents",
          links: [
            { label: "Brochures and data sheets", detail: "Download as PDF", url: "https://www.pronomic.com/knowledge/downloads" }, // verify
            { label: "Manuals and declarations", url: "https://www.pronomic.com/knowledge/manuals" }, // verify
          ],
        },
      ],
    },

    // ------------------------------------------------------------------------
    {
      id: "about",
      type: "list",
      placement: "utility", // top bar on desktop, accordion in the mobile menu
      label: "About us",
      links: [
        { label: "About Pronomic", url: "https://www.pronomic.com/about" }, // verify
        { label: "Service and spare parts", url: "https://www.pronomic.com/service" }, // verify
        { label: "Careers", url: "https://www.pronomic.com/careers" }, // verify
        { label: "Contact", url: "https://www.pronomic.com/contact" }, // verify
      ],
    },
  ],
};
