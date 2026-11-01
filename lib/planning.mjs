import { seed, money, validateBrief } from "./engine.mjs";
export function createEventPlan(brief) {
  validateBrief(brief);
  const s = seed();
  s.brief = { ...brief };
  s.version = 1;
  s.proposals = [];
  s.history = [];
  let shares =
    brief.type === "Wedding"
      ? [0.36, 0.19, 0.15, 0.13, 0.07]
      : brief.type === "Birthday"
        ? [0.3, 0.2, 0.18, 0.12, 0.1]
        : [0.28, 0.12, 0.26, 0.09, 0.15];
  if (brief.priority === "Food experience") {
    shares[0] += 0.06;
    shares[1] -= 0.03;
    shares[4] -= 0.03;
  }
  if (brief.priority === "Visual impact") {
    shares[1] += 0.05;
    shares[0] -= 0.03;
    shares[3] -= 0.02;
  }
  const names =
    brief.type === "Community"
      ? [
          "Food & refreshments",
          "Stage & signage",
          "Venue & access",
          "Documentation",
          "Programme & engagement",
        ]
      : [
          "Food & beverages",
          "Décor & florals",
          "Venue & seating",
          "Photography",
          "Music & engagement",
        ];
  s.items = s.items.map((x, i) => ({
    ...x,
    name: names[i],
    amount: Math.round(brief.budget * shares[i]),
    paid: 0,
    perGuest:
      i === 0 ? Math.floor((brief.budget * shares[0]) / brief.guests) : 0,
    basis: "Estimate",
    vendor: "Not selected",
    status: "Shortlisted",
  }));
  let base = brief.start || "14:00";
  const [h, m] = base.split(":").map(Number),
    start = h * 60 + m;
  const time = (offset) => {
    const n = Math.max(0, Math.min(1439, start + offset));
    return `${String(Math.floor(n / 60)).padStart(2, "0")}:${String(n % 60).padStart(2, "0")}`;
  };
  const titles =
    brief.type === "Wedding"
      ? [
          "Confirm menu and guest dietary needs",
          "Complete mandap and décor setup",
          "Family portraits and venue checks",
          "Welcome guests and acoustic music",
          "Wedding ceremony and family blessings",
          "Dining service and guest assistance",
        ]
      : brief.type === "Birthday"
        ? [
            "Confirm menu, cake and allergies",
            "Complete themed décor and activity zones",
            "Birthday portraits and cake-table check",
            "Welcome guests and icebreaker",
            "Cake cutting and birthday wishes",
            "Food service and guest activities",
          ]
        : [
            "Confirm refreshments and dietary needs",
            "Complete stage, signage and access routes",
            "Speaker and sound-system checks",
            "Welcome and registration",
            "Community programme and acknowledgements",
            "Refreshments and participant networking",
          ];
  const offsets = [-240, -180, -90, -45, 0, 60];
  s.tasks = s.tasks.map((x, i) => ({
    ...x,
    title: titles[i],
    time: time(offsets[i]),
    owner: "Unassigned",
    status: "Proposed",
    duration: [30, 90, 45, 30, 60, 60][i],
  }));
  s.blueprint = creativeBlueprint(brief);
  return s;
}
export function creativeBlueprint(b) {
  const palette = {
    Heritage: ["Marigold & memories", "Marigold, brass and warm ivory"],
    Contemporary: ["Modern moments", "Ivory, forest green and brushed gold"],
    Garden: [
      "Gather under the green",
      "Sage, fresh white and warm natural textures",
    ],
  };
  const [theme, colours] = palette[b.style || "Heritage"];
  const eventIdeas =
    b.type === "Wedding"
      ? [
          "Build a family story corner with photographs and bilingual notes.",
          "Plan a short seated blessing or storytelling moment between key rituals.",
        ]
      : b.type === "Birthday"
        ? [
            "Create a memory wall and a short guest-led birthday quiz.",
            "Offer separate quiet seating and optional games suited to the age group.",
          ]
        : [
            "Create a local-story installation contributed by participants.",
            "Schedule an opt-in community showcase with short, clearly timed segments.",
          ];
  return {
    theme,
    vision: `${b.type} · ${b.guests} guests · ${b.city}. ${colours}. Plan around ${money(b.budget)}, with ${b.priority || "guest comfort"} as the protected priority. ${b.setting === "Outdoor" ? "Keep a covered fallback and protect power/audio from weather." : b.setting === "Mixed" ? "Connect indoor and outdoor zones with clear routes." : "Keep entry, dining and seating routes clear."} Client context: ${b.preferences || "Confirm traditions and preferences before locking the proposal."}`,
    ideas: [
      ...eventIdeas,
      `Use ${colours.toLowerCase()} with reusable décor; confirm availability with suppliers.`,
    ],
    menu: [
      b.type === "Birthday"
        ? "Confirm the birthday cake, serving portions and food allergies."
        : "Choose a balanced menu aligned to client traditions; confirm dietary requirements.",
      b.priority === "Food experience"
        ? "Protect the catering allocation and compare menu quality with actual tastings."
        : "Prefer a focused menu and predictable service over excessive dish counts.",
      `Plan quantities for ${b.guests} guests; enter caterer quotes before confirming costs.`,
    ],
    questions: [
      `Confirm ${b.venue || "venue"} capacity${b.capacity ? ` (${b.capacity} recorded)` : " and access restrictions"}.`,
      b.setting === "Outdoor"
        ? "Who owns the weather fallback decision and what is its cutoff time?"
        : "Confirm access, power, setup windows and accessible facilities.",
      "Confirm taxes, transport, overtime and cancellation terms in each supplier quote.",
    ],
    source: "Context-based planning draft · rule-based, not live AI",
  };
}
export function nextAction(s) {
  if (!s.blueprint) return "Build your creative plan";
  if (s.items.some((x) => x.vendor === "Not selected"))
    return "Add vendor quotes";
  if (s.tasks.some((x) => x.owner === "Unassigned")) return "Assign your team";
  if (s.proposals.some((x) => x.status === "Pending"))
    return "Review pending changes";
  return "Check the event run sheet";
}
