import type { CheckItem, PhotoShot } from "@/lib/jobs/types";

export const OWNER_CHECKS: CheckItem[] = [
  {
    id: "vin",
    title: "VIN in my pocket",
    detail: "17 characters from the windshield or door sticker. Photo both if they disagree.",
  },
  {
    id: "symptom",
    title: "One sentence for the writer",
    detail: "When, speed, weather, how long. 'Check brakes' is how you buy an MPI.",
  },
  {
    id: "code",
    title: "If the light is on, I wrote the code",
    detail: "Any $20 scanner. Translate it on /jobs/obd before you authorize a part.",
  },
  {
    id: "measure",
    title: "I will ask for millimeters, not adjectives",
    detail: "'They're due' is not a reading. Rotor mm, pad mm, tread 32nds, PSI.",
  },
  {
    id: "otd",
    title: "Out-the-door number before they start",
    detail: "Labor + parts + supplies + tax. A range is fine. Silence is not a price.",
  },
  {
    id: "extras",
    title: "Call me before 'while we're in there'",
    detail: "New work needs a new number. I do not authorize by voicemail silence.",
  },
  {
    id: "old-part",
    title: "I want the old part in the box",
    detail: "If they say core or hazardous, I want a photo. Otherwise it rides home.",
  },
  {
    id: "ride",
    title: "Wait / ride / loaner is decided",
    detail: "Don't discover a four-hour diagnosis in the lobby with a running meter.",
  },
];

export const SALES_DISCLOSURES: CheckItem[] = [
  {
    id: "ppi",
    title: "PPI before you sign — or we write why not",
    detail: "Independent shop, lift, scan. We do not bury 'as-is' under a stack of add-ons.",
  },
  {
    id: "otd",
    title: "Out-the-door is one number, add-ons are listed",
    detail: "Vehicle + tax + fees. Every product is a separate yes.",
  },
  {
    id: "gap",
    title: "GAP is named, not bundled",
    detail: "What it pays, what it does not (total loss minus what you owe). Decline is allowed.",
  },
  {
    id: "vsc",
    title: "Service contract: what is excluded",
    detail: "Wear items, existing conditions, maintenance. Read the exclusion page out loud.",
  },
  {
    id: "etch",
    title: "VIN etch / theft / paint / fabric",
    detail: "These are products. They are not required for the sale or the warranty.",
  },
  {
    id: "nitrogen",
    title: "Nitrogen / rust / key replacement",
    detail: "Air is already mostly nitrogen. Rust modules are optional. Keys have a price on the window or they don't.",
  },
  {
    id: "fees",
    title: "Doc / prep / 'market' fees are on the whiteboard",
    detail: "If it is not on the buyer's order before F&I, it does not appear after.",
  },
];

export const SHOP_NORMS: CheckItem[] = [
  {
    id: "written",
    title: "Written estimate before teardown",
    detail: "Concern, diagnosis hours, and a not-to-exceed if they authorize diagnosis only.",
  },
  {
    id: "diag-split",
    title: "Diagnosis is a line, not a gift into the repair",
    detail: "If they decline the repair, they still pay the agreed diagnosis.",
  },
  {
    id: "measure",
    title: "Measurements on the ticket",
    detail: "mm, PSI, degrees. 'Due' is for the MPI sheet's sales column, not the RO.",
  },
  {
    id: "call",
    title: "Call before extras",
    detail: "A text with the new total. No work past the authorization without a reply.",
  },
  {
    id: "supplies",
    title: "Shop supplies disclosed and capped",
    detail: "Percent or flat, printed. Not a surprise on the pickup ticket.",
  },
  {
    id: "old-parts",
    title: "Old parts offered",
    detail: "Cores and hazardous get a photo. Everything else can go in the trunk.",
  },
  {
    id: "comeback",
    title: "Comeback window in writing",
    detail: "Days and miles for the same concern. Goodwill has a name and an RO number.",
  },
];

export const EV_CHECKS: CheckItem[] = [
  {
    id: "twelve",
    title: "12V battery is the silent killer",
    detail: "The traction pack can be fine and the car still bricks. Age, voltage, load test.",
  },
  {
    id: "tires",
    title: "Tires — weight and instant torque",
    detail: "Rotate on the interval. Door-sticker PSI. EV-rated rubber if that is what it left with.",
  },
  {
    id: "brakes",
    title: "Brakes rust from regen — fluid still ages",
    detail: "Pads may last a long time and still glaze. Brake fluid is years, not miles.",
  },
  {
    id: "cabin",
    title: "Cabin filter still exists",
    detail: "Same glove-box job. Show the old one.",
  },
  {
    id: "loops",
    title: "Coolant loops are not 'no service'",
    detail: "Battery / inverter loops use a specific coolant. A general shop may not have it.",
  },
  {
    id: "no-oil",
    title: "There is no oil change",
    detail: "No plugs, no trans 'flush' on a single-speed reduction gear unless the book says fluid. Decline the ICE menu.",
  },
];

export const AUCTION_GOTCHAS: CheckItem[] = [
  {
    id: "as-is",
    title: "As-is means no arbitration on that announcement",
    detail: "If they announced it, you bought it. Read the board before you bid.",
  },
  {
    id: "run",
    title: "Run-and-drive vs 'doesn't start' vs 'engine note'",
    detail: "Those are different promises. A note is not a compression test.",
  },
  {
    id: "title",
    title: "Title absent / salvage / flood / repo",
    detail: "You are buying paperwork risk, not just a car. Fee + days to title.",
  },
  {
    id: "arb",
    title: "Arbitration window is hours, not weeks",
    detail: "Dealer lanes often have a clock. Public lanes often have none.",
  },
  {
    id: "cr",
    title: "Condition report is a starting point",
    detail: "CR grades miss frames. Walk it if you can. PPI after if the number still works.",
  },
  {
    id: "internet",
    title: "Online bid + gate + transport is the real number",
    detail: "Hammer is not landed cost. Run the fee desk on this page.",
  },
];

export const CLAIMS_SHOTS: PhotoShot[] = [
  { id: "c1", order: 1, title: "All four corners", why: "Context for the adjuster.", frame: "Wide. Include the ground and a bit of the lane." },
  { id: "c2", order: 2, title: "All four sides + roof", why: "Prior damage vs this loss.", frame: "Stand back. No cropped bumpers." },
  { id: "c3", order: 3, title: "VIN plate + door sticker", why: "The car on the claim is this car.", frame: "Glare-free. 17 characters readable." },
  { id: "c4", order: 4, title: "Odometer / cluster", why: "Miles and airbag lamps.", frame: "Ignition on. Whole cluster." },
  { id: "c5", order: 5, title: "Plate / registration", why: "Match the loss report.", frame: "One frame, readable." },
  { id: "c6", order: 6, title: "Damage wide", why: "Which panels, which gap.", frame: "Whole side or whole end." },
  { id: "c7", order: 7, title: "Damage medium", why: "Panel edges and paint crack.", frame: "One panel fills the frame." },
  { id: "c8", order: 8, title: "Damage close with scale", why: "Depth. A coin or tape in frame.", frame: "Perpendicular to the crease." },
  { id: "c9", order: 9, title: "Adjacent undamaged panel", why: "Blend / no-blend argument.", frame: "Same light as the damage shot." },
  { id: "c10", order: 10, title: "Undercarriage / pinch if safe", why: "Structure vs cover.", frame: "Only if the car is on a lift or you can see without crawling a live lane." },
  { id: "c11", order: 11, title: "Airbags / pretensioners", why: "Restraint deployment.", frame: "Interior wide, then the bag." },
  { id: "c12", order: 12, title: "Prior damage you are not claiming", why: "Honesty now vs denial later.", frame: "Label it in the filename." },
];

export const PPI_SHOTS: PhotoShot[] = [
  { id: "p1", order: 1, title: "Front three-quarter", why: "Gaps, height, accident tells.", frame: "Both sides if the light is different." },
  { id: "p2", order: 2, title: "Rear three-quarter", why: "Same. Look for overspray and tape lines.", frame: "Include the rocker." },
  { id: "p3", order: 3, title: "All four tires + date codes", why: "Age and mismatch.", frame: "Tread close + sidewall DOT week/year." },
  { id: "p4", order: 4, title: "VIN + door sticker + build", why: "Options vs the ad.", frame: "All three readable." },
  { id: "p5", order: 5, title: "Odometer + cluster lamps", why: "Miles and SRS / ABS / CEL.", frame: "Key on, engine off, then running." },
  { id: "p6", order: 6, title: "Engine bay wet vs dry", why: "Leaks, battery, aftermarket.", frame: "Whole bay, then the wet spot." },
  { id: "p7", order: 7, title: "Undercarriage if the lift is up", why: "Oil, rust, impact, welds.", frame: "Pan, trans, subframe, exhaust." },
  { id: "p8", order: 8, title: "Interior wear", why: "Seat bolsters, pedal rubber vs miles.", frame: "Driver seat, wheel, pedals." },
  { id: "p9", order: 9, title: "Service receipts / Carfax you were handed", why: "Paper vs the car.", frame: "Photo the stack. Do not trust a verbal." },
  { id: "p10", order: 10, title: "Scan / codes screen", why: "Pending and permanent, not just the light.", frame: "The tool's code list, not a thumbs-up." },
];

export const INSPECTOR_SHOTS: PhotoShot[] = [
  { id: "i1", order: 1, title: "Four corners + four sides + roof", why: "A complete walk-around, same as a claim but for a file.", frame: "Same distance each side." },
  { id: "i2", order: 2, title: "VIN, sticker, plate, odometer", why: "Identity. Lemon-law files die on a wrong VIN.", frame: "Readable. Date the folder." },
  { id: "i3", order: 3, title: "Concern area — wide / medium / close", why: "The defect they keep coming back for.", frame: "Include a ruler or coin." },
  { id: "i4", order: 4, title: "Repair-order headers", why: "Dates, miles, 'customer states.'", frame: "Whole header, not a crop of the total." },
  { id: "i5", order: 5, title: "Same concern, next visit", why: "Pattern. Same words, new miles.", frame: "Keep a consistent filename: YYYY-MM-DD-miles." },
  { id: "i6", order: 6, title: "Scan before they 'clear it'", why: "Stored / pending / permanent.", frame: "Screenshot the tool." },
  { id: "i7", order: 7, title: "Test-drive notes in one photo", why: "Speed, temp, when it happens.", frame: "A handwritten card is fine." },
  { id: "i8", order: 8, title: "What they declined or deferred", why: "The paper trail of 'we could not duplicate.'", frame: "The NTF line on the RO." },
];
