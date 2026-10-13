/*
 * Pronomic Lifting Advisor — questions & product catalogue.
 *
 * This is the only file you normally need to edit.
 *  - questions: what the visitor is asked, in order.
 *  - products:  the lifting solutions we can recommend, and how each answer
 *               affects that product's score.
 *
 * How scoring works (per product):
 *  - `exclude`   : { questionId: [optionValues] } — product is never shown if
 *                  the visitor picked any of these values.
 *  - `capacityKg`: [min, max] — compared with the "weight" answer. Products
 *                  that cannot lift the lightest load in the chosen band are
 *                  excluded; products that only cover part of the band get a
 *                  penalty and a "check model capacity" note.
 *  - `score`     : { questionId: { optionValue: points } } — added up.
 *                  Positive = good fit, negative = poor fit.
 *  - `reasons`   : { "questionId:optionValue": "text" } — shown to the visitor
 *                  as "Why this fits" when that answer was given.
 *
 * TODO (Pronomic): verify capacities and URLs marked "verify" against the
 * live product pages before publishing.
 */
window.PRONOMIC_ADVISOR_CONFIG = {
  contact: {
    // Where the "Talk to an expert" button goes. The visitor's answers are
    // appended as a summary (mailto body, or ?advisor=... for a form URL).
    url: "https://www.pronomic.com/contact", // verify
    email: "", // e.g. "sales@pronomic.com" — if set, a mailto link is used instead
  },

  maxResults: 3,

  questions: [
    {
      id: "load",
      title: "What do you need to lift?",
      help: "Pick the type of load that best matches your most common lift.",
      type: "single",
      options: [
        { value: "boxes", label: "Boxes, sacks or cartons", icon: "📦" },
        { value: "rolls", label: "Rolls or reels", icon: "🧻" },
        { value: "panels", label: "Panels, sheets or glass", icon: "🪟" },
        { value: "servers", label: "Servers, batteries or IT equipment", icon: "🖥️" },
        { value: "drums", label: "Drums, barrels or kegs", icon: "🛢️" },
        { value: "parts", label: "Machine parts, tools or components", icon: "⚙️" },
        { value: "other", label: "Something else", icon: "❔" },
      ],
    },
    {
      id: "weight",
      title: "How heavy is the heaviest load?",
      help: "Include any packaging or pallet the load sits on.",
      type: "single",
      options: [
        { value: "w35", label: "Up to 35 kg", kg: [0, 35] },
        { value: "w80", label: "35 – 80 kg", kg: [35, 80] },
        { value: "w150", label: "80 – 150 kg", kg: [80, 150] },
        { value: "w325", label: "150 – 325 kg", kg: [150, 325] },
        { value: "w1000", label: "325 – 1 000 kg", kg: [325, 1000] },
        { value: "w1000plus", label: "More than 1 000 kg", kg: [1000, 5000] },
      ],
    },
    {
      id: "surface",
      title: "What is the surface of the load like?",
      help: "This tells us how the load can be gripped.",
      type: "single",
      options: [
        { value: "smooth", label: "Flat, smooth and fairly airtight", hint: "e.g. sealed cartons, sheet metal, glass" },
        { value: "porous", label: "Porous, uneven or irregular", hint: "e.g. open sacks, castings, odd shapes" },
        { value: "eyes", label: "Has lifting eyes, hooks or handles" },
        { value: "unsure", label: "Not sure / it varies" },
      ],
    },
    {
      id: "movement",
      title: "Where does the load need to go?",
      type: "single",
      options: [
        { value: "station", label: "Within one workstation", hint: "Lift and place within a few metres" },
        { value: "area", label: "Across a larger area of the hall", hint: "e.g. along a production line" },
        { value: "mobile", label: "Moved around the building", hint: "Between rooms, aisles or racks" },
        { value: "floors", label: "Between floors or up to a mezzanine" },
      ],
    },
    {
      id: "height",
      title: "How high does the load need to be lifted?",
      type: "single",
      options: [
        { value: "work", label: "To a comfortable working height", hint: "Roughly table height" },
        { value: "shelf", label: "Onto shelves, racks or machines", hint: "Up to about 2 m" },
        { value: "high", label: "Above head height", hint: "More than 2 m" },
      ],
    },
    {
      id: "frequency",
      title: "How often is the lift done?",
      type: "single",
      options: [
        { value: "rare", label: "A few times a day" },
        { value: "regular", label: "Several times an hour" },
        { value: "constant", label: "Continuously, all shift long" },
      ],
    },
    {
      id: "orientation",
      title: "Does the load need to be turned or tilted?",
      type: "single",
      options: [
        { value: "no", label: "No, it stays the same way up" },
        { value: "rotate", label: "Yes, rotated or tilted (e.g. horizontal ↔ vertical)" },
      ],
    },
    {
      id: "environment",
      title: "Anything special about the environment?",
      help: "Select all that apply.",
      type: "multi",
      options: [
        { value: "hygiene", label: "Food, pharma or clean-room hygiene" },
        { value: "atex", label: "Explosive atmosphere (ATEX)" },
        { value: "lowceiling", label: "Low ceiling / no room for a crane" },
        { value: "narrow", label: "Narrow aisles or tight spaces" },
        { value: "none", label: "None of these", exclusive: true },
      ],
    },
  ],

  products: [
    {
      id: "vacuum-tube-lifter",
      name: "Vacuum tube lifter",
      family: "Vacuhand / Easyhand",
      url: "https://www.pronomic.com/products/vacuum-and-tube-lifts", // verify
      image: "",
      summary:
        "Grips the load with vacuum and lifts it almost weightlessly with one hand. Built for fast, repetitive lifting.",
      capacityKg: [5, 270], // verify
      exclude: { movement: ["mobile", "floors"], surface: ["eyes"] },
      score: {
        load: { boxes: 4, panels: 3, drums: 2, parts: 0, rolls: 1, servers: -3, other: 0 },
        surface: { smooth: 4, unsure: 1, porous: -3 },
        movement: { station: 3, area: 2 },
        frequency: { rare: -1, regular: 3, constant: 5 },
        height: { work: 2, shelf: 2, high: -1 },
        orientation: { rotate: -1 },
        environment: { atex: 1, lowceiling: -2 },
      },
      reasons: {
        "frequency:constant": "Made for high-frequency lifting: one-hand control keeps cycle times short.",
        "frequency:regular": "Fast grip and release suits regular lifting throughout the day.",
        "surface:smooth": "Smooth, airtight surfaces give a secure vacuum grip.",
        "load:boxes": "A very common choice for boxes, sacks and cartons.",
        "environment:atex": "Available with an ATEX-approved vacuum pump.",
      },
    },
    {
      id: "lifting-trolley",
      name: "Lift&Drive lifting trolley",
      family: "Lift&Drive",
      url: "https://www.pronomic.com/products/lifting-trolleys",
      image: "",
      summary:
        "Mobile lifting trolley that lifts and carries the load to where it is needed. Manual or electric, with tools for many load types.",
      capacityKg: [0, 325],
      exclude: { movement: ["floors"] },
      score: {
        load: { boxes: 3, rolls: 3, panels: 1, servers: 2, drums: 3, parts: 2, other: 1 },
        movement: { mobile: 6, station: 1, area: 2 },
        height: { work: 2, shelf: 2, high: -2 },
        frequency: { rare: 2, regular: 2, constant: 0 },
        environment: { lowceiling: 4, narrow: 2, hygiene: 1 },
        surface: { porous: 1, unsure: 1 },
      },
      reasons: {
        "movement:mobile": "Takes the load with you: no fixed installation needed.",
        "environment:lowceiling": "Needs no ceiling or crane structure.",
        "environment:narrow": "Compact chassis for narrow aisles and tight spaces.",
        "load:rolls": "Interchangeable tools are available for rolls and reels.",
        "load:drums": "Can be fitted with grippers for drums and barrels.",
        "frequency:rare": "A flexible, cost-effective option when lifts happen now and then.",
      },
    },
    {
      id: "server-lifter",
      name: "Server lifter",
      family: "Data centre lifting trolleys",
      url: "https://www.pronomic.com/data-center/products/server-lifters",
      image: "",
      summary:
        "Lifting trolley made for data centres: lifts servers, UPS batteries and IT equipment safely in and out of racks.",
      capacityKg: [0, 325], // verify
      exclude: { movement: ["floors"] },
      score: {
        load: { servers: 10, boxes: -2, rolls: -6, panels: -4, drums: -6, parts: -2, other: -3 },
        movement: { mobile: 3, station: 1 },
        height: { shelf: 3, work: 1, high: 1 },
        environment: { narrow: 2, lowceiling: 2 },
      },
      reasons: {
        "load:servers": "Built for servers and batteries, with precise positioning into racks.",
        "height:shelf": "Lifts to rack height with stepless control.",
        "environment:narrow": "Fits between rack rows.",
      },
    },
    {
      id: "jib-crane",
      name: "Jib crane with hoist",
      family: "Easycrane / jib cranes",
      url: "https://www.pronomic.com/products/jib-cranes", // verify
      image: "",
      summary:
        "Pillar- or wall-mounted crane arm that covers one workstation. Combined with a hoist or vacuum lifter it handles most loads.",
      capacityKg: [0, 1000], // verify
      exclude: { movement: ["mobile", "floors"], environment: ["lowceiling"] },
      score: {
        load: { parts: 3, boxes: 1, drums: 2, rolls: 2, panels: 1, servers: -4, other: 2 },
        movement: { station: 5, area: -1 },
        surface: { eyes: 4, porous: 1, unsure: 1 },
        frequency: { rare: 1, regular: 2, constant: 1 },
        height: { work: 1, shelf: 2, high: 2 },
      },
      reasons: {
        "movement:station": "Covers one workstation: an efficient way to serve a fixed lifting point.",
        "surface:eyes": "Lifting eyes and hooks can be picked up directly with the hoist.",
        "load:parts": "Common choice for machine parts, tools and components.",
      },
    },
    {
      id: "overhead-crane",
      name: "Overhead light crane system",
      family: "Rail-mounted crane systems",
      url: "https://www.pronomic.com/products/crane-systems", // verify
      image: "",
      summary:
        "Rail-based crane system that covers a whole area of the hall. Combines with hoists, vacuum lifters and grippers.",
      capacityKg: [0, 2000], // verify
      exclude: { movement: ["mobile", "floors"], environment: ["lowceiling"] },
      score: {
        load: { parts: 3, boxes: 2, drums: 2, rolls: 2, panels: 2, servers: -4, other: 2 },
        movement: { area: 7, station: 1 },
        weight: { w325: 1, w1000: 3, w1000plus: 4 },
        surface: { eyes: 3 },
        frequency: { regular: 1, constant: 2 },
        height: { shelf: 1, high: 3 },
      },
      reasons: {
        "movement:area": "Covers a large working area, such as a line or several stations.",
        "weight:w1000": "Handles heavier loads that are beyond trolleys and vacuum lifters.",
        "weight:w1000plus": "Built for heavy loads above 1 000 kg (check the model).",
        "height:high": "Lifts high, above head height.",
      },
    },
    {
      id: "hoist",
      name: "Electric or pneumatic hoist",
      family: "Hoists",
      url: "https://www.pronomic.com/products/hoists", // verify
      image: "",
      summary:
        "Electric or pneumatic hoist, with frequency control for smooth and precise lifting. Mounted on a jib or overhead crane.",
      capacityKg: [0, 2000], // verify
      exclude: { movement: ["mobile", "floors"], environment: ["lowceiling"] },
      score: {
        surface: { eyes: 6, porous: 1, smooth: -1 },
        load: { parts: 2, drums: 1, servers: -4 },
        weight: { w325: 1, w1000: 2, w1000plus: 2 },
        frequency: { rare: 2, regular: 1, constant: -1 },
        environment: { atex: 1 },
      },
      reasons: {
        "surface:eyes": "Lifting eyes and hooks are picked up directly with the hoist.",
        "frequency:rare": "Simple, robust solution for occasional lifts.",
        "environment:atex": "Pneumatic hoists are often chosen for explosive atmospheres.",
      },
    },
    {
      id: "manipulator",
      name: "Manipulator with load-specific gripper",
      family: "Manipulators & grippers",
      url: "https://www.pronomic.com/products/manipulators", // verify
      image: "",
      summary:
        "Rigid-arm lifting aid with a gripper made for your load. Turns, tilts and holds off-centre loads with precision.",
      capacityKg: [0, 300], // verify
      exclude: { movement: ["mobile", "floors"] },
      score: {
        orientation: { rotate: 7, no: -1 },
        load: { rolls: 3, panels: 3, parts: 3, drums: 2, servers: -4, other: 2 },
        surface: { porous: 3, unsure: 1 },
        movement: { station: 3 },
        frequency: { regular: 2, constant: 3 },
      },
      reasons: {
        "orientation:rotate": "Turns and tilts the load. A rigid arm handles the torque safely.",
        "surface:porous": "A gripper made for your load holds irregular or porous items.",
        "load:rolls": "Roll grippers can lift and turn rolls horizontally or vertically.",
        "load:panels": "Panel grippers can tilt sheets between horizontal and vertical.",
      },
    },
    {
      id: "lifting-table",
      name: "Lifting table",
      family: "Scissor lifting tables",
      url: "https://www.pronomic.com/products/lifting-tables", // verify
      image: "",
      summary:
        "Raises the load to an ergonomic working height so staff don't have to bend or stretch. Simple, robust and low-maintenance.",
      capacityKg: [0, 5000], // verify
      exclude: { movement: ["mobile", "area", "floors"], height: ["high"] },
      score: {
        height: { work: 6, shelf: -2 },
        movement: { station: 2 },
        load: { boxes: 2, parts: 2, panels: 1 },
        weight: { w1000: 2, w1000plus: 2 },
        environment: { lowceiling: 2, hygiene: 1 },
      },
      reasons: {
        "height:work": "Brings the load to a comfortable working height.",
        "weight:w1000": "Scissor tables take heavy loads with ease.",
        "environment:lowceiling": "No overhead structure needed.",
      },
    },
    {
      id: "goods-lift",
      name: "Goods lift / mezzanine lift",
      family: "Elevators",
      url: "https://www.pronomic.com/products/elevators", // verify
      image: "",
      summary:
        "Moves goods safely between floors or up to a mezzanine, so nobody has to carry loads up stairs.",
      capacityKg: [0, 2000], // verify
      exclude: {
        movement: ["station", "area", "mobile"],
      },
      score: {
        movement: { floors: 12 },
        frequency: { regular: 1, constant: 2 },
      },
      reasons: {
        "movement:floors": "Made for moving goods between floor levels.",
      },
    },
  ],

  // General notes added below the results when an answer calls for it.
  notes: {
    "environment:hygiene":
      "For food, pharma and clean rooms, ask for stainless or washable versions.",
    "environment:atex":
      "ATEX environments need certified equipment. Our experts will confirm which models are approved.",
  },
};
