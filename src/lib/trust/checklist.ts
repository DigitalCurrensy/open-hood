import type { TrustCheckItem, TrustPhotoShot } from "@/lib/trust/types";

/** What a written / bonded-looking estimate should already have. We do not bond the shop. */
export const BONDED_ESTIMATE_CHECKS: TrustCheckItem[] = [
  {
    id: "written",
    title: "Written estimate before teardown",
    detail: "Concern, diagnosis hours, and a not-to-exceed if they are only authorized to look.",
    expert: "If the car is already apart, the paper still has to name the next dollars before more labor.",
  },
  {
    id: "license",
    title: "Shop name, address, and license / bond number",
    detail: "Some states print a surety-bond or registration number on the RO. If it is blank, ask. We do not hold that bond.",
    expert: "Bond / BAR / MVSF / facility number — whatever your state stamps. A DBA with no number is a question.",
  },
  {
    id: "diag",
    title: "Diagnosis is its own line",
    detail: "If you decline the repair, you still owe the agreed look. That is not a gift into the job.",
    expert: "Diag hours × posted rate, or a flat look. Not buried in “while we’re in there.”",
  },
  {
    id: "ceiling",
    title: "Authorization ceiling in dollars",
    detail: "A range is fine. Silence is not a price. Write the number you will still say at pickup.",
    expert: "Approved to $X. Text before anything above it. Voicemail silence is not consent.",
  },
  {
    id: "parts",
    title: "OEM, aftermarket, or reman — written per line",
    detail: "“Equivalent” is not a brand. The line names the brand or it is not authorized.",
    expert: "CAPA on body. Core on the invoice if they keep the old unit.",
  },
  {
    id: "old-part",
    title: "Old part offered or photographed",
    detail: "Cores and hazardous waste get a photo. Everything else can ride home in a box.",
    expert: "If they say they cannot return it, that reason is on the RO.",
  },
  {
    id: "comeback",
    title: "Comeback window in writing",
    detail: "Days and miles for the same concern. Goodwill has a name and an RO number.",
    expert: "Same concern, new miles, dated folder. That is your file, not their verbal.",
  },
  {
    id: "not-us",
    title: "This bay does not bond, escrow, or pay the shop",
    detail: "The checklist is yours. A hold stamp here is DEMO unless this page says Stripe test — and even then it is not captured.",
    expert: "No silent live charges. sk_live_ is refused. We take no cut of the repair.",
  },
];

export const WORK_VERIFY_SHOTS: TrustPhotoShot[] = [
  {
    id: "w1",
    order: 1,
    title: "VIN + RO header",
    why: "The car in the photo is the car on the ticket.",
    frame: "17 characters readable. Shop name and RO number in the same folder.",
  },
  {
    id: "w2",
    order: 2,
    title: "Before the job",
    why: "What it looked like when you authorized.",
    frame: "The concern area, wide enough to see the panel or the bay.",
  },
  {
    id: "w3",
    order: 3,
    title: "The old part",
    why: "Proof they replaced what they billed.",
    frame: "The part on a bench or in a bag. Pad / filter / hose — not a blurry tote.",
  },
  {
    id: "w4",
    order: 4,
    title: "The finished work",
    why: "The install, not a thumbs-up in the lobby.",
    frame: "Same angle as the before shot when you can.",
  },
  {
    id: "w5",
    order: 5,
    title: "Invoice line that matches the photo",
    why: "The dollars and the part have to be the same story.",
    frame: "The line item, not just the total.",
  },
];

export const FNOL_SHOTS: TrustPhotoShot[] = [
  {
    id: "f1",
    order: 1,
    title: "Four corners + the lane",
    why: "Context for the adjuster before anyone moves the cars.",
    frame: "Wide. Include the ground. Only if it is safe to stand there.",
  },
  {
    id: "f2",
    order: 2,
    title: "VIN plate + door sticker",
    why: "The car on the claim is this car.",
    frame: "Glare-free. 17 characters readable.",
  },
  {
    id: "f3",
    order: 3,
    title: "Cluster / odometer",
    why: "Miles and airbag lamps.",
    frame: "Ignition on if the car still wakes up.",
  },
  {
    id: "f4",
    order: 4,
    title: "Damage wide",
    why: "Which panels, which gap.",
    frame: "Whole side or whole end.",
  },
  {
    id: "f5",
    order: 5,
    title: "Damage close with a coin",
    why: "Depth. A coin or tape in the frame.",
    frame: "Perpendicular to the crease.",
  },
  {
    id: "f6",
    order: 6,
    title: "Other vehicle / scene if safe",
    why: "The other story, not an argument.",
    frame: "Plate if you can. Do not stand in a live lane.",
  },
  {
    id: "f7",
    order: 7,
    title: "Other driver’s insurance card",
    why: "If they will hold it. Do not grab.",
    frame: "One readable frame. Then their plate.",
  },
  {
    id: "f8",
    order: 8,
    title: "Prior damage you are not claiming",
    why: "Honesty now vs a denial later.",
    frame: "Label it in the filename.",
  },
];
