"use client";

import { useEffect, useMemo, useState } from "react";
import { FiImage, FiShare2, FiDownload, FiCheckCircle } from "react-icons/fi";

type CardType = "fee" | "payment" | "holiday" | "exam" | "general";
type Row = [string, string];

type Props = {
  type: CardType;
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

const PALETTE = {
  green: "#087443",
  deep: "#06452d",
  ink: "#132a22",
  muted: "#53665e",
  line: "#dce9e2",
  pale: "#edf7f1",
  gold: "#c18a32",
  white: "#ffffff",
};

function cardData(p: Props) {
  const common: Row[] = [["Student", p.studentName || "Student"], ["Guardian", p.guardian || "Parent/Guardian"], ["Student ID", p.studentId || "—"]];
  if (p.type === "fee") return {
    eyebrow: "FEE PAYMENT REMINDER", title: "Outstanding Fee", value: "₹" + p.due.toLocaleString("en-IN"),
    valueLabel: "TOTAL OUTSTANDING", accent: "A gentle reminder to clear the pending madrasa fee at your earliest convenience.",
    rows: common, footer: "Agar fee already jama kar di gayi hai, to please is reminder ko ignore karein. JazakAllahu Khairan.",
    tag: "PAYMENT REMINDER",
  };
  if (p.type === "payment") return {
    eyebrow: "PAYMENT ACKNOWLEDGEMENT", title: "Payment Received", value: "₹" + Number(p.amount || 0).toLocaleString("en-IN"),
    valueLabel: "AMOUNT RECEIVED", accent: "Your fee payment has been recorded successfully. Thank you for your support.",
    rows: [["Student", p.studentName || "Student"], ["Fee Month", p.feeMonth || "—"], ["Receipt Number", p.receipt || "—"], ["Guardian", p.guardian || "—"]],
    footer: "Please keep this acknowledgement for your records. JazakAllahu Khairan.",
    tag: "PAYMENT CONFIRMATION",
  };
  if (p.type === "holiday") return {
    eyebrow: "OFFICIAL MADRASA ANNOUNCEMENT", title: "Holiday Notice", value: p.startDate && p.endDate ? p.startDate + " – " + p.endDate : "Holiday Schedule",
    valueLabel: "HOLIDAY PERIOD", accent: p.reason || "The madrasa will remain closed during the dates mentioned above.",
    rows: [["Student", p.studentName || "Student"], ["Classes Resume", p.resumeDate || "—"], ["Guardian", p.guardian || "—"]],
    footer: "Classes will resume on the date mentioned above, InshaAllah. Please take note.",
    tag: "IMPORTANT UPDATE",
  };
  if (p.type === "exam") return {
    eyebrow: "ACADEMIC ANNOUNCEMENT", title: p.examName || "Examination Notice", value: p.examDate || "Date to be announced",
    valueLabel: "EXAMINATION DATE", accent: p.examTime ? "Reporting / Examination Time: " + p.examTime : "Please ensure the student arrives on time and is prepared.",
    rows: [["Student", p.studentName || "Student"], ["Guardian", p.guardian || "—"], ["Student ID", p.studentId || "—"]],
    footer: "Please ensure punctuality and proper preparation. We wish the student every success.",
    tag: "EXAMINATION",
  };
  return {
    eyebrow: "OFFICIAL MADRASA ANNOUNCEMENT", title: "Important Notice", value: "PLEASE READ",
    valueLabel: "MESSAGE FOR GUARDIANS", accent: p.customMessage || "Please read the important update from the madrasa.",
    rows: common, footer: "For any clarification, please contact the madrasa office. JazakAllahu Khairan.",
    tag: "GENERAL NOTICE",
  };
}

function roundedRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  const radius = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + w - radius, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + radius);
  ctx.lineTo(x + w, y + h - radius);
  ctx.quadraticCurveTo(x + w, y + h, x + w - radius, y + h);
  ctx.lineTo(x + radius, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number) {
  const words = String(text || "").trim().split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let line = "";
  for (const word of words) {
    const next = line ? line + " " + word : word;
    if (ctx.measureText(next).width <= maxWidth) line = next;
    else {
      if (line) lines.push(line);
      // Break a single long word instead of allowing it to overflow.
      if (ctx.measureText(word).width > maxWidth) {
        let part = "";
        for (const char of word) {
          if (part && ctx.measureText(part + char).width > maxWidth) { lines.push(part); part = char; }
          else part += char;
        }
        line = part;
      } else line = word;
    }
  }
  if (line) lines.push(line);
  return lines;
}

async function loadLogo(): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = "/mmbb-logo.svg";
  });
}

async function renderCard(p: Props) {
  const W = 900, H = 1125, scale = 2;
  const canvas = document.createElement("canvas");
  canvas.width = W * scale;
  canvas.height = H * scale;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Aapke browser me image canvas support available nahi hai.");
  ctx.scale(scale, scale);

  const bg = ctx.createLinearGradient(0, 0, W, H);
  bg.addColorStop(0, "#f7fbf8");
  bg.addColorStop(1, "#edf5ef");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  // Elegant frame and brand header.
  ctx.fillStyle = PALETTE.deep;
  ctx.fillRect(0, 0, W, 18);
  ctx.fillStyle = PALETTE.gold;
  ctx.fillRect(0, 18, W, 5);
  ctx.fillStyle = "#e0eee5";
  ctx.beginPath(); ctx.arc(850, 65, 170, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#f5ead7";
  ctx.beginPath(); ctx.arc(35, 1040, 150, 0, Math.PI * 2); ctx.fill();

  const logo = await loadLogo();
  if (logo) {
    ctx.save();
    ctx.beginPath(); ctx.arc(94, 100, 52, 0, Math.PI * 2); ctx.clip();
    ctx.fillStyle = "#ffffff"; ctx.fillRect(42, 48, 104, 104);
    ctx.drawImage(logo, 48, 54, 92, 92);
    ctx.restore();
  } else {
    ctx.fillStyle = PALETTE.deep;
    ctx.beginPath(); ctx.arc(94, 100, 49, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#ffffff"; ctx.font = "900 25px Arial"; ctx.textAlign = "center";
    ctx.fillText("MMBB", 94, 109); ctx.textAlign = "left";
  }

  ctx.fillStyle = PALETTE.deep;
  ctx.font = "900 21px Arial, sans-serif";
  ctx.fillText("MADRASA MAJMAUL BAHRAIN", 165, 88);
  ctx.fillStyle = PALETTE.ink;
  ctx.font = "900 33px Arial, sans-serif";
  ctx.fillText("BIJOL", 165, 128);
  ctx.fillStyle = PALETTE.muted;
  ctx.font = "600 14px Arial, sans-serif";
  ctx.fillText("OFFICIAL GUARDIAN COMMUNICATION", 165, 155);

  roundedRect(ctx, 650, 70, 190, 48, 24);
  ctx.fillStyle = "#ffffff"; ctx.fill();
  ctx.strokeStyle = "#d5e6db"; ctx.lineWidth = 2; ctx.stroke();
  ctx.fillStyle = PALETTE.green; ctx.font = "900 12px Arial"; ctx.textAlign = "center";
  ctx.fillText(cardData(p).tag, 745, 99); ctx.textAlign = "left";

  const data = cardData(p);
  ctx.fillStyle = PALETTE.green;
  ctx.font = "900 15px Arial, sans-serif";
  ctx.fillText(data.eyebrow, 62, 235);
  ctx.fillStyle = PALETTE.ink;
  ctx.font = "900 48px Arial, sans-serif";
  const titleLines = wrapText(ctx, data.title, 770).slice(0, 2);
  titleLines.forEach((line, i) => ctx.fillText(line, 62, 300 + i * 54));

  const panelY = titleLines.length > 1 ? 405 : 365;
  roundedRect(ctx, 62, panelY, 776, 205, 28);
  const panel = ctx.createLinearGradient(62, panelY, 838, panelY + 205);
  panel.addColorStop(0, "#e6f4eb"); panel.addColorStop(1, "#f5faf6");
  ctx.fillStyle = panel; ctx.fill();
  ctx.strokeStyle = "#cfe4d6"; ctx.lineWidth = 2; ctx.stroke();

  ctx.fillStyle = PALETTE.green; ctx.font = "900 13px Arial";
  ctx.fillText(data.valueLabel, 94, panelY + 43);
  ctx.fillStyle = PALETTE.deep;
  ctx.font = data.value.length > 22 ? "900 29px Arial" : "900 46px Arial";
  const valueLines = wrapText(ctx, data.value, 710).slice(0, 2);
  valueLines.forEach((line, i) => ctx.fillText(line, 94, panelY + 100 + i * 42));
  ctx.fillStyle = PALETTE.muted; ctx.font = "600 16px Arial";
  const accentLines = wrapText(ctx, data.accent, 710).slice(0, 3);
  const accentY = panelY + (valueLines.length > 1 ? 155 : 145);
  accentLines.forEach((line, i) => ctx.fillText(line, 94, accentY + i * 23));

  let y = panelY + 240;
  for (const [label, rawValue] of data.rows) {
    const value = String(rawValue || "—");
    roundedRect(ctx, 62, y, 776, 68, 12);
    ctx.fillStyle = "#ffffff"; ctx.fill();
    ctx.strokeStyle = PALETTE.line; ctx.lineWidth = 1.5; ctx.stroke();
    ctx.fillStyle = "#82948a"; ctx.font = "900 12px Arial";
    ctx.fillText(label.toUpperCase(), 86, y + 40);
    ctx.fillStyle = PALETTE.ink; ctx.font = "900 17px Arial";
    const valueLines = wrapText(ctx, value, 470).slice(0, 2);
    valueLines.forEach((line, i) => ctx.fillText(line, 810 - ctx.measureText(line).width, y + 30 + i * 20));
    y += 78;
  }

  const footerY = Math.min(Math.max(y + 28, 900), 970);
  ctx.strokeStyle = "#cbded1"; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(62, footerY); ctx.lineTo(838, footerY); ctx.stroke();
  ctx.fillStyle = PALETTE.muted; ctx.font = "600 15px Arial";
  wrapText(ctx, data.footer, 776).slice(0, 3).forEach((line, i) => ctx.fillText(line, 62, footerY + 32 + i * 23));
  ctx.fillStyle = PALETTE.green; ctx.font = "900 16px Arial";
  ctx.fillText("JazakAllahu Khairan", 62, 1065);
  ctx.fillStyle = "#718279"; ctx.font = "700 12px Arial";
  ctx.fillText("Madrasa Majmaul Bahrain Bijol", 620, 1065);
  ctx.fillStyle = PALETTE.gold; ctx.fillRect(62, 1090, 776, 4);

  return canvas;
}

export default function WhatsAppImageCard(props: Props) {
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState("");
  const [preview, setPreview] = useState("");
  const data = cardData(props);

  useEffect(() => {
    let active = true;
    renderCard(props).then((canvas) => {
      if (active) setPreview(canvas.toDataURL("image/png"));
    }).catch((e) => {
      if (active) setResult(e?.message || "Card preview load nahi ho saka.");
    });
    return () => { active = false; };
  }, [props.type, props.studentId, props.studentName, props.guardian, props.mobile, props.amount, props.feeMonth, props.receipt, props.startDate, props.endDate, props.resumeDate, props.reason, props.examName, props.examDate, props.examTime, props.customMessage, props.due, props.message]);

  async function createAndShare() {
    setBusy(true);
    setResult("");
    try {
      const canvas = await renderCard(props);
      const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/png"));
      if (!blob) throw new Error("PNG image create nahi ho saki. Browser ko refresh karke dobara try karein.");
      const safeName = (props.studentName || "student").replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "") || "student";
      const file = new File([blob], "MMBB-" + props.type + "-" + safeName + ".png", { type: "image/png" });
      const canShare = typeof navigator !== "undefined" && !!navigator.share && !!navigator.canShare && navigator.canShare({ files: [file] });
      if (canShare) {
        try {
          await navigator.share({ files: [file], title: data.title, text: "Madrasa Majmaul Bahrain Bijol" });
          setResult("Card share sheet me ready hai. WhatsApp select karke recipient ko bhej dein.");
          return;
        } catch (shareError: any) {
          if (shareError?.name === "AbortError") throw shareError;
          // If file sharing is unavailable, fall back to a direct PNG download.
        }
      }
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = file.name;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 1500);
      setResult("Professional PNG card download ho gaya. WhatsApp me attach karke Send karein.");
    } catch (e: any) {
      if (e?.name === "AbortError") setResult("Share cancel kiya gaya.");
      else setResult(e?.message || "Professional card generate nahi ho saka.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="overflow-hidden rounded-3xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-white p-4 sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-emerald-950"><FiImage className="text-xl" /><div><p className="text-sm font-black">Professional {data.tag} Card</p><p className="text-xs text-emerald-800">Personalized branded PNG · 4:5 format</p></div></div>
        <span className="rounded-full bg-white px-3 py-1 text-[10px] font-black uppercase tracking-wider text-emerald-800">MMBB Official</span>
      </div>
      <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 p-2">
        {preview ? <img src={preview} alt={data.title + " card preview"} className="mx-auto block max-h-[520px] w-auto max-w-full rounded-xl object-contain shadow-lg" /> : <div className="flex min-h-48 items-center justify-center text-sm font-bold text-slate-500">Preparing professional card preview…</div>}
      </div>
      {result && <p className="mt-3 flex items-start gap-2 rounded-xl bg-white p-3 text-xs font-bold text-emerald-800"><FiCheckCircle className="mt-0.5 shrink-0" />{result}</p>}
      <button type="button" onClick={createAndShare} disabled={busy} className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-800 px-5 py-3.5 text-sm font-black text-white shadow-sm transition hover:bg-emerald-900 disabled:cursor-wait disabled:opacity-60">
        {busy ? <FiImage className="animate-pulse" /> : <FiShare2 />} {busy ? "Card taiyar ho raha hai…" : "Create & Share / Download Card"} <FiDownload />
      </button>
    </section>
  );
}
