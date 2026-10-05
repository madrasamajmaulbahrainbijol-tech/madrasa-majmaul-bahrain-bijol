"use client";

import { useRef, useState } from "react";
import { FiImage, FiShare2 } from "react-icons/fi";
import html2canvas from "html2canvas";

type Row = [string, string];

type Props = {
  type: "fee" | "payment" | "holiday" | "exam" | "general";
  studentId: string;
  studentName: string;
  guardian: string;
  mobile: string | null;
  amount?: string;
  feeMonth?: string;
  receipt?: string;
  startDate?: string;
  endDate?: string;
  resumeDate?: string;
  reason?: string;
  examName?: string;
  examDate?: string;
  examTime?: string;
  customMessage?: string;
  due: number;
  message: string;
};

function cardData(p: Props) {
  if (p.type === "fee") return {
    eyebrow: "FEE PAYMENT REMINDER",
    title: "Outstanding Fee",
    value: "₹" + p.due.toLocaleString("en-IN"),
    accent: "Please clear the outstanding fee at your earliest convenience.",
    rows: [["Student", p.studentName], ["Guardian", p.guardian], ["Student ID", p.studentId]] as Row[],
    footer: "Barah-e-karam fee ki adaigi jald se jald kar dein. Agar fee already jama kar di gayi hai, to please is notice ko ignore karein."
  };
  if (p.type === "payment") return {
    eyebrow: "PAYMENT CONFIRMATION",
    title: "Payment Received",
    value: "₹" + Number(p.amount || 0).toLocaleString("en-IN"),
    accent: "Thank you for your timely fee payment.",
    rows: [["Student", p.studentName], ["Fee Month", p.feeMonth || "—"], ["Receipt No.", p.receipt || "—"]] as Row[],
    footer: "JazakAllahu Khairan for your payment and continued support."
  };
  if (p.type === "holiday") return {
    eyebrow: "HOLIDAY NOTICE",
    title: "Madrasa Holiday",
    value: (p.startDate || "—") + "  —  " + (p.endDate || "—"),
    accent: p.reason || "Madrasa holiday",
    rows: [["Student", p.studentName], ["Classes Resume", p.resumeDate || "—"], ["Guardian", p.guardian]] as Row[],
    footer: "Classes will resume as mentioned above, InshaAllah."
  };
  if (p.type === "exam") return {
    eyebrow: "EXAMINATION NOTICE",
    title: p.examName || "Examination",
    value: p.examDate || "—",
    accent: p.examTime ? "Reporting / Time: " + p.examTime : "Please arrive on time and be prepared.",
    rows: [["Student", p.studentName], ["Guardian", p.guardian], ["Student ID", p.studentId]] as Row[],
    footer: "Please ensure the student arrives on time and is properly prepared."
  };
  return {
    eyebrow: "IMPORTANT NOTICE",
    title: "Madrasa Notice",
    value: "Please Read",
    accent: p.customMessage || "Please check the latest madrasa notice.",
    rows: [["Student", p.studentName], ["Guardian", p.guardian], ["Student ID", p.studentId]] as Row[],
    footer: p.customMessage || "Please check the latest madrasa notice."
  };
}

export default function WhatsAppImageCard(props: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState("");
  const data = cardData(props);

  async function createAndShare() {
    if (!ref.current) return;
    setBusy(true);
    setResult("");
    try {
      const canvas = await html2canvas(ref.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
        logging: false,
        onclone: (clonedDoc) => {
          // Tailwind can expose modern lab()/oklch() colors in computed CSS.
          // html2canvas does not understand lab(), so give the captured card
          // safe hex fallbacks without changing the live UI.
          const palette: Record<string, string> = {
            "white": "#ffffff",
            "slate-900": "#0f172a",
            "slate-800": "#1e293b",
            "slate-600": "#475569",
            "slate-400": "#94a3b8",
            "slate-200": "#e2e8f0",
            "slate-100": "#f1f5f9",
            "emerald-900": "#064e3b",
            "emerald-800": "#065f46",
            "emerald-700": "#047857",
            "emerald-50": "#ecfdf5",
            "emerald-100": "#d1fae5",
            "amber-50": "#fffbeb",
          };

          clonedDoc.querySelectorAll<HTMLElement>("[class]").forEach((el) => {
            const tokens = String(el.className).split(/\\s+/);
            for (const token of tokens) {
              const match = token.match(/^(?:text|bg|border)-(.+)$/);
              if (!match) continue;
              const value = palette[match[1]];
              if (!value) continue;
              if (token.startsWith("text-")) el.style.setProperty("color", value, "important");
              if (token.startsWith("bg-")) el.style.setProperty("background-color", value, "important");
              if (token.startsWith("border-")) el.style.setProperty("border-color", value, "important");
            }
          });
        },
      });
      const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/png", 1));
      if (!blob) throw new Error("Image generate nahi ho saki.");
      const safeName = props.studentName.replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "") || "student";
      const file = new File([blob], "MMBB-" + props.type + "-" + safeName + ".png", { type: "image/png" });
      const canShare = typeof navigator !== "undefined" && !!navigator.share && !!navigator.canShare && navigator.canShare({ files: [file] });
      if (canShare) {
        await navigator.share({ files: [file], title: "Madrasa Majmaul Bahrain Bijol", text: "Madrasa Majmaul Bahrain Bijol" });
        setResult("Professional card share sheet me ready hai.");
        return;
      }
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = file.name;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      setResult("Professional card download ho gaya. WhatsApp me image attach karke Send karein.");
    } catch (e: any) {
      if (e?.name === "AbortError") setResult("Share cancel kiya gaya.");
      else setResult(e?.message || "Professional card generate nahi ho saka.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
      <div className="flex items-center gap-2 text-emerald-900"><FiImage /><p className="text-sm font-black">Professional WhatsApp Card</p></div>
      <p className="mt-1 text-xs leading-5 text-emerald-800">Normal text ke bajaye madrasa branding ke saath professional PNG card generate hoga.</p>
      <div className="mt-3 overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 p-3">
        <div className="mx-auto max-w-[520px]">
          <div ref={ref} className="relative overflow-hidden bg-white p-7 text-slate-900" style={{ aspectRatio: "4 / 5" }}>
            <div className="absolute inset-x-0 top-0 h-2 bg-emerald-700" />
            <div className="absolute -right-24 -top-24 h-56 w-56 rounded-full bg-emerald-50" />
            <div className="absolute -left-20 bottom-10 h-44 w-44 rounded-full bg-amber-50" />
            <div className="relative flex h-full flex-col">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <img src="/mmbb-logo.svg" alt="Madrasa logo" crossOrigin="anonymous" className="h-14 w-14 object-contain" />
                  <div><p className="text-[10px] font-black uppercase tracking-[0.22em] text-emerald-700">Madrasa Majmaul Bahrain</p><p className="text-sm font-black">Bijol</p></div>
                </div>
                <div className="rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1.5 text-[9px] font-black uppercase tracking-wider text-emerald-800">Official Notice</div>
              </div>
              <div className="mt-9">
                <p className="text-[11px] font-black tracking-[0.18em] text-emerald-700">{data.eyebrow}</p>
                <h2 className="mt-2 text-3xl font-black tracking-tight">{data.title}</h2>
                <div className="mt-4 rounded-2xl border border-emerald-100 bg-emerald-50 p-5"><p className="text-[10px] font-bold uppercase tracking-widest text-emerald-700">Important</p><p className="mt-1 text-2xl font-black text-emerald-900">{data.value}</p><p className="mt-2 text-xs font-semibold leading-5 text-slate-600">{data.accent}</p></div>
              </div>
              <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200">
                {data.rows.map(([label, value]) => <div key={label} className="flex items-center justify-between gap-4 border-b border-slate-100 px-4 py-3 last:border-b-0"><span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{label}</span><span className="max-w-[62%] text-right text-xs font-black text-slate-800">{value}</span></div>)}
              </div>
              <div className="mt-auto border-t border-slate-200 pt-5"><p className="text-xs font-semibold leading-5 text-slate-600">{data.footer}</p><div className="mt-4 flex items-end justify-between"><div><p className="text-[10px] font-black text-emerald-700">JazakAllahu Khairan</p><p className="mt-1 text-[9px] font-semibold text-slate-400">For your cooperation and support</p></div><div className="text-right"><p className="text-[10px] font-black">Madrasa Majmaul Bahrain</p><p className="text-[9px] font-semibold text-slate-400">Bijol</p></div></div></div>
            </div>
          </div>
        </div>
      </div>
      {result && <p className="mt-3 rounded-xl bg-white p-3 text-xs font-bold text-emerald-800">{result}</p>}
      <button type="button" onClick={createAndShare} disabled={busy} className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-700 px-5 py-3 text-sm font-black text-white hover:bg-emerald-800 disabled:opacity-60"><FiShare2 />{busy ? "Card bana raha hoon..." : "Create & Share Professional Card"}</button>
    </div>
  );
}
