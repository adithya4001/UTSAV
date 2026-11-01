"use client";
import { useState } from "react";
import {
  ArrowRight,
  CheckCircle2,
  ClipboardList,
  Palette,
  Wallet,
  Users,
  ShieldCheck,
} from "lucide-react";
export const lessons = [
  {
    title: "Your orders come first",
    icon: ClipboardList,
    text: "Start in Orders. Create a client enquiry, or open an existing event. Each order keeps its own brief, plan, budget and team. Sign in to save your own orders across devices.",
    action: "Create order",
  },
  {
    title: "Turn the brief into a direction",
    icon: Palette,
    text: "Enter event type, venue, guest count, budget, style and priorities. Your creative plan changes with these inputs. Review the assumptions before choosing your direction.",
    action: "Open creative plan",
  },
  {
    title: "Replace estimates with real quotes",
    icon: Wallet,
    text: "Open Budget & vendors. Add supplier names, actual allocations, per-guest rates and payments. Evidence labels distinguish estimates from quotes you have confirmed.",
    action: "Open budget",
  },
  {
    title: "Give every task an owner",
    icon: Users,
    text: "Open Team & schedule. Assign responsible people, record accepted work and update progress. Prerequisites and overlapping owner assignments help expose coordination risks.",
    action: "Open schedule",
  },
  {
    title: "Approve changes before applying",
    icon: ShieldCheck,
    text: "In Review & delivery, preview a guest-count change or décor delay. Read the cost and schedule impact. Approval updates the plan and creates human follow-up tasks; it does not contact vendors.",
    action: "Open review",
  },
];
export default function Tutorial({
  go,
  close,
}: {
  go: (n: number) => void;
  close: () => void;
}) {
  const [step, setStep] = useState(0),
    l = lessons[step],
    Icon = l.icon;
  return (
    <div className="tutorial">
      <div className="lesson-count">
        QUICK START / {String(step + 1).padStart(2, "0")} OF 05
      </div>
      <div className="lesson-visual">
        <Icon size={52} strokeWidth={1} />
        <div className="lesson-path">
          {lessons.map((_, i) => (
            <span className={i <= step ? "on" : ""} key={i}>
              {i < step ? <CheckCircle2 size={13} /> : i + 1}
            </span>
          ))}
        </div>
      </div>
      <h3>{l.title}</h3>
      <p>{l.text}</p>
      <div className="dialog-actions">
        <button
          className="btn secondary"
          onClick={() => {
            close();
            go(step);
          }}
        >
          {l.action}
        </button>
        <button
          className="btn primary"
          onClick={() => (step === 4 ? close() : setStep(step + 1))}
        >
          {step === 4 ? "Ready to organise" : "Next lesson"}
          <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
}
