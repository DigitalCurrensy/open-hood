import { CATALOG_BRIEF } from "@/config/nav/catalog";
import { CONTACT_BRIEF } from "@/config/nav/contact";
import { STICKER_BRIEF } from "@/config/nav/sticker";
import { TRUST_BRIEFS } from "@/config/nav/trust";

export const READING_LEVEL_STORAGE_KEY = "openhood.reading-level";
export const READING_LEVEL_EVENT = "openhood:reading-level";

export type ReadingLevelId = "beginner" | "expert";

export const READING_TOGGLE = {
  beginner: { id: "beginner", label: "Beginner", hint: "Short steps. What to say at the counter." },
  expert: { id: "expert", label: "Expert", hint: "Codes, millimeters, OEM vs aftermarket, freeze-frame." },
} as const;

const LEGACY_READING_LEVEL: Record<string, ReadingLevelId> = {
  dummy: "beginner",
  "shop-talk": "expert",
};

export interface AltitudeCopy {
  job: string;
  for: string;
  click: string;
  say: string;
}

export interface PageUxBrief {
  href: string;
  eyebrow: string;
  dummy: AltitudeCopy;
  genius: AltitudeCopy;
}

export const UX_BRIEFS: PageUxBrief[] = [
  {
    href: "/",
    eyebrow: "Identify",
    dummy: {
      job: "Type the VIN. No VIN? Year, make, and model. Then the other bays have a car.",
      for: "Anyone about to authorize a repair.",
      click: "Decode VIN — or the year / make / model fields.",
      say: "This is a year-make-model. Confirm it on the RO before you sign.",
    },
    genius: {
      job: "NHTSA vPIC. WMI + VDS + VIS. A photo is read on your phone. A plate is a note, not a DMV lookup.",
      for: "Owners who want the decode, not a marketplace.",
      click: "VIN first. Year/make/model is the fallback. Photos compress to JPEG on device.",
      say: "Match the 17-character VIN on the ticket to the door sticker.",
    },
  },
  {
    href: "/garage",
    eyebrow: "Spec sheet",
    dummy: {
      job: "Read oil, coolant, and tire PSI for this car.",
      for: "You already identified a vehicle.",
      click: "Open the fluids card. Copy a filter SKU if you need one.",
      say: "What's the factory oil spec and capacity?",
    },
    genius: {
      job: "Capacities, viscosities, filter SKUs, door-sticker PSI. Displacement rounds to 3.0L, not 3.00.",
      for: "Anyone checking OEM fluid vs the menu.",
      click: "Use the spec ticket. Parts links are search URLs, not stock.",
      say: "Quote the viscosity and liters. Do not accept 'whatever we have.'",
    },
  },
  {
    href: "/quote",
    eyebrow: "Quote defense",
    dummy: {
      job: "Paste the estimate. We mark the padded lines.",
      for: "You have a written quote or a photo of the RO.",
      click: "Paste the lines or shoot the ticket. Then read the script.",
      say: "Show me the test that makes this line necessary.",
    },
    genius: {
      job: "Local price book vs RO lines. Grease-pencil on pad. Photo reading is an optional connection.",
      for: "Owners defending labor hours and shop supplies.",
      click: "Paste the RO. Photo uses device OCR without a key.",
      say: "Diagnosis is a line. Shop supplies need a dollar amount.",
    },
  },
  {
    href: "/symptoms",
    eyebrow: "Symptom wizard",
    dummy: {
      job: "Pick the noise and when it happens. Get the sentences for the shop.",
      for: "Something sounds or feels wrong.",
      click: "Answer the wizard. Copy the inspect list.",
      say: "It does this when I [moment]. Please inspect [system] first.",
    },
    genius: {
      job: "Rule map from symptom + condition to likely systems. Not a parts catalog.",
      for: "Anyone who needs a test order, not a guess.",
      click: "Noise + moment. Then the inspect list.",
      say: "Do not replace parts until you duplicate the complaint.",
    },
  },
  {
    href: "/recalls",
    eyebrow: "Recalls",
    dummy: {
      job: "See if the dealer owes you a free fix.",
      for: "This VIN is already on the desk.",
      click: "Read each campaign. Call the dealer with the script.",
      say: "Campaign [id] is open on this VIN. When can you perform it?",
    },
    genius: {
      job: "NHTSA SaferCar campaigns for the VIN. Remedy vs incomplete. We do not file the claim.",
      for: "Owners checking campaign status before a dealer visit.",
      click: "VIN-scoped list. Copy the dealer line.",
      say: "Is NHTSA campaign [id] open, and is the part on hand?",
    },
  },
  {
    href: "/obd",
    eyebrow: "OBD codes",
    dummy: {
      job: "Type the code from the cheap scanner. Read it in English.",
      for: "The light is on. You have the code.",
      click: "Enter the P0xxx. Do not buy parts yet.",
      say: "The scanner shows [code]. What test comes first?",
    },
    genius: {
      job: "P/B/C/U translator. P0420 is not automatically a converter. Ask for freeze-frame.",
      for: "Anyone who will not throw parts at a code.",
      click: "Type the exact DTC. Read likely systems.",
      say: "Pull freeze-frame: load, RPM, STFT/LTFT, coolant temp. Then test.",
    },
  },
  {
    href: "/parts",
    eyebrow: "Parts",
    dummy: {
      job: "Search the same part at three stores. We do not have it on a shelf.",
      for: "You have a car on the spec sheet.",
      click: "Open RockAuto, AutoZone, or Amazon from the SKU.",
      say: "I need [SKU]. OEM or equivalent — write the difference.",
    },
    genius: {
      job: "Outbound search URLs from catalog SKUs. Not TecDoc. Not live dealer stock.",
      for: "Owners comparing OEM vs aftermarket before they authorize.",
      click: "SKU → store search. eBay Motors is a search, not a cart.",
      say: "OEM, aftermarket, or CAPA? Write the brand on the RO.",
    },
  },
  {
    href: "/directory",
    eyebrow: "Directory",
    dummy: {
      job: "Type a ZIP. See nearby shops. We do not book a bay.",
      for: "You need a rooftop, not a marketplace.",
      click: "Search ZIP or city. Tap a card for phone and map.",
      say: "Do you do this make? What's the diagnostic fee in writing?",
    },
    genius: {
      job: "Nominatim geocode + OSM Overpass rooftops (~12 km). The demo cache only answers when you type 90210 or 43215. A city we cannot geocode reads as a miss — we do not hand you Beverly Hills instead.",
      for: "Anyone who wants OSM tags, not a paid placement.",
      click: "Filter dealer / repair / parts / body / tires / tow / inspect / wash.",
      say: "Confirm hours from OSM opening_hours. We take no cut.",
    },
  },
  {
    href: "/directory/parts",
    eyebrow: "Parts SKUs",
    dummy: {
      job: "Year, make, model, part type → four store searches.",
      for: "You know the part name, not the interchange.",
      click: "Fill the fields. Open a store tab.",
      say: "This is a year-make-model. I need [part]. What's your SKU?",
    },
    genius: {
      job: "RockAuto / AutoZone / Amazon / eBay Motors query URLs. No invented interchange. No TecDoc hours.",
      for: "SKU hunters who will not trust a fake 'in stock' badge.",
      click: "Submit the query. We only open search pages.",
      say: "Match brand and OEM vs aftermarket on the invoice line.",
    },
  },
  {
    href: "/auctions",
    eyebrow: "Auctions",
    dummy: {
      job: "See which lanes you can actually bid on. Then we open their site.",
      for: "You're shopping wrecks or wholesale — not a lot we own.",
      click: "Pick a lane. Search their site with year / make / model.",
      say: "Is this a public consumer auction or dealer-only?",
    },
    genius: {
      job: "Link-out only. BaT / Cars & Bids are public. Copart / IAA often need a broker. Manheim / ADESA stay wholesale. We do not scrape lots.",
      for: "Buyers who need landed cost, not a live board.",
      click: "Lane list + year/make/model query params.",
      say: "Hammer plus fees plus transport. That's the number.",
    },
  },
  {
    href: "/guides",
    eyebrow: "Guides",
    dummy: {
      job: "Pick the job. Watch a real video or open an honest search.",
      for: "Non-mechanics who still need to do the thing.",
      click: "Search or tap a family. Open the guide.",
      say: "I watched the job. Confirm torque from the chart — not the video.",
    },
    genius: {
      job: "Curated jobs mapped to verified YouTube IDs. Search link when one ID is not honest enough.",
      for: "Owners who want a procedure, not a random dump.",
      click: "Family stamps, then the job card.",
      say: "Use the OEM torque and spec. A video is not the book.",
    },
  },
  {
    href: "/agent",
    eyebrow: "Advocate",
    dummy: {
      job: "Ask the question you'd ask a mechanic in line.",
      for: "You have a quote, a noise, or a code and want English first.",
      click: "Type the question. Use the tickets it hands back.",
      say: "Read the script it gives you. Don't authorize adjectives.",
    },
    genius: {
      job: "Advocate desk. Quote, symptoms, OBD tools. A missing optional connection is an honest fallback — the price book still runs.",
      for: "Owners who want a second reader before they sign.",
      click: "Ask. Follow the tool tickets — VIN, quote, code.",
      say: "I need the test and the measurement, not 'they're due.'",
    },
  },
  {
    href: "/jobs",
    eyebrow: "Jobs / roles",
    dummy: {
      job: "Pick who you are. Use that desk. Then go to the counter.",
      for: "Owner, writer, tech, parts — or anyone else in the pipeline.",
      click: "A role stamp. Then the tool on that desk.",
      say: "Depends on the desk. Each one writes the sentence for you.",
    },
    genius: {
      job: "Role switchboard. Everyday owner first. No live dealer inventory on any desk.",
      for: "The whole pipeline — owner through fleet.",
      click: "Role or tool stamp on the jobs board.",
      say: "Measurements on the RO. Diagnosis split from repair.",
    },
  },
  {
    href: "/jobs/owner",
    eyebrow: "Owner",
    dummy: {
      job: "Tick the card. Write one sentence. Walk in.",
      for: "Daily drivers before a shop visit.",
      click: "Check VIN, miles, the concern, the out-the-door ask.",
      say: "Here is the concern in one sentence. What's the test?",
    },
    genius: {
      job: "Confidence checklist: VIN, complaint, measurements, authorization ceiling.",
      for: "Owners who will not authorize adjectives.",
      click: "Finish the card. Copy the sentence.",
      say: "Approve a number, not a vibe. Call before extras.",
    },
  },
  {
    href: "/jobs/diy",
    eyebrow: "DIY",
    dummy: {
      job: "Read the job card. Get the tools. Don't guess torque.",
      for: "Weekend mechanics on a driveway.",
      click: "Open the card. Note tools, torque mindset, safety.",
      say: "I need the torque spec from the chart, not a forum.",
    },
    genius: {
      job: "Tools, torque mindset, jack points. A chart beats a guess. Safety keeps a driveway job from a tow.",
      for: "DIY who will not skip stands or torque.",
      click: "Job card first. Then the book spec.",
      say: "What's the OEM torque and thread locker callout?",
    },
  },
  {
    href: "/jobs/advisor",
    eyebrow: "Service writer",
    dummy: {
      job: "LOF is oil. 'Due' is not a measurement. Pick the line you wrote.",
      for: "Advisors translating a ticket for an owner.",
      click: "Pick the RO line. Read what the owner hears.",
      say: "This line is [service]. The test is [measurement].",
    },
    genius: {
      job: "RO decoder: LOF, MPI, alignment, trans service. Ticket slang in owner English.",
      for: "Writers who will put millimeters on the RO.",
      click: "Select the operation. Copy the owner line.",
      say: "Diagnosis is separate from the repair. Authorization has a ceiling.",
    },
  },
  {
    href: "/jobs/tech",
    eyebrow: "Tech",
    dummy: {
      job: "They will ask for the test. Write millimeters on the rotors.",
      for: "Technicians talking to an owner who read this bay.",
      click: "Use the pad. Write the number. We do not invent the book spec.",
      say: "Rotor thickness is [mm] vs discard [mm].",
    },
    genius: {
      job: "Numbers, not adjectives. Rotor mm, DTC freeze-frame, OEM vs aftermarket on the line.",
      for: "ASE techs who expect to be asked for the test.",
      click: "Write the measurement. Leave the book spec blank if you don't have it.",
      say: "Here is the test, the reading, and the discard spec.",
    },
  },
  {
    href: "/jobs/parts",
    eyebrow: "Parts counter",
    dummy: {
      job: "Ask the VIN. OEM, aftermarket, or CAPA — say which.",
      for: "Counter staff and owners buying a SKU.",
      click: "Walk the SKU conversation. We do not show a dealer shelf.",
      say: "VIN first. Which brand, and is it OEM or aftermarket?",
    },
    genius: {
      job: "OEM vs aftermarket vs CAPA body. No fake live inventory. No TecDoc interchange.",
      for: "Anyone writing a brand on an invoice line.",
      click: "Use the talk track. Search URLs live on /parts.",
      say: "Write the brand and OEM/AM on the RO. No 'equivalent' without a name.",
    },
  },
  {
    href: "/jobs/sales",
    eyebrow: "Dealer sales",
    dummy: {
      job: "PPI on paper. Products have names. Decline is a complete sentence.",
      for: "Buyers in F&I, and the person sitting across from them.",
      click: "Read what not to bury. Take the PPI reminder.",
      say: "I want a pre-purchase inspection on paper before I sign.",
    },
    genius: {
      job: "Add-ons are yes/no lines. Don't bury products in F&I. PPI is not optional theater.",
      for: "Sales desks that will put add-ons on their own lines.",
      click: "Walk the decline list. Send them to /jobs/ppi.",
      say: "Each product, a price, a yes or no. No bundle fog.",
    },
  },
  {
    href: "/jobs/shop",
    eyebrow: "Independent shop",
    dummy: {
      job: "Diagnosis is a line. Supplies have a number. Authorization is a ceiling.",
      for: "Shop owners quoting work, and owners reading that quote.",
      click: "Read the fair-quoting norms.",
      say: "Call me before extras. Diagnosis is not the repair.",
    },
    genius: {
      job: "Fair quoting: diag split, shop supplies disclosed, authorization ceiling, no vibe approvals.",
      for: "Independents who want the owner to come back.",
      click: "Use the norms card. Put dollars on supplies.",
      say: "Approved to [amount]. Call before anything above it.",
    },
  },
  {
    href: "/jobs/claims",
    eyebrow: "Claims",
    dummy: {
      job: "Wide, medium, close with a coin. Prior damage gets its own frame.",
      for: "Adjusters and anyone shooting a claim.",
      click: "Work the shot list. VIN first.",
      say: "Here is the VIN, the damage with scale, and prior damage called out.",
    },
    genius: {
      job: "Claim photo list: VIN, scale, prior damage, dated folder. Not a legal filing.",
      for: "Body and claims desks that need a file that will pay.",
      click: "Tick each shot. Keep the same miles in the folder name.",
      say: "Prior damage is in frames [n]. This impact is [n].",
    },
  },
  {
    href: "/jobs/inspector",
    eyebrow: "Inspector",
    dummy: {
      job: "Same concern, new miles, dated folder. We do not file a claim.",
      for: "PPI / walk-around photographers. Not a lawyer.",
      click: "Follow the shot list. Date and miles on the folder.",
      say: "Here is the walk-around from [date] at [miles].",
    },
    genius: {
      job: "Walk-around file. Not legal advice. Not a lemon-law filing. A paper trail you already have.",
      for: "Inspectors documenting, not litigating.",
      click: "Shot list + legal line on the desk.",
      say: "These photos are documentation. Get counsel for a filing.",
    },
  },
  {
    href: "/jobs/auction",
    eyebrow: "Auction lanes",
    dummy: {
      job: "Public vs dealer is paperwork and a clock. Hammer is not the gate.",
      for: "Anyone bidding who still thinks the hammer is the price.",
      click: "Read lanes and fees. Add transport.",
      say: "What's the landed cost — hammer, fees, and trucking?",
    },
    genius: {
      job: "Public vs dealer lanes, fee gotchas, landed-cost desk. No live auction inventory.",
      for: "Wholesale buyers who will not scrape Copart.",
      click: "Lane card + fee math. Link out from /auctions.",
      say: "Dealer-only means a broker. Price that in.",
    },
  },
  {
    href: "/jobs/fleet",
    eyebrow: "Fleet",
    dummy: {
      job: "Stamp the book, not the pitch. Ask for millimeters.",
      for: "Fleet and shop managers approving ROs.",
      click: "Interval vs upsell. Approve the page.",
      say: "Show me the OEM interval and the measurement.",
    },
    genius: {
      job: "OEM interval vs MPI adjectives. Authorization by spec, not menu.",
      for: "Managers who approve a page, not a pitch.",
      click: "Use the interval card. Reject 'due' without mm.",
      say: "Approve [interval item]. Decline [upsell] until you have a reading.",
    },
  },
  {
    href: "/jobs/ev",
    eyebrow: "EV owner",
    dummy: {
      job: "There is no oil change. The 12-volt still dies. Tires still wear.",
      for: "EV owners handed an ICE menu.",
      click: "Read 12V, tires, brakes, cabin, coolant loops.",
      say: "Decline the oil change. What's the 12-volt test?",
    },
    genius: {
      job: "12V, tires, brake fluid age, cabin filter, thermal-loop coolant. No ICE LOF.",
      for: "BEV / PHEV owners at a mixed bay.",
      click: "Use the EV desk. Skip oil and spark.",
      say: "12-volt state of health, tire date codes, brake-fluid test.",
    },
  },
  {
    href: "/jobs/obd",
    eyebrow: "Codes desk",
    dummy: {
      job: "The light is a pointer. Do not throw parts.",
      for: "Anyone with a P/B/C/U on a $20 scanner.",
      click: "Type the code. Read the English. Stop at the inspect list.",
      say: "P0420 is not automatically a converter. What test first?",
    },
    genius: {
      job: "Dictionary + likely systems. Freeze-frame before parts. P0300 is not a coil kit.",
      for: "Owners and techs who want the test order.",
      click: "Code in the box. Optional ?code= on the URL.",
      say: "Freeze-frame first. Then the circuit test. Then parts.",
    },
  },
  {
    href: "/jobs/ppi",
    eyebrow: "PPI shots",
    dummy: {
      job: "Date codes, VIN, cluster lamps, a scan screen. Then decide if you wire money.",
      for: "Buyers before a transfer. Not an appraisal.",
      click: "Work the guided shot list.",
      say: "I want these photos and a scan before I send a deposit.",
    },
    genius: {
      job: "Guided pre-purchase shots. Not a certified inspection. Not legal advice. Not a live lot.",
      for: "Anyone documenting a car they do not yet own.",
      click: "Tick the list. Keep date and miles in the folder.",
      say: "Scan screen and tire date codes are not optional.",
    },
  },
  {
    href: "/jobs/ro-terms",
    eyebrow: "RO glossary",
    dummy: {
      job: "Look up the slang on the ticket. Read the trap on that line.",
      for: "Anyone staring at LOF, MPI, R&R, or shop supplies.",
      click: "Search a term. Copy what to say.",
      say: "What does [term] mean in dollars on this RO?",
    },
    genius: {
      job: "Invoice slang: LOF, MPI, R&R, NTF, shop supplies, 'while we're in there.'",
      for: "Owners and writers who want the trap named.",
      click: "Term → meaning → counter line → trap.",
      say: "Shop supplies need a number. 'While we're in there' needs a yes.",
    },
  },
  {
    href: "/builds",
    eyebrow: "Build log",
    dummy: {
      job: "Write down the chassis, the engine, and the trans when one VIN is a lie.",
      for: "Kit, swap, or a car that no longer matches the door sticker.",
      click: "Add the three serials. The binder stays on this device.",
      say: "The VIN is the chassis. The engine is [code]. Don't mix the books.",
    },
    genius: {
      job: "On-device localStorage binder: chassis + engine + trans. Not a VIN decode of a swapped long-block.",
      for: "Builders who need three identities, not one.",
      click: "Log each serial. We do not invent interchange.",
      say: "Which book are we using — chassis, engine, or trans?",
    },
  },
  {
    href: "/integrations",
    eyebrow: "Patch bay",
    dummy: {
      job: "Open a real site. If a key is missing, the card says so.",
      for: "Anyone who wants the official page, not a fake badge.",
      click: "A family stamp, then Open on a live card.",
      say: "I pulled this from [source]. What's your number?",
    },
    genius: {
      job: "NHTSA, EPA, OSM, parts counters, auction lanes. Paid catalogs request access. No TecDoc SKUs. No Carfax feed we don't have.",
      for: "Techs and owners who will not trust a dead key.",
      click: "Live desks without a key. Licensed hooks stay honest.",
      say: "Source the measurement. Don't quote a catalog we didn't call.",
    },
  },
  {
    href: "/expert",
    eyebrow: "Playbooks",
    dummy: {
      job: "Pick the situation. Read the left column. Say that at the window.",
      for: "Owners in a named jam — brakes, noise, a light, a quote.",
      click: "A playbook card. Then the beginner script.",
      say: "The left-column sentence. Then ask for the number on the right.",
    },
    genius: {
      job: "Twelve owner scenarios. Beginner script + genius measurements. SaferCar patterns — not a pirated TSB book.",
      for: "Anyone who wants both altitudes on one card.",
      click: "Playbook → steps. TSB desk and counter card live next door.",
      say: "Measurement first. Campaign lookup second. Parts last.",
    },
  },
  {
    href: "/expert/tsb",
    eyebrow: "Failure patterns",
    dummy: {
      job: "Find the pattern that matches the symptom. Then look up the VIN.",
      for: "Owners who heard 'there's a bulletin' and want the public version.",
      click: "Pick a pattern card. Open SaferCar on the VIN.",
      say: "Is there an open campaign on this VIN for [pattern]?",
    },
    genius: {
      job: "Public failure patterns + SaferCar pointers. Not stolen dealer PDFs. Takata is a campaign lookup.",
      for: "Techs and owners who will not pirate a TSB.",
      click: "Symptom card → SaferCar. Honda Accord 2003 Takata is a VIN check.",
      say: "Campaign status on this VIN. Not a yard airbag.",
    },
  },
  {
    href: "/expert/cheatsheet",
    eyebrow: "Counter card",
    dummy: {
      job: "Print the sheet. Say the number. Don't authorize the adjective.",
      for: "Anyone walking to the window with a phone and a ticket.",
      click: "Print. Take the Ask list.",
      say: "What's the reading in millimeters / 32nds / PSI / volts?",
    },
    genius: {
      job: "One-sheet: mm, 32nds, PSI, volts, freeze-frame questions. Not a factory service manual.",
      for: "Owners who want units in their pocket.",
      click: "Print the ticket. Use Ask / Refuse.",
      say: "Rotor mm vs discard. Freeze-frame before parts. Decline 'they're due.'",
    },
  },
  {
    href: "/how-it-works",
    eyebrow: "How it works",
    dummy: {
      job: "VIN, then the spec, then the quote, then the script, then the shop.",
      for: "First visit. You want the ten-second map.",
      click: "Three stamps in the header: Car, Ticket, Shops. Every other desk is listed under More bays.",
      say: "Don't authorize until you can read the three lines out loud.",
    },
    genius: {
      job: "vPIC → capacities → price-book markup → freeze-frame / rotor mm → OSM rooftops. We refuse escrow, TecDoc, and fake stock.",
      for: "Anyone checking what is real vs Phase 2.",
      click: "Read both walks. Then open the bay that matches the ticket in your hand.",
      say: "Show me the measurement. OEM or aftermarket — in writing.",
    },
  },
  {
    href: "/shops",
    eyebrow: "Find shops",
    dummy: {
      job: "We open Google Maps. You ask the questions.",
      for: "You need a place, not a certified network.",
      click: "Search Maps. Use the question list before you book.",
      say: "What's the diagnostic fee? Do you work on this make?",
    },
    genius: {
      job: "Honest stub. No audit, no booking fee, no 'certified shop' badge we didn't earn.",
      for: "Owners who refuse a marketplace cut.",
      click: "Maps query + the question card. Directory has OSM rooftops.",
      say: "Out-the-door number in writing. Call before extras.",
    },
  },
  CONTACT_BRIEF,
  STICKER_BRIEF,
  CATALOG_BRIEF,
  ...TRUST_BRIEFS,
  {
    href: "/mechanic-mode",
    eyebrow: "Counter script",
    dummy: {
      job: "Copy three lines. Say them at the window. Then decide.",
      for: "You have a car on the desk and you're walking in.",
      click: "Copy or print the script.",
      say: "The three bullets on the ticket. Word for word.",
    },
    genius: {
      job: "Printable counter script plus rotor mm and spec talking points. Adjectives are not measurements.",
      for: "Owners who will not authorize 'they're due.'",
      click: "Print / copy. Bring rotor thickness into the sentence.",
      say: "What's the rotor thickness in millimeters versus discard spec?",
    },
  },
];

const BY_HREF = new Map(UX_BRIEFS.map((brief) => [brief.href, brief]));

export function briefForPath(pathname: string): PageUxBrief | undefined {
  const exact = BY_HREF.get(pathname);
  if (exact) return exact;
  return UX_BRIEFS.filter((brief) => brief.href !== "/" && pathname.startsWith(`${brief.href}/`)).sort(
    (a, b) => b.href.length - a.href.length,
  )[0];
}

export function isReadingLevel(value: string | null | undefined): value is ReadingLevelId {
  return value === "beginner" || value === "expert";
}

export function parseReadingLevel(value: string | null | undefined): ReadingLevelId | null {
  if (isReadingLevel(value)) return value;
  if (value && value in LEGACY_READING_LEVEL) return LEGACY_READING_LEVEL[value];
  return null;
}

/** Five stamps, in the order the header walks them: Car → Spec → Ticket → Script → Shops. */
export const HOW_IT_WORKS_STEPS = [
  {
    n: "01",
    stamp: "Car",
    href: "/",
    dummy: "Type 17 characters. Or year, make, and model. A photo is read on your phone.",
    genius: "NHTSA vPIC. WMI + VDS + VIS. Photo reading on this device. A plate is a note, not a DMV lookup.",
    clickDummy: "Car stamp → Decode VIN",
    clickGenius: "POST identify / vPIC",
    sayDummy: "This is the car. Confirm it on the RO.",
    sayGenius: "Match the 17 to the door sticker.",
  },
  {
    n: "02",
    stamp: "Spec",
    href: "/garage",
    dummy: "Read oil, coolant, and tire PSI. Copy a filter SKU if you need one.",
    genius: "Capacities, viscosities, filter SKUs, PSI. Displacement as 3.0L, not 3.00.",
    clickDummy: "More bays → Garage → fluids card",
    clickGenius: "Catalog + heuristic card",
    sayDummy: "What's the factory oil spec?",
    sayGenius: "Viscosity and liters. Not 'whatever we have.'",
  },
  {
    n: "03",
    stamp: "Ticket",
    href: "/quote",
    dummy: "Paste the estimate. We mark the padded lines.",
    genius: "Local price book vs RO lines. Grease-pencil. Bay reader first when the photo key is on; this device still tries.",
    clickDummy: "Ticket stamp → paste or photo",
    clickGenius: "POST /api/quote",
    sayDummy: "Show me the test for this line.",
    sayGenius: "Diagnosis is a line. Supplies need a dollar.",
  },
  {
    n: "04",
    stamp: "Script",
    href: "/mechanic-mode",
    dummy: "Copy three lines. Say them at the window. Then decide.",
    genius: "Counter script + rotor mm. DTC freeze-frame if a code started this.",
    clickDummy: "More bays → Mechanic mode → copy",
    clickGenius: "Print ticket / clipboard",
    sayDummy: "The three bullets. Word for word.",
    sayGenius: "Rotor mm vs discard. Freeze-frame before parts.",
  },
  {
    n: "05",
    stamp: "Shops",
    href: "/directory",
    dummy: "Find a rooftop. We do not book a bay or take a cut.",
    genius: "OSM Overpass rooftops. Nominatim ZIP. Maps stub on /shops if you just need a pin.",
    clickDummy: "Shops stamp → ZIP",
    clickGenius: "Overpass around: ~12 km",
    sayDummy: "Do you work on this make? Diagnostic fee in writing?",
    sayGenius: "Hours from OSM. Out-the-door number. Call before extras.",
  },
] as const;

export const GENIUS_EXTRAS = [
  {
    stamp: "Freeze-frame",
    href: "/obd",
    body: "A DTC is a pointer. Ask for load, RPM, STFT/LTFT, and coolant temp before anyone sells a part.",
  },
  {
    stamp: "Rotor mm",
    href: "/mechanic-mode",
    body: "Thickness versus discard. 'They're due' is not a millimeter reading.",
  },
  {
    stamp: "OSM rooftops",
    href: "/directory",
    body: "Overpass shop=car, car_repair, car_parts, tyres. Phone when OSM has it. No booking fee.",
  },
] as const;
