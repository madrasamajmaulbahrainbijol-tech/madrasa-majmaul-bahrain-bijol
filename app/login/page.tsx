"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { supabase } from "../lib/supabase";

const STUDENT_AUTH_DOMAIN = "student.mmbb.local";

function authEmail(studentId: string) {
  return `${studentId.trim().toLowerCase()}@${STUDENT_AUTH_DOMAIN}`;
}

export default function LoginPage() {
  const [studentId, setStudentId] = useState("");
  const [password, setPassword] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [mustChangePassword, setMustChangePassword] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState("");

  const [applicationNumber, setApplicationNumber] = useState("");
  const [registeredMobile, setRegisteredMobile] = useState("");
  const [statusLoading, setStatusLoading] = useState(false);
  const [statusError, setStatusError] = useState("");
  const [statusResult, setStatusResult] = useState<any>(null);

  async function handleLogin(event: FormEvent) {
    event.preventDefault();
    setLoginLoading(true);
    setLoginError("");
    setPasswordMessage("");

    try {
      const cleanId = studentId.trim().toUpperCase();
      if (!/^MMBB[A-Z]{3}\d{4}$/.test(cleanId)) {
        throw new Error("Please enter a valid Student ID.");
      }
      if (!password) throw new Error("Please enter your password.");

      const { data, error } = await supabase.auth.signInWithPassword({
        email: authEmail(cleanId),
        password,
      });
      if (error || !data.user) throw new Error("Student ID or password is incorrect.");

      const { data: account, error: accountError } = await supabase
        .from("student_accounts")
        .select("student_id,password_created,account_status")
        .eq("auth_user_id", data.user.id)
        .maybeSingle();
      if (accountError) throw accountError;
      if (!account || account.account_status !== "approved") {
        await supabase.auth.signOut();
        throw new Error("Your student account is not active. Please contact the Madrasa office.");
      }

      if (!account.password_created || data.user.user_metadata?.must_change_password) {
        setMustChangePassword(true);
      } else {
        window.location.href = "/student/dashboard";
      }
    } catch (error) {
      setLoginError(error instanceof Error ? error.message : "Login failed. Please try again.");
    } finally {
      setLoginLoading(false);
    }
  }

  async function handlePasswordChange(event: FormEvent) {
    event.preventDefault();
    setPasswordMessage("");
    if (newPassword.length < 8) {
      setPasswordMessage("New password must be at least 8 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordMessage("New password and confirm password do not match.");
      return;
    }

    setPasswordLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("student-password", {
        body: { newPassword },
      });
      if (error || data?.error) throw new Error(data?.error || error?.message || "Password update failed.");
      setPasswordMessage("Password updated successfully. Opening your student portal...");
      window.setTimeout(() => { window.location.href = "/student/dashboard"; }, 700);
    } catch (error) {
      setPasswordMessage(error instanceof Error ? error.message : "Password update failed.");
    } finally {
      setPasswordLoading(false);
    }
  }

  async function checkApplication(event: FormEvent) {
    event.preventDefault();
    setStatusLoading(true);
    setStatusError("");
    setStatusResult(null);

    try {
      const { data, error } = await supabase.functions.invoke("student-application-status", {
        body: { applicationNumber, mobile: registeredMobile },
      });
      if (error || data?.error) throw new Error(data?.error || error?.message || "Unable to check status.");
      setStatusResult(data);
    } catch (error) {
      setStatusError(error instanceof Error ? error.message : "Unable to check application status.");
    } finally {
      setStatusLoading(false);
    }
  }

  return (
    <>
      <Navbar />
      <section className="relative overflow-hidden bg-gradient-to-br from-green-950 via-green-800 to-green-600 px-6 pb-20 pt-36 text-white sm:pb-24">
        <div className="absolute inset-0 bg-black/15" />
        <div className="relative mx-auto max-w-5xl text-center">
          <p className="text-sm font-bold uppercase tracking-[5px] text-green-200 sm:text-base">Student Portal</p>
          <h1 className="mt-5 text-4xl font-extrabold sm:text-5xl md:text-6xl">Student Login</h1>
          <p className="mx-auto mt-5 max-w-3xl text-base leading-8 text-green-100 sm:text-lg">Secure access to your personal profile, attendance, results, fees and official student records.</p>
        </div>
      </section>

      <section className="bg-slate-50 px-4 py-14 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-2">
          <div className="rounded-3xl bg-white p-7 shadow-xl ring-1 ring-slate-100 sm:p-9">
            <p className="text-xs font-black uppercase tracking-[3px] text-green-700">Student Portal</p>
            <h2 className="mt-3 text-3xl font-black text-slate-900">Login to Your Account</h2>
            <p className="mt-3 text-slate-600">Use your Student ID and password provided by the Madrasa office.</p>

            {!mustChangePassword ? (
              <form onSubmit={handleLogin} className="mt-8 space-y-5">
                <div><label className="font-bold text-slate-800">Student ID</label><input value={studentId} onChange={(e) => setStudentId(e.target.value.toUpperCase())} className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 font-semibold outline-none focus:border-green-600 focus:bg-white" placeholder="MMBBMDR0802" autoComplete="username" /></div>
                <div><label className="font-bold text-slate-800">Password</label><input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 font-semibold outline-none focus:border-green-600 focus:bg-white" placeholder="Enter password" autoComplete="current-password" /></div>
                {loginError && <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-700">{loginError}</div>}
                <button disabled={loginLoading} className="w-full rounded-xl bg-green-800 py-4 text-lg font-black text-white shadow-lg transition hover:bg-green-900 disabled:opacity-60">{loginLoading ? "Signing in..." : "Login to Student Portal"}</button>
              </form>
            ) : (
              <form onSubmit={handlePasswordChange} className="mt-8 space-y-5">
                <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900"><strong>First login:</strong> your temporary DOB password has been accepted. Please create your own permanent password before continuing.</div>
                <div><label className="font-bold text-slate-800">New Permanent Password</label><input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3.5 font-semibold outline-none focus:border-green-600" placeholder="Minimum 8 characters" autoComplete="new-password" /></div>
                <div><label className="font-bold text-slate-800">Confirm Password</label><input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3.5 font-semibold outline-none focus:border-green-600" placeholder="Repeat your password" autoComplete="new-password" /></div>
                {passwordMessage && <div className="rounded-xl border border-green-200 bg-green-50 p-4 text-sm font-bold text-green-800">{passwordMessage}</div>}
                <button disabled={passwordLoading} className="w-full rounded-xl bg-green-800 py-4 text-lg font-black text-white shadow-lg hover:bg-green-900 disabled:opacity-60">{passwordLoading ? "Saving..." : "Set Permanent Password"}</button>
              </form>
            )}

            <div className="mt-7 rounded-2xl bg-slate-50 p-5 text-sm leading-6 text-slate-600"><strong className="text-slate-900">Forgot your password?</strong> Please contact the Madrasa office. After verification, the office can issue a new temporary DOB password for your account.</div>
          </div>

          <div className="rounded-3xl bg-white p-7 shadow-xl ring-1 ring-slate-100 sm:p-9">
            <p className="text-xs font-black uppercase tracking-[3px] text-green-700">Admission</p>
            <h2 className="mt-3 text-3xl font-black text-slate-900">Check Your Application</h2>
            <p className="mt-3 text-slate-600">Enter your application number and the primary mobile number used on the admission form.</p>

            <form onSubmit={checkApplication} className="mt-8 space-y-5">
              <div><label className="font-bold text-slate-800">Application Number</label><input value={applicationNumber} onChange={(e) => setApplicationNumber(e.target.value.toUpperCase())} className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 font-semibold outline-none focus:border-green-600 focus:bg-white" placeholder="MMBB-2026-123456" /></div>
              <div><label className="font-bold text-slate-800">Primary Mobile Number</label><input value={registeredMobile} onChange={(e) => setRegisteredMobile(e.target.value.replace(/\D/g, "").slice(0, 10))} inputMode="numeric" maxLength={10} className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 font-semibold outline-none focus:border-green-600 focus:bg-white" placeholder="10-digit mobile number" /></div>
              {statusError && <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-700">{statusError}</div>}
              <button disabled={statusLoading} className="w-full rounded-xl border-2 border-green-800 py-3.5 font-black text-green-800 hover:bg-green-50 disabled:opacity-60">{statusLoading ? "Checking..." : "Check Application Status"}</button>
            </form>

            {statusResult && (
              <div className="mt-7 rounded-2xl border border-green-200 bg-green-50 p-5">
                <div className="flex items-start justify-between gap-4"><div><p className="text-xs font-black uppercase tracking-[2px] text-green-700">Application Status</p><h3 className="mt-1 text-xl font-black text-slate-900">{statusResult.studentName}</h3></div><span className="rounded-full bg-white px-3 py-1 text-xs font-black uppercase text-green-800">{String(statusResult.status).replace("_", " ")}</span></div>
                <p className="mt-4 text-sm leading-6 text-slate-700">{statusResult.message}</p>
                <div className="mt-4 grid gap-3 sm:grid-cols-2"><div className="rounded-xl bg-white p-3"><p className="text-xs font-bold text-slate-500">Application Number</p><p className="mt-1 font-black text-slate-900">{statusResult.applicationNumber}</p></div><div className="rounded-xl bg-white p-3"><p className="text-xs font-bold text-slate-500">Course</p><p className="mt-1 font-black text-slate-900">{statusResult.course || "—"}</p></div></div>
                {statusResult.approved && <div className="mt-4 rounded-xl bg-green-800 p-4 text-white"><p className="text-xs font-bold uppercase tracking-[2px] text-green-200">Admission Approved</p><p className="mt-1 text-lg font-black">Student ID: {statusResult.studentId}</p><p className="mt-2 text-sm text-green-100">Use this Student ID with your temporary DOB password to login.</p></div>}
              </div>
            )}

            <Link href="/admission" className="mt-6 inline-flex w-full items-center justify-center rounded-xl bg-slate-900 py-3.5 font-black text-white hover:bg-slate-800">Apply for Admission</Link>
          </div>
        </div>
      </section>
      <Footer />
    </>
  );
}
