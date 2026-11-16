// AnderBerry Bracelets — business facts. Items marked CONFIRM need the owner's sign-off.
export const site = {
  name: "AnderBerry Bracelets",
  legalName: "AnderBerry LLC",
  founders: "Amy & Aaron Anderson",
  founded: 2014,
  city: "Charlotte",
  region: "NC",
  country: "US",
  email: "Anderberrybracelets@gmail.com",
  url: process.env.NEXT_PUBLIC_SITE_URL || "https://anderberry-bracelets.netlify.app",
  description:
    "Hand-strung gemstone bracelets, Tap-to-Connect NFC jewelry and custom logo pieces, made in Charlotte, NC by mother-and-son team Amy and Aaron Anderson since 2014.",
  social: {
    instagram: "https://www.instagram.com/anderberrybracelets/",
    facebook: "https://www.facebook.com/AnderBerryBracelets",
    tiktok: "https://www.tiktok.com/@anderberryllc",
    etsy: "https://www.etsy.com/shop/AnderBerryBracelets",
  },
  shipping: {
    // CONFIRM with owner: flat rate + free-shipping threshold
    flatRateCents: 600,
    freeOverCents: 7500,
    processing: "Made to order and shipped in 3–5 business days", // CONFIRM
  },
  press: [
    {
      outlet: "PBS Charlotte — Carolina Impact",
      title: "Find out how a Charlotte teen used bracelets to financially help his family.",
      url: "https://www.youtube.com/watch?v=LDtY-U1d5Gw",
      youtubeId: "LDtY-U1d5Gw",
    },
    { outlet: "WBTV", title: "How Aaron started creating AnderBerry Bracelets", url: "https://youtu.be/q-CeauFJVZI" },
    { outlet: "WBTV", title: "How Build-A-Bracelet started", url: "https://youtu.be/Ha3RjjVt3kc" },
    { outlet: "FOX 46", title: "AnderBerry Bracelets news story", url: "https://www.youtube.com/watch?v=D9UBcBXYAIM" },
    {
      outlet: "Charlotte Is Creative",
      title: "Aaron Anderson bands CLT together with bracelets",
      url: "https://www.charlotteiscreative.com/aaron-anderson-bands-clt-together-with-bracelets/",
    },
  ],
  // Verbatim from Aaron's interview with Charlotte Is Creative
  quotes: {
    no: "All the “No thank you” or “I’m not interested” responses get you closer to the “Yes, I’ll buy one” or “I’ll get one for me and one for my friend” replies.",
    goal: "My goal is to continue to build a brand based on the principle that there is something that each and everyone of us can do to overcome challenges in life and build a business out of virtually nothing.",
    start: "The idea was born to make and sell these bracelets to help get us into a home that we could call our own.",
  },
} as const;

/** A collection key, e.g. "tap-to-connect". Collections live in the Supabase `collections` table. */
export type Collection = string;

export type CollectionRow = { key: string; name: string; blurb: string; image: string | null; sort: number; active: boolean };

/** Build-time fallback only (used if Supabase is unreachable). Edit collections in /admin/collections. */
export const fallbackCollections: CollectionRow[] = [
  { key: "tap-to-connect", name: "Tap-to-Connect", blurb: "Stone bracelets with an NFC chip set in the centerpiece. One tap shares your link.", image: "/products/ttc-tiger-onyx-hex.webp", sort: 10, active: true },
  { key: "gemstone", name: "Gemstone", blurb: "Onyx, tiger eye, hematite and agate, strung by hand for everyday wear.", image: "/products/tiger-eye-hex.webp", sort: 20, active: true },
  { key: "custom", name: "Custom logo", blurb: "Your organization’s logo sealed into a charm on bracelets, keychains and pins.", image: "/products/logo-charm-agate.webp", sort: 30, active: true },
  { key: "pins", name: "Pins & cigar pokers", blurb: "Logo lapel pins, NFC optional, and beaded cigar nub holders.", image: "/products/hat-pin-display.webp", sort: 40, active: true },
];

export const wristSizes = [
  { value: "child", label: "Child" },
  { value: "6", label: "6 in" },
  { value: "6.5", label: "6½ in" },
  { value: "7", label: "7 in" },
  { value: "7.5", label: "7½ in" },
  { value: "8", label: "8 in" },
  { value: "8.5", label: "8½ in" },
  { value: "9", label: "9 in" },
];
