"use client";
import { useState } from "react";
import { ArrowRight, Check } from "lucide-react";
import StageArt from "./StageArt";
import type { EventBriefData } from "../lib/domain-types";
import { briefSchema } from "../lib/contracts";
export const blankBrief: EventBriefData = {
  name: "",
  type: "Wedding",
  city: "Hyderabad",
  date: "2026-12-12",
  guests: 150,
  budget: 300000,
  preferences: "",
  venue: "",
  setting: "Indoor",
  style: "Heritage",
  priority: "Guest comfort",
  start: "14:00",
  capacity: 200,
};
export default function EventBrief({
  initial,
  onSubmit,
  editing = false,
}: {
  initial?: EventBriefData;
  onSubmit: (b: EventBriefData) => void;
  editing?: boolean;
}) {
  const [b, setB] = useState(initial || blankBrief),
    [error, setError] = useState(""),
    [step, setStep] = useState(0);
  const field = <K extends keyof EventBriefData>(
    key: K,
    value: EventBriefData[K],
  ) => setB({ ...b, [key]: value });
  function submit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = briefSchema.safeParse(b);
    if (!parsed.success) {
      setError(parsed.error.issues[0].message);
      return;
    }
    onSubmit(parsed.data);
  }
  return (
    <form onSubmit={submit} className="brief-form">
      <div className="brief-progress">
        {["The occasion", "The constraints", "The creative brief"].map(
          (x, i) => (
            <button
              type="button"
              className={i === step ? "selected" : ""}
              key={x}
              onClick={() => setStep(i)}
            >
              <span>{i + 1}</span>
              {x}
            </button>
          ),
        )}
      </div>
      <div className="brief-body">
        <div className="brief-fields">
          {error && (
            <p className="error" role="alert">
              {error}
            </p>
          )}
          {step === 0 && (
            <>
              <h3>What are we bringing to life?</h3>
              <label>
                Event / client name
                <input
                  autoComplete="off"
                  required
                  maxLength={100}
                  placeholder="e.g. Ananya & Arjun’s wedding"
                  value={b.name}
                  onChange={(e) => field("name", e.target.value)}
                />
              </label>
              <div className="occasion-options">
                {(["Wedding", "Birthday", "Community"] as const).map((x) => (
                  <button
                    className={b.type === x ? "selected" : ""}
                    type="button"
                    key={x}
                    onClick={() => field("type", x)}
                  >
                    {x}
                    {b.type === x && <Check size={14} />}
                  </button>
                ))}
              </div>
              <div className="form-grid">
                <label>
                  Event date
                  <input
                    type="date"
                    required
                    value={b.date}
                    onChange={(e) => field("date", e.target.value)}
                  />
                </label>
                <label>
                  Main programme starts
                  <input
                    type="time"
                    value={b.start}
                    onChange={(e) => field("start", e.target.value)}
                  />
                </label>
                <label>
                  City
                  <input
                    maxLength={100}
                    required
                    value={b.city}
                    onChange={(e) => field("city", e.target.value)}
                  />
                </label>
                <label>
                  Venue name
                  <input
                    maxLength={150}
                    placeholder="Optional"
                    value={b.venue || ""}
                    onChange={(e) => field("venue", e.target.value)}
                  />
                </label>
              </div>
            </>
          )}
          {step === 1 && (
            <>
              <h3>A beautiful plan starts with real constraints.</h3>
              <div className="form-grid">
                <label>
                  Total event budget · ₹
                  <input
                    required
                    type="number"
                    min={1000}
                    max={100000000}
                    value={b.budget}
                    onChange={(e) => field("budget", Number(e.target.value))}
                  />
                </label>
                <label>
                  Expected guests
                  <input
                    required
                    type="number"
                    min={1}
                    max={10000}
                    value={b.guests}
                    onChange={(e) => field("guests", Number(e.target.value))}
                  />
                </label>
                <label>
                  Recorded venue capacity
                  <input
                    type="number"
                    min={1}
                    max={10000}
                    value={b.capacity || 200}
                    onChange={(e) => field("capacity", Number(e.target.value))}
                  />
                </label>
                <label>
                  Venue setting
                  <select
                    value={b.setting || "Indoor"}
                    onChange={(e) =>
                      field(
                        "setting",
                        e.target.value as EventBriefData["setting"],
                      )
                    }
                  >
                    {["Indoor", "Outdoor", "Mixed"].map((x) => (
                      <option key={x}>{x}</option>
                    ))}
                  </select>
                </label>
              </div>
              {b.guests > (b.capacity || 10000) && (
                <p className="error">
                  Guest count exceeds recorded capacity. Resolve venue capacity
                  before confirming the event.
                </p>
              )}
              <p className="hint">
                We reserve 10% for contingency. Initial allocations are
                estimates, never vendor quotes.
              </p>
            </>
          )}
          {step === 2 && (
            <>
              <h3>Make it feel unmistakably theirs.</h3>
              <label>
                Visual direction
                <select
                  value={b.style || "Heritage"}
                  onChange={(e) =>
                    field("style", e.target.value as EventBriefData["style"])
                  }
                >
                  {["Heritage", "Contemporary", "Garden"].map((x) => (
                    <option key={x}>{x}</option>
                  ))}
                </select>
              </label>
              <label>
                Protect this priority
                <select
                  value={b.priority || "Guest comfort"}
                  onChange={(e) =>
                    field(
                      "priority",
                      e.target.value as EventBriefData["priority"],
                    )
                  }
                >
                  {["Guest comfort", "Food experience", "Visual impact"].map(
                    (x) => (
                      <option key={x}>{x}</option>
                    ),
                  )}
                </select>
              </label>
              <label>
                Traditions, cuisine, accessibility and personal touches
                <textarea
                  maxLength={2000}
                  rows={4}
                  placeholder="What matters to the client? What should we avoid?"
                  value={b.preferences}
                  onChange={(e) => field("preferences", e.target.value)}
                />
              </label>
              <p className="hint">
                Include preferences, not private addresses or sensitive guest
                data.
              </p>
            </>
          )}
        </div>
        <div className="brief-preview">
          <StageArt type={b.type} style={b.style} />
          <span className="eyebrow">YOUR DIRECTION</span>
          <h3>
            {b.style || "Heritage"} {b.type.toLowerCase()}
          </h3>
          <p>
            {b.guests} guests · {b.setting || "Indoor"} · {b.city}
          </p>
          <span className="palette-swatches">
            <i />
            <i />
            <i />
            <i />
          </span>
        </div>
      </div>
      <div className="dialog-actions">
        <button
          className="btn secondary"
          type="button"
          disabled={step === 0}
          onClick={() => setStep(step - 1)}
        >
          Back
        </button>
        {step < 2 ? (
          <button
            type="button"
            className="btn primary"
            onClick={(e) => {
              e.preventDefault();
              setStep(step + 1);
            }}
          >
            Continue
            <ArrowRight size={16} />
          </button>
        ) : (
          <button className="btn primary" type="submit">
            {editing ? "Save brief & rebuild estimates" : "Create event order"}
            <ArrowRight size={16} />
          </button>
        )}
      </div>
    </form>
  );
}
