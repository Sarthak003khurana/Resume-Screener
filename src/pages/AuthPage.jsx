import { useState } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  signInWithPopup,
  GoogleAuthProvider
} from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../firebase/config";
import "../styles/auth.css";

const googleProvider = new GoogleAuthProvider();

export default function AuthPage() {
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ name: "", email: "", password: "", company: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (mode === "signup") {

        const cred = await createUserWithEmailAndPassword(auth, form.email, form.password);

        await updateProfile(cred.user, { displayName: form.name });

        await setDoc(doc(db, "users", cred.user.uid), {
          name: form.name,
          email: form.email,
          company: form.company,
          createdAt: serverTimestamp(),
          role: "recruiter"
        });

      } else {

        await signInWithEmailAndPassword(auth, form.email, form.password);

      }

    } catch (err) {

      setError(
        err.message.replace("Firebase: ", "")
          .replace(/\(auth\/.*\)/, "")
          .trim()
      );

    } finally {

      setLoading(false);

    }
  };

  /* GOOGLE LOGIN */

  const handleGoogleLogin = async () => {
    try {

      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      console.log("Google user:", user);

      await setDoc(
        doc(db, "users", user.uid),
        {
          name: user.displayName,
          email: user.email,
          createdAt: serverTimestamp(),
          role: "recruiter"
        },
        { merge: true }
      );

    } catch (error) {

      console.error(error);
      setError("Google login failed");

    }
  };

  return (
    <div className="auth-root">

      {/* LEFT PANEL */}

      <div className="auth-left">

        <div className="auth-brand">
          <div className="brand-icon">SR</div>
          <span className="brand-name">ScreenerAI</span>
        </div>

        <div className="auth-hero">

          <h1>
            Hire Smarter.<br />
            Screen Faster.
          </h1>

          <p>
            AI-powered resume matching that surfaces your best candidates in seconds, not hours.
          </p>

          <div className="auth-stats">

            <div className="stat">
              <span className="stat-num">10x</span>
              <span className="stat-label">Faster Screening</span>
            </div>

            <div className="stat">
              <span className="stat-num">94%</span>
              <span className="stat-label">Match Accuracy</span>
            </div>

            <div className="stat">
              <span className="stat-num">∞</span>
              <span className="stat-label">Resumes Supported</span>
            </div>

          </div>

        </div>

        <div className="auth-bg-circles">
          <div className="circle c1" />
          <div className="circle c2" />
          <div className="circle c3" />
        </div>

      </div>

      {/* RIGHT PANEL */}

      <div className="auth-right">

        <div className="auth-card">

          <div className="tab-switcher">

            <button
              className={mode === "login" ? "tab active" : "tab"}
              onClick={() => { setMode("login"); setError(""); }}
            >
              Sign In
            </button>

            <button
              className={mode === "signup" ? "tab active" : "tab"}
              onClick={() => { setMode("signup"); setError(""); }}
            >
              Create Account
            </button>

          </div>

          <h2 className="auth-title">
            {mode === "login" ? "Welcome back" : "Get started today"}
          </h2>

          <p className="auth-subtitle">
            {mode === "login"
              ? "Sign in to your recruiter dashboard"
              : "Set up your company account in minutes"}
          </p>

          {error && <div className="auth-error">⚠ {error}</div>}

          {/* GOOGLE LOGIN BUTTON */}

          <button className="auth-google" onClick={handleGoogleLogin}>
            <img
              src="https://www.svgrepo.com/show/475656/google-color.svg"
              alt="Google"
              width="18"
              height="18"
            />
            Continue with Google
          </button>

          {/* LOGIN FORM */}

          <form onSubmit={submit} className="auth-form">

            {mode === "signup" && (
              <>
                <div className="field-group">
                  <label>Full Name</label>
                  <input
                    name="name"
                    placeholder="Jane Smith"
                    value={form.name}
                    onChange={handle}
                    required
                  />
                </div>

                <div className="field-group">
                  <label>Company Name</label>
                  <input
                    name="company"
                    placeholder="Acme Corp"
                    value={form.company}
                    onChange={handle}
                    required
                  />
                </div>
              </>
            )}

            <div className="field-group">
              <label>Work Email</label>
              <input
                name="email"
                type="email"
                placeholder="you@company.com"
                value={form.email}
                onChange={handle}
                required
              />
            </div>

            <div className="field-group">
              <label>Password</label>
              <input
                name="password"
                type="password"
                placeholder={mode === "signup" ? "Min 6 characters" : "Your password"}
                value={form.password}
                onChange={handle}
                required
                minLength={6}
              />
            </div>

            <button type="submit" className="auth-submit" disabled={loading}>
              {loading ? (
                <span className="spinner" />
              ) : mode === "login" ? (
                "Sign In →"
              ) : (
                "Create Account →"
              )}
            </button>

          </form>

          <p className="auth-switch">
            {mode === "login" ? "Don't have an account?" : "Already have an account?"}{" "}
            <button
              className="link-btn"
              onClick={() => {
                setMode(mode === "login" ? "signup" : "login");
                setError("");
              }}
            >
              {mode === "login" ? "Sign up" : "Sign in"}
            </button>
          </p>

        </div>

      </div>

    </div>
  );
}