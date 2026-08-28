/** Honest scorecard. These apps send a person or hold a dealer bay. We do not. */

export const BOOK_RIVALS = [
  {
    id: "openhood",
    stamp: "Bay",
    name: "Open Hood",
    sendsTech: "No",
    takesPay: "No",
    booksBay: "No — intake",
    cut: "None",
    object: "The request ticket. A script. A rooftop list.",
  },
  {
    id: "yourmechanic",
    stamp: "YM",
    name: "YourMechanic",
    sendsTech: "Yes — a van",
    takesPay: "Yes",
    booksBay: "Yes — they dispatch",
    cut: "Marketplace",
    object: "A mechanic at your curb. Payment in the app.",
    href: "https://www.yourmechanic.com/",
  },
  {
    id: "wrench",
    stamp: "Wrench",
    name: "Wrench",
    sendsTech: "Yes — a van",
    takesPay: "Yes",
    booksBay: "Yes — they dispatch",
    cut: "Marketplace",
    object: "Mobile service they employ or contract.",
    href: "https://www.getwrench.com/",
  },
  {
    id: "repairsmith",
    stamp: "RS",
    name: "RepairSmith",
    sendsTech: "Yes — a van",
    takesPay: "Yes",
    booksBay: "Yes — they dispatch",
    cut: "Marketplace",
    object: "Mobile repair they sell as a visit.",
    href: "https://www.repairsmith.com/",
  },
  {
    id: "dealer-app",
    stamp: "OEM",
    name: "Dealer app",
    sendsTech: "Dealer bay",
    takesPay: "Yes",
    booksBay: "Yes — their roof",
    cut: "The RO",
    object: "This VIN at that dealer. They will not grease-pencil their own upsell.",
  },
] as const;

export const BOOK_COMPARE_LINE =
  "Do not treat these as substitutes. An owner who needs the car fixed books a shop or a van. An owner who needs to not get rolled opens Quote. We store a request. We do not dispatch a tech.";
