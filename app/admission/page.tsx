"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import Footer from "../components/Footer";
import { supabase } from "../lib/supabase/client";

type FormData = {
  // ================================
  // STUDENT INFORMATION
  // ================================
  full_name: string;
  date_of_birth: string;
  gender: string;
  place_of_birth: string;
  nationality: string;
  previous_school: string;
  previous_class: string;
  quran_education: string;

  // ================================
  // PARENT / GUARDIAN
  // ================================
  father_name: string;
  mother_name: string;
  guardian_name: string;
  guardian_relation: string;
  phone: string;
  whatsapp: string;
  alternate_phone: string;
  email: string;
  occupation: string;

  // ================================
  // ADDRESS
  // ================================
  address: string;
  village: string;
  post_office: string;
  district: string;
  state: string;
  pincode: string;
  country: string;

  // ================================
  // ADMISSION DETAILS
  // ================================
  course: string;
  academic_session: string;
  admission_type: string;
  preferred_start_date: string;
  previous_madrasa: string;
  reason_for_admission: string;

  // ================================
  // ADDITIONAL
  // ================================
  message: string;
};

const initialFormData: FormData = {
  full_name: "",
  date_of_birth: "",
  gender: "",
  place_of_birth: "",
  nationality: "Indian",
  previous_school: "",
  previous_class: "",
  quran_education: "",

  father_name: "",
  mother_name: "",
  guardian_name: "",
  guardian_relation: "",
  phone: "",
  whatsapp: "",
  alternate_phone: "",
  email: "",
  occupation: "",

  address: "",
  village: "",
  post_office: "",
  district: "",
  state: "",
  pincode: "",
  country: "India",

  course: "",
  academic_session: "2026",
  admission_type: "New Admission",
  preferred_start_date: "",
  previous_madrasa: "",
  reason_for_admission: "",

  message: "",
};

export default function AdmissionPage() {
  const [formData, setFormData] =
    useState<FormData>(initialFormData);

  const [studentPhoto, setStudentPhoto] =
    useState<File | null>(null);

  const [birthCertificate, setBirthCertificate] =
    useState<File | null>(null);

  const [previousCertificate, setPreviousCertificate] =
    useState<File | null>(null);

  const [idDocument, setIdDocument] =
    useState<File | null>(null);

  const [residenceProof, setResidenceProof] =
    useState<File | null>(null);

  const [declarationAccepted, setDeclarationAccepted] =
    useState(false);

  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] =
    useState("");

  const [applicationNumber, setApplicationNumber] =
    useState("");

  const [errorMessage, setErrorMessage] =
    useState("");

  // ==========================================
  // HANDLE INPUT
  // ==========================================

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement |
        HTMLTextAreaElement |
        HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // ==========================================
  // HANDLE FILE
  // ==========================================

  const validateFile = (
    file: File | null,
    required = false
  ) => {
    if (!file) {
      if (required) {
        throw new Error(
          "Student photograph is required."
        );
      }

      return;
    }

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "application/pdf",
    ];

    if (!allowedTypes.includes(file.type)) {
      throw new Error(
        "Only JPG, PNG, WEBP or PDF files are allowed."
      );
    }

    const maxSize = 5 * 1024 * 1024;

    if (file.size > maxSize) {
      throw new Error(
        `"${file.name}" is larger than 5 MB.`
      );
    }
  };

  // ==========================================
  // UPLOAD DOCUMENT
  // ==========================================

  async function uploadDocument(
    file: File,
    folder: string,
    applicationId: string
  ): Promise<string> {
    const extension =
      file.name.split(".").pop()?.toLowerCase() ||
      "file";

    const fileName = `${Date.now()}-${Math.random()
      .toString(36)
      .substring(2, 10)}.${extension}`;

    const filePath = `${folder}/${applicationId}/${fileName}`;

    const { error } = await supabase.storage
      .from("admission-documents")
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
        contentType: file.type,
      });

    if (error) {
      console.error(
        "Document upload error:",
        error
      );

      throw new Error(
        `Document upload failed: ${error.message}`
      );
    }

    return filePath;
  }

  // ==========================================
  // SUBMIT
  // ==========================================

  const handleSubmit = async (
    e: FormEvent
  ) => {
    e.preventDefault();

    setLoading(true);
    setSuccessMessage("");
    setErrorMessage("");
    setApplicationNumber("");

    try {
      // ========================================
      // CLEAN DATA
      // ========================================

      const clean = {
        ...formData,

        full_name:
          formData.full_name.trim(),

        date_of_birth:
          formData.date_of_birth.trim(),

        father_name:
          formData.father_name.trim(),

        guardian_name:
          formData.guardian_name.trim(),

        phone:
          formData.phone.trim(),

        whatsapp:
          formData.whatsapp.trim(),

        alternate_phone:
          formData.alternate_phone.trim(),

        email:
          formData.email.trim(),

        address:
          formData.address.trim(),

        village:
          formData.village.trim(),

        post_office:
          formData.post_office.trim(),

        district:
          formData.district.trim(),

        state:
          formData.state.trim(),

        pincode:
          formData.pincode.trim(),

        course:
          formData.course.trim(),

        academic_session:
          formData.academic_session.trim(),
      };

      // ========================================
      // REQUIRED VALIDATION
      // ========================================

      if (!clean.full_name) {
        throw new Error(
          "Student full name is required."
        );
      }

      if (!clean.date_of_birth) {
        throw new Error(
          "Date of birth is required."
        );
      }

      if (!clean.gender) {
        throw new Error(
          "Please select student's gender."
        );
      }

      if (!clean.father_name) {
        throw new Error(
          "Father's name is required."
        );
      }

      if (!clean.guardian_name) {
        throw new Error(
          "Guardian name is required."
        );
      }

      if (!clean.guardian_relation) {
        throw new Error(
          "Please select guardian relationship."
        );
      }

      if (!clean.phone) {
        throw new Error(
          "Mobile number is required."
        );
      }

      if (!/^[0-9]{10}$/.test(clean.phone)) {
        throw new Error(
          "Please enter a valid 10-digit mobile number."
        );
      }

      if (
        clean.whatsapp &&
        !/^[0-9]{10}$/.test(clean.whatsapp)
      ) {
        throw new Error(
          "Please enter a valid 10-digit WhatsApp number."
        );
      }

      if (!clean.address) {
        throw new Error(
          "Address is required."
        );
      }

      if (!clean.village) {
        throw new Error(
          "Village / Town is required."
        );
      }

      if (!clean.district) {
        throw new Error(
          "District is required."
        );
      }

      if (!clean.state) {
        throw new Error(
          "State is required."
        );
      }

      if (!/^[0-9]{6}$/.test(clean.pincode)) {
        throw new Error(
          "Please enter a valid 6-digit PIN code."
        );
      }

      if (!clean.course) {
        throw new Error(
          "Please select a course."
        );
      }

      if (!clean.academic_session) {
        throw new Error(
          "Academic session is required."
        );
      }

      if (!declarationAccepted) {
        throw new Error(
          "Please accept the declaration before submitting."
        );
      }

      // ========================================
      // FILE VALIDATION
      // ========================================

      validateFile(studentPhoto, true);
      validateFile(birthCertificate);
      validateFile(previousCertificate);
      validateFile(idDocument);
      validateFile(residenceProof);

      // ========================================
      // APPLICATION NUMBER
      // ========================================

      const generatedApplicationNumber =
        `MMBB-${new Date().getFullYear()}-${Math.floor(
          100000 + Math.random() * 900000
        )}`;

      // ========================================
      // INSERT ADMISSION
      // ========================================

      const { data: admission, error } =
        await supabase
          .from("admissions")
          .insert([
            {
              student_name:
                clean.full_name,

              guardian_name:
                clean.guardian_name,

              mobile:
                clean.phone,

              email:
                clean.email || null,

              course:
                clean.course,

              message:
                clean.message || null,

              status: "new",

              application_number:
                generatedApplicationNumber,

              date_of_birth:
                clean.date_of_birth,

              gender:
                clean.gender,

              place_of_birth:
                clean.place_of_birth || null,

              nationality:
                clean.nationality || null,

              previous_school:
                clean.previous_school || null,

              previous_class:
                clean.previous_class || null,

              quran_education:
                clean.quran_education || null,

              father_name:
                clean.father_name,

              mother_name:
                clean.mother_name || null,

              guardian_relation:
                clean.guardian_relation,

              whatsapp:
                clean.whatsapp || null,

              alternate_phone:
                clean.alternate_phone || null,

              occupation:
                clean.occupation || null,

              address:
                clean.address,

              village:
                clean.village,

              post_office:
                clean.post_office || null,

              district:
                clean.district,

              state:
                clean.state,

              pincode:
                clean.pincode,

              country:
                clean.country || "India",

              academic_session:
                clean.academic_session,

              admission_type:
                clean.admission_type,

              preferred_start_date:
                clean.preferred_start_date ||
                null,

              previous_madrasa:
                clean.previous_madrasa || null,

              reason_for_admission:
                clean.reason_for_admission ||
                null,

              declaration_accepted:
                true,
            },
          ])
          .select("id")
          .single();

      if (error) {
        console.error(
          "Supabase admission error:",
          error
        );

        throw new Error(
          error.message ||
            "Admission form could not be submitted."
        );
      }

      if (!admission?.id) {
        throw new Error(
          "Admission application ID could not be generated."
        );
      }

      // ========================================
      // UPLOAD DOCUMENTS
      // ========================================

      const documentUpdates: {
        student_photo_path?: string | null;
        birth_certificate_path?: string | null;
        previous_certificate_path?: string | null;
        id_document_path?: string | null;
        residence_proof_path?: string | null;
      } = {};

      if (studentPhoto) {
        documentUpdates.student_photo_path =
          await uploadDocument(
            studentPhoto,
            "student-photos",
            admission.id
          );
      }

      if (birthCertificate) {
        documentUpdates.birth_certificate_path =
          await uploadDocument(
            birthCertificate,
            "birth-certificates",
            admission.id
          );
      }

      if (previousCertificate) {
        documentUpdates.previous_certificate_path =
          await uploadDocument(
            previousCertificate,
            "previous-certificates",
            admission.id
          );
      }

      if (idDocument) {
        documentUpdates.id_document_path =
          await uploadDocument(
            idDocument,
            "id-documents",
            admission.id
          );
      }

      if (residenceProof) {
        documentUpdates.residence_proof_path =
          await uploadDocument(
            residenceProof,
            "residence-proofs",
            admission.id
          );
      }

      // ========================================
      // SAVE DOCUMENT PATHS
      // ========================================

      if (
        Object.keys(documentUpdates).length > 0
      ) {
        const { error: updateError } =
          await supabase
            .from("admissions")
            .update(documentUpdates)
            .eq("id", admission.id);

        if (updateError) {
          console.error(
            "Document path update error:",
            updateError
          );

          throw new Error(
            "Application was saved but document information could not be saved."
          );
        }
      }

      // ========================================
      // SUCCESS
      // ========================================

      setApplicationNumber(
        generatedApplicationNumber
      );

      setSuccessMessage(
        "JazakAllahu Khairan! Your admission application has been submitted successfully. Please save your application number for future reference."
      );

      setFormData(initialFormData);

      setStudentPhoto(null);
      setBirthCertificate(null);
      setPreviousCertificate(null);
      setIdDocument(null);
      setResidenceProof(null);
      setDeclarationAccepted(false);

      // Reset file inputs
      const fileInputs =
        document.querySelectorAll(
          'input[type="file"]'
        );

      fileInputs.forEach((input) => {
        (
          input as HTMLInputElement
        ).value = "";
      });

      window.scrollTo({
        top:
          document.getElementById(
            "apply"
          )?.offsetTop || 0,
        behavior: "smooth",
      });
    } catch (error) {
      console.error(
        "Admission form error:",
        error
      );

      if (error instanceof Error) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage(
          "Admission form submit nahi ho saka. Please dobara try karein."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* =====================================================
          HERO
      ===================================================== */}

      <section className="relative overflow-hidden bg-gradient-to-br from-green-950 via-green-800 to-green-600 px-6 py-28 sm:py-32">
        <div className="absolute inset-0 bg-black/20" />

        <div className="relative z-10 mx-auto max-w-5xl text-center text-white">
          <p className="mb-5 text-sm font-bold uppercase tracking-[5px] text-green-200 sm:text-lg">
            Admissions 2026
          </p>

          <h1 className="text-4xl font-extrabold leading-tight sm:text-5xl md:text-6xl">
            Admission Open
            <br />

            <span className="text-green-100">
              Madrasa Majmaul Bahrain Bijol
            </span>
          </h1>

          <p className="mx-auto mt-8 max-w-3xl text-base leading-8 text-green-100 sm:text-lg">
            Join an institution dedicated to Islamic
            values, quality education, discipline and
            character building. Admissions are now open
            for the academic session 2026.
          </p>

          <div className="mt-10 flex flex-col justify-center gap-4 sm:flex-row">
            <a
              href="#apply"
              className="rounded-xl bg-white px-8 py-4 text-lg font-bold text-green-700 shadow-xl transition hover:scale-105"
            >
              Apply Now
            </a>

            <Link
              href="/courses"
              className="rounded-xl border-2 border-white px-8 py-4 text-lg font-bold text-white transition hover:bg-white hover:text-green-700"
            >
              View Courses
            </Link>
          </div>
        </div>
      </section>

      {/* =====================================================
          INFORMATION
      ===================================================== */}

      <section className="bg-white py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-14 text-center">
            <p className="font-semibold uppercase tracking-[4px] text-green-600">
              Admission Information
            </p>

            <h2 className="mt-4 text-3xl font-extrabold text-gray-900 sm:text-4xl">
              Why Join Our Madrasa?
            </h2>

            <div className="mx-auto mt-5 h-1 w-24 rounded-full bg-green-600" />
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            <div className="rounded-3xl bg-green-50 p-8 shadow-lg transition hover:-translate-y-1">
              <h3 className="mb-4 text-2xl font-bold text-green-700">
                Islamic Education
              </h3>

              <p className="leading-8 text-gray-700">
                Quran, Hifz, Nazrah, Qirat and Darse
                Nizami under qualified scholars.
              </p>
            </div>

            <div className="rounded-3xl bg-green-50 p-8 shadow-lg transition hover:-translate-y-1">
              <h3 className="mb-4 text-2xl font-bold text-green-700">
                Modern Education
              </h3>

              <p className="leading-8 text-gray-700">
                English, Mathematics, Basic Science and
                Moral Education with experienced teachers.
              </p>
            </div>

            <div className="rounded-3xl bg-green-50 p-8 shadow-lg transition hover:-translate-y-1">
              <h3 className="mb-4 text-2xl font-bold text-green-700">
                Character Building
              </h3>

              <p className="leading-8 text-gray-700">
                Focus on discipline, good manners,
                leadership and Islamic values.
              </p>
            </div>
          </div>

          {/* =================================================
              ELIGIBILITY + DOCUMENTS
          ================================================= */}

          <div className="mt-20 grid gap-10 lg:grid-cols-2">
            <div className="rounded-3xl bg-white p-8 shadow-xl ring-1 ring-gray-100 sm:p-10">
              <h2 className="mb-7 text-3xl font-extrabold text-gray-900">
                Eligibility
              </h2>

              <ul className="space-y-5 text-lg leading-8 text-gray-700">
                <li>
                  ✅ Boys seeking quality Islamic and
                  Modern Education.
                </li>

                <li>
                  ✅ Good moral character and discipline.
                </li>

                <li>
                  ✅ Previous academic record if
                  applicable.
                </li>

                <li>
                  ✅ Parent/Guardian consent is mandatory.
                </li>

                <li>
                  ✅ Admission is subject to seat
                  availability.
                </li>
              </ul>
            </div>

            <div className="rounded-3xl bg-white p-8 shadow-xl ring-1 ring-gray-100 sm:p-10">
              <h2 className="mb-7 text-3xl font-extrabold text-gray-900">
                Documents
              </h2>

              <ul className="space-y-5 text-lg leading-8 text-gray-700">
                <li>
                  📷 Student Photograph — Required
                </li>

                <li>
                  📄 Birth Certificate — Optional
                </li>

                <li>
                  📄 Previous School/Madrasa Certificate
                  — Optional
                </li>

                <li>
                  📄 ID Document — Optional
                </li>

                <li>
                  📄 Residence Proof — Optional
                </li>
              </ul>
            </div>
          </div>

          {/* =================================================
              ADMISSION PROCESS
          ================================================= */}

          <div className="mt-20">
            <div className="mb-12 text-center">
              <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
                Admission Process
              </h2>

              <div className="mx-auto mt-5 h-1 w-24 rounded-full bg-green-600" />
            </div>

            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-3xl bg-green-50 p-8 text-center shadow-lg">
                <div className="mb-5 text-5xl">1️⃣</div>

                <h3 className="text-xl font-bold text-green-700">
                  Fill Form
                </h3>

                <p className="mt-4 leading-7 text-gray-700">
                  Complete the admission form with
                  correct details.
                </p>
              </div>

              <div className="rounded-3xl bg-green-50 p-8 text-center shadow-lg">
                <div className="mb-5 text-5xl">2️⃣</div>

                <h3 className="text-xl font-bold text-green-700">
                  Submit Documents
                </h3>

                <p className="mt-4 leading-7 text-gray-700">
                  Upload available documents for
                  verification.
                </p>
              </div>

              <div className="rounded-3xl bg-green-50 p-8 text-center shadow-lg">
                <div className="mb-5 text-5xl">3️⃣</div>

                <h3 className="text-xl font-bold text-green-700">
                  Verification
                </h3>

                <p className="mt-4 leading-7 text-gray-700">
                  Documents and eligibility will be
                  verified by the madrasa administration.
                </p>
              </div>

              <div className="rounded-3xl bg-green-50 p-8 text-center shadow-lg">
                <div className="mb-5 text-5xl">4️⃣</div>

                <h3 className="text-xl font-bold text-green-700">
                  Admission Confirmed
                </h3>

                <p className="mt-4 leading-7 text-gray-700">
                  After approval, admission will be
                  confirmed.
                </p>
              </div>
            </div>
          </div>

          {/* =================================================
              APPLICATION FORM
          ================================================= */}

          <section
            id="apply"
            className="mt-24 rounded-[2rem] bg-gradient-to-br from-green-950 via-green-800 to-green-700 p-5 shadow-2xl sm:p-8 lg:p-12"
          >
            <div className="mx-auto max-w-5xl">
              <div className="text-center text-white">
                <p className="font-semibold uppercase tracking-[4px] text-green-200">
                  Online Admission
                </p>

                <h2 className="mt-4 text-3xl font-extrabold sm:text-4xl">
                  Apply for Admission
                </h2>

                <p className="mx-auto mt-5 max-w-2xl leading-8 text-green-100">
                  Please fill in the form below carefully.
                  All information should be accurate.
                </p>
              </div>

              {/* SUCCESS */}

              {successMessage && (
                <div className="mt-8 rounded-2xl border border-green-300 bg-green-100 p-6 text-center text-green-900 shadow-lg">
                  <div className="text-3xl">✅</div>

                  <h3 className="mt-2 text-xl font-extrabold">
                    Application Submitted Successfully
                  </h3>

                  <p className="mt-3 font-medium">
                    {successMessage}
                  </p>

                  {applicationNumber && (
                    <div className="mx-auto mt-5 max-w-md rounded-xl bg-white p-4 shadow">
                      <p className="text-sm font-semibold text-gray-500">
                        Your Application Number
                      </p>

                      <p className="mt-1 text-2xl font-black tracking-wider text-green-700">
                        {applicationNumber}
                      </p>

                      <p className="mt-2 text-xs text-gray-500">
                        Please save this number for future
                        reference.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* ERROR */}

              {errorMessage && (
                <div className="mt-8 rounded-2xl border border-red-300 bg-red-100 p-5 text-center font-semibold text-red-700">
                  ❌ {errorMessage}
                </div>
              )}

              {/* =================================================
                  FORM
              ================================================= */}

              <form
                onSubmit={handleSubmit}
                className="mt-10 rounded-3xl bg-white p-5 shadow-2xl sm:p-8 lg:p-10"
              >
                {/* ===============================================
                    SECTION 1
                =============================================== */}

                <div className="border-b border-gray-200 pb-8">
                  <div className="mb-6">
                    <p className="text-sm font-bold uppercase tracking-[3px] text-green-600">
                      Section 01
                    </p>

                    <h3 className="mt-2 text-2xl font-extrabold text-gray-900">
                      Student Information
                    </h3>

                    <p className="mt-1 text-sm text-gray-500">
                      Enter the student's personal and
                      educational information.
                    </p>
                  </div>

                  <div className="grid gap-6 md:grid-cols-2">
                    {/* NAME */}

                    <div className="md:col-span-2">
                      <label
                        htmlFor="full_name"
                        className="mb-2 block font-semibold text-gray-800"
                      >
                        Student Full Name *
                      </label>

                      <input
                        id="full_name"
                        name="full_name"
                        type="text"
                        required
                        value={formData.full_name}
                        onChange={handleChange}
                        placeholder="Enter student's full name"
                        className="input-style"
                      />
                    </div>

                    {/* DOB */}

                    <div>
                      <label
                        htmlFor="date_of_birth"
                        className="mb-2 block font-semibold text-gray-800"
                      >
                        Date of Birth *
                      </label>

                      <input
                        id="date_of_birth"
                        name="date_of_birth"
                        type="date"
                        required
                        value={formData.date_of_birth}
                        onChange={handleChange}
                        className="input-style"
                      />
                    </div>

                    {/* GENDER */}

                    <div>
                      <label
                        htmlFor="gender"
                        className="mb-2 block font-semibold text-gray-800"
                      >
                        Gender *
                      </label>

                      <select
                        id="gender"
                        name="gender"
                        required
                        value={formData.gender}
                        onChange={handleChange}
                        className="input-style"
                      >
                        <option value="">
                          Select gender
                        </option>

                        <option value="Male">
                          Male
                        </option>

                        <option value="Female">
                          Female
                        </option>
                      </select>
                    </div>

                    {/* PLACE */}

                    <div>
                      <label
                        htmlFor="place_of_birth"
                        className="mb-2 block font-semibold text-gray-800"
                      >
                        Place of Birth
                      </label>

                      <input
                        id="place_of_birth"
                        name="place_of_birth"
                        type="text"
                        value={formData.place_of_birth}
                        onChange={handleChange}
                        placeholder="City / Village"
                        className="input-style"
                      />
                    </div>

                    {/* NATIONALITY */}

                    <div>
                      <label
                        htmlFor="nationality"
                        className="mb-2 block font-semibold text-gray-800"
                      >
                        Nationality
                      </label>

                      <input
                        id="nationality"
                        name="nationality"
                        type="text"
                        value={formData.nationality}
                        onChange={handleChange}
                        className="input-style"
                      />
                    </div>

                    {/* PREVIOUS SCHOOL */}

                    <div>
                      <label
                        htmlFor="previous_school"
                        className="mb-2 block font-semibold text-gray-800"
                      >
                        Previous School
                      </label>

                      <input
                        id="previous_school"
                        name="previous_school"
                        type="text"
                        value={formData.previous_school}
                        onChange={handleChange}
                        placeholder="School name"
                        className="input-style"
                      />
                    </div>

                    {/* PREVIOUS CLASS */}

                    <div>
                      <label
                        htmlFor="previous_class"
                        className="mb-2 block font-semibold text-gray-800"
                      >
                        Previous Class / Grade
                      </label>

                      <input
                        id="previous_class"
                        name="previous_class"
                        type="text"
                        value={formData.previous_class}
                        onChange={handleChange}
                        placeholder="e.g. Class 5"
                        className="input-style"
                      />
                    </div>

                    {/* QURAN */}

                    <div className="md:col-span-2">
                      <label
                        htmlFor="quran_education"
                        className="mb-2 block font-semibold text-gray-800"
                      >
                        Previous Quran / Hifz Education
                      </label>

                      <textarea
                        id="quran_education"
                        name="quran_education"
                        rows={3}
                        value={formData.quran_education}
                        onChange={handleChange}
                        placeholder="Mention Nazrah, Hifz, Qirat or other Quran education, if any."
                        className="input-style resize-none"
                      />
                    </div>
                  </div>
                </div>

                {/* ===============================================
                    SECTION 2
                =============================================== */}

                <div className="border-b border-gray-200 py-8">
                  <div className="mb-6">
                    <p className="text-sm font-bold uppercase tracking-[3px] text-green-600">
                      Section 02
                    </p>

                    <h3 className="mt-2 text-2xl font-extrabold text-gray-900">
                      Parent / Guardian Information
                    </h3>
                  </div>

                  <div className="grid gap-6 md:grid-cols-2">
                    {/* FATHER */}

                    <div>
                      <label
                        htmlFor="father_name"
                        className="mb-2 block font-semibold text-gray-800"
                      >
                        Father's Name *
                      </label>

                      <input
                        id="father_name"
                        name="father_name"
                        type="text"
                        required
                        value={formData.father_name}
                        onChange={handleChange}
                        placeholder="Father's full name"
                        className="input-style"
                      />
                    </div>

                    {/* MOTHER */}

                    <div>
                      <label
                        htmlFor="mother_name"
                        className="mb-2 block font-semibold text-gray-800"
                      >
                        Mother's Name
                      </label>

                      <input
                        id="mother_name"
                        name="mother_name"
                        type="text"
                        value={formData.mother_name}
                        onChange={handleChange}
                        placeholder="Mother's full name"
                        className="input-style"
                      />
                    </div>

                    {/* GUARDIAN */}

                    <div>
                      <label
                        htmlFor="guardian_name"
                        className="mb-2 block font-semibold text-gray-800"
                      >
                        Guardian Full Name *
                      </label>

                      <input
                        id="guardian_name"
                        name="guardian_name"
                        type="text"
                        required
                        value={formData.guardian_name}
                        onChange={handleChange}
                        placeholder="Parent / guardian name"
                        className="input-style"
                      />
                    </div>

                    {/* RELATION */}

                    <div>
                      <label
                        htmlFor="guardian_relation"
                        className="mb-2 block font-semibold text-gray-800"
                      >
                        Relationship with Student *
                      </label>

                      <select
                        id="guardian_relation"
                        name="guardian_relation"
                        required
                        value={formData.guardian_relation}
                        onChange={handleChange}
                        className="input-style"
                      >
                        <option value="">
                          Select relationship
                        </option>

                        <option value="Father">
                          Father
                        </option>

                        <option value="Mother">
                          Mother
                        </option>

                        <option value="Brother">
                          Brother
                        </option>

                        <option value="Uncle">
                          Uncle
                        </option>

                        <option value="Other">
                          Other
                        </option>
                      </select>
                    </div>

                    {/* MOBILE */}

                    <div>
                      <label
                        htmlFor="phone"
                        className="mb-2 block font-semibold text-gray-800"
                      >
                        Mobile Number *
                      </label>

                      <input
                        id="phone"
                        name="phone"
                        type="tel"
                        inputMode="numeric"
                        maxLength={10}
                        required
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="10-digit mobile number"
                        className="input-style"
                      />
                    </div>

                    {/* WHATSAPP */}

                    <div>
                      <label
                        htmlFor="whatsapp"
                        className="mb-2 block font-semibold text-gray-800"
                      >
                        WhatsApp Number
                      </label>

                      <input
                        id="whatsapp"
                        name="whatsapp"
                        type="tel"
                        inputMode="numeric"
                        maxLength={10}
                        value={formData.whatsapp}
                        onChange={handleChange}
                        placeholder="10-digit WhatsApp number"
                        className="input-style"
                      />
                    </div>

                    {/* ALTERNATE */}

                    <div>
                      <label
                        htmlFor="alternate_phone"
                        className="mb-2 block font-semibold text-gray-800"
                      >
                        Alternate Contact Number
                      </label>

                      <input
                        id="alternate_phone"
                        name="alternate_phone"
                        type="tel"
                        inputMode="numeric"
                        maxLength={10}
                        value={formData.alternate_phone}
                        onChange={handleChange}
                        placeholder="Alternate number"
                        className="input-style"
                      />
                    </div>

                    {/* EMAIL */}

                    <div>
                      <label
                        htmlFor="email"
                        className="mb-2 block font-semibold text-gray-800"
                      >
                        Email Address
                      </label>

                      <input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="Email address"
                        className="input-style"
                      />
                    </div>

                    {/* OCCUPATION */}

                    <div className="md:col-span-2">
                      <label
                        htmlFor="occupation"
                        className="mb-2 block font-semibold text-gray-800"
                      >
                        Parent / Guardian Occupation
                      </label>

                      <input
                        id="occupation"
                        name="occupation"
                        type="text"
                        value={formData.occupation}
                        onChange={handleChange}
                        placeholder="Occupation"
                        className="input-style"
                      />
                    </div>
                  </div>
                </div>

                {/* ===============================================
                    SECTION 3
                =============================================== */}

                <div className="border-b border-gray-200 py-8">
                  <div className="mb-6">
                    <p className="text-sm font-bold uppercase tracking-[3px] text-green-600">
                      Section 03
                    </p>

                    <h3 className="mt-2 text-2xl font-extrabold text-gray-900">
                      Address
                    </h3>
                  </div>

                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="md:col-span-2">
                      <label
                        htmlFor="address"
                        className="mb-2 block font-semibold text-gray-800"
                      >
                        Full Address *
                      </label>

                      <textarea
                        id="address"
                        name="address"
                        rows={3}
                        required
                        value={formData.address}
                        onChange={handleChange}
                        placeholder="House number, street and complete address"
                        className="input-style resize-none"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="village"
                        className="mb-2 block font-semibold text-gray-800"
                      >
                        Village / Town *
                      </label>

                      <input
                        id="village"
                        name="village"
                        type="text"
                        required
                        value={formData.village}
                        onChange={handleChange}
                        className="input-style"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="post_office"
                        className="mb-2 block font-semibold text-gray-800"
                      >
                        Post Office
                      </label>

                      <input
                        id="post_office"
                        name="post_office"
                        type="text"
                        value={formData.post_office}
                        onChange={handleChange}
                        className="input-style"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="district"
                        className="mb-2 block font-semibold text-gray-800"
                      >
                        District *
                      </label>

                      <input
                        id="district"
                        name="district"
                        type="text"
                        required
                        value={formData.district}
                        onChange={handleChange}
                        className="input-style"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="state"
                        className="mb-2 block font-semibold text-gray-800"
                      >
                        State *
                      </label>

                      <input
                        id="state"
                        name="state"
                        type="text"
                        required
                        value={formData.state}
                        onChange={handleChange}
                        placeholder="e.g. Bihar"
                        className="input-style"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="pincode"
                        className="mb-2 block font-semibold text-gray-800"
                      >
                        PIN Code *
                      </label>

                      <input
                        id="pincode"
                        name="pincode"
                        type="text"
                        inputMode="numeric"
                        maxLength={6}
                        required
                        value={formData.pincode}
                        onChange={handleChange}
                        placeholder="6-digit PIN code"
                        className="input-style"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="country"
                        className="mb-2 block font-semibold text-gray-800"
                      >
                        Country
                      </label>

                      <input
                        id="country"
                        name="country"
                        type="text"
                        value={formData.country}
                        onChange={handleChange}
                        className="input-style"
                      />
                    </div>
                  </div>
                </div>

                {/* ===============================================
                    SECTION 4
                =============================================== */}

                <div className="border-b border-gray-200 py-8">
                  <div className="mb-6">
                    <p className="text-sm font-bold uppercase tracking-[3px] text-green-600">
                      Section 04
                    </p>

                    <h3 className="mt-2 text-2xl font-extrabold text-gray-900">
                      Admission Details
                    </h3>
                  </div>

                  <div className="grid gap-6 md:grid-cols-2">
                    {/* COURSE */}

                    <div>
                      <label
                        htmlFor="course"
                        className="mb-2 block font-semibold text-gray-800"
                      >
                        Course / Program *
                      </label>

                      <select
                        id="course"
                        name="course"
                        required
                        value={formData.course}
                        onChange={handleChange}
                        className="input-style"
                      >
                        <option value="">
                          Select a course
                        </option>

                        <option value="Hifz-ul-Quran">
                          Hifz-ul-Quran
                        </option>

                        <option value="Nazrah & Qirat">
                          Nazrah & Qirat
                        </option>

                        <option value="Darse Nizami">
                          Darse Nizami
                        </option>

                        <option value="Modern Education">
                          Modern Education
                        </option>
                      </select>
                    </div>

                    {/* SESSION */}

                    <div>
                      <label
                        htmlFor="academic_session"
                        className="mb-2 block font-semibold text-gray-800"
                      >
                        Academic Session *
                      </label>

                      <select
                        id="academic_session"
                        name="academic_session"
                        required
                        value={formData.academic_session}
                        onChange={handleChange}
                        className="input-style"
                      >
                        <option value="2026">
                          2026
                        </option>

                        <option value="2026-27">
                          2026-27
                        </option>
                      </select>
                    </div>

                    {/* TYPE */}

                    <div>
                      <label
                        htmlFor="admission_type"
                        className="mb-2 block font-semibold text-gray-800"
                      >
                        Admission Type
                      </label>

                      <select
                        id="admission_type"
                        name="admission_type"
                        value={formData.admission_type}
                        onChange={handleChange}
                        className="input-style"
                      >
                        <option value="New Admission">
                          New Admission
                        </option>

                        <option value="Transfer">
                          Transfer
                        </option>
                      </select>
                    </div>

                    {/* START DATE */}

                    <div>
                      <label
                        htmlFor="preferred_start_date"
                        className="mb-2 block font-semibold text-gray-800"
                      >
                        Preferred Start Date
                      </label>

                      <input
                        id="preferred_start_date"
                        name="preferred_start_date"
                        type="date"
                        value={
                          formData.preferred_start_date
                        }
                        onChange={handleChange}
                        className="input-style"
                      />
                    </div>

                    {/* PREVIOUS MADRASA */}

                    <div className="md:col-span-2">
                      <label
                        htmlFor="previous_madrasa"
                        className="mb-2 block font-semibold text-gray-800"
                      >
                        Previous Madrasa / Institution
                      </label>

                      <input
                        id="previous_madrasa"
                        name="previous_madrasa"
                        type="text"
                        value={formData.previous_madrasa}
                        onChange={handleChange}
                        placeholder="If applicable"
                        className="input-style"
                      />
                    </div>

                    {/* REASON */}

                    <div className="md:col-span-2">
                      <label
                        htmlFor="reason_for_admission"
                        className="mb-2 block font-semibold text-gray-800"
                      >
                        Why do you want admission?
                      </label>

                      <textarea
                        id="reason_for_admission"
                        name="reason_for_admission"
                        rows={4}
                        value={
                          formData.reason_for_admission
                        }
                        onChange={handleChange}
                        placeholder="Optional"
                        className="input-style resize-none"
                      />
                    </div>
                  </div>
                </div>

                {/* ===============================================
                    SECTION 5 DOCUMENTS
                =============================================== */}

                <div className="border-b border-gray-200 py-8">
                  <div className="mb-6">
                    <p className="text-sm font-bold uppercase tracking-[3px] text-green-600">
                      Section 05
                    </p>

                    <h3 className="mt-2 text-2xl font-extrabold text-gray-900">
                      Documents
                    </h3>

                    <p className="mt-2 text-sm text-gray-500">
                      JPG, PNG, WEBP or PDF • Maximum 5 MB
                      per file.
                    </p>
                  </div>

                  <div className="grid gap-6 md:grid-cols-2">
                    {/* PHOTO */}

                    <div className="rounded-2xl border border-green-200 bg-green-50 p-5">
                      <label
                        htmlFor="student_photo"
                        className="mb-3 block font-bold text-gray-800"
                      >
                        Student Photograph *
                      </label>

                      <input
                        id="student_photo"
                        type="file"
                        accept=".jpg,.jpeg,.png,.webp"
                        required
                        onChange={(e) =>
                          setStudentPhoto(
                            e.target.files?.[0] ||
                              null
                          )
                        }
                        className="block w-full rounded-xl border border-gray-300 bg-white p-3 text-sm"
                      />

                      {studentPhoto && (
                        <p className="mt-2 text-xs font-medium text-green-700">
                          ✓ {studentPhoto.name}
                        </p>
                      )}
                    </div>

                    {/* BIRTH */}

                    <div className="rounded-2xl border border-gray-200 bg-gray-50 p-5">
                      <label
                        htmlFor="birth_certificate"
                        className="mb-3 block font-bold text-gray-800"
                      >
                        Birth Certificate
                      </label>

                      <input
                        id="birth_certificate"
                        type="file"
                        accept=".jpg,.jpeg,.png,.webp,.pdf"
                        onChange={(e) =>
                          setBirthCertificate(
                            e.target.files?.[0] ||
                              null
                          )
                        }
                        className="block w-full rounded-xl border border-gray-300 bg-white p-3 text-sm"
                      />

                      {birthCertificate && (
                        <p className="mt-2 text-xs font-medium text-green-700">
                          ✓ {birthCertificate.name}
                        </p>
                      )}
                    </div>

                    {/* PREVIOUS CERTIFICATE */}

                    <div className="rounded-2xl border border-gray-200 bg-gray-50 p-5">
                      <label
                        htmlFor="previous_certificate"
                        className="mb-3 block font-bold text-gray-800"
                      >
                        Previous School / Madrasa Certificate
                      </label>

                      <input
                        id="previous_certificate"
                        type="file"
                        accept=".jpg,.jpeg,.png,.webp,.pdf"
                        onChange={(e) =>
                          setPreviousCertificate(
                            e.target.files?.[0] ||
                              null
                          )
                        }
                        className="block w-full rounded-xl border border-gray-300 bg-white p-3 text-sm"
                      />

                      {previousCertificate && (
                        <p className="mt-2 text-xs font-medium text-green-700">
                          ✓ {previousCertificate.name}
                        </p>
                      )}
                    </div>

                    {/* ID */}

                    <div className="rounded-2xl border border-gray-200 bg-gray-50 p-5">
                      <label
                        htmlFor="id_document"
                        className="mb-3 block font-bold text-gray-800"
                      >
                        ID Document
                      </label>

                      <input
                        id="id_document"
                        type="file"
                        accept=".jpg,.jpeg,.png,.webp,.pdf"
                        onChange={(e) =>
                          setIdDocument(
                            e.target.files?.[0] ||
                              null
                          )
                        }
                        className="block w-full rounded-xl border border-gray-300 bg-white p-3 text-sm"
                      />

                      {idDocument && (
                        <p className="mt-2 text-xs font-medium text-green-700">
                          ✓ {idDocument.name}
                        </p>
                      )}
                    </div>

                    {/* RESIDENCE */}

                    <div className="rounded-2xl border border-gray-200 bg-gray-50 p-5 md:col-span-2">
                      <label
                        htmlFor="residence_proof"
                        className="mb-3 block font-bold text-gray-800"
                      >
                        Residence Proof
                      </label>

                      <input
                        id="residence_proof"
                        type="file"
                        accept=".jpg,.jpeg,.png,.webp,.pdf"
                        onChange={(e) =>
                          setResidenceProof(
                            e.target.files?.[0] ||
                              null
                          )
                        }
                        className="block w-full rounded-xl border border-gray-300 bg-white p-3 text-sm"
                      />

                      {residenceProof && (
                        <p className="mt-2 text-xs font-medium text-green-700">
                          ✓ {residenceProof.name}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* ===============================================
                    SECTION 6
                =============================================== */}

                <div className="py-8">
                  <div className="mb-6">
                    <p className="text-sm font-bold uppercase tracking-[3px] text-green-600">
                      Section 06
                    </p>

                    <h3 className="mt-2 text-2xl font-extrabold text-gray-900">
                      Declaration
                    </h3>
                  </div>

                  {/* MESSAGE */}

                  <div>
                    <label
                      htmlFor="message"
                      className="mb-2 block font-semibold text-gray-800"
                    >
                      Additional Information
                    </label>

                    <textarea
                      id="message"
                      name="message"
                      rows={4}
                      value={formData.message}
                      onChange={handleChange}
                      placeholder="Any additional information you want to tell the madrasa..."
                      className="input-style resize-none"
                    />
                  </div>

                  {/* DECLARATION */}

                  <div className="mt-6 rounded-2xl border border-gray-200 bg-gray-50 p-5">
                    <label className="flex cursor-pointer items-start gap-3">
                      <input
                        type="checkbox"
                        checked={declarationAccepted}
                        onChange={(e) =>
                          setDeclarationAccepted(
                            e.target.checked
                          )
                        }
                        className="mt-1 h-5 w-5 rounded border-gray-300 text-green-700 focus:ring-green-600"
                      />

                      <span className="text-sm leading-7 text-gray-700">
                        I hereby declare that the
                        information provided in this
                        admission form is true and correct
                        to the best of my knowledge. I
                        understand that providing false or
                        misleading information may affect
                        the admission decision. I also
                        confirm that my parent/guardian has
                        consented to this application.
                      </span>
                    </label>
                  </div>

                  {/* SUBMIT */}

                  <button
                    type="submit"
                    disabled={loading}
                    className="mt-8 w-full rounded-xl bg-green-700 px-8 py-4 text-lg font-bold text-white shadow-lg transition hover:bg-green-800 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {loading
                      ? "Submitting Application..."
                      : "Submit Admission Application"}
                  </button>

                  <p className="mt-4 text-center text-xs text-gray-500">
                    Please check all information carefully
                    before submitting.
                  </p>
                </div>
              </form>
            </div>
          </section>

          {/* =================================================
              CONTACT CTA
          ================================================= */}

          <section className="mt-20 rounded-3xl bg-gray-900 px-6 py-14 text-center text-white shadow-2xl sm:px-10">
            <h2 className="text-3xl font-extrabold sm:text-4xl">
              Need More Information?
            </h2>

            <p className="mx-auto mt-5 max-w-2xl leading-8 text-gray-300">
              If you have any questions regarding
              admission, courses or documents, please
              contact our office team.
            </p>

            <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
              <Link
                href="/#contact"
                className="rounded-xl bg-green-600 px-8 py-4 font-bold transition hover:bg-green-700"
              >
                Contact Office
              </Link>

              <Link
                href="/courses"
                className="rounded-xl border-2 border-white px-8 py-4 font-bold transition hover:bg-white hover:text-gray-900"
              >
                View Courses
              </Link>
            </div>
          </section>
        </div>
      </section>

      <Footer />

      {/* =====================================================
          INPUT STYLE
      ===================================================== */}

      <style jsx global>{`
        .input-style {
          width: 100%;
          border-radius: 0.75rem;
          border: 1px solid #d1d5db;
          background: #ffffff;
          padding: 0.75rem 1rem;
          font-weight: 500;
          color: #111827;
          outline: none;
          transition: all 0.2s ease;
        }

        .input-style::placeholder {
          color: #9ca3af;
        }

        .input-style:focus {
          border-color: #15803d;
          box-shadow: 0 0 0 3px rgba(21, 128, 61, 0.1);
        }
      `}</style>
    </>
  );
}
