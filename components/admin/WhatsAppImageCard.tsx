"use client";

import { useState } from "react";
import { FiImage, FiShare2 } from "react-icons/fi";

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

function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number) {
  const words = String(text || "").split(/\s+/);
  const lines: string[] = [];
  let line = "";
  for (const word of words) {
    const test = line ? line + " " + word : word;
    if (ctx.measureText(test).width <= maxWidth || !line) line = test;
    else { lines.push(line); line = word; }
  }
  if (line) lines.push(line);
  return lines;
}

async function loadLogo() {
  const img = new Image();
  img.crossOrigin = "anonymous";
  img.src = "/mmbb-logo.svg";
  await new Promise<void>((resolve, reject) => {
    img.onload = () => resolve();
    img.onerror = () => reject(new Error("Madrasa logo load nahi ho saka."));
  });
  return img;
}

async function renderCard(p: Props) {
  const W = 800, H = 1000;
  const canvas = document.createElement("canvas");
  canvas.width = W * 2;
  canvas.height = H * 2;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas available nahi hai.");
  ctx.scale(2, 2);

  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, W, H);

  ctx.fillStyle = "#047857";
  ctx.fillRect(0, 0, W, 12);

  ctx.fillStyle = "#ecfdf5";
  ctx.beginPath(); ctx.arc(760, 50, 150, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#fffbeb";
  ctx.beginPath(); ctx.arc(35, 890, 125, 0, Math.PI * 2); ctx.fill();

  const logo = await loadLogo();
  ctx.drawImage(logo, 48, 42, 70, 70);

  ctx.fillStyle = "#047857";
  ctx.font = "900 16px Arial, sans-serif";
  ctx.fillText("MADRASA MAJMAUL BAHRAIN", 132, 65);
  ctx.fillStyle = "#0f172a";
  ctx.font = "900 24px Arial, sans-serif";
  ctx.fillText("Bijol", 132, 94);

  ctx.fillStyle = "#ecfdf5";
  ctx.strokeStyle = "#d1fae5";
  ctx.lineWidth = 2;
  ctx.beginPath(); ctx.roundRect(590, 50, 160, 40, 20); ctx.fill(); ctx.stroke();
  ctx.fillStyle = "#065f46";
  ctx.font = "900 11px Arial, sans-serif";
  ctx.fillText("OFFICIAL NOTICE", 616, 75);

  const data = cardData(p);
  ctx.fillStyle = "#047857";
  ctx.font = "900 13px Arial, sans-serif";
  ctx.fillText(data.eyebrow, 48, 175);
  ctx.fillStyle = "#0f172a";
  ctx.font = "900 42px Arial, sans-serif";
  ctx.fillText(data.title, 48, 225);

  ctx.fillStyle = "#ecfdf5";
  ctx.strokeStyle = "#d1fae5";
  ctx.lineWidth = 2;
  ctx.beginPath(); ctx.roundRect(48, 255, 704, 165, 24); ctx.fill(); ctx.stroke();

  ctx.fillStyle = "#047857";
  ctx.font = "900 11px Arial, sans-serif";
  ctx.fillText("IMPORTANT", 72, 285);
  ctx.fillStyle = "#064e3b";
  ctx.font = "900 34px Arial, sans-serif";
  ctx.fillText(data.value, 72, 328);

  ctx.fillStyle = "#475569";
  ctx.font = "600 15px Arial, sans-serif";
  wrapText(ctx, data.accent, 650).slice(0, 3).forEach((line, i) => ctx.fillText(line, 72, 360 + i * 22));

  let y = 450;
  for (const [label, value] of data.rows) {
    ctx.fillStyle = "#ffffff";
    ctx.strokeStyle = "#e2e8f0";
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.roundRect(48, y, 704, 58, 0); ctx.fill(); ctx.stroke();
    ctx.fillStyle = "#94a3b8";
    ctx.font = "700 11px Arial, sans-serif";
    ctx.fillText(label.toUpperCase(), 68, y + 35);
    ctx.fillStyle = "#1e293b";
    ctx.font = "900 14px Arial, sans-serif";
    const valueLines = wrapText(ctx, value, 430).slice(0, 2);
    valueLines.forEach((line, i) => ctx.fillText(line, 735 - ctx.measureText(line).width, y + 28 + i * 16));
    y += 58;
  }

  const footerY = Math.max(y + 30, 680);
  ctx.strokeStyle = "#e2e8f0";
  ctx.beginPath(); ctx.moveTo(48, footerY); ctx.lineTo(752, footerY); ctx.stroke();

  ctx.fillStyle = "#475569";
  ctx.font = "600 14px Arial, sans-serif";
  const footerLines = wrapText(ctx, data.footer, 704).slice(0, 4);
  footerLines.forEach((line, i) => ctx.fillText(line, 48, footerY + 30 + i * 21));

  ctx.fillStyle = "#047857";
  ctx.font = "900 13px Arial, sans-serif";
  ctx.fillText("JazakAllahu Khairan", 48, 910);
  ctx.fillStyle = "#94a3b8";
  ctx.font = "600 11px Arial, sans-serif";
  ctx.fillText("For your cooperation and support", 48, 930);
  ctx.fillStyle = "#0f172a";
  ctx.font = "900 12px Arial, sans-serif";
  ctx.fillText("Madrasa Majmaul Bahrain", 570, 910);
  ctx.fillStyle = "#94a3b8";
  ctx.font = "600 11px Arial, sans-serif";
  ctx.fillText("Bijol", 705, 930);

  return canvas;
}

export default function WhatsAppImageCard(props: Props) {
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState("");
  const data = cardData(props);

  async function createAndShare() {
    setBusy(true);
    setResult("");
    try {
      const canvas = await renderCard(props);
      const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/png", 1));
      if (!blob) throw new Error("Image generate nahi ho saki.");
      const safeName = props.studentName.replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "") || "student";
      const file = new File([blob], "MMBB-" + props.type + "-" + safeName + ".png", { type: "image/png" });
      const canShare = typeof navigator !== "undefined" && !!navigator.share && !!navigator.canShare && navigator.canShare({ files: [file] });
      if (canShare) {
        await navigator.share({ files: [file], title: "Madrasa Majmaul Bahrain Bijol", text: "Madrasa Majmaul Bahrain Bijol" });
        setResult("Professional card share sheet me ready hai.");
      } else {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = file.name;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
        setResult("Professional card download ho gaya. WhatsApp me image attach karke Send karein.");
      }
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
      <div className="mt-3 rounded-2xl border border-slate-200 bg-slate-100 p-3">
        <div className="mx-auto max-w-[520px] rounded-xl bg-white p-2">
          <div className="flex min-h-[420px] flex-col items-center justify-center rounded-xl border border-dashed border-emerald-200 bg-white p-6 text-center">
            <FiImage className="text-3xl text-emerald-700" />
            <p className="mt-3 text-sm font-black text-slate-800">{data.title}</p>
            <p className="mt-1 text-xs text-slate-500">Professional branded PNG preview will be generated.</p>
          </div>
        </div>
      </div>
      {result && <p className="mt-3 rounded-xl bg-white p-3 text-xs font-bold text-emerald-800">{result}</p>}
      <button type="button" onClick={createAndShare} disabled={busy} className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-700 px-5 py-3 text-sm font-black text-white hover:bg-emerald-800 disabled:opacity-60"><FiShare2 />{busy ? "Card bana raha hoon..." : "Create & Share Professional Card"}</button>
    </div>
  );
}
