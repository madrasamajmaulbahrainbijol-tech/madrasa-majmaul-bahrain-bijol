import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Link from "next/link";
import { publicSupabase } from "../lib/supabase/public";

export const dynamic = "force-dynamic";

export default async function DonatePage() {
  const { data } = await publicSupabase.from("donation_settings").select("*").limit(1).maybeSingle();
  const s = data || {
    quran_reference: "Quran 2:261", quran_text: "The example of those who spend their wealth in the way of Allah is like a seed that grows seven ears; in every ear are one hundred grains.",
    hadith_reference: "Sahih Muslim", hadith_text: "When a person dies, all his deeds end except three: Sadaqah Jariyah, beneficial knowledge, or a righteous child who prays for him.",
    upi_id: "Coming Soon", account_holder: "Madrasa Majmaul Bahrain Bijol", bank_name: "", account_number: "", ifsc_code: "", qr_code_url: null,
  };

  return (
    <>
      <Navbar />
      <main className="overflow-hidden bg-white">
        <section className="relative flex min-h-[76vh] items-center justify-center bg-gradient-to-br from-green-950 via-green-800 to-emerald-700 px-6 pb-24 pt-32 text-white">
          <div className="pointer-events-none absolute inset-0 opacity-20 [background-image:radial-gradient(circle_at_20%_20%,white_1px,transparent_1px)] [background-size:28px_28px]" />
          <div className="pointer-events-none absolute -left-24 top-24 h-72 w-72 rounded-full bg-emerald-300/10 blur-3xl" />
          <div className="pointer-events-none absolute -right-20 bottom-0 h-96 w-96 rounded-full bg-lime-200/10 blur-3xl" />
          <div className="premium-reveal relative z-10 max-w-5xl text-center">
            <span className="inline-flex rounded-full border border-white/20 bg-white/10 px-5 py-2 text-xs font-bold uppercase tracking-[0.28em] text-green-100 shadow-lg backdrop-blur-md">Support Our Mission</span>
            <h1 className="mt-7 text-4xl font-black leading-[1.08] tracking-tight md:text-6xl lg:text-7xl">Donate for Education<br /><span className="text-green-200">&amp; Sadaqah-e-Jariyah</span></h1>
            <p className="mx-auto mt-7 max-w-3xl text-base leading-8 text-green-50/90 md:text-lg">Your contribution helps us provide quality Islamic and modern education, support deserving students, and develop our madrasa for future generations.</p>
            <div className="mt-10 flex flex-col justify-center gap-4 sm:flex-row">
              <a href="#donate" className="rounded-2xl bg-white px-8 py-4 text-base font-extrabold text-green-800 shadow-xl hover:-translate-y-1 hover:shadow-2xl">Donate Now</a>
              <Link href="/contact" className="rounded-2xl border border-white/50 bg-white/5 px-8 py-4 text-base font-extrabold text-white backdrop-blur-sm hover:-translate-y-1 hover:bg-white hover:text-green-800">Contact Office</Link>
            </div>
          </div>
        </section>

        <section className="relative bg-gradient-to-b from-white via-green-50/30 to-white py-24">
          <div className="mx-auto max-w-7xl px-6">
            <div className="premium-reveal text-center">
              <p className="text-xs font-black uppercase tracking-[0.3em] text-green-700">The impact of your support</p>
              <h2 className="mt-4 text-4xl font-black tracking-tight text-gray-950 md:text-5xl">Why Your Donation Matters</h2>
              <div className="mx-auto mt-6 h-1.5 w-20 rounded-full bg-gradient-to-r from-green-700 to-emerald-400" />
              <p className="mx-auto mt-6 max-w-3xl text-base leading-8 text-gray-600 md:text-lg">Every contribution supports students, teachers, educational resources and the development of Madrasa Majmaul Bahrain Bijol.</p>
            </div>

            <div className="mt-14 grid gap-7 md:grid-cols-3">
              {[
                ["🎓", "Student Support", "Help deserving students receive education, books and essential facilities."],
                ["🕌", "Madrasa Development", "Contribute towards classrooms, library and infrastructure development."],
                ["🤲", "Sadaqah-e-Jariyah", "Support Islamic education and help its benefit continue for generations."],
              ].map(([icon, title, text]) => (
                <article key={title} className="premium-glow rounded-[2rem] border border-green-100 bg-white p-8 shadow-xl hover:-translate-y-2 hover:shadow-2xl">
                  <div className="premium-float flex h-16 w-16 items-center justify-center rounded-2xl bg-green-50 text-4xl shadow-inner">{icon}</div>
                  <h3 className="mt-7 text-2xl font-black text-green-800">{title}</h3>
                  <p className="mt-4 text-[15px] leading-8 text-gray-600">{text}</p>
                </article>
              ))}
            </div>

            <div className="mt-24 grid gap-8 lg:grid-cols-[0.95fr_1.05fr]">
              <article className="premium-glow relative overflow-hidden rounded-[2rem] border border-amber-100 bg-gradient-to-br from-amber-50 via-white to-green-50 p-8 shadow-xl md:p-10">
                <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-green-100/60 blur-2xl" />
                <div className="relative">
                  <span className="text-xs font-black uppercase tracking-[0.25em] text-green-700">Guidance &amp; Inspiration</span>
                  <h2 className="mt-3 text-3xl font-black tracking-tight text-gray-950 md:text-4xl">Quran &amp; Hadith</h2>
                  <div className="mt-8 space-y-6">
                    <blockquote className="rounded-2xl border-l-4 border-green-700 bg-white/80 p-6 shadow-sm">
                      <p className="text-sm font-black uppercase tracking-wider text-green-700">{s.quran_reference || "Quran"}</p>
                      <p className="mt-3 text-[16px] leading-8 text-gray-700">“{s.quran_text || ""}”</p>
                    </blockquote>
                    <blockquote className="rounded-2xl border-l-4 border-emerald-500 bg-white/80 p-6 shadow-sm">
                      <p className="text-sm font-black uppercase tracking-wider text-green-700">{s.hadith_reference || "Hadith"}</p>
                      <p className="mt-3 text-[16px] leading-8 text-gray-700">“{s.hadith_text || ""}”</p>
                    </blockquote>
                  </div>
                </div>
              </article>

              <article id="donate" className="premium-glow rounded-[2rem] border border-green-100 bg-white p-8 shadow-xl md:p-10">
                <div className="flex items-start justify-between gap-5">
                  <div>
                    <span className="text-xs font-black uppercase tracking-[0.25em] text-green-700">Secure giving details</span>
                    <h2 className="mt-3 text-3xl font-black tracking-tight text-gray-950 md:text-4xl">Donation Details</h2>
                  </div>
                  <span className="hidden rounded-full bg-green-50 px-4 py-2 text-xs font-bold text-green-800 sm:inline-flex">Official Account</span>
                </div>

                <div className="mt-8 grid gap-4 sm:grid-cols-2">
                  <div className="rounded-2xl bg-green-50/80 p-5 sm:col-span-2"><p className="text-xs font-bold uppercase tracking-wider text-gray-500">UPI ID</p><p className="mt-2 break-all text-lg font-black text-green-800">{s.upi_id || "Not available"}</p></div>
                  <div className="rounded-2xl border border-gray-100 bg-gray-50/70 p-5"><p className="text-xs font-bold uppercase tracking-wider text-gray-500">Account Holder</p><p className="mt-2 font-bold text-gray-800">{s.account_holder || "Not available"}</p></div>
                  {s.bank_name && <div className="rounded-2xl border border-gray-100 bg-gray-50/70 p-5"><p className="text-xs font-bold uppercase tracking-wider text-gray-500">Bank Name</p><p className="mt-2 font-bold text-gray-800">{s.bank_name}</p></div>}
                  {s.account_number && <div className="rounded-2xl border border-gray-100 bg-gray-50/70 p-5"><p className="text-xs font-bold uppercase tracking-wider text-gray-500">Account Number</p><p className="mt-2 break-all font-bold text-gray-800">{s.account_number}</p></div>}
                  {s.ifsc_code && <div className="rounded-2xl border border-gray-100 bg-gray-50/70 p-5"><p className="text-xs font-bold uppercase tracking-wider text-gray-500">IFSC Code</p><p className="mt-2 font-bold text-gray-800">{s.ifsc_code}</p></div>}
                </div>

                <div className="mt-8 rounded-[1.75rem] border border-green-100 bg-gradient-to-b from-green-50 to-white p-5 shadow-inner">
                  <div className="text-center">
                    <p className="text-xs font-black uppercase tracking-[0.22em] text-green-800">Scan to Donate</p>
                    <p className="mt-2 text-sm text-gray-500">Use your preferred UPI app to make a contribution.</p>
                  </div>
                  <div className="mx-auto mt-5 flex aspect-square w-full max-w-[300px] items-center justify-center overflow-hidden rounded-2xl border border-green-100 bg-white p-5 shadow-lg">
                    {s.qr_code_url ? (
                      <img src={s.qr_code_url} alt="Donation QR Code" className="block h-full w-full object-contain object-center" />
                    ) : (
                      <div className="text-center"><div className="text-5xl">📱</div><h3 className="mt-3 font-bold text-green-800">QR Code</h3><p className="mt-2 text-sm text-gray-500">QR code will be updated by the madrasa administration.</p></div>
                    )}
                  </div>
                </div>
              </article>
            </div>

            <section className="premium-glow relative mt-20 overflow-hidden rounded-[2rem] bg-gradient-to-br from-green-900 via-green-800 to-emerald-700 px-7 py-14 text-center text-white shadow-2xl md:px-12 md:py-16">
              <div className="pointer-events-none absolute -left-16 -top-16 h-48 w-48 rounded-full bg-white/10 blur-3xl" />
              <div className="relative">
                <p className="text-xs font-black uppercase tracking-[0.28em] text-green-200">Together we can make a difference</p>
                <h2 className="mt-4 text-3xl font-black tracking-tight md:text-5xl">Be a Part of This Noble Mission</h2>
                <p className="mx-auto mt-5 max-w-3xl text-base leading-8 text-green-50/90 md:text-lg">Your generosity helps educate students, strengthen Islamic values, and build a better future for our community. Every contribution is valuable and appreciated.</p>
                <div className="mt-9 flex flex-col items-center justify-center gap-4 sm:flex-row">
                  <Link href="/admission" className="rounded-2xl bg-white px-9 py-4 font-extrabold text-green-800 shadow-xl hover:-translate-y-1 hover:shadow-2xl">Apply for Admission</Link>
                  <a href="/#contact" className="rounded-2xl border border-white/50 bg-white/5 px-9 py-4 font-extrabold text-white backdrop-blur-sm hover:-translate-y-1 hover:bg-white hover:text-green-800">Contact Office</a>
                </div>
              </div>
            </section>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
