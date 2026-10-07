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
        "Pneumonia",
        "Heart Attack",
        "Sepsis",
        "Dengue",
        "Malaria",
        "Cancer",
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
        <div className="min-h-screen bg-slate-50">

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
                        <div className="mb-7">

                            <div className="flex items-center gap-3">

                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
                                    <Activity size={21} />
                                </div>

                                <div>
                                    <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
                                        New Patient Analysis
                                    </h1>

                                    <p className="mt-1 text-sm text-slate-500">
                                        Enter the available patient information for risk assessment.
                                    </p>
                                </div>

                            </div>

                        </div>

                        <form onSubmit={handleSubmit}>

                            {/* ================================================= */}
                            {/* CONDITION */}
                            {/* ================================================= */}

                            <section className="mb-6 rounded-xl border border-slate-200 bg-white shadow-sm">

                                <div className="border-b border-slate-100 px-6 py-5">

                                    <div className="flex items-center gap-3">

                                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                                            <ClipboardList size={19} />
                                        </div>

                                        <div>
                                            <h2 className="text-base font-semibold text-slate-900">
                                                Assessment
                                            </h2>

                                            <p className="mt-0.5 text-xs text-slate-500">
                                                Select the health condition to assess.
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
                                        <span className="ml-1 text-red-500">
                                            *
                                        </span>
                                    </label>

                                    <select
                                        id="condition"
                                        name="condition"
                                        value={formData.condition}
                                        onChange={handleChange}
                                        className={`w-full rounded-lg border bg-white px-3.5 py-3 text-sm text-slate-900 outline-none transition ${
                                            errors.condition
                                                ? "border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-100"
                                                : "border-slate-300 hover:border-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
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

                            <section className="mb-6 rounded-xl border border-slate-200 bg-white shadow-sm">

                                <div className="border-b border-slate-100 px-6 py-5">

                                    <div className="flex items-center gap-3">

                                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                                            <User size={19} />
                                        </div>

                                        <div>
                                            <h2 className="text-base font-semibold text-slate-900">
                                                Patient Information
                                            </h2>

                                            <p className="mt-0.5 text-xs text-slate-500">
                                                Basic information about the patient.
                                            </p>
                                        </div>

                                    </div>

                                </div>

                                <div className="grid gap-5 p-6 md:grid-cols-2">

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
                                            className="mb-2 block text-sm font-medium text-slate-700"
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
                                            className={`w-full rounded-lg border bg-white px-3.5 py-3 text-sm text-slate-900 outline-none transition ${
                                                errors.gender
                                                    ? "border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-100"
                                                    : "border-slate-300 hover:border-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
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

                            <section className="mb-6 rounded-xl border border-slate-200 bg-white shadow-sm">

                                <div className="border-b border-slate-100 px-6 py-5">

                                    <div className="flex items-center gap-3">

                                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-pink-50 text-pink-600">
                                            <HeartPulse size={19} />
                                        </div>

                                        <div>
                                            <h2 className="text-base font-semibold text-slate-900">
                                                Vital Signs
                                            </h2>

                                            <p className="mt-0.5 text-xs text-slate-500">
                                                Enter the patient's current vital measurements.
                                            </p>
                                        </div>

                                    </div>

                                </div>

                                <div className="grid gap-5 p-6 sm:grid-cols-2 lg:grid-cols-3">

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

                            <section className="mb-6 rounded-xl border border-slate-200 bg-white shadow-sm">

                                <div className="border-b border-slate-100 px-6 py-5">

                                    <div className="flex items-center gap-3">

                                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
                                            <FileText size={19} />
                                        </div>

                                        <div>
                                            <h2 className="text-base font-semibold text-slate-900">
                                                Clinical Information
                                            </h2>

                                            <p className="mt-0.5 text-xs text-slate-500">
                                                Upload additional patient information when available.
                                            </p>
                                        </div>

                                    </div>

                                </div>

                                <div className="space-y-6 p-6">

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

                                    <div className="flex items-start gap-3 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">

                                        <Upload
                                            size={17}
                                            className="mt-0.5 shrink-0 text-slate-500"
                                        />

                                        <p className="text-xs leading-5 text-slate-500">
                                            Clinical files are optional. If information
                                            is unavailable, the system will identify
                                            the missing data during the assessment.
                                        </p>

                                    </div>

                                </div>

                            </section>


                            {/* ================================================= */}
                            {/* ACTIONS */}
                            {/* ================================================= */}

                            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">

                                <button
                                    type="button"
                                    onClick={() =>
                                        navigate("/dashboard")
                                    }
                                    className="rounded-lg border border-slate-300 bg-white px-5 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    className="rounded-lg bg-blue-600 px-6 py-3 text-sm font-medium text-white transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                                >
                                    Predict Risk
                                </button>

                            </div>

                            {/* Disclaimer */}
                            <p className="mt-5 text-center text-xs leading-5 text-slate-400">
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