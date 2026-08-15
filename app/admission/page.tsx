"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import Footer from "../components/Footer";
import { supabase } from "../lib/supabase/client";

type FormData = {
  full_name: string;
  date_of_birth: string;
  previous_education: string;
  father_name: string;
  mother_name: string;
  guardian_name: string;
  guardian_relation: string;
  phone: string;
  alternate_phone: string;
  occupation: string;
  course: string;
};

const initialFormData: FormData = {
  full_name: "",
  date_of_birth: "",
  previous_education: "",
  father_name: "",
  mother_name: "",
  guardian_name: "",
  guardian_relation: "",
  phone: "",
  alternate_phone: "",
  occupation: "",
  course: "",
};

const inputClass =
  "mt-2 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3.5 font-medium text-gray-900 outline-none transition focus:border-green-600 focus:bg-white focus:ring-2 focus:ring-green-100";

export default function AdmissionPage() {
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [studentPhoto, setStudentPhoto] = useState<File | null>(null);
  const [identityProof, setIdentityProof] = useState<File | null>(null);
  const [identityProofType, setIdentityProofType] = useState("");
  const [declarationAccepted, setDeclarationAccepted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [applicationNumber, setApplicationNumber] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((current) => ({ ...current, [name]: value }));
  };

  function validateFile(file: File | null, photo = false) {
    if (!file) {
      throw new Error(photo ? "Student photo is required." : "Identity proof is required.");
    }

    const allowed = photo
      ? ["image/jpeg", "image/png", "image/webp"]
      : ["image/jpeg", "image/png", "image/webp", "application/pdf"];

    if (!allowed.includes(file.type)) {
      throw new Error(
        photo
          ? "Student photo must be JPG, PNG or WEBP."
          : "Identity proof must be JPG, PNG, WEBP or PDF."
      );
    }

    if (file.size > 5 * 1024 * 1024) {
      throw new Error(`"${file.name}" is larger than 5 MB.`);
    }
  }

  async function uploadDocument(file: File, folder: string, admissionId: string) {
    const extension = file.name.split(".").pop()?.toLowerCase() || "file";
    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}.${extension}`;
    const path = `${folder}/${admissionId}/${fileName}`;

    const { error } = await supabase.storage
      .from("admission-documents")
      .upload(path, file, {
        cacheControl: "3600",
        upsert: false,
        contentType: file.type,
      });

    if (error) {
      throw new Error(`Document upload failed: ${error.message}`);
    }

    return path;
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setErrorMessage("");
    setSuccessMessage("");
    setApplicationNumber("");

    try {
      const clean = Object.fromEntries(
        Object.entries(formData).map(([key, value]) => [key, value.trim()])
      ) as FormData;

      if (!clean.full_name) throw new Error("Student name is required.");
      if (!clean.date_of_birth) throw new Error("Date of birth is required.");
      if (!clean.father_name) throw new Error("Father's name is required.");
      if (!clean.guardian_name) throw new Error("Guardian name is required.");
      if (!clean.guardian_relation) throw new Error("Guardian relationship is required.");
      if (!/^\d{10}$/.test(clean.phone)) throw new Error("Please enter a valid 10-digit Mobile Number 1.");
      if (clean.alternate_phone && !/^\d{10}$/.test(clean.alternate_phone)) {
        throw new Error("Please enter a valid 10-digit Mobile Number 2.");
      }
      if (!clean.course) throw new Error("Please select a course.");
      if (!identityProofType) throw new Error("Please select the identity proof type.");
      if (!declarationAccepted) throw new Error("Please accept the declaration before submitting.");

      validateFile(studentPhoto, true);
      validateFile(identityProof, false);

      const generatedApplicationNumber =
        `MMBB-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;

      /*
       * IMPORTANT:
       * The existing Supabase admissions table is kept untouched.
       * Only columns already used by the working admin panel are written
       * directly to the table. The additional form details are stored in
       * the existing message column so no schema change is required.
       */
      const initialMessage = [
        `Application Number: ${generatedApplicationNumber}`,
        `Father's Name: ${clean.father_name}`,
        `Mother's Name: ${clean.mother_name || "Not provided"}`,
        `Guardian Name: ${clean.guardian_name}`,
        `Guardian Relationship: ${clean.guardian_relation}`,
        `Mobile Number 1: ${clean.phone}`,
        `Mobile Number 2: ${clean.alternate_phone || "Not provided"}`,
        `Parent Occupation: ${clean.occupation || "Not provided"}`,
        `Previous Education: ${clean.previous_education || "Not provided"}`,
        `Identity Proof Type: ${identityProofType}`,
      ].join("\n");

      const { data: admission, error: insertError } = await supabase
        .from("admissions")
        .insert({
          student_name: clean.full_name,
          guardian_name: clean.guardian_name,
          mobile: clean.phone,
          email: null,
          course: clean.course,
          message: initialMessage,
          date_of_birth: clean.date_of_birth,
          status: "new",
        })
        .select("id")
        .single();

      if (insertError) {
        console.error("Supabase admission insert error:", insertError);
        throw new Error(insertError.message);
      }

      if (!admission?.id) {
        throw new Error("Admission application ID could not be generated.");
      }

      const studentPhotoPath = await uploadDocument(
        studentPhoto as File,
        "student-photos",
        admission.id
      );

      const identityProofPath = await uploadDocument(
        identityProof as File,
        "id-documents",
        admission.id
      );

      const finalMessage = [
        initialMessage,
        `Student Photo: ${studentPhotoPath}`,
        `Identity Proof: ${identityProofPath}`,
      ].join("\n");

      const { error: messageUpdateError } = await supabase
        .from("admissions")
        .update({ message: finalMessage })
        .eq("id", admission.id);

      if (messageUpdateError) {
        console.error("Admission details update error:", messageUpdateError);
        throw new Error(messageUpdateError.message);
      }

      setApplicationNumber(generatedApplicationNumber);
      setSuccessMessage(
        "JazakAllahu Khairan! Your admission application has been submitted successfully. Please save your application number."
      );

      setFormData(initialFormData);
      setStudentPhoto(null);
      setIdentityProof(null);
      setIdentityProofType("");
      setDeclarationAccepted(false);

      document.querySelectorAll('input[type="file"]').forEach((input) => {
        (input as HTMLInputElement).value = "";
      });

      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (error) {
      console.error("Admission form error:", error);
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Admission form submit nahi ho saka. Please dobara try karein."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <section className="relative overflow-hidden bg-gradient-to-br from-green-950 via-green-800 to-green-600 px-6 py-24 text-white sm:py-28">
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative z-10 mx-auto max-w-5xl text-center">
          <p className="text-sm font-bold uppercase tracking-[5px] text-green-200 sm:text-base">
            Online Admission
          </p>
          <h1 className="mt-5 text-4xl font-extrabold sm:text-5xl md:text-6xl">
            Apply for Admission
          </h1>
          <p className="mx-auto mt-5 max-w-3xl text-base leading-8 text-green-100 sm:text-lg">
            Please fill in the form below carefully. All information should be accurate.
          </p>
        </div>
      </section>

      <section id="apply" className="bg-gray-50 px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        <div className="mx-auto max-w-5xl">
          {successMessage && (
            <div className="mb-8 rounded-3xl border border-green-200 bg-green-50 p-6 text-center shadow-sm">
              <p className="text-lg font-bold text-green-800">✅ {successMessage}</p>
              <div className="mt-4 inline-flex rounded-2xl bg-white px-6 py-4 shadow-sm">
                <span className="mr-3 font-semibold text-gray-600">Application Number:</span>
                <strong className="text-green-700">{applicationNumber}</strong>
              </div>
            </div>
          )}

          {errorMessage && (
            <div className="mb-8 rounded-2xl border border-red-200 bg-red-50 p-5 text-red-700 shadow-sm">
              <p className="font-bold">❌ {errorMessage}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="overflow-hidden rounded-3xl bg-white shadow-xl ring-1 ring-gray-100">
              <div className="border-b border-gray-100 bg-green-50 px-6 py-6 sm:px-8">
                <p className="text-sm font-bold uppercase tracking-[3px] text-green-600">Section 01</p>
                <h2 className="mt-2 text-2xl font-extrabold text-gray-900">Student Information</h2>
                <p className="mt-1 text-sm text-gray-500">Basic student details.</p>
              </div>
              <div className="grid gap-6 p-6 sm:p-8 md:grid-cols-2">
                <div className="md:col-span-2">
                  <label className="font-bold text-gray-800">Student Name *</label>
                  <input name="full_name" value={formData.full_name} onChange={handleChange} required className={inputClass} placeholder="Enter student's full name" />
                </div>
                <div>
                  <label className="font-bold text-gray-800">Date of Birth *</label>
                  <input name="date_of_birth" type="date" value={formData.date_of_birth} onChange={handleChange} required className={inputClass} />
                </div>
                <div>
                  <label className="font-bold text-gray-800">Previous Education</label>
                  <input name="previous_education" value={formData.previous_education} onChange={handleChange} className={inputClass} placeholder="School / Madrasa / Class" />
                </div>
              </div>
            </div>

            <div className="overflow-hidden rounded-3xl bg-white shadow-xl ring-1 ring-gray-100">
              <div className="border-b border-gray-100 bg-green-50 px-6 py-6 sm:px-8">
                <p className="text-sm font-bold uppercase tracking-[3px] text-green-600">Section 02</p>
                <h2 className="mt-2 text-2xl font-extrabold text-gray-900">Parent / Guardian Information</h2>
                <p className="mt-1 text-sm text-gray-500">Family and contact details.</p>
              </div>
              <div className="grid gap-6 p-6 sm:p-8 md:grid-cols-2">
                <div>
                  <label className="font-bold text-gray-800">Father's Name *</label>
                  <input name="father_name" value={formData.father_name} onChange={handleChange} required className={inputClass} />
                </div>
                <div>
                  <label className="font-bold text-gray-800">Mother's Name</label>
                  <input name="mother_name" value={formData.mother_name} onChange={handleChange} className={inputClass} />
                </div>
                <div>
                  <label className="font-bold text-gray-800">Guardian Name *</label>
                  <input name="guardian_name" value={formData.guardian_name} onChange={handleChange} required className={inputClass} />
                </div>
                <div>
                  <label className="font-bold text-gray-800">Relationship *</label>
                  <select name="guardian_relation" value={formData.guardian_relation} onChange={handleChange} required className={inputClass}>
                    <option value="">Select relationship</option>
                    <option value="Father">Father</option>
                    <option value="Mother">Mother</option>
                    <option value="Brother">Brother</option>
                    <option value="Uncle">Uncle</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-gray-800">Mobile Number 1 *</label>
                  <input name="phone" type="tel" inputMode="numeric" maxLength={10} value={formData.phone} onChange={handleChange} required className={inputClass} placeholder="10-digit mobile number" />
                </div>
                <div>
                  <label className="font-bold text-gray-800">Mobile Number 2</label>
                  <input name="alternate_phone" type="tel" inputMode="numeric" maxLength={10} value={formData.alternate_phone} onChange={handleChange} className={inputClass} placeholder="Optional" />
                </div>
                <div className="md:col-span-2">
                  <label className="font-bold text-gray-800">Parent Occupation</label>
                  <input name="occupation" value={formData.occupation} onChange={handleChange} className={inputClass} placeholder="Occupation" />
                </div>
              </div>
            </div>

            <div className="overflow-hidden rounded-3xl bg-white shadow-xl ring-1 ring-gray-100">
              <div className="border-b border-gray-100 bg-green-50 px-6 py-6 sm:px-8">
                <p className="text-sm font-bold uppercase tracking-[3px] text-green-600">Section 03</p>
                <h2 className="mt-2 text-2xl font-extrabold text-gray-900">Address Information</h2>
              </div>
              <div className="p-6 sm:p-8">
                <p className="rounded-2xl bg-green-50 p-5 leading-7 text-gray-700">
                  Address details will be collected by the office after initial application submission if required.
                </p>
              </div>
            </div>

            <div className="overflow-hidden rounded-3xl bg-white shadow-xl ring-1 ring-gray-100">
              <div className="border-b border-gray-100 bg-green-50 px-6 py-6 sm:px-8">
                <p className="text-sm font-bold uppercase tracking-[3px] text-green-600">Section 04</p>
                <h2 className="mt-2 text-2xl font-extrabold text-gray-900">Course Selection</h2>
                <p className="mt-1 text-sm text-gray-500">Select the course for which you are applying.</p>
              </div>
              <div className="p-6 sm:p-8">
                <label className="font-bold text-gray-800">Select Course *</label>
                <select name="course" value={formData.course} onChange={handleChange} required className={inputClass}>
                  <option value="">Select a course</option>
                  <option value="Nazrah & Qirat">Nazrah & Qirat</option>
                  <option value="Hifz-ul-Quran">Hifz-ul-Quran</option>
                  <option value="Darse Nizami">Darse Nizami</option>
                  <option value="Islamic & Modern Education">Islamic & Modern Education</option>
                </select>
              </div>
            </div>

            <div className="overflow-hidden rounded-3xl bg-white shadow-xl ring-1 ring-gray-100">
              <div className="border-b border-gray-100 bg-green-50 px-6 py-6 sm:px-8">
                <p className="text-sm font-bold uppercase tracking-[3px] text-green-600">Section 05</p>
                <h2 className="mt-2 text-2xl font-extrabold text-gray-900">Student Photo & Identity Proof</h2>
                <p className="mt-1 text-sm text-gray-500">Both are mandatory. Maximum 5 MB per file.</p>
              </div>
              <div className="grid gap-6 p-6 sm:p-8 md:grid-cols-2">
                <div className="rounded-2xl border border-green-200 bg-green-50 p-5">
                  <label className="font-bold text-gray-800">Student Photo *</label>
                  <input type="file" accept=".jpg,.jpeg,.png,.webp" required onChange={(e) => setStudentPhoto(e.target.files?.[0] || null)} className="mt-3 block w-full rounded-xl border border-gray-300 bg-white p-3 text-sm" />
                  {studentPhoto && <p className="mt-2 text-xs font-semibold text-green-700">✓ {studentPhoto.name}</p>}
                </div>
                <div className="rounded-2xl border border-green-200 bg-green-50 p-5">
                  <label className="font-bold text-gray-800">Identity Proof Type *</label>
                  <select value={identityProofType} onChange={(e) => setIdentityProofType(e.target.value)} required className={inputClass}>
                    <option value="">Select proof type</option>
                    <option value="Aadhaar Card">Aadhaar Card</option>
                    <option value="Birth Certificate">Birth Certificate</option>
                    <option value="Other Valid Identity Proof">Other Valid Identity Proof</option>
                  </select>
                  <label className="mt-5 block font-bold text-gray-800">Upload Identity Proof *</label>
                  <input type="file" accept=".jpg,.jpeg,.png,.webp,.pdf" required onChange={(e) => setIdentityProof(e.target.files?.[0] || null)} className="mt-3 block w-full rounded-xl border border-gray-300 bg-white p-3 text-sm" />
                  {identityProof && <p className="mt-2 text-xs font-semibold text-green-700">✓ {identityProof.name}</p>}
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-xl sm:p-8">
              <label className="flex cursor-pointer items-start gap-3">
                <input type="checkbox" checked={declarationAccepted} onChange={(e) => setDeclarationAccepted(e.target.checked)} className="mt-1 h-5 w-5" />
                <span className="text-sm leading-7 text-gray-700">
                  I hereby declare that the information provided in this admission form is true and correct. I confirm that my parent/guardian has consented to this application.
                </span>
              </label>
              <button type="submit" disabled={loading} className="mt-7 w-full rounded-xl bg-green-700 px-8 py-4 text-lg font-bold text-white shadow-lg transition hover:bg-green-800 disabled:cursor-not-allowed disabled:opacity-60">
                {loading ? "Submitting Application..." : "Submit Admission Application"}
              </button>
            </div>
          </form>

          <div className="mt-12 text-center">
            <Link href="/" className="font-bold text-green-700 hover:text-green-800">← Back to Website</Link>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
