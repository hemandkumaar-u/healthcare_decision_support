import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    ArrowLeft,
    Activity,
    FileText,
    User,
    HeartPulse,
    ClipboardList,
    Upload,
} from "lucide-react";

import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import InputField from "../components/InputField";
import FileUpload from "../components/FileUpload";

function PatientInput() {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        condition: "",

        patientName: "",
        patientId: "",
        email: "",
        mobile: "",
        age: "",
        gender: "",

        heartRate: "",
        systolicBP: "",
        diastolicBP: "",
        temperature: "",
        spo2: "",
        respiratoryRate: "",
    });

    const [files, setFiles] = useState({
        laboratory: null,
        medicalHistory: null,
        longitudinal: null,
    });

    const [errors, setErrors] = useState({});

    const conditions = [
        "Acute Appendicitis",
        "Acute Kidney Injury",
        "Acute Myocardial Infarction",
        "Alcohol Related",
        "Back Pain",
        "Cerebral Infarction",
        "Chest Pain NOS",
        "Cholelithiasis",
        "COPD Exacerbation",
        "Dyspnea",
        "Fracture Forearm",
        "GI Hemorrhage",
        "Hypertensive Crisis",
        "Intracranial Injury",
        "Other/Not Coded",
        "Pneumonia Unspecified",
        "Poisoning Non-Opioid Analgesics",
        "Pulmonary Embolism",
        "Sepsis",
        "Stroke not specified",
        "Type 2 Diabetes Complication",
    ];

    const handleChange = (event) => {
        const { name, value } = event.target;

        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));

        // Remove error when user starts correcting the field
        if (errors[name]) {
            setErrors((prev) => ({
                ...prev,
                [name]: "",
            }));
        }
    };

    const handleFileChange = (type, file) => {
        setFiles((prev) => ({
            ...prev,
            [type]: file,
        }));
    };

    const handleFileRemove = (type) => {
        setFiles((prev) => ({
            ...prev,
            [type]: null,
        }));
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.condition) {
            newErrors.condition = "Please select a health condition.";
        }

        if (!formData.patientName.trim()) {
            newErrors.patientName = "Patient name is required.";
        }

        if (!formData.patientId.trim()) {
            newErrors.patientId = "Patient ID is required.";
        }

        if (!formData.age) {
            newErrors.age = "Age is required.";
        }

        if (!formData.gender) {
            newErrors.gender = "Gender is required.";
        }

        if (!formData.heartRate) {
            newErrors.heartRate = "Heart rate is required.";
        }

        if (!formData.systolicBP) {
            newErrors.systolicBP = "Systolic BP is required.";
        }

        if (!formData.diastolicBP) {
            newErrors.diastolicBP = "Diastolic BP is required.";
        }

        if (!formData.temperature) {
            newErrors.temperature = "Temperature is required.";
        }

        if (!formData.spo2) {
            newErrors.spo2 = "SpO₂ is required.";
        }

        if (!formData.respiratoryRate) {
            newErrors.respiratoryRate =
                "Respiratory rate is required.";
        }

        setErrors(newErrors);

        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (event) => {
        event.preventDefault();

        if (!validateForm()) {
            window.scrollTo({
                top: 0,
                behavior: "smooth",
            });

            return;
        }

        navigate("/prediction", {
            state: {
                formData,
                files,
            },
        });
    };

    return (
        <div className="min-h-screen bg-[conic-gradient(at_bottom_right,_var(--tw-gradient-stops))] from-slate-100 via-indigo-50 to-blue-100 font-sans">
            <Sidebar />

            <div className="lg:pl-64">

                <Header />

                <main className="px-5 py-6 sm:px-7 lg:px-8">

                    <div className="mx-auto max-w-6xl">

                        {/* Back */}
                        <button
                            type="button"
                            onClick={() => navigate("/dashboard")}
                            className="mb-5 flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-blue-600"
                        >
                            <ArrowLeft size={17} />
                            Back to dashboard
                        </button>

                        {/* Page heading */}
                        <div className="mb-8">

                            <div className="flex items-center gap-4">

                                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 text-blue-600 shadow-sm ring-1 ring-blue-100/50">
                                    <Activity size={24} />
                                </div>

                                <div>
                                    <h1 className="text-3xl font-bold tracking-tight text-slate-900 font-['Inter']">
                                        New Patient Analysis
                                    </h1>

                                    <p className="mt-1 text-sm font-medium text-slate-500 font-['Roboto']">
                                        Enter the available patient information for risk assessment.
                                    </p>
                                </div>

                            </div>

                        </div>

                        <form onSubmit={handleSubmit}>

                            {/* ================================================= */}
                            {/* CONDITION */}
                            {/* ================================================= */}

                            <section className="mb-8 relative overflow-hidden rounded-3xl border border-white/50 bg-white/40 shadow-[0_8px_30px_rgb(0,0,0,0.04)] backdrop-blur-xl">

                                <div className="absolute top-0 right-0 h-40 w-40 rounded-full bg-gradient-to-bl from-amber-200 to-orange-300 opacity-10 blur-3xl pointer-events-none"></div>

                                <div className="relative z-10 border-b border-white/40 px-7 py-6">

                                    <div className="flex items-center gap-4">

                                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-sm ring-1 ring-slate-200/50 text-amber-600">
                                            <ClipboardList size={22} />
                                        </div>

                                        <div>
                                            <h2 className="text-xl font-bold text-slate-900 font-['Inter']">
                                                Assessment
                                            </h2>

                                            <p className="mt-1 text-sm font-medium text-slate-500 font-['Roboto']">
                                                Select the health condition to assess.
                                            </p>
                                        </div>

                                    </div>

                                </div>

                                <div className="relative z-10 p-7">

                                    <label
                                        htmlFor="condition"
                                        className="mb-2 block text-sm font-semibold text-slate-700 font-['Inter']"
                                    >
                                        Health condition
                                        <span className="ml-1 text-red-500">
                                            *
                                        </span>
                                    </label>

                                    <select
                                        id="condition"
                                        name="condition"
                                        value={formData.condition}
                                        onChange={handleChange}
                                        className={`w-full rounded-2xl border bg-white/50 px-4 py-3.5 text-sm font-medium text-slate-900 shadow-sm outline-none backdrop-blur-sm transition-all font-['Roboto'] ${
                                            errors.condition
                                                ? "border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-100 bg-red-50/50"
                                                : "border-slate-200/60 hover:bg-white/80 focus:bg-white focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10"
                                        }`}
                                    >
                                        <option value="">
                                            Select a condition
                                        </option>

                                        {conditions.map((condition) => (
                                            <option
                                                key={condition}
                                                value={condition}
                                            >
                                                {condition}
                                            </option>
                                        ))}
                                    </select>

                                    {errors.condition && (
                                        <p className="mt-1.5 text-xs text-red-500">
                                            {errors.condition}
                                        </p>
                                    )}

                                </div>

                            </section>


                            {/* ================================================= */}
                            {/* PATIENT INFORMATION */}
                            {/* ================================================= */}

                            <section className="mb-8 relative overflow-hidden rounded-3xl border border-white/50 bg-white/40 shadow-[0_8px_30px_rgb(0,0,0,0.04)] backdrop-blur-xl">

                                <div className="absolute top-0 right-0 h-64 w-64 rounded-full bg-gradient-to-bl from-blue-200 to-indigo-300 opacity-10 blur-3xl pointer-events-none"></div>

                                <div className="relative z-10 border-b border-white/40 px-7 py-6">

                                    <div className="flex items-center gap-4">

                                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-sm ring-1 ring-slate-200/50 text-indigo-600">
                                            <User size={22} />
                                        </div>

                                        <div>
                                            <h2 className="text-xl font-bold text-slate-900 font-['Inter']">
                                                Patient Information
                                            </h2>

                                            <p className="mt-1 text-sm font-medium text-slate-500 font-['Roboto']">
                                                Basic information about the patient.
                                            </p>
                                        </div>

                                    </div>

                                </div>

                                <div className="relative z-10 grid gap-6 p-7 md:grid-cols-2">

                                    <InputField
                                        label="Patient name"
                                        name="patientName"
                                        value={formData.patientName}
                                        onChange={handleChange}
                                        placeholder="Enter patient name"
                                        required
                                        error={errors.patientName}
                                    />

                                    <InputField
                                        label="Patient ID"
                                        name="patientId"
                                        value={formData.patientId}
                                        onChange={handleChange}
                                        placeholder="Enter patient ID"
                                        required
                                        error={errors.patientId}
                                    />

                                    <InputField
                                        label="Email address"
                                        name="email"
                                        type="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        placeholder="Enter email for reports"
                                    />

                                    <InputField
                                        label="Mobile number"
                                        name="mobile"
                                        type="tel"
                                        value={formData.mobile}
                                        onChange={handleChange}
                                        placeholder="Optional"
                                    />

                                    <InputField
                                        label="Age"
                                        name="age"
                                        type="number"
                                        value={formData.age}
                                        onChange={handleChange}
                                        placeholder="Enter age"
                                        min="0"
                                        max="120"
                                        required
                                        error={errors.age}
                                    />

                                    <div>

                                        <label
                                            htmlFor="gender"
                                            className="mb-2 block text-sm font-semibold text-slate-700 font-['Inter']"
                                        >
                                            Gender
                                            <span className="ml-1 text-red-500">
                                                *
                                            </span>
                                        </label>

                                        <select
                                            id="gender"
                                            name="gender"
                                            value={formData.gender}
                                            onChange={handleChange}
                                            className={`w-full rounded-2xl border bg-white/50 px-4 py-3.5 text-sm font-medium text-slate-900 shadow-sm outline-none backdrop-blur-sm transition-all font-['Roboto'] ${
                                                errors.gender
                                                    ? "border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-100 bg-red-50/50"
                                                    : "border-slate-200/60 hover:bg-white/80 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
                                            }`}
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
                                            <option value="Other">
                                                Other
                                            </option>
                                        </select>

                                        {errors.gender && (
                                            <p className="mt-1.5 text-xs text-red-500">
                                                {errors.gender}
                                            </p>
                                        )}

                                    </div>

                                </div>

                            </section>


                            {/* ================================================= */}
                            {/* VITAL SIGNS */}
                            {/* ================================================= */}

                            <section className="mb-8 relative overflow-hidden rounded-3xl border border-white/50 bg-white/40 shadow-[0_8px_30px_rgb(0,0,0,0.04)] backdrop-blur-xl">

                                <div className="absolute top-0 left-0 h-64 w-64 rounded-full bg-gradient-to-br from-pink-200 to-rose-300 opacity-10 blur-3xl pointer-events-none"></div>

                                <div className="relative z-10 border-b border-white/40 px-7 py-6">

                                    <div className="flex items-center gap-4">

                                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-sm ring-1 ring-slate-200/50 text-pink-600">
                                            <HeartPulse size={22} />
                                        </div>

                                        <div>
                                            <h2 className="text-xl font-bold text-slate-900 font-['Inter']">
                                                Vital Signs
                                            </h2>

                                            <p className="mt-1 text-sm font-medium text-slate-500 font-['Roboto']">
                                                Enter the patient's current vital measurements.
                                            </p>
                                        </div>

                                    </div>

                                </div>

                                <div className="relative z-10 grid gap-6 p-7 sm:grid-cols-2 lg:grid-cols-3">

                                    <InputField
                                        label="Heart rate"
                                        name="heartRate"
                                        type="number"
                                        value={formData.heartRate}
                                        onChange={handleChange}
                                        placeholder="e.g. 72"
                                        unit="bpm"
                                        required
                                        error={errors.heartRate}
                                    />

                                    <InputField
                                        label="Systolic blood pressure"
                                        name="systolicBP"
                                        type="number"
                                        value={formData.systolicBP}
                                        onChange={handleChange}
                                        placeholder="e.g. 120"
                                        unit="mmHg"
                                        required
                                        error={errors.systolicBP}
                                    />

                                    <InputField
                                        label="Diastolic blood pressure"
                                        name="diastolicBP"
                                        type="number"
                                        value={formData.diastolicBP}
                                        onChange={handleChange}
                                        placeholder="e.g. 80"
                                        unit="mmHg"
                                        required
                                        error={errors.diastolicBP}
                                    />

                                    <InputField
                                        label="Temperature"
                                        name="temperature"
                                        type="number"
                                        step="0.1"
                                        value={formData.temperature}
                                        onChange={handleChange}
                                        placeholder="e.g. 37.0"
                                        unit="°C"
                                        required
                                        error={errors.temperature}
                                    />

                                    <InputField
                                        label="Oxygen saturation"
                                        name="spo2"
                                        type="number"
                                        value={formData.spo2}
                                        onChange={handleChange}
                                        placeholder="e.g. 98"
                                        unit="%"
                                        required
                                        error={errors.spo2}
                                    />

                                    <InputField
                                        label="Respiratory rate"
                                        name="respiratoryRate"
                                        type="number"
                                        value={formData.respiratoryRate}
                                        onChange={handleChange}
                                        placeholder="e.g. 16"
                                        unit="/min"
                                        required
                                        error={errors.respiratoryRate}
                                    />

                                </div>

                            </section>


                            {/* ================================================= */}
                            {/* CLINICAL FILES */}
                            {/* ================================================= */}

                            <section className="mb-8 relative overflow-hidden rounded-3xl border border-white/50 bg-white/40 shadow-[0_8px_30px_rgb(0,0,0,0.04)] backdrop-blur-xl">

                                <div className="absolute bottom-0 right-0 h-64 w-64 rounded-full bg-gradient-to-tl from-emerald-200 to-teal-300 opacity-10 blur-3xl pointer-events-none"></div>

                                <div className="relative z-10 border-b border-white/40 px-7 py-6">

                                    <div className="flex items-center gap-4">

                                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-sm ring-1 ring-slate-200/50 text-emerald-600">
                                            <FileText size={22} />
                                        </div>

                                        <div>
                                            <h2 className="text-xl font-bold text-slate-900 font-['Inter']">
                                                Clinical Information
                                            </h2>

                                            <p className="mt-1 text-sm font-medium text-slate-500 font-['Roboto']">
                                                Upload additional patient information when available.
                                            </p>
                                        </div>

                                    </div>

                                </div>

                                <div className="relative z-10 space-y-7 p-7">

                                    <FileUpload
                                        label="Laboratory values"
                                        description="Upload laboratory test results or blood investigation data."
                                        file={files.laboratory}
                                        onChange={(file) =>
                                            handleFileChange(
                                                "laboratory",
                                                file
                                            )
                                        }
                                        onRemove={() =>
                                            handleFileRemove(
                                                "laboratory"
                                            )
                                        }
                                    />

                                    <FileUpload
                                        label="Medical history"
                                        description="Upload relevant medical history or previous clinical records."
                                        file={files.medicalHistory}
                                        onChange={(file) =>
                                            handleFileChange(
                                                "medicalHistory",
                                                file
                                            )
                                        }
                                        onRemove={() =>
                                            handleFileRemove(
                                                "medicalHistory"
                                            )
                                        }
                                    />

                                    <FileUpload
                                        label="Longitudinal measurements"
                                        description="Upload previous measurements or time-series patient data."
                                        file={files.longitudinal}
                                        onChange={(file) =>
                                            handleFileChange(
                                                "longitudinal",
                                                file
                                            )
                                        }
                                        onRemove={() =>
                                            handleFileRemove(
                                                "longitudinal"
                                            )
                                        }
                                    />

                                    <div className="flex items-start gap-4 rounded-2xl border border-indigo-200/60 bg-indigo-50/50 p-5 backdrop-blur-sm">

                                        <Upload
                                            size={20}
                                            className="mt-0.5 shrink-0 text-indigo-500"
                                        />

                                        <p className="text-sm leading-relaxed text-indigo-900 font-['Roboto']">
                                            <strong>Clinical files are optional.</strong> If information
                                            is unavailable, the system will identify
                                            the missing data during the assessment.
                                        </p>

                                    </div>

                                </div>

                            </section>


                            {/* ================================================= */}
                            {/* ACTIONS */}
                            {/* ================================================= */}

                            <div className="mt-8 flex flex-col-reverse gap-4 sm:flex-row sm:justify-end">

                                <button
                                    type="button"
                                    onClick={() =>
                                        navigate("/dashboard")
                                    }
                                    className="rounded-2xl border border-slate-200 bg-white/80 px-8 py-4 text-sm font-bold text-slate-700 shadow-sm backdrop-blur-sm transition-all hover:bg-slate-50 hover:shadow"
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    className="rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-4 text-sm font-bold text-white shadow-lg shadow-blue-500/30 transition-all hover:shadow-xl hover:shadow-blue-500/40 hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                                >
                                    Predict Risk
                                </button>

                            </div>

                            {/* Disclaimer */}
                            <p className="mt-6 text-center text-xs leading-5 text-slate-400 font-['Roboto']">
                                This assessment is intended for research and
                                educational decision-support purposes and does not
                                replace professional medical judgment.
                            </p>

                        </form>

                    </div>

                </main>

            </div>

        </div>
    );
}

export default PatientInput;