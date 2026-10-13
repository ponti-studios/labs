export type LocalAutomation = {
  name: string;
  description: string;
  price: number;
};

export type LocalBusiness = {
  slug: string;
  name: string;
  shortName: string;
  eyebrow: string;
  headline: string;
  intro: string;
  problemHeadline: string;
  problems: readonly string[];
  automations: readonly LocalAutomation[];
  payback: string;
  doneTitle: string;
  done: readonly string[];
  checkCopy: string;
};

export const localBusinesses: readonly LocalBusiness[] = [
  {
    slug: "restaurants",
    name: "Restaurants, cafés and bars",
    shortName: "Restaurants & bars",
    eyebrow: "For restaurants, cafés and bars in Bermondsey",
    headline: "Never lose a booking or a private hire to an unanswered message.",
    intro: "Five fixed-price automations that answer, quote and chase while you're busy serving. Pick one, or take three.",
    problemHeadline: "Service comes first. The messages wait.",
    problems: [
      "Instagram and WhatsApp messages pile up during service.",
      "Private hire and group enquiries go cold while you're busy.",
      "Reviews and posts only happen when someone has spare time.",
    ],
    automations: [
      { name: "Enquiry Catcher", description: "Every WhatsApp, Instagram and website message answered in under a minute, day or night.", price: 950 },
      { name: "Private Hire Quoter", description: "Event and group enquiries turned into a priced proposal, then chased until they answer.", price: 1150 },
      { name: "Review Engine", description: "Happy guests asked for a Google review at the right moment, with replies drafted for you.", price: 650 },
      { name: "Weekly Content", description: "A week of posts and a newsletter drafted from your specials, new pours and what actually happened.", price: 450 },
      { name: "Supplier Admin Autopilot", description: "Supplier invoices and delivery emails filed into your books, with price rises flagged.", price: 850 },
    ],
    payback: "One extra private hire booking covers the Private Hire Quoter several times over.",
    doneTitle: "For the Enquiry Catcher, finished means this.",
    done: [
      "Replies on WhatsApp, Instagram and your website chat.",
      "Knows your hours, menu, dietary notes and booking rules.",
      "Holds a table, or flags the booking for you to confirm.",
      "Hands anything unusual to you, with the conversation attached.",
    ],
    checkCopy: "I'll look at how guests reach you today and tell you honestly where enquiries are slipping through, and whether an automation is worth it.",
  },
  {
    slug: "salons",
    name: "Salons, barbers and studios",
    shortName: "Salons & studios",
    eyebrow: "For salons, barbers and studios in Bermondsey",
    headline: "Fewer empty chairs, fewer no-shows, more regulars coming back.",
    intro: "Five fixed-price automations that fill the diary and bring regulars back while your hands are busy. Pick one, or take three.",
    problemHeadline: "You can't answer messages with colour on your gloves.",
    problems: [
      "Booking questions arrive while your hands are busy.",
      "No-shows and late cancellations leave gaps that stay empty.",
      "Regulars drift away and nobody has time to ask why.",
    ],
    automations: [
      { name: "Enquiry Catcher", description: "Every WhatsApp, Instagram and website message answered in under a minute, day or night.", price: 950 },
      { name: "No-Show Shield", description: "Reminders that cut no-shows, plus a waitlist that refills cancelled slots automatically.", price: 850 },
      { name: "Win-Back", description: "Clients who haven't rebooked in a while get a friendly nudge that brings them back.", price: 750 },
      { name: "Review Engine", description: "Happy clients asked for a Google review at the right moment, with replies drafted for you.", price: 650 },
      { name: "Weekly Content", description: "A week of posts and a newsletter drafted from the work you actually did this week.", price: 450 },
    ],
    payback: "Refilling one cancelled slot a week more than covers the No-Show Shield.",
    doneTitle: "For the Enquiry Catcher, finished means this.",
    done: [
      "Replies on WhatsApp, Instagram and your website chat.",
      "Knows your services, prices and opening hours.",
      "Offers free slots from your diary, or passes the request to you.",
      "Hands anything unusual to you, with the conversation attached.",
    ],
    checkCopy: "I'll look at how clients reach you today and tell you honestly where bookings are slipping through, and whether an automation is worth it.",
  },
  {
    slug: "trades",
    name: "Trades and home services",
    shortName: "Trades",
    eyebrow: "For trades and home services in Bermondsey",
    headline: "Answer every call, send every quote, get paid faster.",
    intro: "Five fixed-price automations that keep working while you're up a ladder. Pick one, or take three.",
    problemHeadline: "You can't answer the phone from inside a boiler cupboard.",
    problems: [
      "You miss calls while on a job and the customer rings the next person.",
      "Quotes wait until evening and the lead goes cold.",
      "Chasing invoices eats the time you meant to spend resting.",
    ],
    automations: [
      { name: "Missed-Call Catcher", description: "Every missed call gets a text within seconds, and the job details land in one tidy list.", price: 850 },
      { name: "Quote Helper", description: "Customers send photos and a description; you get a draft quote, and quiet leads get chased.", price: 1250 },
      { name: "Review Engine", description: "Happy customers asked for a Google review when the job is done, with replies drafted for you.", price: 650 },
      { name: "Invoice & Payment Chaser", description: "Invoices go out the same day and polite reminders continue until you're paid.", price: 850 },
      { name: "Service Reminders", description: "Past customers reminded when their yearly service is due, so repeat work books itself.", price: 650 },
    ],
    payback: "One rescued missed call that becomes a job covers the Missed-Call Catcher.",
    doneTitle: "For the Missed-Call Catcher, finished means this.",
    done: [
      "Every missed call gets a text within seconds.",
      "Asks for the job, the postcode and a photo.",
      "Drops the details into one tidy list you can check.",
      "Flags emergencies so you see them first.",
    ],
    checkCopy: "I'll look at how customers reach you today and tell you honestly where jobs are slipping through, and whether an automation is worth it.",
  },
];

export const currency = (amount: number) =>
  new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP", maximumFractionDigits: 0 }).format(amount);
