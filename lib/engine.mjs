let sequence = 0;
const uid = () =>
  globalThis.crypto?.randomUUID?.() ||
  `local-${Date.now()}-${++sequence}-${Math.random().toString(36).slice(2)}`;
export const money = (n) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n);
export function validateBrief(b) {
  if (!b || !["Wedding", "Birthday", "Community"].includes(b.type))
    throw Error("Choose an event type.");
  if (typeof b.name !== "string" || !b.name.trim() || b.name.length > 100)
    throw Error("Event name must be 1–100 characters.");
  if (!Number.isInteger(b.guests) || b.guests < 1 || b.guests > 10000)
    throw Error("Guests must be 1–10,000.");
  if (!Number.isFinite(b.budget) || b.budget < 1000 || b.budget > 100000000)
    throw Error("Budget must be ₹1,000–₹10 crore.");
  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(b.date) ||
    Number.isNaN(Date.parse(b.date + "T00:00:00Z")) ||
    new Date(b.date + "T00:00:00Z").toISOString().slice(0, 10) !== b.date
  )
    throw Error("Enter a valid event date.");
  if (typeof b.city !== "string" || b.city.length > 100 || !b.city.trim())
    throw Error("Enter a city.");
  if (typeof b.preferences !== "string" || b.preferences.length > 2000)
    throw Error("Preferences must be at most 2,000 characters.");
  return b;
}
export function seed() {
  return {
    brief: {
      name: "Ananya & Arjun",
      type: "Wedding",
      city: "Hyderabad",
      date: "2026-12-12",
      guests: 200,
      budget: 500000,
      preferences:
        "An intimate Telugu wedding. Warm marigold palette, excellent vegetarian food, accessible seating, acoustic music. Prioritise guest comfort.",
    },
    items: [
      {
        id: "food",
        name: "Food & beverages",
        amount: 160000,
        paid: 40000,
        perGuest: 800,
        basis: "Illustrative quote",
        vendor: "Saffron Table",
        status: "Quote received",
      },
      {
        id: "decor",
        name: "Décor & florals",
        amount: 90000,
        paid: 20000,
        perGuest: 0,
        basis: "Illustrative quote",
        vendor: "Bloom Studio",
        status: "Booking confirmed",
      },
      {
        id: "venue",
        name: "Venue & seating",
        amount: 100000,
        paid: 25000,
        perGuest: 0,
        basis: "Estimate",
        vendor: "Venue partner",
        status: "Shortlisted",
      },
      {
        id: "photo",
        name: "Photography",
        amount: 65000,
        paid: 15000,
        perGuest: 0,
        basis: "Illustrative quote",
        vendor: "Frame Collective",
        status: "Quote received",
      },
      {
        id: "music",
        name: "Music & engagement",
        amount: 30000,
        paid: 0,
        perGuest: 0,
        basis: "Estimate",
        vendor: "Acoustic ensemble",
        status: "Shortlisted",
      },
    ],
    tasks: [
      {
        id: "t1",
        title: "Confirm menu and dietary requirements",
        owner: "Priya · Catering",
        time: "10:00",
        duration: 45,
        status: "Accepted",
        depends: [],
        category: "Catering",
      },
      {
        id: "t2",
        title: "Finish mandap and floral installation",
        owner: "Ravi · Production",
        time: "11:00",
        duration: 90,
        status: "In progress",
        depends: [],
        category: "Décor",
      },
      {
        id: "t3",
        title: "Family portraits at the mandap",
        owner: "Neha · Photography",
        time: "12:30",
        duration: 45,
        status: "Proposed",
        depends: ["t2"],
        category: "Photography",
      },
      {
        id: "t4",
        title: "Guest welcome and acoustic set",
        owner: "Aman · Hospitality",
        time: "13:15",
        duration: 30,
        status: "Accepted",
        depends: [],
        category: "Hospitality",
      },
      {
        id: "t5",
        title: "Ceremony and family blessings",
        owner: "Ravi · Production",
        time: "14:00",
        duration: 60,
        status: "Proposed",
        depends: ["t2"],
        category: "Ceremony",
      },
      {
        id: "t6",
        title: "Lunch service and guest assistance",
        owner: "Priya · Catering",
        time: "15:00",
        duration: 60,
        status: "Proposed",
        depends: ["t1"],
        category: "Catering",
      },
    ],
    proposals: [],
    history: [],
    blueprint: null,
    version: 1,
  };
}
export function totals(s) {
  let committed = s.items.reduce((a, x) => a + x.amount, 0),
    paid = s.items.reduce((a, x) => a + x.paid, 0),
    reserve = Math.round(s.brief.budget * 0.1);
  return {
    committed,
    paid,
    reserve,
    remaining: s.brief.budget - committed - reserve,
    outstanding: committed - paid,
  };
}
export function guestProposal(s, n) {
  if (!Number.isInteger(n) || n < 1 || n > 10000 || n === s.brief.guests)
    throw Error("Enter a different guest count between 1 and 10,000.");
  let delta = n - s.brief.guests,
    cost = s.items.reduce((a, x) => a + delta * x.perGuest, 0);
  return {
    id: uid(),
    kind: "guests",
    baseVersion: s.version,
    title: `Guest count ${s.brief.guests} → ${n}`,
    guests: n,
    cost,
    status: "Pending",
    reason: "Client-requested headcount change",
    details: [
      `${delta > 0 ? "+" : ""}${delta} guests; food rate ${money(s.items.find((x) => x.id === "food")?.perGuest || 0)} per guest.`,
      `Net variable-cost change: ${money(cost)}. Fixed vendor quotes stay unchanged.`,
      `Seating capacity, staffing and supplier availability require human confirmation.`,
    ],
    created: new Date().toISOString(),
  };
}
export function delayProposal(s, minutes) {
  if (!Number.isInteger(minutes) || minutes < 5 || minutes > 240)
    throw Error("Delay must be 5–240 minutes.");
  return {
    id: uid(),
    kind: "delay",
    baseVersion: s.version,
    title: `Décor recovery · ${minutes} minutes`,
    minutes,
    cost: 0,
    status: "Pending",
    reason: "Production delay reported by coordinator",
    details: [
      `Move décor completion and dependent portraits / ceremony ${minutes} minutes later.`,
      `Shift later activities to preserve sequence; coordinator must confirm venue and vendor availability.`,
      `No additional charge assumed. Overtime and supplier costs remain unconfirmed.`,
    ],
    created: new Date().toISOString(),
  };
}
export function shiftTime(time, n) {
  let [h, m] = time.split(":").map(Number);
  let value = h * 60 + m + n;
  if (value >= 1440) throw Error("Recovery crosses midnight; revise manually.");
  return `${String(Math.floor(value / 60)).padStart(2, "0")}:${String(value % 60).padStart(2, "0")}`;
}
export function approve(s, id) {
  const p = s.proposals.find((x) => x.id === id);
  if (!p || p.status !== "Pending")
    throw Error("This proposal is no longer pending.");
  if (p.baseVersion !== s.version)
    throw Error(
      "Plan changed. Recreate this proposal against the latest version.",
    );
  let next = structuredClone(s);
  if (p.kind === "guests") {
    next.items = next.items.map((x) => ({
      ...x,
      amount: x.amount + (p.guests - s.brief.guests) * x.perGuest,
    }));
    if (next.items.some((x) => x.amount < x.paid))
      throw Error(
        "Revised cost is below an existing payment; reconcile the vendor quote first.",
      );
    next.brief.guests = p.guests;
    next.tasks.push({
      id: uid(),
      title: `Reconfirm catering, seating and staffing for ${p.guests} guests`,
      owner: "Unassigned",
      time: "09:00",
      duration: 30,
      status: "Proposed",
      depends: [],
      category: "Coordination",
    });
  } else {
    next.tasks = next.tasks.map((x) =>
      x.time >= (s.tasks.find((t) => t.id === "t2")?.time || "11:00")
        ? { ...x, time: shiftTime(x.time, p.minutes) }
        : x,
    );
    next.tasks.push({
      id: uid(),
      title: "Confirm revised timings and any overtime with vendors",
      owner: "Unassigned",
      time: "09:00",
      duration: 15,
      status: "Proposed",
      depends: [],
      category: "Coordination",
    });
  }
  next.version++;
  next.proposals = next.proposals.map((x) =>
    x.id === id ? { ...x, status: "Approved" } : x,
  );
  next.history.unshift({
    id: uid(),
    title: p.title,
    version: next.version,
    at: new Date().toISOString(),
    snapshot: JSON.stringify({ ...s, history: [] }),
    cost: p.cost,
  });
  next.history = next.history.slice(0, 30);
  return next;
}
export function conflicts(tasks) {
  const mins = (t) => Number(t.slice(0, 2)) * 60 + Number(t.slice(3));
  let out = [];
  for (let i = 0; i < tasks.length; i++)
    for (let j = i + 1; j < tasks.length; j++) {
      let a = tasks[i],
        b = tasks[j];
      if (
        a.owner !== "Unassigned" &&
        a.owner === b.owner &&
        a.status !== "Completed" &&
        b.status !== "Completed" &&
        mins(a.time) < mins(b.time) + b.duration &&
        mins(b.time) < mins(a.time) + a.duration
      )
        out.push(`${a.owner}: ${a.title} overlaps ${b.title}`);
    }
  return out;
}
export function sampleBlueprint(b) {
  return {
    theme:
      b.type === "Wedding"
        ? "Marigold & memories"
        : b.type === "Birthday"
          ? "A celebration of you"
          : "Together, beautifully",
    vision: `A ${b.type.toLowerCase()} in ${b.city} for ${b.guests} guests, designed around ${money(b.budget)}. Final styling follows the approved client brief.`,
    ideas: [
      "A welcome corner with personal stories and family photographs",
      "A short, optional interactive activity with comfortable seated participation",
      "Reusable local décor, warm lighting and clearly marked accessible routes",
    ],
    menu: [
      "Confirm vegetarian / non-vegetarian preferences and allergies before selecting dishes",
      "Offer drinking water, a seasonal beverage and a clearly labelled menu",
      "Ask the caterer to confirm quantities, service capacity and food handling arrangements",
    ],
    questions: [
      "What are the venue capacity and access restrictions?",
      "Which traditions and moments are non-negotiable?",
      "Are the vendor quotes inclusive of tax, transport and overtime?",
    ],
    source: "Sample blueprint · deterministic template, not live AI",
  };
}
