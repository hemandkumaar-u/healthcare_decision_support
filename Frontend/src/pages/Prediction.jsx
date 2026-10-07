import { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
    ArrowLeft,
    CheckCircle2,
    AlertTriangle,
    FileText,
    User,
    Activity,
    ClipboardList,
    HeartPulse,
    Phone,
    Save,
    ShieldCheck,
    Stethoscope,
    Plus,
    Trash2,
} from "lucide-react";

import Sidebar from "../components/Sidebar";
import Header from "../components/Header";

function Prediction() {
    const navigate = useNavigate();
    const location = useLocation();

    const { formData, files } = location.state || {};

    const [showPrescription, setShowPrescription] = useState(false);

    const [medications, setMedications] = useState([
        {
            id: Date.now(),
            medication: "",
            dosage: "",
            frequency: "",
            duration: "",
            instructions: "",
        },
    ]);

    const [saved, setSaved] = useState(false);

    /*
     * =========================================================
     * NO PATIENT DATA
     * =========================================================
     */

    if (!formData) {
        return (
            <div className="min-h-screen bg-slate-50">
                <Sidebar />

                <div className="lg:pl-64">
                    <Header />

                    <main className="flex min-h-[calc(100vh-64px)] items-center justify-center px-5 py-10">

                        <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-8 text-center shadow-sm">

                            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-amber-50 text-amber-600">
                                <AlertTriangle size={24} />
                            </div>

                            <h1 className="mt-4 text-lg font-semibold text-slate-900">
                                No patient data found
                            </h1>

                            <p className="mt-2 text-sm leading-6 text-slate-500">
                                Please enter patient information before
                                running a risk assessment.
                            </p>

                            <button
                                type="button"
                                onClick={() => navigate("/patient/new")}
                                className="mt-6 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700"
                            >
                                New Analysis
                            </button>

                        </div>

                    </main>
                </div>
            </div>
        );
    }

    /*
     * =========================================================
     * TEMPORARY FRONTEND PREDICTION
     * =========================================================
     *
     * Replace this object with the actual backend response.
     *
     * Dataset interpretation:
     *
     * 0 = Normal
     * 1 = Mild
     * 2 = Moderate
     * 3 = Severe
     * 4 = Critical
     */

    const prediction = {
        class: 3,
        label: "Severe",
    };

    /*
     * =========================================================
     * DATA COMPLETENESS
     * =========================================================
     *
     * Temporary frontend calculation.
     * Backend should eventually provide the actual value.
     */

    const dataStatus = useMemo(() => {
        const requiredFields = [
            "patientName",
            "patientId",
            "age",
            "gender",
            "heartRate",
            "systolicBP",
            "diastolicBP",
            "temperature",
            "spo2",
            "respiratoryRate",
        ];

        const completedFields = requiredFields.filter(
            (field) =>
                formData[field] !== undefined &&
                formData[field] !== null &&
                String(formData[field]).trim() !== ""
        );

        const uploadedFiles = files
            ? Object.values(files).filter(Boolean).length
            : 0;

        const totalFiles = 3;

        const fieldCompletion =
            (completedFields.length / requiredFields.length) * 70;

        const fileCompletion =
            (uploadedFiles / totalFiles) * 30;

        const completeness = Math.round(
            fieldCompletion + fileCompletion
        );

        const missingFiles = [];

        if (!files?.laboratory) {
            missingFiles.push("Laboratory values");
        }

        if (!files?.medicalHistory) {
            missingFiles.push("Medical history");
        }

        if (!files?.longitudinal) {
            missingFiles.push("Longitudinal measurements");
        }

        return {
            completeness,
            missingFiles,
            uploadedFiles,
        };
    }, [formData, files]);

    /*
     * =========================================================
     * RISK STYLE
     * =========================================================
     */

    const getRiskStyle = (riskClass) => {
        switch (Number(riskClass)) {
            case 0:
                return {
                    label: "Normal",
                    bg: "bg-green-50",
                    border: "border-green-200",
                    textColor: "text-green-700",
                };

            case 1:
                return {
                    label: "Mild",
                    bg: "bg-yellow-50",
                    border: "border-yellow-200",
                    textColor: "text-yellow-700",
                };

            case 2:
                return {
                    label: "Moderate",
                    bg: "bg-orange-50",
                    border: "border-orange-200",
                    textColor: "text-orange-700",
                };

            case 3:
                return {
                    label: "Severe",
                    bg: "bg-red-50",
                    border: "border-red-200",
                    textColor: "text-red-700",
                };

            case 4:
                return {
                    label: "Critical",
                    bg: "bg-red-50",
                    border: "border-red-300",
                    textColor: "text-red-800",
                };

            default:
                return {
                    label: "Unknown",
                    bg: "bg-slate-50",
                    border: "border-slate-200",
                    textColor: "text-slate-700",
                };
        }
    };

    const riskStyle = getRiskStyle(prediction.class);

    /*
     * =========================================================
     * RISK DESCRIPTION
     * =========================================================
     */

    const getRiskDescription = (riskClass) => {
        switch (Number(riskClass)) {
            case 0:
                return "The model classified the patient's condition as Normal.";

            case 1:
                return "The model classified the patient's condition as Mild.";

            case 2:
                return "The model classified the patient's condition as Moderate.";

            case 3:
                return "The model classified the patient's condition as Severe.";

            case 4:
                return "The model classified the patient's condition as Critical.";

            default:
                return "The model returned an unknown risk class.";
        }
    };

    /*
     * =========================================================
     * MEDICATION HANDLING
     * =========================================================
     */

    const addMedication = () => {
        setMedications((previous) => [
            ...previous,
            {
                id: Date.now() + Math.random(),
                medication: "",
                dosage: "",
                frequency: "",
                duration: "",
                instructions: "",
            },
        ]);
    };

    const removeMedication = (id) => {
        setMedications((previous) => {
            if (previous.length === 1) {
                return previous;
            }

            return previous.filter(
                (medication) => medication.id !== id
            );
        });
    };

    const handleMedicationChange = (
        id,
        field,
        value
    ) => {
        setMedications((previous) =>
            previous.map((medication) =>
                medication.id === id
                    ? {
                          ...medication,
                          [field]: value,
                      }
                    : medication
            )
        );
    };

    /*
     * =========================================================
     * SAVE ANALYSIS
     * =========================================================
     */

    const handleSave = () => {
        /*
         * Mobile is required when prescription is selected.
         */

        if (
            showPrescription &&
            !formData.mobile?.trim()
        ) {
            alert(
                "A mobile number is required when providing a prescription."
            );

            return;
        }

        /*
         * Medication validation
         */

        if (showPrescription) {
            const incompleteMedication =
                medications.some(
                    (medication) =>
                        !medication.medication.trim() ||
                        !medication.dosage.trim() ||
                        !medication.frequency.trim() ||
                        !medication.duration.trim()
                );

            if (incompleteMedication) {
                alert(
                    "Please complete the medication, dosage, frequency and duration for every medication."
                );

                return;
            }
        }

        const analysis = {
            id: `AN-${Date.now()}`,

            patient: {
                name: formData.patientName,
                patientId: formData.patientId,
                mobile: formData.mobile || "",
                age: formData.age,
                gender: formData.gender,
            },

            condition: formData.condition,

            input: {
                heartRate: formData.heartRate,
                systolicBP: formData.systolicBP,
                diastolicBP: formData.diastolicBP,
                temperature: formData.temperature,
                spo2: formData.spo2,
                respiratoryRate:
                    formData.respiratoryRate,
            },

            prediction: {
                class: prediction.class,
                label: riskStyle.label,
            },

            dataCompleteness:
                dataStatus.completeness,

            missingData:
                dataStatus.missingFiles,

            /*
             * Multiple medications are stored here.
             */

            prescription: showPrescription
                ? {
                      mobile: formData.mobile,
                      medications: medications.map(
                          (medication) => ({
                              medication:
                                  medication.medication,
                              dosage:
                                  medication.dosage,
                              frequency:
                                  medication.frequency,
                              duration:
                                  medication.duration,
                              instructions:
                                  medication.instructions,
                          })
                      ),
                  }
                : null,

            createdAt: new Date().toISOString(),
        };

        const existingHistory = JSON.parse(
            localStorage.getItem(
                "analysisHistory"
            ) || "[]"
        );

        localStorage.setItem(
            "analysisHistory",
            JSON.stringify([
                analysis,
                ...existingHistory,
            ])
        );

        setSaved(true);
    };

    /*
     * =========================================================
     * PAGE
     * =========================================================
     */

    return (
        <div className="min-h-screen bg-slate-50">

            <Sidebar />

            <div className="lg:pl-64">

                <Header />

                <main className="px-5 py-6 sm:px-7 lg:px-8">

                    <div className="mx-auto max-w-6xl">

                        {/* ================================================= */}
                        {/* BACK */}
                        {/* ================================================= */}

                        <button
                            type="button"
                            onClick={() =>
                                navigate("/patient/new")
                            }
                            className="mb-5 flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-blue-600"
                        >
                            <ArrowLeft size={17} />
                            Back to patient input
                        </button>


                        {/* ================================================= */}
                        {/* PAGE HEADER */}
                        {/* ================================================= */}

                        <div className="mb-7">

                            <div className="flex items-center gap-3">

                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
                                    <Activity size={21} />
                                </div>

                                <div>

                                    <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
                                        Risk Assessment
                                    </h1>

                                    <p className="mt-1 text-sm text-slate-500">
                                        Assessment result for the selected health condition.
                                    </p>

                                </div>

                            </div>

                        </div>


                        {/* ================================================= */}
                        {/* CONDITION + PATIENT */}
                        {/* ================================================= */}

                        <div className="mb-6 grid gap-6 lg:grid-cols-2">

                            {/* Condition */}

                            <section className="rounded-xl border border-slate-200 bg-white shadow-sm">

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
                                                Selected health condition
                                            </p>

                                        </div>

                                    </div>

                                </div>

                                <div className="p-6">

                                    <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                                        Condition
                                    </p>

                                    <p className="mt-2 text-xl font-semibold text-slate-900">
                                        {formData.condition}
                                    </p>

                                    <div className="mt-4 flex items-center gap-2 text-xs text-slate-500">

                                        <ShieldCheck
                                            size={15}
                                            className="text-blue-600"
                                        />

                                        Decision-support assessment

                                    </div>

                                </div>

                            </section>


                            {/* Patient */}

                            <section className="rounded-xl border border-slate-200 bg-white shadow-sm">

                                <div className="border-b border-slate-100 px-6 py-5">

                                    <div className="flex items-center gap-3">

                                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
                                            <User size={19} />
                                        </div>

                                        <div>

                                            <h2 className="text-base font-semibold text-slate-900">
                                                Patient
                                            </h2>

                                            <p className="mt-0.5 text-xs text-slate-500">
                                                Patient information
                                            </p>

                                        </div>

                                    </div>

                                </div>

                                <div className="grid grid-cols-2 gap-5 p-6">

                                    <PatientValue
                                        label="Patient name"
                                        value={
                                            formData.patientName
                                        }
                                    />

                                    <PatientValue
                                        label="Patient ID"
                                        value={
                                            formData.patientId
                                        }
                                    />

                                    <PatientValue
                                        label="Age"
                                        value={
                                            formData.age
                                        }
                                    />

                                    <PatientValue
                                        label="Gender"
                                        value={
                                            formData.gender
                                        }
                                    />

                                </div>

                            </section>

                        </div>


                        {/* ================================================= */}
                        {/* RISK ASSESSMENT / GAUGE */}
                        {/* ================================================= */}

                        <section className="mb-6 rounded-xl border border-slate-200 bg-white shadow-sm">

                            <div className="border-b border-slate-100 px-6 py-5">

                                <div className="flex items-center gap-3">

                                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                                        <Activity size={19} />
                                    </div>

                                    <div>

                                        <h2 className="text-base font-semibold text-slate-900">
                                            Risk Assessment
                                        </h2>

                                        <p className="mt-0.5 text-xs text-slate-500">
                                            Model result for the selected condition
                                        </p>

                                    </div>

                                </div>

                            </div>

                            <div className="p-6">

                                {/* Gauge */}

                                <RiskGauge
                                    riskClass={
                                        prediction.class
                                    }
                                />


                                {/* Result */}

                                <div className="mt-5 text-center">

                                    <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
                                        Assessment Result
                                    </p>

                                    <h3
                                        className={`mt-2 text-3xl font-bold ${riskStyle.textColor}`}
                                    >
                                        {riskStyle.label}
                                    </h3>

                                    <p className="mt-1 text-sm text-slate-500">
                                        Risk Class{" "}
                                        {prediction.class}{" "}
                                        / 4
                                    </p>

                                </div>


                                {/* Description */}

                                <div
                                    className={`mx-auto mt-6 max-w-xl rounded-lg border ${riskStyle.border} ${riskStyle.bg} px-5 py-4 text-center`}
                                >

                                    <p
                                        className={`text-sm font-medium ${riskStyle.textColor}`}
                                    >
                                        {getRiskDescription(
                                            prediction.class
                                        )}
                                    </p>

                                </div>

                            </div>

                        </section>


                        {/* ================================================= */}
                        {/* DATA COMPLETENESS */}
                        {/* ================================================= */}

                        <section className="mb-6 rounded-xl border border-slate-200 bg-white shadow-sm">

                            <div className="border-b border-slate-100 px-6 py-5">

                                <div className="flex items-center gap-3">

                                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
                                        <FileText size={19} />
                                    </div>

                                    <div>

                                        <h2 className="text-base font-semibold text-slate-900">
                                            Data Completeness
                                        </h2>

                                        <p className="mt-0.5 text-xs text-slate-500">
                                            Available patient information
                                        </p>

                                    </div>

                                </div>

                            </div>

                            <div className="p-6">

                                <div className="flex items-center justify-between">

                                    <div>

                                        <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                                            Available data
                                        </p>

                                        <p className="mt-2 text-3xl font-semibold text-slate-900">
                                            {
                                                dataStatus.completeness
                                            }
                                            %
                                        </p>

                                    </div>

                                    <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
                                        <FileText size={20} />
                                    </div>

                                </div>

                                <div className="mt-5 h-2 overflow-hidden rounded-full bg-slate-100">

                                    <div
                                        className="h-full rounded-full bg-blue-600 transition-all"
                                        style={{
                                            width: `${dataStatus.completeness}%`,
                                        }}
                                    />

                                </div>

                                <p className="mt-3 text-xs leading-5 text-slate-500">
                                    This is currently a frontend
                                    indication based on the
                                    information entered and
                                    uploaded. The backend should
                                    provide the model-specific
                                    completeness value.
                                </p>

                            </div>

                        </section>


                        {/* ================================================= */}
                        {/* MISSING DATA */}
                        {/* ================================================= */}

                        <section className="mb-6 rounded-xl border border-slate-200 bg-white shadow-sm">

                            <div className="border-b border-slate-100 px-6 py-5">

                                <div className="flex items-center gap-3">

                                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
                                        <AlertTriangle size={19} />
                                    </div>

                                    <div>

                                        <h2 className="text-base font-semibold text-slate-900">
                                            Missing Information
                                        </h2>

                                        <p className="mt-0.5 text-xs text-slate-500">
                                            Additional information that was not provided
                                        </p>

                                    </div>

                                </div>

                            </div>

                            <div className="p-6">

                                {dataStatus.missingFiles
                                    .length === 0 ? (

                                    <div className="flex items-center gap-3 rounded-lg border border-green-200 bg-green-50 px-4 py-3">

                                        <CheckCircle2
                                            size={18}
                                            className="text-green-600"
                                        />

                                        <p className="text-sm text-green-700">
                                            All available clinical information has been provided.
                                        </p>

                                    </div>

                                ) : (

                                    <div>

                                        <p className="mb-4 text-sm text-slate-600">
                                            The following additional information was not uploaded:
                                        </p>

                                        <div className="grid gap-3 sm:grid-cols-3">

                                            {dataStatus.missingFiles.map(
                                                (item) => (
                                                    <div
                                                        key={item}
                                                        className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3"
                                                    >

                                                        <p className="text-sm font-medium text-amber-800">
                                                            {item}
                                                        </p>

                                                    </div>
                                                )
                                            )}

                                        </div>

                                    </div>

                                )}

                            </div>

                        </section>


                        {/* ================================================= */}
                        {/* RESULT EXPLANATION */}
                        {/* ================================================= */}

                        <section className="mb-6 rounded-xl border border-slate-200 bg-white shadow-sm">

                            <div className="border-b border-slate-100 px-6 py-5">

                                <div className="flex items-center gap-3">

                                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-pink-50 text-pink-600">
                                        <Stethoscope size={19} />
                                    </div>

                                    <div>

                                        <h2 className="text-base font-semibold text-slate-900">
                                            Result Explanation
                                        </h2>

                                        <p className="mt-0.5 text-xs text-slate-500">
                                            Explanation returned by the model
                                        </p>

                                    </div>

                                </div>

                            </div>

                            <div className="p-6">

                                <div className="rounded-lg border border-blue-100 bg-blue-50/50 p-4">

                                    <p className="text-sm leading-6 text-slate-600">
                                        The model explanation will be
                                        displayed here once the
                                        backend provides the
                                        features or factors that
                                        contributed to the result.
                                    </p>

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
                                            Recorded Vital Signs
                                        </h2>

                                        <p className="mt-0.5 text-xs text-slate-500">
                                            Values submitted for this assessment
                                        </p>

                                    </div>

                                </div>

                            </div>

                            <div className="grid grid-cols-2 gap-4 p-6 sm:grid-cols-3 lg:grid-cols-6">

                                <VitalValue
                                    label="Heart rate"
                                    value={
                                        formData.heartRate
                                    }
                                    unit="bpm"
                                />

                                <VitalValue
                                    label="Systolic BP"
                                    value={
                                        formData.systolicBP
                                    }
                                    unit="mmHg"
                                />

                                <VitalValue
                                    label="Diastolic BP"
                                    value={
                                        formData.diastolicBP
                                    }
                                    unit="mmHg"
                                />

                                <VitalValue
                                    label="Temperature"
                                    value={
                                        formData.temperature
                                    }
                                    unit="°C"
                                />

                                <VitalValue
                                    label="SpO₂"
                                    value={
                                        formData.spo2
                                    }
                                    unit="%"
                                />

                                <VitalValue
                                    label="Respiratory rate"
                                    value={
                                        formData.respiratoryRate
                                    }
                                    unit="/min"
                                />

                            </div>

                        </section>


                        {/* ================================================= */}
                        {/* PRESCRIPTION */}
                        {/* ================================================= */}

                        <section className="mb-6 rounded-xl border border-slate-200 bg-white shadow-sm">

                            <div className="border-b border-slate-100 px-6 py-5">

                                <div className="flex items-center gap-3">

                                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-pink-50 text-pink-600">
                                        <FileText size={19} />
                                    </div>

                                    <div>

                                        <h2 className="text-base font-semibold text-slate-900">
                                            Prescription
                                        </h2>

                                        <p className="mt-0.5 text-xs text-slate-500">
                                            Optional clinician-entered prescription
                                        </p>

                                    </div>

                                </div>

                            </div>

                            <div className="p-6">

                                {/* Checkbox */}

                                <label className="flex cursor-pointer items-start gap-3">

                                    <input
                                        type="checkbox"
                                        checked={
                                            showPrescription
                                        }
                                        onChange={(event) =>
                                            setShowPrescription(
                                                event.target.checked
                                            )
                                        }
                                        className="mt-0.5 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                                    />

                                    <div>

                                        <p className="text-sm font-medium text-slate-800">
                                            Provide prescription
                                        </p>

                                        <p className="mt-1 text-xs leading-5 text-slate-500">
                                            Prescription details must be entered by the healthcare professional.
                                        </p>

                                    </div>

                                </label>


                                {/* Prescription form */}

                                {showPrescription && (

                                    <div className="mt-6 border-t border-slate-100 pt-6">

                                        {/* Mobile */}

                                        <div className="mb-6 rounded-lg border border-blue-100 bg-blue-50 px-4 py-3">

                                            <div className="flex items-start gap-3">

                                                <Phone
                                                    size={17}
                                                    className="mt-0.5 shrink-0 text-blue-600"
                                                />

                                                <div>

                                                    <p className="text-sm font-medium text-blue-800">
                                                        Patient mobile number
                                                    </p>

                                                    <p className="mt-1 text-xs leading-5 text-blue-700">
                                                        A mobile number is required when a prescription is provided.
                                                    </p>

                                                </div>

                                            </div>

                                        </div>


                                        <div className="mb-6">

                                            <label className="mb-2 block text-sm font-medium text-slate-700">

                                                Mobile number

                                                <span className="ml-1 text-red-500">
                                                    *
                                                </span>

                                            </label>

                                            <input
                                                type="tel"
                                                value={
                                                    formData.mobile ||
                                                    ""
                                                }
                                                readOnly
                                                className={`w-full rounded-lg border px-3.5 py-3 text-sm outline-none ${
                                                    formData.mobile
                                                        ? "border-slate-300 bg-slate-50 text-slate-700"
                                                        : "border-red-300 bg-red-50 text-red-700"
                                                }`}
                                                placeholder="Mobile number required"
                                            />

                                            {!formData.mobile && (
                                                <p className="mt-1.5 text-xs text-red-500">
                                                    Go back and enter the patient's mobile number.
                                                </p>
                                            )}

                                        </div>


                                        {/* Medication list */}

                                        <div className="space-y-5">

                                            {medications.map(
                                                (
                                                    medication,
                                                    index
                                                ) => (

                                                    <div
                                                        key={
                                                            medication.id
                                                        }
                                                        className="rounded-xl border border-slate-200 bg-slate-50 p-5"
                                                    >

                                                        <div className="mb-5 flex items-center justify-between">

                                                            <div>

                                                                <p className="text-sm font-semibold text-slate-800">
                                                                    Medication{" "}
                                                                    {index +
                                                                        1}
                                                                </p>

                                                                <p className="mt-1 text-xs text-slate-500">
                                                                    Enter the details for this medication.
                                                                </p>

                                                            </div>

                                                            {medications.length >
                                                                1 && (

                                                                <button
                                                                    type="button"
                                                                    onClick={() =>
                                                                        removeMedication(
                                                                            medication.id
                                                                        )
                                                                    }
                                                                    className="flex items-center gap-1.5 text-xs font-medium text-red-500 transition hover:text-red-600"
                                                                >
                                                                    <Trash2
                                                                        size={
                                                                            14
                                                                        }
                                                                    />
                                                                    Remove
                                                                </button>

                                                            )}

                                                        </div>


                                                        <div className="grid gap-5 md:grid-cols-2">

                                                            <PrescriptionInput
                                                                label="Medication"
                                                                value={
                                                                    medication.medication
                                                                }
                                                                onChange={(
                                                                    event
                                                                ) =>
                                                                    handleMedicationChange(
                                                                        medication.id,
                                                                        "medication",
                                                                        event
                                                                            .target
                                                                            .value
                                                                    )
                                                                }
                                                                placeholder="Enter medication"
                                                                required
                                                            />

                                                            <PrescriptionInput
                                                                label="Dosage"
                                                                value={
                                                                    medication.dosage
                                                                }
                                                                onChange={(
                                                                    event
                                                                ) =>
                                                                    handleMedicationChange(
                                                                        medication.id,
                                                                        "dosage",
                                                                        event
                                                                            .target
                                                                            .value
                                                                    )
                                                                }
                                                                placeholder="e.g. 500 mg"
                                                                required
                                                            />

                                                            <PrescriptionInput
                                                                label="Frequency"
                                                                value={
                                                                    medication.frequency
                                                                }
                                                                onChange={(
                                                                    event
                                                                ) =>
                                                                    handleMedicationChange(
                                                                        medication.id,
                                                                        "frequency",
                                                                        event
                                                                            .target
                                                                            .value
                                                                    )
                                                                }
                                                                placeholder="e.g. Twice daily"
                                                                required
                                                            />

                                                            <PrescriptionInput
                                                                label="Duration"
                                                                value={
                                                                    medication.duration
                                                                }
                                                                onChange={(
                                                                    event
                                                                ) =>
                                                                    handleMedicationChange(
                                                                        medication.id,
                                                                        "duration",
                                                                        event
                                                                            .target
                                                                            .value
                                                                    )
                                                                }
                                                                placeholder="e.g. 5 days"
                                                                required
                                                            />

                                                        </div>


                                                        <div className="mt-5">

                                                            <label className="mb-2 block text-sm font-medium text-slate-700">
                                                                Instructions
                                                            </label>

                                                            <textarea
                                                                value={
                                                                    medication.instructions
                                                                }
                                                                onChange={(
                                                                    event
                                                                ) =>
                                                                    handleMedicationChange(
                                                                        medication.id,
                                                                        "instructions",
                                                                        event
                                                                            .target
                                                                            .value
                                                                    )
                                                                }
                                                                rows={
                                                                    3
                                                                }
                                                                placeholder="Enter instructions for this medication..."
                                                                className="w-full resize-none rounded-lg border border-slate-300 bg-white px-3.5 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 hover:border-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                                            />

                                                        </div>

                                                    </div>

                                                )
                                            )}

                                        </div>


                                        {/* Add medication */}

                                        <button
                                            type="button"
                                            onClick={
                                                addMedication
                                            }
                                            className="mt-5 flex items-center gap-2 rounded-lg border border-blue-200 bg-white px-4 py-2.5 text-sm font-medium text-blue-600 transition hover:bg-blue-50"
                                        >
                                            <Plus size={17} />
                                            Add another medication
                                        </button>

                                    </div>

                                )}

                            </div>

                        </section>


                        {/* ================================================= */}
                        {/* ACTIONS */}
                        {/* ================================================= */}

                        <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:justify-end">

                            <button
                                type="button"
                                onClick={() =>
                                    navigate(
                                        "/patient/new"
                                    )
                                }
                                className="rounded-lg border border-slate-300 bg-white px-5 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                            >
                                Modify Information
                            </button>

                            <button
                                type="button"
                                onClick={handleSave}
                                disabled={saved}
                                className={`flex items-center justify-center gap-2 rounded-lg px-6 py-3 text-sm font-medium text-white transition ${
                                    saved
                                        ? "cursor-default bg-green-600"
                                        : "bg-blue-600 hover:bg-blue-700"
                                }`}
                            >

                                {saved ? (
                                    <>
                                        <CheckCircle2
                                            size={17}
                                        />
                                        Saved to History
                                    </>
                                ) : (
                                    <>
                                        <Save size={17} />
                                        Save Analysis
                                    </>
                                )}

                            </button>

                        </div>


                        {/* ================================================= */}
                        {/* DISCLAIMER */}
                        {/* ================================================= */}

                        <div className="mb-6 flex items-start gap-3 rounded-lg border border-slate-200 bg-white px-5 py-4">

                            <ShieldCheck
                                size={18}
                                className="mt-0.5 shrink-0 text-blue-600"
                            />

                            <p className="text-xs leading-5 text-slate-500">
                                This system is a research and educational
                                decision-support prototype. The risk class is
                                generated by the machine learning model and
                                should not be treated as a diagnosis or a
                                replacement for professional medical judgment.
                            </p>

                        </div>

                    </div>

                </main>

            </div>

        </div>
    );
}


/*
 * =========================================================
 * RISK GAUGE
 * =========================================================
 *
 * 0 = Normal
 * 1 = Mild
 * 2 = Moderate
 * 3 = Severe
 * 4 = Critical
 *
 * The gauge is intentionally a semicircular clinical meter.
 */

function RiskGauge({ riskClass }) {
    const currentClass = Math.min(
        4,
        Math.max(0, Number(riskClass))
    );

    const zones = [
        { label: "Normal", color: "#22c55e" },
        { label: "Mild", color: "#eab308" },
        { label: "Moderate", color: "#f97316" },
        { label: "Severe", color: "#ef4444" },
        { label: "Critical", color: "#b91c1c" },
    ];

    const centerX = 150;
    const centerY = 130;
    const radius = 100;

    const needleAngle = 180 - currentClass * 45;

    const needleRadians =
        (needleAngle * Math.PI) / 180;

    const needleLength = 82;

    const needleX =
        centerX +
        needleLength * Math.cos(needleRadians);

    const needleY =
        centerY -
        needleLength * Math.sin(needleRadians);

    const polarToCartesian = (
        angle,
        arcRadius = radius
    ) => {
        const radians =
            (angle * Math.PI) / 180;

        return {
            x:
                centerX +
                arcRadius * Math.cos(radians),

            y:
                centerY -
                arcRadius * Math.sin(radians),
        };
    };

    const createArcPath = (
        startAngle,
        endAngle,
        arcRadius = radius
    ) => {
        const start = polarToCartesian(
            startAngle,
            arcRadius
        );

        const end = polarToCartesian(
            endAngle,
            arcRadius
        );

        return [
            `M ${start.x} ${start.y}`,
            `A ${arcRadius} ${arcRadius} 0 0 1 ${end.x} ${end.y}`,
        ].join(" ");
    };

    return (
        <div className="mx-auto flex w-full max-w-[560px] flex-col items-center">

            {/* Gauge */}

            <div className="flex w-full justify-center">
                <svg
                    viewBox="0 0 300 160"
                    className="block h-auto w-full max-w-[500px]"
                    role="img"
                    aria-label={`Risk status: ${zones[currentClass].label}`}
                >

                    {/* Background */}

                    <path
                        d={createArcPath(180, 0, 100)}
                        fill="none"
                        stroke="#e2e8f0"
                        strokeWidth="32"
                    />

                    {/* Colored zones */}

                    {zones.map((zone, index) => {
                        const startAngle =
                            180 - index * 36;

                        const endAngle =
                            startAngle - 36;

                        return (
                            <path
                                key={zone.label}
                                d={createArcPath(
                                    startAngle,
                                    endAngle,
                                    100
                                )}
                                fill="none"
                                stroke={zone.color}
                                strokeWidth="32"
                            />
                        );
                    })}

                    {/* Inner white area */}

                    <circle
                        cx="150"
                        cy="130"
                        r="73"
                        fill="white"
                    />

                    {/* Needle */}

                    <line
                        x1={centerX}
                        y1={centerY}
                        x2={needleX}
                        y2={needleY}
                        stroke="#1e293b"
                        strokeWidth="5"
                        strokeLinecap="round"
                    />

                    {/* Needle center */}

                    <circle
                        cx={centerX}
                        cy={centerY}
                        r="14"
                        fill="white"
                        stroke="#1e293b"
                        strokeWidth="6"
                    />

                </svg>
            </div>

            {/* Labels */}

            <div className="mt-1 grid w-full grid-cols-5">

                {zones.map((zone, index) => (
                    <div
                        key={zone.label}
                        className="text-center"
                    >

                        <div
                            className="mx-auto mb-1 h-1.5 w-8 rounded-full"
                            style={{
                                backgroundColor:
                                    zone.color,
                                opacity:
                                    currentClass === index
                                        ? 1
                                        : 0.25,
                            }}
                        />

                        <p
                            className={`text-[11px] sm:text-xs ${
                                currentClass === index
                                    ? "font-bold text-slate-800"
                                    : "text-slate-400"
                            }`}
                        >
                            {zone.label}
                        </p>

                    </div>
                ))}

            </div>

        </div>
    );
}


/*
 * =========================================================
 * PATIENT VALUE
 * =========================================================
 */

function PatientValue({ label, value }) {
    return (
        <div>

            <p className="text-xs text-slate-400">
                {label}
            </p>

            <p className="mt-1 text-sm font-medium text-slate-800">
                {value || "—"}
            </p>

        </div>
    );
}


/*
 * =========================================================
 * VITAL VALUE
 * =========================================================
 */

function VitalValue({
    label,
    value,
    unit,
}) {
    return (
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">

            <p className="text-xs text-slate-400">
                {label}
            </p>

            <p className="mt-2 text-lg font-semibold text-slate-900">
                {value || "—"}
            </p>

            <p className="mt-0.5 text-xs text-slate-500">
                {unit}
            </p>

        </div>
    );
}


/*
 * =========================================================
 * PRESCRIPTION INPUT
 * =========================================================
 */

function PrescriptionInput({
    label,
    value,
    onChange,
    placeholder,
    required = false,
}) {
    return (
        <div>

            <label className="mb-2 block text-sm font-medium text-slate-700">

                {label}

                {required && (
                    <span className="ml-1 text-red-500">
                        *
                    </span>
                )}

            </label>

            <input
                type="text"
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 hover:border-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />

        </div>
    );
}

export default Prediction;
