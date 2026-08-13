"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import Footer from "../components/Footer";
import { supabase } from "../lib/supabase/client";

type FormDataType = {
  full_name: string;
  date_of_birth: string;
  gender: string;

  father_name: string;
  mother_name: string;
  guardian_name: string;
  guardian_relation: string;
  contact_number_1: string;
  contact_number_2: string;

  full_address: string;
  village_city: string;
  district: string;
  state: string;
  pin_code: string;

  course: string;

  student_document_type: string;
};

export default function AdmissionPage() {
  const [formData, setFormData] = useState<FormDataType>({
    full_name: "",
    date_of_birth: "",
    gender: "",

    father_name: "",
    mother_name: "",
    guardian_name: "",
    guardian_relation: "",
    contact_number_1: "",
    contact_number_2: "",

    full_address: "",
    village_city: "",
    district: "",
    state: "",
    pin_code: "",

    course: "",

    student_document_type: "",
  });

  const [studentPhoto, setStudentPhoto] = useState<File | null>(null);
  const [studentDocument, setStudentDocument] = useState<File | null>(
    null
  );

  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [declarationAccepted, setDeclarationAccepted] = useState(false);

  /* =========================================================
     HANDLE INPUT CHANGE
  ========================================================= */

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  /* =========================================================
     FILE VALIDATION
  ========================================================= */

  function validateImage(file: File, fieldName: string) {
    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
    ];

    if (!allowedTypes.includes(file.type)) {
      throw new Error(
        `${fieldName}: Sirf JPG, PNG ya WEBP image upload kar sakte hain.`
      );
    }

    const maxSize = 5 * 1024 * 1024;

    if (file.size > maxSize) {
      throw new Error(
        `${fieldName}: Image maximum 5MB ki honi chahiye.`
      );
    }
  }

  function validateDocument(file: File) {
    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
      "application/pdf",
    ];

    if (!allowedTypes.includes(file.type)) {
      throw new Error(
        "Document sirf JPG, PNG, WEBP ya PDF format me upload karein."
      );
    }

    const maxSize = 5 * 1024 * 1024;

    if (file.size > maxSize) {
      throw new Error(
        "Document maximum 5MB ka hona chahiye."
      );
    }
  }

  /* =========================================================
     STUDENT PHOTO
  ========================================================= */

  const handleStudentPhotoChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];

    if (!file) {
      setStudentPhoto(null);
      return;
    }

    try {
      validateImage(file, "Student Photo");
      setStudentPhoto(file);
      setErrorMessage("");
    } catch (error) {
      setStudentPhoto(null);

      if (error instanceof Error) {
        setErrorMessage(error.message);
      }
    }
  };

  /* =========================================================
     STUDENT DOCUMENT
  ========================================================= */

  const handleStudentDocumentChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];

    if (!file) {
      setStudentDocument(null);
      return;
    }

    try {
      validateDocument(file);
      setStudentDocument(file);
      setErrorMessage("");
    } catch (error) {
      setStudentDocument(null);

      if (error instanceof Error) {
        setErrorMessage(error.message);
      }
    }
  };

  /* =========================================================
     UPLOAD FILE
  ========================================================= */

  async function uploadAdmissionFile(
    file: File,
    folder: string
  ): Promise<string> {
    const extension =
      file.name.split(".").pop()?.toLowerCase() || "file";

    const fileName = `${Date.now()}-${Math.random()
      .toString(36)
      .substring(2, 10)}.${extension}`;

    const filePath = `${folder}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from("admission-documents")
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
        contentType: file.type,
      });

    if (uploadError) {
      console.error(
        "Admission document upload error:",
        uploadError
      );

      throw new Error(
        uploadError.message ||
          "Document upload nahi ho saka."
      );
    }

    const { data } = supabase.storage
      .from("admission-documents")
      .getPublicUrl(filePath);

    if (!data?.publicUrl) {
      throw new Error(
        "Uploaded document ka public URL nahi mila."
      );
    }

    return data.publicUrl;
  }

  /* =========================================================
     SUBMIT FORM
  ========================================================= */

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    setLoading(true);
    setSuccessMessage("");
    setErrorMessage("");

    try {
      /* =====================================================
         BASIC VALIDATION
      ===================================================== */

      const cleanData = {
        full_name: formData.full_name.trim(),
        date_of_birth: formData.date_of_birth,
        gender: formData.gender,

        father_name: formData.father_name.trim(),
        mother_name: formData.mother_name.trim(),
        guardian_name: formData.guardian_name.trim(),
        guardian_relation: formData.guardian_relation.trim(),
        contact_number_1: formData.contact_number_1.trim(),
        contact_number_2: formData.contact_number_2.trim(),

        full_address: formData.full_address.trim(),
        village_city: formData.village_city.trim(),
        district: formData.district.trim(),
        state: formData.state.trim(),
        pin_code: formData.pin_code.trim(),

        course: formData.course.trim(),

        student_document_type:
          formData.student_document_type.trim(),
      };

      if (!cleanData.full_name) {
        throw new Error(
          "Student full name is required."
        );
      }

      if (!cleanData.date_of_birth) {
        throw new Error(
          "Student date of birth is required."
        );
      }

      if (!cleanData.gender) {
        throw new Error(
          "Please select student's gender."
        );
      }

      if (!cleanData.contact_number_1) {
        throw new Error(
          "Primary contact number is required."
        );
      }

      if (!cleanData.full_address) {
        throw new Error(
          "Full address is required."
        );
      }

      if (!cleanData.village_city) {
        throw new Error(
          "Village / City is required."
        );
      }

      if (!cleanData.district) {
        throw new Error(
          "District is required."
        );
      }

      if (!cleanData.state) {
        throw new Error(
          "State is required."
        );
      }

      if (!cleanData.pin_code) {
        throw new Error(
          "PIN code is required."
        );
      }

      if (!cleanData.course) {
        throw new Error(
          "Please select a course."
        );
      }

      if (!studentPhoto) {
        throw new Error(
          "Student photo is mandatory."
        );
      }

      if (!studentDocument) {
        throw new Error(
          "Aadhaar Card ya student ka koi ek certificate upload karna mandatory hai."
        );
      }

      if (!cleanData.student_document_type) {
        throw new Error(
          "Please select the type of student document."
        );
      }

      if (!declarationAccepted) {
        throw new Error(
          "Please accept the declaration before submitting the form."
        );
      }

      /* =====================================================
         UPLOAD STUDENT PHOTO
      ===================================================== */

      const studentPhotoUrl = await uploadAdmissionFile(
        studentPhoto,
        "student-photos"
      );

      /* =====================================================
         UPLOAD STUDENT DOCUMENT
      ===================================================== */

      const studentDocumentUrl = await uploadAdmissionFile(
        studentDocument,
        "student-documents"
      );

      /* =====================================================
         INSERT ADMISSION
      ===================================================== */

      const { error } = await supabase
        .from("admissions")
        .insert([
          {
            student_name: cleanData.full_name,
            date_of_birth: cleanData.date_of_birth,
            gender: cleanData.gender,

            father_name: cleanData.father_name || null,
            mother_name: cleanData.mother_name || null,
            guardian_name:
              cleanData.guardian_name || null,
            guardian_relation:
              cleanData.guardian_relation || null,

            mobile: cleanData.contact_number_1,
            alternate_mobile:
              cleanData.contact_number_2 || null,

            full_address: cleanData.full_address,
            village_city: cleanData.village_city,
            district: cleanData.district,
            state: cleanData.state,
            pin_code: cleanData.pin_code,

            course: cleanData.course,

            student_photo_url: studentPhotoUrl,
            student_document_url: studentDocumentUrl,
            student_document_type:
              cleanData.student_document_type,

            status: "new",
          },
        ]);

      if (error) {
        console.error(
          "Supabase admission error:",
          error
        );

        throw new Error(
          error.message ||
            "Admission application could not be submitted."
        );
      }

      /* =====================================================
         SUCCESS
      ===================================================== */

      setSuccessMessage(
        "JazakAllahu Khairan! Your admission application has been submitted successfully. Our office team will review your application and contact you soon."
      );

      /* =====================================================
         RESET FORM
      ===================================================== */

      setFormData({
        full_name: "",
        date_of_birth: "",
        gender: "",

        father_name: "",
        mother_name: "",
        guardian_name: "",
        guardian_relation: "",
        contact_number_1: "",
        contact_number_2: "",

        full_address: "",
        village_city: "",
        district: "",
        state: "",
        pin_code: "",

        course: "",

        student_document_type: "",
      });

      setStudentPhoto(null);
      setStudentDocument(null);
      setDeclarationAccepted(false);

      /* Reset file inputs */

      const photoInput = document.getElementById(
        "student_photo"
      ) as HTMLInputElement | null;

      const documentInput = document.getElementById(
        "student_document"
      ) as HTMLInputElement | null;

      if (photoInput) {
        photoInput.value = "";
      }

      if (documentInput) {
        documentInput.value = "";
      }
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

  /* =========================================================
     UI
  ========================================================= */

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
            Join an institution dedicated to Islamic values,
            quality education, discipline and character building.
            Admissions are now open for the academic session 2026.
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
          ADMISSION INFORMATION
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
                Quran, Hifz, Nazrah, Qirat and Darse Nizami under
                qualified scholars.
              </p>
            </div>

            <div className="rounded-3xl bg-green-50 p-8 shadow-lg transition hover:-translate-y-1">
              <h3 className="mb-4 text-2xl font-bold text-green-700">
                Modern Education
              </h3>

              <p className="leading-8 text-gray-700">
                English, Mathematics, Basic Science and Moral
                Education with experienced teachers.
              </p>
            </div>

            <div className="rounded-3xl bg-green-50 p-8 shadow-lg transition hover:-translate-y-1">
              <h3 className="mb-4 text-2xl font-bold text-green-700">
                Character Building
              </h3>

              <p className="leading-8 text-gray-700">
                Focus on discipline, good manners, leadership and
                Islamic values.
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
                  ✅ Boys seeking quality Islamic and Modern
                  Education.
                </li>

                <li>
                  ✅ Good moral character and discipline.
                </li>

                <li>
                  ✅ Parent / Guardian consent is mandatory.
                </li>

                <li>
                  ✅ Admission is subject to seat availability.
                </li>
              </ul>
            </div>

            <div className="rounded-3xl bg-white p-8 shadow-xl ring-1 ring-gray-100 sm:p-10">
              <h2 className="mb-7 text-3xl font-extrabold text-gray-900">
                Required Documents
              </h2>

              <ul className="space-y-5 text-lg leading-8 text-gray-700">
                <li>
                  📷 Student Photograph — <strong>Mandatory</strong>
                </li>

                <li>
                  📄 Aadhaar Card OR Any One Student Certificate —
                  <strong> Mandatory</strong>
                </li>

                <li className="text-base text-gray-500">
                  Accepted certificates: Birth Certificate,
                  Previous School Certificate, Transfer Certificate
                  or other valid student certificate.
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
                  Complete the admission form with correct details.
                </p>
              </div>

              <div className="rounded-3xl bg-green-50 p-8 text-center shadow-lg">
                <div className="mb-5 text-5xl">2️⃣</div>

                <h3 className="text-xl font-bold text-green-700">
                  Upload Documents
                </h3>

                <p className="mt-4 leading-7 text-gray-700">
                  Upload the student photo and one valid certificate
                  or Aadhaar card.
                </p>
              </div>

              <div className="rounded-3xl bg-green-50 p-8 text-center shadow-lg">
                <div className="mb-5 text-5xl">3️⃣</div>

                <h3 className="text-xl font-bold text-green-700">
                  Verification
                </h3>

                <p className="mt-4 leading-7 text-gray-700">
                  Our office team will review the application and
                  documents.
                </p>
              </div>

              <div className="rounded-3xl bg-green-50 p-8 text-center shadow-lg">
                <div className="mb-5 text-5xl">4️⃣</div>

                <h3 className="text-xl font-bold text-green-700">
                  Admission Confirmed
                </h3>

                <p className="mt-4 leading-7 text-gray-700">
                  After approval, the admission will be confirmed.
                </p>
              </div>
            </div>
          </div>

          {/* =================================================
              APPLICATION FORM
          ================================================= */}

          <section
            id="apply"
            className="mt-24 rounded-[2rem] bg-gradient-to-br from-green-950 via-green-800 to-green-700 p-6 shadow-2xl sm:p-10 lg:p-14"
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
                  Please fill in the form carefully and upload the
                  required documents.
                </p>
              </div>

              {/* SUCCESS MESSAGE */}

              {successMessage && (
                <div className="mt-8 rounded-2xl bg-green-100 p-5 text-center font-semibold text-green-800">
                  ✅ {successMessage}
                </div>
              )}

              {/* ERROR MESSAGE */}

              {errorMessage && (
                <div className="mt-8 rounded-2xl bg-red-100 p-5 text-center font-semibold text-red-700">
                  ❌ {errorMessage}
                </div>
              )}

              {/* =================================================
                  FORM
              ================================================= */}

              <form
                onSubmit={handleSubmit}
                className="mt-10 rounded-3xl bg-white p-6 shadow-2xl sm:p-10"
              >
                {/* =================================================
                    SECTION 1
                ================================================= */}

                <div>
                  <div className="mb-7 border-b border-gray-200 pb-4">
                    <p className="text-sm font-bold uppercase tracking-[3px] text-green-600">
                      Section 1
                    </p>

                    <h3 className="mt-2 text-2xl font-extrabold text-gray-900">
                      Student Details
                    </h3>
                  </div>

                  <div className="grid gap-6 md:grid-cols-2">
                    {/* FULL NAME */}

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
                        className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 font-medium text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-green-600 focus:ring-2 focus:ring-green-100"
                      />
                    </div>

                    {/* DATE OF BIRTH */}

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
                        className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 font-medium text-gray-900 outline-none transition focus:border-green-600 focus:ring-2 focus:ring-green-100"
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
                        className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 font-medium text-gray-900 outline-none transition focus:border-green-600 focus:ring-2 focus:ring-green-100"
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
                  </div>
                </div>

                {/* =================================================
                    SECTION 2
                ================================================= */}

                <div className="mt-14 border-t border-gray-200 pt-12">
                  <div className="mb-7 border-b border-gray-200 pb-4">
                    <p className="text-sm font-bold uppercase tracking-[3px] text-green-600">
                      Section 2
                    </p>

                    <h3 className="mt-2 text-2xl font-extrabold text-gray-900">
                      Parent / Guardian Details
                    </h3>
                  </div>

                  <div className="grid gap-6 md:grid-cols-2">
                    {/* FATHER */}

                    <div>
                      <label
                        htmlFor="father_name"
                        className="mb-2 block font-semibold text-gray-800"
                      >
                        Father Name
                      </label>

                      <input
                        id="father_name"
                        name="father_name"
                        type="text"
                        value={formData.father_name}
                        onChange={handleChange}
                        placeholder="Enter father name"
                        className="w-full rounded-xl border border-gray-300 px-4 py-3 font-medium text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-green-600 focus:ring-2 focus:ring-green-100"
                      />
                    </div>

                    {/* MOTHER */}

                    <div>
                      <label
                        htmlFor="mother_name"
                        className="mb-2 block font-semibold text-gray-800"
                      >
                        Mother Name
                      </label>

                      <input
                        id="mother_name"
                        name="mother_name"
                        type="text"
                        value={formData.mother_name}
                        onChange={handleChange}
                        placeholder="Enter mother name"
                        className="w-full rounded-xl border border-gray-300 px-4 py-3 font-medium text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-green-600 focus:ring-2 focus:ring-green-100"
                      />
                    </div>

                    {/* GUARDIAN */}

                    <div>
                      <label
                        htmlFor="guardian_name"
                        className="mb-2 block font-semibold text-gray-800"
                      >
                        Guardian Name
                      </label>

                      <input
                        id="guardian_name"
                        name="guardian_name"
                        type="text"
                        value={formData.guardian_name}
                        onChange={handleChange}
                        placeholder="Enter guardian name"
                        className="w-full rounded-xl border border-gray-300 px-4 py-3 font-medium text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-green-600 focus:ring-2 focus:ring-green-100"
                      />
                    </div>

                    {/* RELATION */}

                    <div>
                      <label
                        htmlFor="guardian_relation"
                        className="mb-2 block font-semibold text-gray-800"
                      >
                        Relation with Student
                      </label>

                      <input
                        id="guardian_relation"
                        name="guardian_relation"
                        type="text"
                        value={formData.guardian_relation}
                        onChange={handleChange}
                        placeholder="e.g. Uncle, Grandfather"
                        className="w-full rounded-xl border border-gray-300 px-4 py-3 font-medium text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-green-600 focus:ring-2 focus:ring-green-100"
                      />
                    </div>

                    {/* CONTACT 1 */}

                    <div>
                      <label
                        htmlFor="contact_number_1"
                        className="mb-2 block font-semibold text-gray-800"
                      >
                        Contact Number 1 *
                      </label>

                      <input
                        id="contact_number_1"
                        name="contact_number_1"
                        type="tel"
                        required
                        value={formData.contact_number_1}
                        onChange={handleChange}
                        placeholder="Primary contact number"
                        className="w-full rounded-xl border border-gray-300 px-4 py-3 font-medium text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-green-600 focus:ring-2 focus:ring-green-100"
                      />
                    </div>

                    {/* CONTACT 2 */}

                    <div>
                      <label
                        htmlFor="contact_number_2"
                        className="mb-2 block font-semibold text-gray-800"
                      >
                        Contact Number 2
                      </label>

                      <input
                        id="contact_number_2"
                        name="contact_number_2"
                        type="tel"
                        value={formData.contact_number_2}
                        onChange={handleChange}
                        placeholder="Alternative contact number"
                        className="w-full rounded-xl border border-gray-300 px-4 py-3 font-medium text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-green-600 focus:ring-2 focus:ring-green-100"
                      />
                    </div>
                  </div>
                </div>

                {/* =================================================
                    SECTION 3
                ================================================= */}

                <div className="mt-14 border-t border-gray-200 pt-12">
                  <div className="mb-7 border-b border-gray-200 pb-4">
                    <p className="text-sm font-bold uppercase tracking-[3px] text-green-600">
                      Section 3
                    </p>

                    <h3 className="mt-2 text-2xl font-extrabold text-gray-900">
                      Address Details
                    </h3>
                  </div>

                  <div className="grid gap-6 md:grid-cols-2">
                    {/* FULL ADDRESS */}

                    <div className="md:col-span-2">
                      <label
                        htmlFor="full_address"
                        className="mb-2 block font-semibold text-gray-800"
                      >
                        Full Address *
                      </label>

                      <textarea
                        id="full_address"
                        name="full_address"
                        required
                        rows={3}
                        value={formData.full_address}
                        onChange={handleChange}
                        placeholder="Enter complete residential address"
                        className="w-full resize-none rounded-xl border border-gray-300 px-4 py-3 font-medium text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-green-600 focus:ring-2 focus:ring-green-100"
                      />
                    </div>

                    {/* VILLAGE / CITY */}

                    <div>
                      <label
                        htmlFor="village_city"
                        className="mb-2 block font-semibold text-gray-800"
                      >
                        Village / City *
                      </label>

                      <input
                        id="village_city"
                        name="village_city"
                        type="text"
                        required
                        value={formData.village_city}
                        onChange={handleChange}
                        placeholder="Village or city"
                        className="w-full rounded-xl border border-gray-300 px-4 py-3 font-medium text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-green-600 focus:ring-2 focus:ring-green-100"
                      />
                    </div>

                    {/* DISTRICT */}

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
                        placeholder="District"
                        className="w-full rounded-xl border border-gray-300 px-4 py-3 font-medium text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-green-600 focus:ring-2 focus:ring-green-100"
                      />
                    </div>

                    {/* STATE */}

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
                        placeholder="State"
                        className="w-full rounded-xl border border-gray-300 px-4 py-3 font-medium text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-green-600 focus:ring-2 focus:ring-green-100"
                      />
                    </div>

                    {/* PIN */}

                    <div>
                      <label
                        htmlFor="pin_code"
                        className="mb-2 block font-semibold text-gray-800"
                      >
                        PIN Code *
                      </label>

                      <input
                        id="pin_code"
                        name="pin_code"
                        type="text"
                        inputMode="numeric"
                        maxLength={6}
                        required
                        value={formData.pin_code}
                        onChange={handleChange}
                        placeholder="6 digit PIN code"
                        className="w-full rounded-xl border border-gray-300 px-4 py-3 font-medium text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-green-600 focus:ring-2 focus:ring-green-100"
                      />
                    </div>
                  </div>
                </div>

                {/* =================================================
                    SECTION 4
                ================================================= */}

                <div className="mt-14 border-t border-gray-200 pt-12">
                  <div className="mb-7 border-b border-gray-200 pb-4">
                    <p className="text-sm font-bold uppercase tracking-[3px] text-green-600">
                      Section 4
                    </p>

                    <h3 className="mt-2 text-2xl font-extrabold text-gray-900">
                      Admission Details
                    </h3>
                  </div>

                  <div>
                    <label
                      htmlFor="course"
                      className="mb-2 block font-semibold text-gray-800"
                    >
                      Select Course / Program *
                    </label>

                    <select
                      id="course"
                      name="course"
                      required
                      value={formData.course}
                      onChange={handleChange}
                      className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 font-medium text-gray-900 outline-none transition focus:border-green-600 focus:ring-2 focus:ring-green-100"
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
                </div>

                {/* =================================================
                    SECTION 5
                ================================================= */}

                <div className="mt-14 border-t border-gray-200 pt-12">
                  <div className="mb-7 border-b border-gray-200 pb-4">
                    <p className="text-sm font-bold uppercase tracking-[3px] text-green-600">
                      Section 5
                    </p>

                    <h3 className="mt-2 text-2xl font-extrabold text-gray-900">
                      Required Documents
                    </h3>

                    <p className="mt-2 text-sm text-gray-500">
                      Student photo and Aadhaar card or any one valid
                      student certificate are mandatory.
                    </p>
                  </div>

                  <div className="grid gap-6 md:grid-cols-2">
                    {/* STUDENT PHOTO */}

                    <div className="rounded-2xl border border-gray-200 bg-gray-50 p-6">
                      <label
                        htmlFor="student_photo"
                        className="mb-2 block font-bold text-gray-800"
                      >
                        Student Photo *
                      </label>

                      <p className="mb-4 text-sm leading-6 text-gray-500">
                        JPG, PNG or WEBP. Maximum size 5MB.
                      </p>

                      <input
                        id="student_photo"
                        name="student_photo"
                        type="file"
                        required
                        accept="image/jpeg,image/jpg,image/png,image/webp"
                        onChange={handleStudentPhotoChange}
                        className="block w-full cursor-pointer rounded-xl border border-gray-300 bg-white text-sm text-gray-700 file:mr-4 file:border-0 file:bg-green-700 file:px-4 file:py-3 file:font-semibold file:text-white hover:file:bg-green-800"
                      />

                      {studentPhoto && (
                        <p className="mt-3 break-all text-sm font-semibold text-green-700">
                          ✅ {studentPhoto.name}
                        </p>
                      )}
                    </div>

                    {/* STUDENT DOCUMENT */}

                    <div className="rounded-2xl border border-gray-200 bg-gray-50 p-6">
                      <label
                        htmlFor="student_document_type"
                        className="mb-2 block font-bold text-gray-800"
                      >
                        Document Type *
                      </label>

                      <select
                        id="student_document_type"
                        name="student_document_type"
                        required
                        value={formData.student_document_type}
                        onChange={handleChange}
                        className="mb-4 w-full rounded-xl border border-gray-300 bg-white px-4 py-3 font-medium text-gray-900 outline-none transition focus:border-green-600 focus:ring-2 focus:ring-green-100"
                      >
                        <option value="">
                          Select document type
                        </option>

                        <option value="Aadhaar Card">
                          Aadhaar Card
                        </option>

                        <option value="Birth Certificate">
                          Birth Certificate
                        </option>

                        <option value="Previous School Certificate">
                          Previous School Certificate
                        </option>

                        <option value="Transfer Certificate">
                          Transfer Certificate
                        </option>

                        <option value="Other Certificate">
                          Other Certificate
                        </option>
                      </select>

                      <input
                        id="student_document"
                        name="student_document"
                        type="file"
                        required
                        accept=".jpg,.jpeg,.png,.webp,.pdf"
                        onChange={handleStudentDocumentChange}
                        className="block w-full cursor-pointer rounded-xl border border-gray-300 bg-white text-sm text-gray-700 file:mr-4 file:border-0 file:bg-green-700 file:px-4 file:py-3 file:font-semibold file:text-white hover:file:bg-green-800"
                      />

                      <p className="mt-3 text-sm leading-6 text-gray-500">
                        JPG, PNG, WEBP or PDF. Maximum size 5MB.
                      </p>

                      {studentDocument && (
                        <p className="mt-3 break-all text-sm font-semibold text-green-700">
                          ✅ {studentDocument.name}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* =================================================
                    SECTION 6
                ================================================= */}

                <div className="mt-14 border-t border-gray-200 pt-12">
                  <div className="mb-7 border-b border-gray-200 pb-4">
                    <p className="text-sm font-bold uppercase tracking-[3px] text-green-600">
                      Section 6
                    </p>

                    <h3 className="mt-2 text-2xl font-extrabold text-gray-900">
                      Declaration
                    </h3>
                  </div>

                  <label className="flex cursor-pointer items-start gap-3 rounded-2xl bg-gray-50 p-5">
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
                      I confirm that the information provided in this
                      admission application is correct to the best of
                      my knowledge. I understand that the admission is
                      subject to verification and approval by the
                      madrasa administration.
                    </span>
                  </label>
                </div>

                {/* =================================================
                    SUBMIT
                ================================================= */}

                <button
                  type="submit"
                  disabled={loading}
                  className="mt-10 w-full rounded-xl bg-green-700 px-8 py-4 text-lg font-bold text-white shadow-lg transition hover:bg-green-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading
                    ? "Submitting Application..."
                    : "Submit Admission Application"}
                </button>

                <p className="mt-4 text-center text-sm text-gray-500">
                  Fields marked with * are mandatory.
                </p>
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
              If you have any questions regarding admission, courses
              or documents, please contact our office team.
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
    </>
  );
}
