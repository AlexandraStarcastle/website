/*
 * Pronomic Lifting Advisor — questions & solutions.
 *
 * This is the only file you normally need to edit.
 *
 * The advisor guides visitors to the right TYPE of solution. It does not
 * configure a product: detailed configuration happens in ProBldr or with
 * Pronomic's sales team.
 *
 *  - questions: what the visitor is asked, in order.
 *  - solutions: the lifting solutions we can point to, and how each answer
 *               affects that solution's score.
 *
 * How scoring works (per solution):
 *  - `exclude`   : { questionId: [optionValues] } — never shown if the visitor
 *                  picked any of these values.
 *  - `capacityKg`: [min, max] — dropped if it can't lift the lightest load in
 *                  the chosen weight band; penalised if it only covers part.
 *  - `score`     : { questionId: { optionValue: points } } — added up.
 *  - `reasons`   : { "questionId:optionValue": "text" } — "Why this fits".
 *  - `loadTips`  : { loadValue: { text, url? } } — advice for that load type.
 *  - `products`  : product families to look at (name, detail, url).
 *  - `probldr`   : true → offer "Build it in ProBldr" as the next step.
 *
 * Figures shown to visitors are quoted from pronomic.com product pages.
 * Values marked "verify" are used for filtering only and should be checked.
 */
window.PRONOMIC_ADVISOR_CONFIG = {
  title: "Lifting Advisor",

  contact: {
    // Where "Talk to an expert" goes. The visitor's answers are appended as
    // ?advisor=..., or used as the email body when `email` is set.
    url: "https://www.pronomic.com/", // verify: replace with the contact form URL
    email: "",
  },

  probldr: {
    url: "https://probldr.pronomic.com/#/products",
    label: "Build your lifting trolley in ProBldr",
  },

  maxResults: 3,

  questions: [
    {
      id: "load",
      short: "Load",
      title: "What do you need to lift?",
      help: "Choose the load you lift most often.",
      type: "single",
      options: [
        { value: "boxes", label: "Boxes, cartons and crates", icon: "boxes" },
        { value: "sacks", label: "Bags and sacks", icon: "sacks" },
        { value: "rolls", label: "Rolls and reels", icon: "rolls" },
        { value: "panels", label: "Panels, sheets and glass", icon: "panels" },
        { value: "drums", label: "Buckets, barrels and drums", icon: "drums" },
        { value: "components", label: "Components and tools", icon: "parts" },
        { value: "wheels", label: "Wheels and tyres", icon: "wheels" },
        { value: "servers", label: "Servers and batteries", icon: "servers" },
        { value: "other", label: "Something else", icon: "other" },
      ],
    },
    {
      id: "weight",
      short: "Weight",
      title: "Roughly how heavy is it?",
      help: "A rough idea is enough. Think of the heaviest load you lift.",
      type: "single",
      options: [
        { value: "w50", label: "Up to 50 kg", kg: [0, 50] },
        { value: "w125", label: "50 – 125 kg", kg: [50, 125] },
        { value: "w325", label: "125 – 325 kg", kg: [125, 325] },
        { value: "w1000", label: "325 – 1 000 kg", kg: [325, 1000] },
        { value: "heavy", label: "Over 1 000 kg", kg: [1000, 5000] },
      ],
    },
    {
      id: "movement",
      short: "Movement",
      title: "Where does the load need to go?",
      type: "single",
      options: [
        { value: "station", label: "Lifted at one workstation", hint: "Picked up and put down within a few metres" },
        { value: "around", label: "Carried around the building", hint: "Between rooms, aisles, shelves or machines" },
        { value: "line", label: "Along a line or across a larger area", hint: "Several workstations in a row" },
        { value: "floors", label: "Between floors or up to a mezzanine" },
        { value: "height", label: "It just needs a better working height", hint: "The load stays put, people shouldn't bend or stretch" },
      ],
    },
    {
      id: "frequency",
      short: "How often",
      title: "How often is it lifted?",
      type: "single",
      options: [
        { value: "rare", label: "Now and then", hint: "A few times a day" },
        { value: "often", label: "Again and again", hint: "Many lifts every hour" },
      ],
    },
    {
      id: "needs",
      short: "Good to know",
      title: "Anything else we should know?",
      help: "Select all that apply.",
      type: "multi",
      options: [
        { value: "tilt", label: "The load needs to be turned or tilted" },
        { value: "nofix", label: "Nothing can be fixed to the floor, wall or ceiling" },
        { value: "hygiene", label: "Food, pharma or clean-room environment" },
        { value: "none", label: "No, nothing else", exclusive: true },
      ],
    },
  ],

  // "Read more" links per load type (pronomic.com application pages)
  applications: {
    boxes: { label: "boxes, cartons and crates", url: "https://www.pronomic.com/applications/boxes-cartons-and-crates" },
    sacks: { label: "bags and sacks", url: "https://www.pronomic.com/applications/bags-and-sacks" },
    rolls: { label: "rolls and reels", url: "https://www.pronomic.com/applications/rolls-and-reels" },
    panels: { label: "panels, sheets and glass", url: "https://www.pronomic.com/applications/panels-sheets-and-glass" },
    components: { label: "components and tools", url: "https://www.pronomic.com/applications/components-and-tools" },
    wheels: { label: "wheels and tyres", url: "https://www.pronomic.com/applications/wheels-and-tyres" },
    servers: { label: "servers and batteries", url: "https://www.pronomic.com/data-center/products/server-lifters" },
    _default: { label: "all applications", url: "https://www.pronomic.com/applications" },
  },

  solutions: [
    {
      id: "lifting-trolley",
      icon: "lifting-trolley",
      name: "Mobile lifting trolley",
      advice:
        "A Lift&Drive lifting trolley lets one person pick up the load, drive it where it needs to go and set it down at the right height, without bending or carrying. Swap the tool on the front to suit the load.",
      summary: "Lifts and carries the load around the building. No installation needed.",
      url: "https://www.pronomic.com/products/lifting-trolleys",
      probldr: true,
      capacityKg: [0, 325],
      exclude: { movement: ["floors"] },
      score: {
        movement: { around: 8, station: 2, line: -1, height: 1 },
        load: { boxes: 3, sacks: 2, rolls: 4, panels: 2, drums: 3, components: 3, wheels: 1, servers: 1, other: 1 },
        frequency: { rare: 2, often: 1 },
        needs: { nofix: 5, tilt: 2 },
      },
      reasons: {
        "movement:around": "Takes the load with you, from room to room and shelf to shelf.",
        "needs:nofix": "Free-standing on wheels: nothing to mount or install.",
        "needs:tilt": "The Turn module tilts the load, and Squeeze&Turn rotates it 360°.",
        "frequency:rare": "A flexible choice when lifts happen now and then, in different places.",
      },
      loadTips: {
        boxes: { text: "Forks handle boxes, cartons and crates.", url: "https://www.pronomic.com/products/lifting-trolleys/tools-lifting-trolleys/forks" },
        rolls: { text: "Use a Prong for rolls lying flat (core from 70 mm), or the Squeeze&Turn gripper to grip a roll from the outside and rotate it.", url: "https://www.pronomic.com/products/lifting-trolleys/tools-lifting-trolleys/squeeze-turn" },
        drums: { text: "The Squeeze&Turn gripper holds buckets and barrels and can rotate them.", url: "https://www.pronomic.com/products/lifting-trolleys/tools-lifting-trolleys/squeeze-turn" },
        panels: { text: "Forks carry panels. Add the Turn module if they need tilting.", url: "https://www.pronomic.com/products/lifting-trolleys/tools-lifting-trolleys/turn" },
        components: { text: "Forks or a custom fixture hold components and tools.", url: "https://www.pronomic.com/applications/components-and-tools/handling-components-and-tools-with-lifting-trolleys" },
        sacks: { text: "See how Lift&Drive trolleys handle bags and sacks.", url: "https://www.pronomic.com/applications/bags-and-sacks/bags-and-sack-lifting-with-lifting-trolleys" },
      },
      products: [
        { name: "Lift&Drive PRX", detail: "Electric, Li-ion battery. 90, 130, 175, 225 or 325 kg", url: "https://www.pronomic.com/products/lifting-trolleys" },
      ],
    },
    {
      id: "server-lifter",
      icon: "server-lifter",
      name: "Server lifter",
      advice:
        "Server lifters are lifting trolleys made for data centres. They lift servers, UPS batteries and IT equipment straight in and out of the rack, so nobody has to hold the weight at shoulder height.",
      summary: "Lifts servers and batteries in and out of racks.",
      url: "https://www.pronomic.com/data-center/products/server-lifters",
      probldr: false,
      capacityKg: [0, 325], // verify
      exclude: {
        movement: ["floors"],
        load: ["boxes", "sacks", "rolls", "panels", "drums", "components", "wheels", "other"],
      },
      score: {
        load: { servers: 14, boxes: -6, sacks: -8, rolls: -8, panels: -6, drums: -8, components: -4, wheels: -8, other: -6 },
        movement: { around: 3, station: 2 },
        needs: { nofix: 3 },
      },
      reasons: {
        "load:servers": "Made for servers and batteries, with precise positioning into the rack.",
        "needs:nofix": "Free-standing on wheels: nothing to install in the server room.",
      },
      products: [
        { name: "Server lifters", detail: "Lifting trolleys for data centres", url: "https://www.pronomic.com/data-center/products/server-lifters" },
      ],
    },
    {
      id: "vacuum-lifter",
      icon: "vacuum-tube-lifter",
      name: "Vacuum tube lifter",
      advice:
        "A vacuum tube lifter grips the load by suction and makes it almost weightless. The operator lifts, moves and releases with one hand on the handle. It's the fastest option when the same kind of load is lifted again and again.",
      summary: "Grips by suction and makes repetitive lifting almost weightless.",
      url: "https://www.pronomic.com/products/vacuum-tube-lifters",
      probldr: false,
      capacityKg: [0, 250],
      exclude: { movement: ["floors", "height"] },
      score: {
        load: { boxes: 5, sacks: 5, panels: 4, drums: 1, components: -1, rolls: -2, wheels: -5, servers: -8, other: 0 },
        frequency: { often: 6, rare: -1 },
        movement: { station: 4, line: 3, around: -4 },
        needs: { nofix: -3, tilt: -2 },
      },
      reasons: {
        "frequency:often": "Built for repetitive lifting: grip, lift and release in seconds.",
        "load:boxes": "A proven way to lift boxes and cartons all day.",
        "load:sacks": "Suction grips bags and sacks without hooks or straps.",
        "load:panels": "Holds flat panels and sheets securely by suction.",
      },
      loadTips: {
        boxes: { text: "See vacuum tube lifters lifting cardboard boxes.", url: "https://www.pronomic.com/applications/boxes-cartons-and-crates/lifting-cardboard-boxes-with-vacuum-tube-lifters" },
        sacks: { text: "See vacuum tube lifters lifting bags and sacks.", url: "https://www.pronomic.com/applications/bags-and-sacks/bags-and-sack-lifting-with-vacuum-tube-lifters" },
        panels: { text: "See vacuum tube lifters handling panels and sheets.", url: "https://www.pronomic.com/applications/panels-sheets-and-glass/handling-panels-with-vacuum-tube-lifters" },
      },
      products: [
        { name: "Easyhand", detail: "One-hand vacuum lifters (Pro, M, Pro Rapid) up to 50 kg", url: "https://www.pronomic.com/products/vacuum-tube-lifters" },
        { name: "Vacuhand Pro", detail: "Vacuum lifter up to 250 kg", url: "https://www.pronomic.com/products/vacuum-tube-lifters" },
        { name: "Easycrane", detail: "Jib crane with built-in vacuum lifter, up to 80 kg", url: "https://www.pronomic.com/products/jib-cranes/easycrane" },
      ],
    },
    {
      id: "jib-crane",
      icon: "jib-crane",
      name: "Jib crane with hoist and gripper",
      advice:
        "A jib crane covers one workstation. Fit it with a hoist, and a gripper made for your load, and the operator can lift and place the load precisely without carrying any of the weight.",
      summary: "Covers one workstation. Combine with a hoist and a gripper for your load.",
      url: "https://www.pronomic.com/products/jib-cranes",
      probldr: false,
      capacityKg: [0, 500], // verify
      exclude: { movement: ["floors", "around", "height"] },
      score: {
        movement: { station: 6, line: 1 },
        load: { components: 4, drums: 3, rolls: 3, sacks: 2, wheels: 2, panels: 1, boxes: 0, servers: -8, other: 2 },
        frequency: { rare: 2, often: 2 },
        needs: { nofix: -2 },
      },
      reasons: {
        "movement:station": "Serves a fixed lifting point efficiently.",
        "load:components": "Hoists and custom grippers handle components and tools of all shapes.",
        "frequency:rare": "Simple and robust for occasional lifts at the same place.",
        "needs:nofix": "MobiArm and Mobichain jib cranes stand on a platform you move with a pallet truck.",
      },
      loadTips: {
        sacks: { text: "The Lifts All sack gripper lifts upright, porous sacks up to 75 kg.", url: "https://www.pronomic.com/products/grippers/lifts-all-mechanical-sack-gripper" },
        rolls: { text: "The Lifts All roll gripper makes the roll weightless for the operator.", url: "https://www.pronomic.com/products/grippers/lifts-all-roll-gripper" },
        drums: { text: "Grippers are available for kegs, drums and gas cylinders.", url: "https://www.pronomic.com/products/grippers" },
        panels: { text: "See hoist solutions for handling panels.", url: "https://www.pronomic.com/applications/panels-sheets-and-glass/hoist-solutions-for-handling-panels" },
      },
      products: [
        { name: "Mechcrane", detail: "Pillar- and wall-mounted jib cranes", url: "https://www.pronomic.com/products/jib-cranes" },
        { name: "MobiArm / Mobichain", detail: "Mobile jib cranes, up to 4 m reach", url: "https://www.pronomic.com/products/jib-cranes/mobiarm" },
        { name: "Hoists", detail: "Mechchain Pro II, Bal-Trol (up to 300 kg)", url: "https://www.pronomic.com/products/hoists" },
        { name: "Grippers", detail: "For sacks, rolls, kegs, gas cylinders and more", url: "https://www.pronomic.com/products/grippers" },
      ],
    },
    {
      id: "overhead-rail",
      icon: "overhead-crane",
      name: "Overhead rail system",
      advice:
        "An overhead rail system lets the load travel along a line or across a whole area. Hoists, vacuum lifters and manipulators run on the rails, so several workstations share one lifting solution.",
      summary: "Moves loads along a line or across a whole area.",
      url: "https://www.pronomic.com/products/overhead-crane-system/mechrail",
      probldr: false,
      capacityKg: [0, 1000],
      exclude: { movement: ["floors", "around", "height"], needs: ["nofix"] },
      score: {
        movement: { line: 9, station: 1 },
        weight: { w325: 1, w1000: 4, heavy: 2 },
        load: { components: 2, boxes: 1, sacks: 1, rolls: 1, panels: 2, drums: 1, servers: -8 },
        frequency: { often: 2 },
      },
      reasons: {
        "movement:line": "Covers a line or a whole area, so loads move between workstations.",
        "weight:w1000": "Mechrail is rated for loads up to 1 000 kg.",
        "frequency:often": "Light aluminium rails make the load easy to push, even all day.",
      },
      products: [
        { name: "Mechrail", detail: "Lightweight aluminium rail system, up to 1 000 kg", url: "https://www.pronomic.com/products/overhead-crane-system/mechrail" },
        { name: "Hoists", detail: "Electric and pneumatic hoists for the rail", url: "https://www.pronomic.com/products/hoists" },
      ],
    },
    {
      id: "manipulator",
      icon: "manipulator",
      name: "Manipulator",
      advice:
        "A manipulator has a rigid arm that holds the load firmly, even off-centre. It's the right choice when the load has to be turned, tilted or placed precisely, for example wheels going onto a hub.",
      summary: "Rigid arm for turning, tilting and precise placing.",
      url: "https://www.pronomic.com/products/manipulators/mechlift-pro",
      probldr: false,
      capacityKg: [0, 650],
      exclude: { movement: ["floors", "around", "height"] },
      score: {
        needs: { tilt: 8, nofix: -4 },
        load: { wheels: 6, components: 3, rolls: 2, panels: 2, drums: 2, servers: -8 },
        movement: { station: 3, line: 2 },
        weight: { w325: 2, w1000: 3 },
        frequency: { often: 2 },
      },
      reasons: {
        "needs:tilt": "Turns and tilts the load. The rigid arm takes the torque.",
        "load:wheels": "The usual choice for heavy wheels and tyres handled off-centre.",
        "weight:w1000": "Mechlift Pro is rated up to 650 kg.",
      },
      loadTips: {
        wheels: { text: "See wheel and tyre lifters.", url: "https://www.pronomic.com/applications/wheels-and-tyres" },
      },
      products: [
        { name: "Mechlift Pro", detail: "Manipulator up to 650 kg, with standard or custom grippers", url: "https://www.pronomic.com/products/manipulators/mechlift-pro" },
      ],
    },
    {
      id: "lifting-table",
      icon: "lifting-table",
      name: "Lifting table",
      advice:
        "If the load just needs to sit at the right height, a scissor lifting table is the simplest fix. It raises the work to a comfortable height so nobody has to bend or stretch.",
      summary: "Raises the load to a comfortable working height.",
      url: "https://www.pronomic.com/products/lifting-tables/static-lifting-tables",
      probldr: false,
      capacityKg: [0, 2000], // verify
      exclude: { movement: ["floors", "line"] },
      score: {
        movement: { height: 14, station: 0, around: -2 },
        weight: { w1000: 2, heavy: 2 },
        needs: { nofix: 2, hygiene: 2 },
      },
      reasons: {
        "movement:height": "Brings the work to a comfortable height: the simplest ergonomic fix.",
        "needs:hygiene": "The heavy-duty mobile table comes in food-grade stainless steel (304 and 316).",
        "needs:nofix": "Mobile tables need no installation.",
      },
      products: [
        { name: "Static lifting tables", detail: "Scissor tables for fixed workstations", url: "https://www.pronomic.com/products/lifting-tables/static-lifting-tables" },
        { name: "Heavy-duty mobile lifting table", detail: "With brakes, overload protection and stainless options", url: "https://www.pronomic.com/products/lifting-tables/mobile-lifting-tables/heavy-duty-mobile-lifting-table" },
      ],
    },
    {
      id: "goods-lift",
      icon: "goods-lift",
      name: "Goods lift",
      advice:
        "A goods lift moves material safely between floors or up to a mezzanine, so nobody carries loads up the stairs.",
      summary: "Moves goods between floors or to a mezzanine.",
      url: "https://www.pronomic.com/products/elevators-and-goods-lifts",
      probldr: false,
      capacityKg: [0, 2000], // verify
      exclude: { movement: ["station", "around", "line", "height"] },
      score: { movement: { floors: 15 } },
      reasons: {
        "movement:floors": "Made for moving goods between floor levels.",
      },
      products: [
        { name: "Elevators and goods lifts", detail: "Light-duty, heavy-duty and reach versions", url: "https://www.pronomic.com/products/elevators-and-goods-lifts" },
      ],
    },
  ],

  // General notes added below the results when an answer calls for it.
  notes: {
    "needs:hygiene": "For food, pharma and clean rooms, ask us about stainless steel and washable versions.",
    "weight:heavy": "Loads over 1 000 kg usually need a tailored solution. Our experts can help.",
  },
};
