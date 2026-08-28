import type { Playbook } from "@/lib/expert/types";

/** Extra jobs — owned expert layer. Core twelve stay in src/data/scenario-playbooks.json. */
export const EXTRA_PLAYBOOKS: Playbook[] = [
  {
    id: "trans-flush",
    slug: "trans-flush",
    stamp: "Flush",
    title: "Transmission flush quoted",
    kicker: "ATF is a spec, not a special",
    plainEnglish:
      "A “flush special” is how CVTs and 8-speeds die. Ask which fluid, which procedure, and whether they are dumping or power-flushing. Dexron is not Honda DW-1.",
    minutes: 12,
    audience: "owner",
    scenario:
      "The writer circled “transmission flush” on a $189 menu. The car shifts fine, or it shudders once on a cold morning. You need the fluid name before you authorize a pump.",
    dummySteps: [
      {
        id: "name-fluid",
        title: "Make them write the fluid SKU",
        do: "Honda DW-1, HCF-2, Toyota WS, Mercon LV/ULV, Dexron VI, NS-3, Subaru High Torque — the bottle has a name. “Universal ATF” is a damage path on a CVT.",
        say: "What exact fluid are you putting in this VIN? Write the OEM name on the RO, not “ATF.”",
      },
      {
        id: "procedure",
        title: "Dump-and-fill vs power flush",
        do: "A drain-and-fill is a pan. A machine flush pushes solvent through a cooler. Many OEM books never call for the machine. Ask which one they priced.",
        say: "Is this a pan drain or a machine flush? I will not authorize a power flush without the OEM procedure.",
      },
      {
        id: "symptom",
        title: "If it already shudders, that is a diagnosis",
        do: "Judder on a Nissan/Subaru/Honda CVT is a complaint pattern, not a coupon. A flush after metal is in the pan is how you buy a valve body.",
        say: "If you found metal or burnt fluid, stop. I want a photo of the pan and a diagnosis, not a flush.",
      },
      {
        id: "interval",
        title: "Ask what the book actually says",
        do: "Some makers say lifetime. Some say 30–60k under tow/heat. “Lifetime” still has a capacity and a spec. We do not have Motor hours — they can show the OEM page.",
        say: "Show me the OEM interval and the fluid spec for this VIN. I will not buy a menu from a poster.",
      },
    ],
    geniusNotes: [
      {
        id: "cvt",
        label: "CVT fluid",
        meaning:
          "HCF-2, NS-3, Subaru High Torque, Toyota CVT FE are not Dexron. A “transmission flush” with the wrong jug is a known failure path on Rogue, CR-V CVT, and Outback.",
      },
      {
        id: "8speed",
        label: "8- and 9-speed ATF",
        meaning:
          "FCA 8&9 Speed ATF is not ATF+4. Ford 10R80 often wants Mercon ULV, not LV. The tag on the case wins.",
      },
    ],
    script: [
      "Write the OEM fluid name on the RO. I will not authorize “universal ATF.”",
      "Pan drain or machine? I will not buy a power flush without the OEM procedure.",
      "If the pan has metal, stop and photograph it. A flush is not a diagnosis.",
    ],
    dont: [
      "Do not authorize a CVT “flush special” from a lube-shop poster.",
      "Do not let them pour Dexron into Honda HCF-2 or Nissan NS-3.",
      "Do not treat a shudder as a coupon item.",
    ],
    links: [
      { href: "/catalog", stamp: "Book", label: "Fluids pamphlet", why: "Factory-typical ATF names. Not Motor." },
      { href: "/expert/tsb", stamp: "Patterns", label: "CVT / 10R80 cards", why: "Public patterns — not a stolen TSB." },
      { href: "/quote", stamp: "Quote", label: "Mark the line", why: "Circle flush before you pay." },
      { href: "/garage", stamp: "Garage", label: "This VIN’s card", why: "What the book says for the car in the bay." },
    ],
    relatedGuides: ["reading-an-ro", "talk-to-mechanic"],
    relatedJobs: ["/jobs/owner", "/jobs/shop"],
    relatedTsb: ["nissan-cvt-judder", "honda-cvt-start-clutch", "ford-10r80"],
  },
  {
    id: "oil-spec",
    slug: "oil-spec",
    stamp: "Oil",
    title: "Oil viscosity at the cap",
    kicker: "The cap beats a heuristic",
    plainEnglish:
      "If the bay missed the catalog, the card is a guess labeled HEURISTIC — not Motor, not OEM TIS. Walk to the cap. 0W-20 on a 2013 Accord is not 5W-20 on a 2004.",
    minutes: 8,
    audience: "owner",
    scenario:
      "A lube shop already has the drain plug out. They asked “conventional or synthetic?” You need viscosity and spec, not a brand pitch.",
    dummySteps: [
      {
        id: "cap",
        title: "Read the oil cap and the under-hood label",
        do: "Photo both. 0W-16, 0W-20, 5W-20, 5W-30, 5W-40 plus an OEM number (dexos1, WSS-M2C, VW 508 00, Honda Genuine). Viscosity alone is not a VW or BMW spec.",
        say: "The cap says [viscosity]. Put that on the ticket, not whatever is on the barrel.",
      },
      {
        id: "lane",
        title: "Ask whether they matched this VIN or guessed",
        do: "Our garage card stamps CATALOG or HEURISTIC. A miss is a starting point. The cap is the close-out.",
        say: "Did you look up this VIN or grab the common 5W-30? I want the cap spec.",
      },
      {
        id: "filter",
        title: "OEM filter number or the box application",
        do: "Honda 15400-PLM-A02 vs a “fits most.” Fram/Wix/Purolator interchange is a pamphlet, not TecDoc.",
        say: "What filter number is going on? Show me the application on the box.",
      },
      {
        id: "quarts",
        title: "Capacity with filter",
        do: "A 5.3 EcoTec3 is ~8 qt. A 1.5T Civic is ~3.7. “Five quarts” on a Silverado is a short fill.",
        say: "How many quarts with the filter for this engine, not this bay’s default?",
      },
    ],
    geniusNotes: [
      {
        id: "heuristic",
        label: "Heuristic miss",
        meaning:
          "If the spec sheet is stamped HEURISTIC, we do not have this YMM in the JSON book. That is not Motor. That is not OEM TIS. Do not pour from the guess.",
      },
      {
        id: "16",
        label: "0W-16",
        meaning:
          "Toyota Dynamic Force caps often say 0W-16. 0W-20 is an emergency fill on some years, not the spec. The cap still wins.",
      },
    ],
    script: [
      "The cap says the viscosity. Put that on the RO, not the barrel.",
      "I want the OEM spec name — dexos, WSS, VW 508, Honda Genuine — not “full synthetic.”",
      "How many quarts with filter for this engine?",
    ],
    dont: [
      "Do not let a heuristic card authorize a pour.",
      "Do not copy last year’s Civic ticket onto a 1998 Civic.",
      "Do not treat “Euro 5W-40” as VW 502 00 unless the bottle lists the number.",
    ],
    links: [
      { href: "/catalog", stamp: "Book", label: "Fluids pamphlet", why: "300+ factory-typical rows. Cap still wins." },
      { href: "/garage", stamp: "Garage", label: "This car", why: "CATALOG vs HEURISTIC is on the card." },
      { href: "/parts", stamp: "Parts", label: "Buy the oil", why: "You can buy the jug yourself." },
    ],
    relatedGuides: ["oil-change"],
    relatedJobs: ["/jobs/diy", "/jobs/owner"],
    relatedTsb: ["honda-15t-dilution", "toyota-2az-consumption"],
  },
  {
    id: "coolant-spec",
    slug: "coolant-spec",
    stamp: "Coolant",
    title: "Coolant color is not a spec",
    kicker: "Chemistry, not the rainbow",
    plainEnglish:
      "Orange, pink, blue, and green are marketing. Dex-Cool is not Honda Type 2. A “universal” dump is how you buy a water pump and a heater core.",
    minutes: 10,
    audience: "owner",
    scenario:
      "They want to flush the coolant because it is “due” or the color looks brown. You need chemistry and a freeze-point number, not a poster.",
    dummySteps: [
      {
        id: "chemistry",
        title: "Name the OEM chemistry",
        do: "Dex-Cool, Honda Type 2, Toyota SLLC pink, Motorcraft Orange/Yellow, VW G12/G13, Subaru Super Coolant. Color is a hint, not a spec.",
        say: "What OEM coolant are you using? I will not authorize universal green in this VIN.",
      },
      {
        id: "freeze",
        title: "Ask for a freeze-point reading",
        do: "50/50 is often about −34 °F. A refractometer or test strip is a number. “It looks old” is not.",
        say: "What is the freeze point? Write the number. I will not flush on the word due.",
      },
      {
        id: "mix",
        title: "Do not mix leftover colors",
        do: "Motorcraft Yellow and Orange do not mix. Dex-Cool and phosphate Hyundai coolant do not mix. A top-off with the wrong jug is a gel.",
        say: "If you top it off, use the same OEM chemistry. Do not blend leftover jugs.",
      },
      {
        id: "leak",
        title: "If it is low, find the leak first",
        do: "Ford EcoBoost coolant loss and GM intake-gasket seepage are diagnosis jobs. A flush does not seal a housing.",
        say: "If it is low, pressure-test before you flush. I want the leak, not a service.",
      },
    ],
    geniusNotes: [
      {
        id: "color",
        label: "Color",
        meaning:
          "Dex-Cool is orange. Honda Type 2 is blue. Toyota SLLC is pink. VW G13 is purple/pink. A parts-store “universal” that matches the color is still the wrong chemistry.",
      },
      {
        id: "ecoboost",
        label: "EcoBoost loss",
        meaning:
          "A 2.0/3.5 EcoBoost that eats coolant may be a degas-bottle or oil-cooler story. Public complaint patterns exist. A flush is not that ticket.",
      },
    ],
    script: [
      "Name the OEM coolant. I will not buy universal green.",
      "Write the freeze point. I will not flush on “due.”",
      "If it is low, pressure-test first.",
    ],
    dont: [
      "Do not mix Dex-Cool with Honda or Toyota coolant.",
      "Do not authorize a flush because the color is brown without a number.",
      "Do not treat coolant loss as a flush upsell.",
    ],
    links: [
      { href: "/catalog", stamp: "Book", label: "Coolant line", why: "Factory-typical chemistry on the card." },
      { href: "/expert/tsb", stamp: "Patterns", label: "EcoBoost / Dex-Cool", why: "Public leak patterns." },
      { href: "/quote", stamp: "Quote", label: "Mark flush", why: "Circle it before you pay." },
    ],
    relatedGuides: ["coolant-check"],
    relatedJobs: ["/jobs/diy", "/jobs/owner"],
    relatedTsb: ["ford-ecoboost-coolant", "gm-dexcool-intake"],
  },
  {
    id: "tire-sticker",
    slug: "tire-sticker",
    stamp: "PSI",
    title: "Door sticker owns PSI",
    kicker: "Sidewall max is not the target",
    plainEnglish:
      "The number on the tire is the maximum the carcass will take. The legal spec for this VIN is the driver’s door placard, cold.",
    minutes: 8,
    audience: "owner",
    scenario:
      "A shop set 40 PSI because “that’s what we do,” or you copied 35 from an F-150 onto a CR-V that wants 26. TPMS is screaming or the center is bald.",
    dummySteps: [
      {
        id: "placard",
        title: "Photo the door-jamb sticker",
        do: "Front and rear can differ. Load and hitch rows exist on vans and trucks. The sidewall 44 PSI is not an invitation.",
        say: "Set the door-sticker number, cold. Not the sidewall max.",
      },
      {
        id: "cold",
        title: "Measure cold, or do the math",
        do: "About 1 PSI per 10 °F. A 32 cold tire reads high after a highway run. Do not bleed a hot tire down to the placard.",
        say: "I want them set cold to the placard. If you set them hot, write the hot number.",
      },
      {
        id: "load",
        title: "Trucks, vans, and lifts",
        do: "Transit rears are often 50–80. A lifted Wrangler on 35s does not rewrite the placard until you have a new load table.",
        say: "What number are you using for the rear? Show me the sticker, not the sidewall.",
      },
      {
        id: "spare",
        title: "Spare and TPMS",
        do: "A compact spare is a different PSI. TPMS often wakes around 25% under placard — that is a fill, not a sensor four-pack.",
        say: "If the lamp is on, read the pressures first. I will not buy sensors from a lamp.",
      },
    ],
    geniusNotes: [
      {
        id: "wear",
        label: "Tread wear",
        unit: "32nds",
        meaning:
          "Center wear is often over-inflation. Shoulder wear is often under-inflation or alignment. Measure 32nds in more than one groove.",
      },
      {
        id: "heuristic-psi",
        label: "Heuristic PSI",
        meaning:
          "Our miss card may say 32 or 35. That is a guess. The door sticker is the spec. A 2002 CR-V at 26 is not a 2018 CR-V at 33.",
      },
    ],
    script: [
      "Door sticker, cold. Not the sidewall max.",
      "Front and rear can differ. Write both.",
      "If TPMS is on, read the pressures before you quote sensors.",
    ],
    dont: [
      "Do not copy an F-150 35 onto a van rear that wants 60.",
      "Do not bleed a hot tire to the placard.",
      "Do not treat a lift as a new placard.",
    ],
    links: [
      { href: "/garage", stamp: "Garage", label: "This VIN", why: "Catalog PSI is still beaten by the sticker." },
      { href: "/guides", stamp: "Guide", label: "How-to bay", why: "PSI, spare, and TPMS cards." },
    ],
    relatedGuides: ["tire-pressure"],
    relatedJobs: ["/jobs/diy"],
    relatedTsb: ["brake-indicator-squeal"],
  },
  {
    id: "misfire",
    slug: "misfire",
    stamp: "P0300",
    title: "Misfire is a pattern",
    kicker: "Not a coil four-pack",
    plainEnglish:
      "P0300 is random misfire. P0301–P0308 name a hole. Coils, plugs, a vacuum leak, or low fuel pressure are the short list — not a tune-up package from the code title.",
    minutes: 15,
    audience: "owner",
    scenario:
      "The light is flashing or it ran rough. A parts counter already has four coils in a basket. You need misfire counts and freeze-frame first.",
    dummySteps: [
      {
        id: "flash",
        title: "Flashing light means stop loading the cat",
        do: "A flashing CEL is catalyst-killing misfire. Reduce load. Do not highway-it to the shop “to burn it off.”",
        say: "The light was flashing. I want misfire counts and a leak-down or plug look before a converter quote.",
      },
      {
        id: "counts",
        title: "Ask for misfire counts per cylinder",
        do: "Mode 6 / freeze-frame / scan-tool counters. One hole is a coil, plug, injector, or compression story. All holes is fuel, vacuum, or a crank sensor.",
        say: "Which cylinders are counting? I will not buy a four-pack from P0300 alone.",
      },
      {
        id: "plugs",
        title: "Plugs before coils if they are due",
        do: "Iridium plugs are often do-not-regap. A 100k plug that is worn will take a new coil with it. One hole first.",
        say: "Pull the plug on the counting cylinder before you sell four coils.",
      },
      {
        id: "trim",
        title: "Read fuel trims and ECT on the freeze-frame",
        do: "A lean trim plus misfire is a leak or a fuel-pressure story. A hot ECT vs a cold driveway code changes the ticket.",
        say: "Print freeze-frame: RPM, load, mph, ECT, STFT, LTFT. I want that paper.",
      },
    ],
    geniusNotes: [
      {
        id: "p0300",
        label: "P0300",
        meaning:
          "Random/multiple. It is a pattern, not a SKU. Coil-on-plug Fords have a public pattern — still confirm the hole that is counting.",
      },
      {
        id: "cat",
        label: "P0420 after a misfire",
        meaning:
          "A melted brick can follow a week of flashing misfire. Fix the fire first. A converter does not fix a dead coil.",
      },
    ],
    script: [
      "Which cylinders are counting? I will not buy a four-pack from P0300.",
      "Print freeze-frame before you clear anything.",
      "If the light was flashing, check the cat after the misfire is gone — not before.",
    ],
    dont: [
      "Do not throw a tune-up package from the code title.",
      "Do not highway a flashing CEL.",
      "Do not clear codes until you have the photo.",
    ],
    links: [
      { href: "/obd", stamp: "OBD", label: "Translate the code", why: "P0300 is a pattern, not a parts list." },
      { href: "/jobs/obd/P0300", stamp: "P0300", label: "Misfire desk", why: "Same warning in the dictionary." },
      { href: "/expert/tsb", stamp: "Patterns", label: "Coil-on-plug / P0420", why: "Public Ford and cat cards." },
    ],
    relatedGuides: ["read-obd"],
    relatedJobs: ["/jobs/obd", "/jobs/tech"],
    relatedTsb: ["ford-coil-on-plug", "p0420-cat-efficiency", "honda-vtc-rattle"],
  },
  {
    id: "history-jacket",
    slug: "history-jacket",
    stamp: "Jacket",
    title: "History jacket — not a Carfax",
    kicker: "NHTSA file + a link we do not own",
    plainEnglish:
      "We assemble vPIC identity, SaferCar campaigns, complaints, and stars. Accident, title, and odometer tape are a consumer Carfax / AutoCheck / NMVTIS purchase. We do not scrape them and we do not own that file.",
    minutes: 12,
    audience: "buyer",
    scenario:
      "You are looking at a used car. Someone said “Carfax is clean.” You still need open inflators, complaint piles, and a PPI. A clean consumer report is not a clean car.",
    dummySteps: [
      {
        id: "nhtsa",
        title: "Run SaferCar on the VIN",
        do: "nhtsa.gov/recalls. Open inflators and campaigns close on the VIN, not on a year/make/model pamphlet. Our /history jacket is YMM plus a link.",
        say: "I want the SaferCar VIN result, not a screenshot of a clean Carfax.",
      },
      {
        id: "carfax-out",
        title: "If you want wrecks and titles, buy them there",
        do: "Carfax consumer portal, AutoCheck, NICB VINCheck, NMVTIS. We deep-link. We do not pull XML and we do not invent wrecks.",
        say: "A clean Carfax is their file, not ours. I still want a PPI and the inflator lookup.",
      },
      {
        id: "complaints",
        title: "Read the SaferCar pile by component",
        do: "/reliability counts who filed, by component. That is not Consumer Reports. A pile is a question for the PPI.",
        say: "What are the top SaferCar components on this nameplate? I will ask the inspector about those.",
      },
      {
        id: "ppi",
        title: "Walk the car anyway",
        do: "The used-PPI playbook is 30 minutes. Frame rust, SRS lamp, and a scan beat a PDF stamp.",
        say: "I am still doing a walk-around. A report is not a lift.",
      },
    ],
    geniusNotes: [
      {
        id: "not-ours",
        label: "Carfax / NMVTIS",
        meaning:
          "Outbound only. We do not host their report, we do not scrape HTML, and we will not paint a green “clean” badge we did not buy.",
      },
      {
        id: "takata",
        label: "Open inflator",
        meaning:
          "A clean history report does not close a Takata campaign. VIN on SaferCar. Do not buy a yard airbag.",
      },
    ],
    script: [
      "SaferCar VIN first. A clean Carfax is their file — Open Hood does not own it.",
      "I still want a PPI. A PDF is not a lift.",
      "If an inflator is open, that is a dealer campaign, not a Facebook bag.",
    ],
    dont: [
      "Do not treat a consumer Carfax as Open Hood’s file.",
      "Do not skip SaferCar because a report said clean.",
      "Do not buy a used airbag.",
    ],
    links: [
      { href: "/history", stamp: "History", label: "NHTSA jacket", why: "Identity + campaigns + a Carfax link-out." },
      { href: "/reliability", stamp: "File", label: "Complaint counts", why: "Complaint counts, not Consumer Reports." },
      { href: "/expert/used-ppi", stamp: "PPI", label: "Walk-around", why: "Thirty minutes before you wire money." },
      { href: "/recalls", stamp: "Recalls", label: "Campaigns", why: "YMM rows. VIN close-out is SaferCar." },
    ],
    relatedGuides: ["buying-used"],
    relatedJobs: ["/jobs/ppi", "/jobs/inspector"],
    relatedTsb: ["takata-accord-2003", "takata-family", "toyota-frame-rust"],
  },
  {
    id: "cabin-upsell",
    slug: "cabin-upsell",
    stamp: "Cabin",
    title: "Cabin filter “while you’re here”",
    kicker: "Often a glove-box job",
    plainEnglish:
      "A $220 cabin-filter line is usually a $15 part and ten minutes. Ask to see the old one. If they already have the glove box open, watch.",
    minutes: 8,
    audience: "owner",
    scenario:
      "The RO grew a cabin-filter line after you asked for an oil change. You can do this at home on most Hondas and Toyotas.",
    dummySteps: [
      {
        id: "see-it",
        title: "See the old filter before you buy",
        do: "Photo. Leaves and hair are real. A tan filter that is not clogged is not an emergency. Tesla HEPA is a different SKU — still not a $400 mystery.",
        say: "Show me the old cabin filter before you add the line.",
      },
      {
        id: "sku",
        title: "Write the OEM number",
        do: "Honda 80292-…, Toyota 87139-…, Motorcraft FP-…. Our cross-ref is Fram/Wix/Purolator — confirm the box.",
        say: "What is the OEM number? I can buy that part myself.",
      },
      {
        id: "labor",
        title: "Ask the labor minutes",
        do: "We do not have Motor hours. A glove-box cabin filter is often 0.3 or less. Rear Odyssey filters are a second SKU.",
        say: "How many tenths is the cabin filter on this VIN? If it is a glove box, I may do it at home.",
      },
      {
        id: "while",
        title: "Separate “while you’re here” from the concern",
        do: "Oil was the job. Cabin air is optional. Mark the quote.",
        say: "Leave the cabin filter as a separate yes. I did not authorize a menu.",
      },
    ],
    geniusNotes: [
      {
        id: "diy",
        label: "DIY",
        meaning:
          "Most glove-box filters are a 5-minute job. Some German cars hide it under the cowl. If they will not show you, that is a reason to walk.",
      },
      {
        id: "two",
        label: "Two filters",
        meaning: "Some Odysseys and vans have a rear cabin filter. Ask if they priced both or one.",
      },
    ],
    script: [
      "Show me the old filter. I will not buy a photo of a catalog.",
      "Write the OEM SKU. I may buy it myself.",
      "Leave it as a separate yes — I came in for oil.",
    ],
    dont: [
      "Do not authorize a cabin filter you were not shown.",
      "Do not let “while you’re here” ride on the oil ticket unread.",
    ],
    links: [
      { href: "/quote", stamp: "Quote", label: "Mark the line", why: "Cabin-filter grease pencil." },
      { href: "/parts", stamp: "Parts", label: "Buy the filter", why: "SKU on the card." },
      { href: "/catalog", stamp: "Book", label: "Cabin SKU", why: "Factory-typical numbers." },
    ],
    relatedGuides: ["cabin-filter"],
    relatedJobs: ["/jobs/diy"],
    relatedTsb: ["brake-indicator-squeal"],
  },
  {
    id: "ev-12v",
    slug: "ev-12v",
    stamp: "12V",
    title: "EV that will not wake",
    kicker: "The 12V still bricks the car",
    plainEnglish:
      "No engine oil. The 12-volt battery still runs contactors and computers. A silent Tesla, Bolt, or Prologue is often a $200 12V, not a high-voltage pack.",
    minutes: 12,
    audience: "ev",
    scenario:
      "The car is dead in the driveway. No screens. Someone already quoted a battery pack. You need a rested 12V voltage first.",
    dummySteps: [
      {
        id: "rested",
        title: "Measure the 12V rested",
        do: "~12.6 V full, ~12.2 half. Below ~12.0 after a rest is a load-test candidate. Jump points are in the manual — not the orange cables.",
        say: "What is the rested 12-volt number? I will not authorize an HV pack from a silent dash.",
      },
      {
        id: "no-oil",
        title: "Refuse the oil-change ticket",
        do: "If they quoted 0W-20 on a Model 3, they have the wrong VIN. Cabin/HEPA is the filter that exists.",
        say: "This is an EV. There is no engine oil. Show me the 12V and the cabin filter if that is the job.",
      },
      {
        id: "tow",
        title: "Tow like an EV",
        do: "Many EVs want flatbed, transport mode, or a specific N to D procedure. A wheel-lift on a locked motor is a bill.",
        say: "How are you towing this? I want transport mode or a flatbed, not a drag.",
      },
      {
        id: "hv",
        title: "HV work is a different roof",
        do: "Orange cables, pack isolation, and dealer/indie EV techs. A general bay that will not show a 12V reading is not that roof.",
        say: "If the 12V tests good and it still will not wake, I want an EV-capable bay — not a parts cannon.",
      },
    ],
    geniusNotes: [
      {
        id: "volt",
        label: "12V rested",
        unit: "V",
        meaning:
          "Contactors need a healthy 12V. A pretty rest number can still fail a load test. AGM vs lithium 12V is a SKU, not a guess.",
      },
      {
        id: "hepa",
        label: "Cabin / HEPA",
        meaning: "Tesla and some others use a HEPA path. Aftermarket is not always a Fram number. Confirm the refresh SKU.",
      },
    ],
    script: [
      "Rested 12-volt number first. I will not buy an HV pack from a dark screen.",
      "There is no oil change on this VIN.",
      "Tow it as an EV — flatbed or transport mode.",
    ],
    dont: [
      "Do not let them quote engine oil on a battery EV.",
      "Do not stand in orange-cable work you did not ask for.",
      "Do not wheel-lift a locked motor.",
    ],
    links: [
      { href: "/expert/ev-owner", stamp: "EV", label: "EV owner card", why: "Tires, 12V, no oil." },
      { href: "/expert/tsb", stamp: "Patterns", label: "Silent 12V", why: "Public EV 12V pattern." },
      { href: "/jobs/ev", stamp: "Jobs", label: "EV desk", why: "Same warning in jobs." },
    ],
    relatedGuides: ["jump-start"],
    relatedJobs: ["/jobs/ev"],
    relatedTsb: ["ev-12v-silent", "tesla-lv-battery"],
  },
  {
    id: "recall-first",
    slug: "recall-first",
    stamp: "Recall",
    title: "Check campaigns before you shop",
    kicker: "A campaign is not a DIY bag",
    plainEnglish:
      "Takata, ignition switches, and open inflators are dealer campaigns. An indie “we can get a bag from the yard” is how the defect repeats. VIN on SaferCar.",
    minutes: 10,
    audience: "owner",
    scenario:
      "SRS lamp, or you are about to pay an indie for an airbag. The 2003 Accord demo exists because that VIN is in the Takata population.",
    dummySteps: [
      {
        id: "vin-safer",
        title: "Type the 17 characters at SaferCar",
        do: "nhtsa.gov/recalls. Year/make/model rows on /recalls are a pamphlet. Close-out is the VIN.",
        say: "Is there an open campaign on this VIN for the airbag or the part you want to replace?",
      },
      {
        id: "no-yard",
        title: "Refuse a used inflator",
        do: "Salvage bags re-install the defect. The campaign exists because that happened.",
        say: "I will not authorize a used airbag. If it is open, I want the dealer campaign.",
      },
      {
        id: "both-sides",
        title: "Driver and passenger can be different campaigns",
        do: "One closed recall does not close the other side. Read both lines.",
        say: "Show me driver and passenger inflator status, not one checkbox.",
      },
      {
        id: "indie",
        title: "Indie can still do the rest of the car",
        do: "Brakes, oil, and a scan stay indie. The inflator is the exception.",
        say: "Do the brakes here. The open inflator goes to the dealer campaign.",
      },
    ],
    geniusNotes: [
      {
        id: "takata",
        label: "Takata",
        meaning:
          "Ammonium-nitrate inflators can rupture. Heat and humidity make unused passenger inflators worse. Public NHTSA campaign — not a TSB PDF we host.",
      },
      {
        id: "switch",
        label: "GM ignition",
        meaning: "A public campaign/pattern. VIN still decides. We will not paste the dealer bulletin.",
      },
    ],
    script: [
      "SaferCar VIN. Is this campaign open?",
      "No used airbags. If it is open, I want the dealer remedy.",
      "Driver and passenger can be different lines.",
    ],
    dont: [
      "Do not buy a Facebook airbag.",
      "Do not skip the VIN because YMM “looks fine.”",
      "Do not treat a campaign as an indie upsell.",
    ],
    links: [
      { href: "/recalls", stamp: "Recalls", label: "YMM file", why: "Then finish on SaferCar VIN." },
      { href: "/expert/tsb", stamp: "Patterns", label: "Takata cards", why: "Pattern cards, not PDFs." },
      { href: "/expert/used-ppi", stamp: "PPI", label: "Buying used", why: "SRS lamp is a walk-away until looked up." },
    ],
    relatedGuides: ["buying-used"],
    relatedJobs: ["/jobs/owner"],
    relatedTsb: ["takata-accord-2003", "takata-family", "gm-ignition-switch"],
  },
  {
    id: "frame-rust",
    slug: "frame-rust",
    stamp: "Frame",
    title: "Frame and rust on a used truck",
    kicker: "A magnet and a photo, not a vibe",
    plainEnglish:
      "Toyota frames and salt-belt unibodies have public complaint history. A PPI is a flashlight on the rails, not a Carfax stamp we do not own.",
    minutes: 15,
    audience: "buyer",
    scenario:
      "You are looking at a Tacoma, Tundra, 4Runner, or a northern Honda. The listing says “rust-free.” You need the rails, the spare-tire crossmember, and a straightedge.",
    dummySteps: [
      {
        id: "rails",
        title: "Photo the frame rails and the spare crossmember",
        do: "Flake, perforation, and fresh undercoat over scale. A campaign or warranty on some Toyota frames is a VIN question — we will not paste the bulletin.",
        say: "I want photos of both rails and the spare-tire crossmember on a lift. “Looks fine” is not a photo.",
      },
      {
        id: "brake-lines",
        title: "Hard lines and brake flex",
        do: "Rusted hard lines are a safety ticket. Flex hoses crack at the crimp. This is a measurement and a look, not a flush.",
        say: "Are the hard lines perforated? I want that in the write-up.",
      },
      {
        id: "bed",
        title: "Body mounts and bed",
        do: "A clean bed can hide rotten mounts. Push the bed. Look at the cab corners on a Tacoma.",
        say: "Check body mounts and cab corners. I will pay for the photos.",
      },
      {
        id: "history",
        title: "SaferCar plus a report you buy",
        do: "Our jacket is NHTSA. Wrecks and titles are a consumer Carfax / NMVTIS link-out. Neither replaces the lift.",
        say: "I still want the lift photos. A clean report is not a clean frame.",
      },
    ],
    geniusNotes: [
      {
        id: "toyota-frame",
        label: "Toyota frame",
        meaning:
          "Public NHTSA complaints and some campaigns on older Tacoma/Tundra/Sequoia frames. VIN decides. We host a pattern card, not the OEM PDF.",
      },
      {
        id: "salt",
        label: "Salt belt",
        meaning: "A southern truck can still rust at a washer. A northern truck can be clean. The photos decide.",
      },
    ],
    script: [
      "Lift photos of both rails and the spare crossmember.",
      "Hard lines and body mounts in the write-up.",
      "A Carfax I buy later is not this inspection.",
    ],
    dont: [
      "Do not skip the lift because a consumer report is clean.",
      "Do not accept “undercoated, so it’s fine” without photos under the coat.",
    ],
    links: [
      { href: "/expert/used-ppi", stamp: "PPI", label: "Full walk-around", why: "Frame is one stall of the PPI." },
      { href: "/expert/history-jacket", stamp: "Jacket", label: "What we own", why: "NHTSA + outbound Carfax." },
      { href: "/expert/tsb", stamp: "Patterns", label: "Frame rust card", why: "Public Toyota pattern." },
    ],
    relatedGuides: ["buying-used"],
    relatedJobs: ["/jobs/ppi", "/jobs/inspector"],
    relatedTsb: ["toyota-frame-rust"],
  },
  {
    id: "interval-card",
    slug: "interval-card",
    stamp: "Interval",
    title: "Factory-typical miles, not TIS",
    kicker: "5k / 10k · 15k · 5yr/100k · 3yr",
    plainEnglish:
      "Oil 5,000 severe or 10,000 normal, cabin about 15,000, coolant often 5 years or 100,000 first, brake fluid about 3 years. That is a US pamphlet, not a licensed Motor hour and not OEM TIS. The cap and the door jamb still win.",
    minutes: 8,
    audience: "owner",
    scenario:
      "The RO says “due” with no miles and no years. You need a typical card you can argue from, then you make them show the book for this VIN.",
    dummySteps: [
      {
        id: "oil",
        title: "Oil is 5k severe or 10k / the monitor",
        do: "Short trips, tow, and dust use the 5k column. Many late cars have an oil-life monitor. Divide the odometer by 10k for a long-interval count — that is a conversation, not a factory close-out.",
        say: "Show me the interval page or the oil-life percent for this VIN. I will not buy “due” from a poster.",
      },
      {
        id: "cabin",
        title: "Cabin filter is a look at 15k",
        do: "Photo the old one. Leaves are real. A tan filter is not an emergency. Most glove-box jobs are a $15 part.",
        say: "Show me the old cabin filter. If it is a glove box, I may do it at home.",
      },
      {
        id: "coolant",
        title: "Coolant 5yr / 100k is a first ticket",
        do: "Chemistry first: Dex-Cool, Honda Type 2, Toyota SLLC. A 5-year card does not authorize universal green.",
        say: "What OEM coolant and what freeze point? I will not flush on the word due.",
      },
      {
        id: "brake",
        title: "Brake fluid is about 3 years or a strip",
        do: "Hygroscopic. A boiling-point or test-strip number beats a menu. DOT 3 vs 4 is on the cap.",
        say: "Write the test number or the year it was last done. I will not buy a flush from a calendar alone.",
      },
    ],
    geniusNotes: [
      {
        id: "not-tis",
        label: "Not TIS",
        meaning:
          "We do not have Honda TIS, Toyota TIS, Ford PTS, or GM SI. This card is factory-typical US maintenance language. If they cite a bulletin, they show the OEM page.",
      },
      {
        id: "math",
        label: "Odometer math",
        meaning:
          "87,000 ÷ 10,000 ≈ 8 oil cards on the long interval. That is how many typical services that pile would have seen — not a diagnosis that the oil is dirty today.",
      },
    ],
    script: [
      "Show the interval page or the oil-life number. I will not authorize “due.”",
      "Cabin filter: show the old one. Coolant: name the chemistry. Brake fluid: a strip or a year.",
      "This bay’s card is factory-typical, not Motor, not OEM TIS.",
    ],
    dont: [
      "Do not treat 5k/10k as a licensed factory hour.",
      "Do not flush coolant because it is brown without a freeze point.",
      "Do not let “while you’re here” ride on the interval card unread.",
    ],
    links: [
      { href: "/catalog", stamp: "Book", label: "Fluids pamphlet", why: "Viscosity and SKUs. Intervals are still typical." },
      { href: "/garage", stamp: "Garage", label: "This VIN", why: "Mileage stamps the typical cards." },
      { href: "/quote", stamp: "Quote", label: "Mark due", why: "Circle the line they called due." },
    ],
    relatedGuides: ["oil-change", "coolant-check"],
    relatedJobs: ["/jobs/owner", "/jobs/diy"],
    relatedTsb: ["honda-15t-dilution", "toyota-2az-consumption"],
  },
  {
    id: "complaint-pile",
    slug: "complaint-pile",
    stamp: "Pile",
    title: "SaferCar pile is a question",
    kicker: "Component → playbook. Not CR.",
    plainEnglish:
      "Complaint counts, not Consumer Reports. NHTSA stores a component on each complaint. We map that label to a playbook, a quote job slug, and a public pattern card. CR is a magazine we do not license.",
    minutes: 10,
    audience: "buyer",
    scenario:
      "The reliability desk pulled 400 filings and “POWER TRAIN” is on top. You need the next script, not a reliability badge.",
    dummySteps: [
      {
        id: "read-label",
        title: "Read the SaferCar component, not the vibe",
        do: "POWER TRAIN is transmission / CVT / TCM. ENGINE is oil, misfire, bottom end. AIR BAGS is a campaign path. The label is the file.",
        say: "What is the top SaferCar component on this nameplate? I will walk that ticket, not a score.",
      },
      {
        id: "open-card",
        title: "Open the mapped playbook",
        do: "/reliability stamps playbook and quote slugs on each component. Pattern cards are public — not a stolen TSB.",
        say: "I am using the POWER TRAIN playbook. Write the fluid name before you quote a flush.",
      },
      {
        id: "not-cr",
        title: "Refuse the CR sentence",
        do: "We do not have their subscriber survey. A pile is owners who filled out a federal form. Small pile can mean nobody bothered.",
        say: "Complaint counts, not Consumer Reports. I still want a PPI.",
      },
      {
        id: "not-carfax",
        title: "Wrecks are a link-out",
        do: "Accident / title / odometer tape is Carfax / AutoCheck / NMVTIS. We deep-link. We do not own that file.",
        say: "If I buy a history report, I buy it there. Open Hood does not host Carfax.",
      },
    ],
    geniusNotes: [
      {
        id: "map",
        label: "The map",
        meaning:
          "AIR BAGS → recall-first. POWER TRAIN → trans-flush. ENGINE → oil-spec / misfire. COOLING → coolant-spec. STRUCTURE → frame-rust. Unmapped labels fall back to pre-shop.",
      },
      {
        id: "rate",
        label: "Not a rate",
        meaning:
          "Filings ÷ years of the nameplate is pace, not failures per 100 cars. No vehicles-in-operation. No CR bubble.",
      },
    ],
    script: [
      "Top SaferCar component is [label]. I want that playbook, not a reliability score.",
      "Complaint counts, not Consumer Reports. CR is a magazine we do not license. I still want a PPI.",
      "Carfax is a purchase I make on their site. You do not own that file.",
    ],
    dont: [
      "Do not call a complaint pile a CR rating.",
      "Do not skip SaferCar VIN because a consumer report is clean.",
      "Do not treat an unmapped component as “nothing.”",
    ],
    links: [
      { href: "/reliability", stamp: "File", label: "Component counts", why: "SaferCar by component, with playbook stamps." },
      { href: "/expert/tsb", stamp: "Patterns", label: "Pattern cards", why: "Public failures. Not TIS PDFs." },
      { href: "/expert/history-jacket", stamp: "Jacket", label: "What we own", why: "NHTSA + outbound Carfax." },
    ],
    relatedGuides: ["buying-used"],
    relatedJobs: ["/jobs/ppi", "/jobs/inspector"],
    relatedTsb: ["takata-family", "nissan-cvt-judder", "toyota-frame-rust"],
  },
];
