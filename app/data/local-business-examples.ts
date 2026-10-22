export type LocalBusinessExample = {
  slug: string;
  name: string;
  icon: "utensils" | "scissors" | "wrench" | "store" | "coffee" | "paw";
  problems: readonly { problem: string; solution: string }[];
  automationPage?: string;
};

export const localBusinessExamples: readonly LocalBusinessExample[] = [
  {
    slug: "restaurants",
    name: "Restaurants, cafés and bars",
    icon: "utensils",
    automationPage: "/local-business/restaurants",
    problems: [
      {
        problem: "Table questions interrupt service.",
        solution: "Answer common questions and send the booking link.",
      },
      {
        problem: "Private-hire enquiries arrive without key details.",
        solution: "Collect the date, party size and requirements; prompt a follow-up.",
      },
      {
        problem: "Cancellations leave tables empty.",
        solution: "Notify the waitlist and route booking requests.",
      },
    ],
  },
  {
    slug: "salons",
    name: "Salons, barbers and studios",
    icon: "scissors",
    automationPage: "/local-business/salons",
    problems: [
      {
        problem: "Booking questions interrupt appointments.",
        solution: "Answer service and price questions, then share the booking link.",
      },
      {
        problem: "Late cancellations leave gaps.",
        solution: "Offer the slot to the waitlist and confirm the first yes.",
      },
      {
        problem: "Regulars forget to rebook.",
        solution: "Send a timely, personal rebooking reminder.",
      },
    ],
  },
  {
    slug: "trades",
    name: "Trades and home services",
    icon: "wrench",
    automationPage: "/local-business/trades",
    problems: [
      {
        problem: "Calls come in while you’re on a job.",
        solution: "Collect job details and queue a callback.",
      },
      {
        problem: "Quotes go quiet after they’re sent.",
        solution: "Follow up and alert you when the customer responds.",
      },
      {
        problem: "Customers ask for updates while you’re working.",
        solution: "Send appointment and arrival-window updates.",
      },
    ],
  },
  {
    slug: "shops",
    name: "Shops",
    icon: "store",
    problems: [
      {
        problem: "Staff repeat opening, delivery and returns answers.",
        solution: "Answer common questions and link to the right information.",
      },
      {
        problem: "Customers ask if a product or size is in stock.",
        solution: "Capture the item and size, then route a stock check to staff.",
      },
      {
        problem: "Click-and-collect customers ask when orders are ready.",
        solution: "Send an update when staff mark an order ready.",
      },
    ],
  },
  {
    slug: "coffee-shops",
    name: "Coffee Shops",
    icon: "coffee",
    problems: [
      {
        problem: "Group orders arrive during the morning rush.",
        solution: "Collect items, quantities and pickup time for staff to confirm.",
      },
      {
        problem: "Catering enquiries lack details needed to quote.",
        solution: "Collect date, headcount and requirements; prompt a follow-up.",
      },
      {
        problem: "Customers repeat menu and dietary questions.",
        solution: "Answer from information the owner has approved.",
      },
    ],
  },
  {
    slug: "pet-care",
    name: "Pet Care",
    icon: "paw",
    problems: [
      {
        problem: "New customers ask if a service suits their pet.",
        solution: "Collect pet details and answer from approved service information.",
      },
      {
        problem: "Booking enquiries arrive while staff are with animals.",
        solution: "Collect pet details and preferred dates, then queue a reply.",
      },
      {
        problem: "Cancellations leave appointment slots empty.",
        solution: "Contact owners who want an earlier appointment.",
      },
    ],
  },
];
