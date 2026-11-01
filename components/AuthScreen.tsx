"use client";
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Eye,
  EyeOff,
  Flower2,
  LockKeyhole,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";
import { demoFetch as fetch } from "../lib/demo-account";
import { readAppearance } from "../lib/appearance";
import { errorMessage } from "../lib/domain-types";
import StageArt from "./StageArt";
const copy = {
  login: {
    eyebrow: "WELCOME BACK",
    title: "Your next great event\nstarts here.",
    subtitle: "Sign in to your browser-only demo workspace.",
    button: "Sign in",
    action: "login",
  },
  register: {
    eyebrow: "MAKE ROOM FOR SOMETHING GREAT",
    title: "A studio for your\nbiggest ideas.",
    subtitle: "Create an organiser account. Bring your team’s plans together.",
    button: "Create account",
    action: "register",
  },
  recover: {
    eyebrow: "LET’S GET YOU BACK IN",
    title: "A fresh start.\nSame brilliant plans.",
    subtitle:
      "Reset this browser’s demo account and its saved events. This deletes its local data; no email is sent.",
    button: "Clear demo account",
    action: "recover",
  },
  reset: {
    eyebrow: "ONE LAST STEP",
    title: "A new password.\nA clear way forward.",
    subtitle: "Choose a strong password to secure your organiser account.",
    button: "Update password",
    action: "reset",
  },
} as const;
export default function AuthScreen({ mode }: { mode: keyof typeof copy }) {
  const c = copy[mode],
    [email, setEmail] = useState(""),
    [password, setPassword] = useState(""),
    [confirm, setConfirm] = useState(""),
    [name, setName] = useState(""),
    [show, setShow] = useState(false),
    [busy, setBusy] = useState(false),
    [message, setMessage] = useState(() =>
      typeof window !== "undefined" &&
      new URLSearchParams(window.location.search).has("updated")
        ? "Password updated. Sign in with your new password."
        : "",
    ),
    [error, setError] = useState(""),
    [configured] = useState(true);
  useEffect(() => {
    document.documentElement.dataset.theme = readAppearance().theme;
  }, []);
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setMessage("");
    if (["register", "reset"].includes(mode) && password !== confirm) {
      setError("The passwords do not match.");
      return;
    }
    if (
      mode === "recover" &&
      !window.confirm(
        "Delete this demo account and its events from this browser? You can register again.",
      )
    )
      return;
    setBusy(true);
    try {
      const r = await fetch("/api/account", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: c.action,
          email: mode === "reset" ? undefined : email,
          password: ["login", "register", "reset"].includes(mode)
            ? password
            : undefined,
          name: mode === "register" ? name : undefined,
        }),
      });
      const d: { error?: string; redirect?: string; message?: string } =
        await r.json();
      if (!r.ok) throw Error(d.error);
      setPassword("");
      setConfirm("");
      if (d.redirect) window.location.assign(d.redirect);
      else setMessage(d.message || "Request completed.");
    } catch (e: unknown) {
      setError(errorMessage(e));
    } finally {
      setBusy(false);
    }
  }
  return (
    <main className="auth-layout">
      <section className="auth-story">
        <a className="wordmark" href="/">
          <span className="logo-mark">
            <Flower2 size={25} />
          </span>
          utsav<span>ops</span>
        </a>
        <div className="auth-story-copy">
          <span className="eyebrow">FOR THE PEOPLE BEHIND THE CELEBRATION</span>
          <h1>
            Great moments.
            <br />
            <em>Thoughtfully orchestrated.</em>
          </h1>
          <p>
            Hackathon prototype. Your event vision, budgets and people in one
            browser-based demo studio.
          </p>
        </div>
        <div className="auth-stage">
          <StageArt type="Wedding" style="Contemporary" />
          <span className="orbit-label">VISION / PEOPLE / CELEBRATION</span>
        </div>
        <div className="auth-story-footer">
          <span>HUMAN-LED. CONNECTED BY DESIGN.</span>
          <ShieldCheck size={17} />
        </div>
      </section>
      <section className="auth-form-side">
        <a className="back-link" href="/">
          <ArrowLeft size={15} />
          Back to UtsavOps
        </a>
        <div className="auth-form-wrap">
          <span className="auth-symbol">
            {["recover", "reset"].includes(mode) ? (
              <LockKeyhole size={23} />
            ) : (
              <Flower2 size={25} />
            )}
          </span>
          <span className="eyebrow">{c.eyebrow}</span>
          <h2>
            {c.title.split("\n").map((x, i) => (
              <span key={x}>
                {x}
                {i === 0 && <br />}
              </span>
            ))}
          </h2>
          <p className="auth-subtitle">{c.subtitle}</p>
          {message ? (
            <div className="auth-success" role="status">
              <CheckCircle2 size={19} />
              <span>{message}</span>
            </div>
          ) : null}
          {error ? (
            <p className="auth-error" role="alert">
              {error}
            </p>
          ) : null}
          {!configured && (
            <p className="auth-service-note" role="status">
              Email sign-in is temporarily unavailable. Please try again later.
            </p>
          )}
          <form onSubmit={submit}>
            {mode === "register" && (
              <label>
                Your name
                <input
                  required
                  autoComplete="name"
                  maxLength={100}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="How should we address you?"
                />
              </label>
            )}
            {mode !== "reset" && (
              <label>
                Email address
                <input
                  required
                  type="email"
                  autoComplete="email"
                  maxLength={254}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@yourstudio.com"
                />
              </label>
            )}
            {mode !== "recover" && (
              <>
                <label>
                  {mode === "reset" ? "New password" : "Password"}
                  <span className="password-input">
                    <input
                      required
                      type={show ? "text" : "password"}
                      autoComplete={
                        mode === "login" ? "current-password" : "new-password"
                      }
                      minLength={mode === "login" ? 1 : 10}
                      maxLength={128}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder={
                        mode === "login"
                          ? "Enter your password"
                          : "At least 10 characters"
                      }
                    />
                    <button
                      type="button"
                      aria-label={show ? "Hide password" : "Show password"}
                      onClick={() => setShow(!show)}
                    >
                      {show ? <EyeOff size={17} /> : <Eye size={17} />}
                    </button>
                  </span>
                </label>
                {mode === "login" && (
                  <a className="forgot-link" href="/forgot-password">
                    Forgot password?
                  </a>
                )}
              </>
            )}
            {["register", "reset"].includes(mode) && (
              <label>
                Confirm password
                <input
                  required
                  type={show ? "text" : "password"}
                  autoComplete="new-password"
                  minLength={10}
                  maxLength={128}
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  placeholder="Enter the password again"
                />
              </label>
            )}
            <button
              className="btn primary full"
              type="submit"
              disabled={busy || configured !== true}
            >
              {busy ? "Please wait…" : c.button}
              <ArrowRight size={16} />
            </button>
          </form>
          <div className="auth-switch">
            {mode === "login" ? (
              <>
                New to UtsavOps? <a href="/register">Create an account</a>
              </>
            ) : mode === "register" ? (
              <>
                Already have an account? <a href="/login">Sign in</a>
              </>
            ) : (
              <a href="/login">Back to sign in</a>
            )}
          </div>
          <div className="auth-privacy">
            <LockKeyhole size={13} />
            <span>
              Prototype access only. Use a demo password. Accounts and events
              stay on this browser; this is not production security.
            </span>
          </div>
        </div>
        <div className="auth-bottom">
          YOUR IDEAS DESERVE A BETTER BACKSTAGE.
        </div>
      </section>
    </main>
  );
}
