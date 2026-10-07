import { useRef, useState } from "react";
import {
    ArrowLeft,
    ArrowRight,
    Upload,
    FileText,
    X,
    CheckCircle2,
    AlertCircle,
    Activity,
    UserRound,
    FlaskConical,
    History,
    Stethoscope,
    Sparkles,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import Sidebar from "../components/Sidebar";
import Header from "../components/Header";

function PatientInput() {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        condition: "",
        patientName: "",
        patientId: "",
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

    const laboratoryRef = useRef(null);
    const medicalHistoryRef = useRef(null);
    const longitudinalRef = useRef(null);

    const conditions = [
        {
            value: "pneumonia",
            label: "Pneumonia",
        },
        {
            value: "heart_attack",
            label: "Heart Attack",
        },
        {
            value: "sepsis",
            label: "Sepsis",
        },
        {
            value: "dengue",
            label: "Dengue",
        },
        {
            value: "malaria",
            label: "Malaria",
        },
        {
            value: "cancer",
            label: "Cancer",
        },
    ];

    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));

        if (errors[name]) {
            setErrors((prev) => ({
                ...prev,
                [name]: "",
            }));
        }
    };

    const handleFileChange = (type, file) => {
        if (!file) return;

        const allowedTypes = [
            "text/csv",
            "application/vnd.ms-excel",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            "application/pdf",
            "image/png",
            "image/jpeg",
        ];

        if (!allowedTypes.includes(file.type)) {
            setErrors((prev) => ({
                ...prev,
                [type]: "Please upload CSV, XLSX, PDF, PNG or JPG files.",
            }));

            return;
        }

        setFiles((prev) => ({
            ...prev,
            [type]: file,
        }));

        setErrors((prev) => ({
            ...prev,
            [type]: "",
        }));
    };

    const removeFile = (type) => {
        setFiles((prev) => ({
            ...prev,
            [type]: null,
        }));

        if (type === "laboratory") {
            laboratoryRef.current.value = "";
        }

        if (type === "medicalHistory") {
            medicalHistoryRef.current.value = "";
        }

        if (type === "longitudinal") {
            longitudinalRef.current.value = "";
        }
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
            newErrors.gender = "Please select gender.";
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
            newErrors.respiratoryRate = "Respiratory rate is required.";
        }

        if (!files.laboratory) {
            newErrors.laboratory = "Laboratory data file is required.";
        }

        if (!files.medicalHistory) {
            newErrors.medicalHistory =
                "Medical history file is required.";
        }

        if (!files.longitudinal) {
            newErrors.longitudinal =
                "Longitudinal measurement file is required.";
        }

        setErrors(newErrors);

        return Object.keys(newErrors).length === 0;
    };

    const handlePredict = (e) => {
        e.preventDefault();

        if (!validateForm()) {
            window.scrollTo({
                top: 0,
                behavior: "smooth",
            });

            return;
        }

        /*
         * Temporary frontend behavior.
         *
         * Later this will send FormData to the ML/backend API.
         */

        navigate("/prediction", {
            state: {
                formData,
                files,
            },
        });
    };

    const formatFileSize = (bytes) => {
        if (bytes < 1024) {
            return `${bytes} B`;
        }

        if (bytes < 1024 * 1024) {
            return `${(bytes / 1024).toFixed(1)} KB`;
        }

        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    };

    return (
        <div className="min-h-screen bg-slate-50">

            <Sidebar />

            <div className="lg:pl-64">

                <Header />

                <main className="mx-auto max-w-6xl px-5 py-7 sm:px-7 lg:px-8">

                    {/* Page heading */}
                    <div className="mb-7">

                        <button
                            onClick={() => navigate("/dashboard")}
                            className="mb-5 flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-slate-800"
                        >
                            <ArrowLeft size={16} />

                            Back to dashboard
                        </button>

                        <div>
                            <p className="mb-1 text-sm font-medium text-blue-600">
                                New Analysis
                            </p>

                            <h1 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
                                Patient Risk Assessment
                            </h1>

                            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                                Provide the available patient information and
                                select the health condition you want to assess.
                            </p>
                        </div>

                    </div>


                    <form onSubmit={handlePredict}>

                        {/* ============================================
                            CONDITION
                        ============================================= */}

                        <section className="mb-6 rounded-2xl border border-slate-200 bg-white shadow-sm">

                            <div className="border-b border-slate-100 px-6 py-5">

                                <div className="flex items-start gap-4">

                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                                        <Stethoscope size={20} />
                                    </div>

                                    <div>
                                        <h2 className="text-base font-semibold text-slate-900">
                                            Select health condition
                                        </h2>

                                        <p className="mt-1 text-sm text-slate-500">
                                            Choose the condition for which the
                                            patient risk should be assessed.
                                        </p>
                                    </div>

                                </div>

                            </div>


                            <div className="p-6">

                                <label
                                    htmlFor="condition"
                                    className="mb-2 block text-sm font-medium text-slate-700"
                                >
                                    Health condition
                                    <span className="ml-1 text-pink-500">
                                        *
                                    </span>
                                </label>

                                <select
                                    id="condition"
                                    name="condition"
                                    value={formData.condition}
                                    onChange={handleChange}
                                    className={`w-full rounded-lg border bg-white px-3.5 py-3 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 ${
                                        errors.condition
                                            ? "border-red-300"
                                            : "border-slate-300"
                                    }`}
                                >
                                    <option value="">
                                        Select a health condition
                                    </option>

                                    {conditions.map((condition) => (
                                        <option
                                            key={condition.value}
                                            value={condition.value}
                                        >
                                            {condition.label}
                                        </option>
                                    ))}
                                </select>

                                {errors.condition && (
                                    <p className="mt-2 flex items-center gap-1.5 text-xs text-red-500">
                                        <AlertCircle size={13} />
                                        {errors.condition}
                                    </p>
                                )}

                            </div>

                        </section>


                        {/* ============================================
                            PATIENT DETAILS
                        ============================================= */}

                        <section className="mb-6 rounded-2xl border border-slate-200 bg-white shadow-sm">

                            <div className="border-b border-slate-100 px-6 py-5">

                                <div className="flex items-start gap-4">

                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-pink-50 text-pink-500">
                                        <UserRound size={20} />
                                    </div>

                                    <div>
                                        <h2 className="text-base font-semibold text-slate-900">
                                            Patient information
                                        </h2>

                                        <p className="mt-1 text-sm text-slate-500">
                                            Basic information about the patient.
                                        </p>
                                    </div>

                                </div>

                            </div>


                            <div className="grid gap-5 p-6 sm:grid-cols-2">

                                {/* Name */}
                                <InputField
                                    label="Patient name"
                                    name="patientName"
                                    value={formData.patientName}
                                    onChange={handleChange}
                                    placeholder="Enter patient's full name"
                                    required
                                    error={errors.patientName}
                                />

                                {/* Patient ID */}
                                <InputField
                                    label="Patient ID"
                                    name="patientId"
                                    value={formData.patientId}
                                    onChange={handleChange}
                                    placeholder="Enter patient ID"
                                    required
                                    error={errors.patientId}
                                />

                                {/* Mobile */}
                                <InputField
                                    label="Mobile number"
                                    name="mobile"
                                    value={formData.mobile}
                                    onChange={handleChange}
                                    placeholder="+91 XXXXX XXXXX"
                                    type="tel"
                                    optional
                                />

                                {/* Age */}
                                <InputField
                                    label="Age"
                                    name="age"
                                    value={formData.age}
                                    onChange={handleChange}
                                    placeholder="Enter age"
                                    type="number"
                                    required
                                    error={errors.age}
                                    min="0"
                                    max="150"
                                />

                                {/* Gender */}
                                <div>

                                    <label
                                        htmlFor="gender"
                                        className="mb-2 block text-sm font-medium text-slate-700"
                                    >
                                        Gender
                                        <span className="ml-1 text-pink-500">
                                            *
                                        </span>
                                    </label>

                                    <select
                                        id="gender"
                                        name="gender"
                                        value={formData.gender}
                                        onChange={handleChange}
                                        className={`w-full rounded-lg border bg-white px-3.5 py-3 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 ${
                                            errors.gender
                                                ? "border-red-300"
                                                : "border-slate-300"
                                        }`}
                                    >
                                        <option value="">
                                            Select gender
                                        </option>

                                        <option value="male">
                                            Male
                                        </option>

                                        <option value="female">
                                            Female
                                        </option>

                                        <option value="other">
                                            Other
                                        </option>

                                    </select>

                                    {errors.gender && (
                                        <p className="mt-2 text-xs text-red-500">
                                            {errors.gender}
                                        </p>
                                    )}

                                </div>

                            </div>

                        </section>


                        {/* ============================================
                            VITAL SIGNS
                        ============================================= */}

                        <section className="mb-6 rounded-2xl border border-slate-200 bg-white shadow-sm">

                            <div className="border-b border-slate-100 px-6 py-5">

                                <div className="flex items-start gap-4">

                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                                        <Activity size={20} />
                                    </div>

                                    <div>
                                        <h2 className="text-base font-semibold text-slate-900">
                                            Vital signs
                                        </h2>

                                        <p className="mt-1 text-sm text-slate-500">
                                            Enter the patient's current vital
                                            measurements.
                                        </p>
                                    </div>

                                </div>

                            </div>


                            <div className="grid gap-5 p-6 sm:grid-cols-2 lg:grid-cols-3">

                                <InputField
                                    label="Heart rate"
                                    name="heartRate"
                                    value={formData.heartRate}
                                    onChange={handleChange}
                                    placeholder="e.g. 82"
                                    type="number"
                                    unit="bpm"
                                    required
                                    error={errors.heartRate}
                                />

                                <InputField
                                    label="Systolic blood pressure"
                                    name="systolicBP"
                                    value={formData.systolicBP}
                                    onChange={handleChange}
                                    placeholder="e.g. 120"
                                    type="number"
                                    unit="mmHg"
                                    required
                                    error={errors.systolicBP}
                                />

                                <InputField
                                    label="Diastolic blood pressure"
                                    name="diastolicBP"
                                    value={formData.diastolicBP}
                                    onChange={handleChange}
                                    placeholder="e.g. 80"
                                    type="number"
                                    unit="mmHg"
                                    required
                                    error={errors.diastolicBP}
                                />

                                <InputField
                                    label="Temperature"
                                    name="temperature"
                                    value={formData.temperature}
                                    onChange={handleChange}
                                    placeholder="e.g. 37.2"
                                    type="number"
                                    step="0.1"
                                    unit="°C"
                                    required
                                    error={errors.temperature}
                                />

                                <InputField
                                    label="SpO₂"
                                    name="spo2"
                                    value={formData.spo2}
                                    onChange={handleChange}
                                    placeholder="e.g. 98"
                                    type="number"
                                    unit="%"
                                    required
                                    error={errors.spo2}
                                />

                                <InputField
                                    label="Respiratory rate"
                                    name="respiratoryRate"
                                    value={formData.respiratoryRate}
                                    onChange={handleChange}
                                    placeholder="e.g. 18"
                                    type="number"
                                    unit="/min"
                                    required
                                    error={errors.respiratoryRate}
                                />

                            </div>

                        </section>


                        {/* ============================================
                            FILE UPLOADS
                        ============================================= */}

                        <section className="mb-6 rounded-2xl border border-slate-200 bg-white shadow-sm">

                            <div className="border-b border-slate-100 px-6 py-5">

                                <div className="flex items-start gap-4">

                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-pink-50 text-pink-500">
                                        <FlaskConical size={20} />
                                    </div>

                                    <div>
                                        <h2 className="text-base font-semibold text-slate-900">
                                            Clinical data
                                        </h2>

                                        <p className="mt-1 text-sm leading-5 text-slate-500">
                                            Upload the available clinical
                                            records used for the risk
                                            assessment.
                                        </p>
                                    </div>

                                </div>

                            </div>


                            <div className="space-y-6 p-6">

                                <FileUpload
                                    title="Laboratory values"
                                    description="Upload laboratory test results for the patient."
                                    file={files.laboratory}
                                    inputRef={laboratoryRef}
                                    onChange={(file) =>
                                        handleFileChange(
                                            "laboratory",
                                            file
                                        )
                                    }
                                    onRemove={() =>
                                        removeFile("laboratory")
                                    }
                                    error={errors.laboratory}
                                />


                                <FileUpload
                                    title="Medical history"
                                    description="Upload the patient's available medical history."
                                    file={files.medicalHistory}
                                    inputRef={medicalHistoryRef}
                                    onChange={(file) =>
                                        handleFileChange(
                                            "medicalHistory",
                                            file
                                        )
                                    }
                                    onRemove={() =>
                                        removeFile("medicalHistory")
                                    }
                                    error={errors.medicalHistory}
                                />


                                <FileUpload
                                    title="Longitudinal measurements"
                                    description="Upload previous measurements and patient observations."
                                    file={files.longitudinal}
                                    inputRef={longitudinalRef}
                                    onChange={(file) =>
                                        handleFileChange(
                                            "longitudinal",
                                            file
                                        )
                                    }
                                    onRemove={() =>
                                        removeFile("longitudinal")
                                    }
                                    error={errors.longitudinal}
                                />

                            </div>

                        </section>


                        {/* ============================================
                            REVIEW
                        ============================================= */}

                        <section className="mb-6 rounded-2xl border border-blue-100 bg-blue-50/50 p-6">

                            <div className="flex gap-4">

                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white text-blue-600 shadow-sm">
                                    <Sparkles size={19} />
                                </div>

                                <div>

                                    <h2 className="text-sm font-semibold text-slate-900">
                                        Ready for analysis?
                                    </h2>

                                    <p className="mt-1 text-sm leading-6 text-slate-500">
                                        The submitted patient information
                                        will be sent to the prediction
                                        service for analysis of the selected
                                        health condition.
                                    </p>

                                </div>

                            </div>

                        </section>


                        {/* ============================================
                            ACTIONS
                        ============================================= */}

                        <div className="flex flex-col-reverse gap-3 pb-10 sm:flex-row sm:justify-end">

                            <button
                                type="button"
                                onClick={() => navigate("/dashboard")}
                                className="rounded-lg border border-slate-300 bg-white px-5 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                            >
                                Cancel
                            </button>

                            <button
                                type="submit"
                                className="flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-6 py-3 text-sm font-medium text-white transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                            >
                                Predict Risk

                                <ArrowRight size={17} />
                            </button>

                        </div>

                    </form>

                </main>

            </div>

        </div>
    );
}


/* ============================================================
   INPUT FIELD COMPONENT
============================================================ */

function InputField({
    label,
    name,
    value,
    onChange,
    placeholder,
    type = "text",
    required = false,
    optional = false,
    error,
    unit,
    min,
    max,
    step,
}) {
    return (
        <div>

            <label
                htmlFor={name}
                className="mb-2 block text-sm font-medium text-slate-700"
            >
                {label}

                {required && (
                    <span className="ml-1 text-pink-500">
                        *
                    </span>
                )}

                {optional && (
                    <span className="ml-1.5 text-xs font-normal text-slate-400">
                        (optional)
                    </span>
                )}
            </label>


            <div className="relative">

                <input
                    id={name}
                    name={name}
                    type={type}
                    value={value}
                    onChange={onChange}
                    placeholder={placeholder}
                    min={min}
                    max={max}
                    step={step}
                    className={`w-full rounded-lg border bg-white px-3.5 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 ${
                        unit ? "pr-16" : ""
                    } ${
                        error
                            ? "border-red-300 focus:border-red-400 focus:ring-2 focus:ring-red-100"
                            : "border-slate-300 hover:border-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    }`}
                />

                {unit && (
                    <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">
                        {unit}
                    </span>
                )}

            </div>


            {error && (
                <p className="mt-1.5 text-xs text-red-500">
                    {error}
                </p>
            )}

        </div>
    );
}


/* ============================================================
   FILE UPLOAD COMPONENT
============================================================ */

function FileUpload({
    title,
    description,
    file,
    inputRef,
    onChange,
    onRemove,
    error,
}) {
    return (
        <div>

            <div className="mb-3">

                <h3 className="text-sm font-medium text-slate-800">
                    {title}
                </h3>

                <p className="mt-1 text-xs text-slate-500">
                    {description}
                </p>

            </div>


            {!file ? (
                <label
                    className={`group flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed px-5 py-8 text-center transition ${
                        error
                            ? "border-red-300 bg-red-50/30"
                            : "border-slate-300 bg-slate-50/50 hover:border-blue-400 hover:bg-blue-50/30"
                    }`}
                >

                    <input
                        ref={inputRef}
                        type="file"
                        className="hidden"
                        accept=".csv,.xlsx,.xls,.pdf,.png,.jpg,.jpeg"
                        onChange={(e) =>
                            onChange(e.target.files?.[0])
                        }
                    />

                    <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-white text-slate-400 shadow-sm transition group-hover:text-blue-600">
                        <Upload size={19} />
                    </div>

                    <p className="text-sm font-medium text-slate-700">
                        Click to upload
                    </p>

                    <p className="mt-1 text-xs text-slate-400">
                        CSV, XLSX, PDF, PNG or JPG
                    </p>

                </label>
            ) : (
                <div className="flex items-center justify-between gap-4 rounded-xl border border-emerald-200 bg-emerald-50/50 p-4">

                    <div className="flex min-w-0 items-center gap-3">

                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white text-emerald-600 shadow-sm">
                            <FileText size={19} />
                        </div>

                        <div className="min-w-0">

                            <p className="truncate text-sm font-medium text-slate-800">
                                {file.name}
                            </p>

                            <div className="mt-1 flex items-center gap-2">

                                <span className="text-xs text-slate-400">
                                    {formatFileSize(file.size)}
                                </span>

                                <span className="text-slate-300">
                                    •
                                </span>

                                <span className="flex items-center gap-1 text-xs text-emerald-600">
                                    <CheckCircle2 size={12} />
                                    Ready
                                </span>

                            </div>

                        </div>

                    </div>


                    <button
                        type="button"
                        onClick={onRemove}
                        className="shrink-0 rounded-lg p-2 text-slate-400 transition hover:bg-white hover:text-red-500"
                        aria-label={`Remove ${title}`}
                    >
                        <X size={17} />
                    </button>

                </div>
            )}


            {error && (
                <p className="mt-2 flex items-center gap-1.5 text-xs text-red-500">
                    <AlertCircle size={13} />
                    {error}
                </p>
            )}

        </div>
    );
}

export default PatientInput;