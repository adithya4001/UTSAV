"use client";
import { Sparkles, ShieldCheck } from "lucide-react";
import StageArt from "./StageArt";
import type { EventState } from "../lib/domain-types";
export default function CreativePlanPanel({
  s,
  busy,
  ai,
}: {
  s: EventState;
  busy: boolean;
  ai: () => Promise<void>;
}) {
  return (
    <>
      <section className="creative-board">
        <div
          className={`creative-poster poster-${(s.brief.style || "Heritage").toLowerCase()}`}
        >
          <span className="eyebrow">THE CREATIVE DIRECTION</span>
          <h2>{s.blueprint?.theme || "A vision, waiting."}</h2>
          <StageArt type={s.brief.type} style={s.brief.style} />
          <div className="poster-bottom">
            <span>{s.brief.style || "Heritage"}</span>
            <span>{s.brief.priority || "Guest comfort"}</span>
          </div>
        </div>
        <div className="creative-copy">
          <div className="panel-heading">
            <span className="tag">{s.blueprint?.source || "Draft needed"}</span>
            <button
              className="btn secondary small"
              disabled={busy}
              onClick={ai}
            >
              <Sparkles size={14} />
              {busy ? "Working…" : "Refine with live AI"}
            </button>
          </div>
          <h3>Designed around this brief.</h3>
          <p>{s.blueprint?.vision}</p>
          <div className="mood-palette">
            <i />
            <i />
            <i />
            <i />
            <span>
              Directional palette
              <br />
              <b>Confirm materials with your supplier</b>
            </span>
          </div>
          <div className="note">
            <ShieldCheck size={17} />
            The context-based draft works without a model. Live AI uses a
            server-side Gemini credential. Demo sign-in is browser-local. Your
            brief is sent to Google only when you request live refinement.
          </div>
        </div>
      </section>
      <div className="three-panels">
        {[
          ["The guest experience", s.blueprint?.ideas],
          ["Food & beverages", s.blueprint?.menu],
          ["Before you confirm", s.blueprint?.questions],
        ].map(([name, items]) => (
          <section className="panel" key={name as string}>
            <span className="eyebrow">{name as string}</span>
            <ul className="editorial-list">
              {((items as string[]) || []).map((x, i) => (
                <li key={i}>
                  <span>0{i + 1}</span>
                  {x}
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </>
  );
}
