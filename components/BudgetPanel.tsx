"use client";
import { ClipboardCheck } from "lucide-react";
import type { Dispatch, SetStateAction } from "react";
import type { EventState, BudgetItem } from "../lib/domain-types";
import { money, totals } from "../lib/engine.mjs";
export default function BudgetPanel({
  s,
  setS,
  notify,
}: {
  s: EventState;
  setS: Dispatch<SetStateAction<EventState>>;
  notify: (message: string) => void;
}) {
  const total = totals(s);
  const badge = (text: string, color = "") => (
    <span className={"tag " + color}>{text}</span>
  );
  return (
    <>
      <div className="budget-summary">
        {[
          ["Total budget", money(s.brief.budget), "Client spending limit"],
          ["Allocated", money(total.committed), "Estimates + entered quotes"],
          ["Paid", money(total.paid), "Recorded payments"],
          [
            "Free after reserve",
            money(total.remaining),
            `${money(total.reserve)} contingency held`,
          ],
        ].map(([label, value, note], i) => (
          <div
            className={i === 3 && total.remaining < 0 ? "negative" : ""}
            key={label}
          >
            <span>{label}</span>
            <strong>{value}</strong>
            <small>{note}</small>
          </div>
        ))}
      </div>
      <section className="panel">
        <div className="panel-heading">
          <div>
            <h3>Vendor desk</h3>
            <p>
              Enter actual quotes. A label records your confirmation; it is not
              independent verification.
            </p>
          </div>
          {badge(
            total.remaining < 0 ? "Budget needs attention" : "Within budget",
            total.remaining < 0 ? "danger" : "success",
          )}
        </div>
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Category & supplier</th>
                <th>Allocation ₹</th>
                <th>Paid ₹</th>
                <th>Per guest ₹</th>
                <th>Evidence</th>
                <th>Booking</th>
              </tr>
            </thead>
            <tbody>
              {s.items.map((x) => (
                <tr key={x.id}>
                  <td>
                    <b>{x.name}</b>
                    <input
                      aria-label={`${x.name} vendor`}
                      value={x.vendor}
                      maxLength={100}
                      onChange={(e) =>
                        setS({
                          ...s,
                          version: s.version + 1,
                          items: s.items.map((a) =>
                            a.id === x.id
                              ? { ...a, vendor: e.target.value }
                              : a,
                          ),
                        })
                      }
                    />
                  </td>
                  {(["amount", "paid", "perGuest"] as const).map((field) => (
                    <td key={field}>
                      <input
                        aria-label={`${x.name} ${field}`}
                        className="money-input"
                        type="number"
                        min={0}
                        max={100000000}
                        value={x[field]}
                        onChange={(e) => {
                          const n = Number(e.target.value),
                            v = { ...x, [field]: n };
                          if (!Number.isInteger(n) || n < 0 || n > 100000000)
                            return;
                          if (v.paid > v.amount) {
                            notify(
                              "Recorded payment cannot exceed allocation. Adjust allocation first.",
                            );
                            return;
                          }
                          setS({
                            ...s,
                            version: s.version + 1,
                            items: s.items.map((a) => (a.id === x.id ? v : a)),
                          });
                        }}
                      />
                    </td>
                  ))}
                  <td>
                    <select
                      aria-label={`${x.name} evidence`}
                      value={x.basis}
                      onChange={(e) =>
                        setS({
                          ...s,
                          version: s.version + 1,
                          items: s.items.map((a) =>
                            a.id === x.id
                              ? {
                                  ...a,
                                  basis: e.target.value as BudgetItem["basis"],
                                }
                              : a,
                          ),
                        })
                      }
                    >
                      {[
                        "Estimate",
                        "Illustrative quote",
                        "Confirmed quote",
                      ].map((o) => (
                        <option key={o}>{o}</option>
                      ))}
                    </select>
                  </td>
                  <td>
                    <select
                      aria-label={`${x.name} booking`}
                      value={x.status}
                      onChange={(e) =>
                        setS({
                          ...s,
                          version: s.version + 1,
                          items: s.items.map((a) =>
                            a.id === x.id
                              ? {
                                  ...a,
                                  status: e.target
                                    .value as BudgetItem["status"],
                                }
                              : a,
                          ),
                        })
                      }
                    >
                      {[
                        "Shortlisted",
                        "Quote received",
                        "Booking confirmed",
                        "Delivered",
                      ].map((o) => (
                        <option key={o}>{o}</option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
      <section className="checklist-band">
        <ClipboardCheck size={24} />
        <div>
          <h3>Before you confirm a supplier</h3>
          <p>
            Check tax & transport · Confirm capacity & timing · Record
            cancellation terms · Agree on a backup contact
          </p>
        </div>
      </section>
    </>
  );
}
