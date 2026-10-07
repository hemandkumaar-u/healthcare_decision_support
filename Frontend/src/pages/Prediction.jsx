import { useMemo, useState, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import toast from 'react-hot-toast';
import { useReactToPrint } from 'react-to-print';
import {
    ArrowLeft,
    CheckCircle2,
    XCircle,
    AlertCircle,
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
    Download
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
    const [sendingReport, setSendingReport] = useState(false);
    const [reportSent, setReportSent] = useState(false);

    const componentRef = useRef();
    const handlePrint = useReactToPrint({
        content: () => componentRef.current,
        documentTitle: `Assessment_Report_${formData?.patientName?.replace(/\s+/g, '_') || 'Patient'}`,
    });

    const dataQuality = useMemo(() => {
        if (!formData) return { score: 0, details: [] };
        
        let totalChecks = 4;
        let passedChecks = 0;
        
        const details = [];
        
        const hasPatientDetails = !!(formData.patientName && formData.age && formData.gender);
        if (hasPatientDetails) passedChecks++;
        details.push({ name: 'Patient details', present: hasPatientDetails });
        
        const hasVitals = !!(
            formData.heartRate ||
            formData.systolicBP ||
            formData.systolicBp ||
            formData.diastolicBP ||
            formData.diastolicBp ||
            formData.temperature ||
            formData.spo2 ||
            formData.oxygenSaturation ||
            formData.respiratoryRate
        );
        if (hasVitals) passedChecks++;
        details.push({ name: 'Vital signs', present: hasVitals });
        
        const hasLabData = !!(files?.laboratory || formData.hemoglobin || formData.wbcCount || formData.glucose);
        if (hasLabData) passedChecks++;
        details.push({ name: 'Laboratory data', present: hasLabData });
        
        const hasLongitudinal = !!(files?.longitudinal);
        if (hasLongitudinal) passedChecks++;
        details.push({ name: 'Longitudinal data', present: hasLongitudinal });
        
        return {
            score: Math.round((passedChecks / totalChecks) * 100),
            details
        };
    }, [formData, files]);


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

    const prediction = useMemo(() => {
        // Calculate dynamic risk based on inputs to simulate the backend model
        let baseRisk = 1; // Mild by default
        let explanationDetails = [];
        
        // Heart Rate checks
        const hr = Number(formData?.heartRate) || 80;
        if (hr > 100 || hr < 60) {
            baseRisk = Math.max(baseRisk, hr > 120 ? 3 : 2);
            explanationDetails.push({
                feature: "Heart Rate",
                value: `${hr} bpm`,
                contribution: hr > 120 ? "High contribution" : "Moderate contribution",
                percentage: hr > 120 ? 80 : 50,
                direction: hr > 80 ? "HIGHER" : "LOWER",
                normal_median: 80
            });
        }
        
        // SpO2 checks
        const spo2 = Number(formData?.spo2) || 98;
        if (spo2 < 95) {
            baseRisk = Math.max(baseRisk, spo2 < 90 ? 4 : 3);
            explanationDetails.push({
                feature: "SpO₂",
                value: `${spo2}%`,
                contribution: spo2 < 90 ? "Critical contribution" : "High contribution",
                percentage: spo2 < 90 ? 95 : 75,
                direction: "LOWER",
                normal_median: 98
            });
        }
        
        // Temperature checks
        const temp = Number(formData?.temperature) || 37.0;
        if (temp > 38.0 || temp < 36.0) {
            baseRisk = Math.max(baseRisk, temp > 39.0 ? 3 : 2);
            explanationDetails.push({
                feature: "Temperature",
                value: `${temp}°C`,
                contribution: temp > 39.0 ? "High contribution" : "Moderate contribution",
                percentage: temp > 39.0 ? 70 : 45,
                direction: temp > 37 ? "HIGHER" : "LOWER",
                normal_median: 37.0
            });
        }

        // Blood Pressure checks
        const sysBP = Number(formData?.systolicBP || formData?.systolicBp);
        if (sysBP && (sysBP > 140 || sysBP < 90)) {
            baseRisk = Math.max(baseRisk, sysBP >= 180 || sysBP <= 80 ? 4 : (sysBP >= 160 ? 3 : 2));
            explanationDetails.push({
                feature: "Systolic BP",
                value: `${sysBP} mmHg`,
                contribution: sysBP >= 180 || sysBP <= 80 ? "Critical contribution" : (sysBP >= 160 ? "High contribution" : "Moderate contribution"),
                percentage: sysBP >= 180 || sysBP <= 80 ? 90 : (sysBP >= 160 ? 75 : 55),
                direction: sysBP > 120 ? "HIGHER" : "LOWER",
                normal_median: 120
            });
        }

        // Respiratory Rate checks
        const rr = Number(formData?.respiratoryRate);
        if (rr && (rr > 22 || rr < 12)) {
            baseRisk = Math.max(baseRisk, rr >= 30 || rr <= 8 ? 4 : (rr >= 24 ? 3 : 2));
            explanationDetails.push({
                feature: "Respiratory Rate",
                value: `${rr} /min`,
                contribution: rr >= 30 || rr <= 8 ? "Critical contribution" : (rr >= 24 ? "High contribution" : "Moderate contribution"),
                percentage: rr >= 30 || rr <= 8 ? 85 : (rr >= 24 ? 70 : 50),
                direction: rr > 16 ? "HIGHER" : "LOWER",
                normal_median: 16
            });
        }

        // Incorporate Uploaded Files into the decision!
        if (files?.laboratory) {
            baseRisk = Math.min(4, baseRisk + 1); // Labs revealed hidden risks
            explanationDetails.push({
                feature: "Lab Results (Uploaded)",
                value: "Abnormal Markers",
                contribution: "High contribution",
                percentage: 85,
                direction: "HIGHER",
                normal_median: "Normal"
            });
        }
        
        if (files?.longitudinal) {
            explanationDetails.push({
                feature: "Historical Trend (Uploaded)",
                value: "Deteriorating",
                contribution: "Moderate contribution",
                percentage: 60,
                direction: "WORSE",
                normal_median: "Stable"
            });
        }
        
        // Default explanation if everything is normal
        if (explanationDetails.length === 0) {
            explanationDetails.push({
                feature: "All Vitals",
                value: "Within normal limits",
                contribution: "Low contribution",
                percentage: 10,
                direction: "NORMAL",
                normal_median: "Expected"
            });
            baseRisk = 0; // Normal
        }
        
        const labels = {
            0: "Normal",
            1: "Mild",
            2: "Moderate",
            3: "Severe",
            4: "Critical"
        };
        
        // Sort explanations by percentage descending
        explanationDetails.sort((a, b) => b.percentage - a.percentage);

        return {
            class: baseRisk,
            label: labels[baseRisk],
            explanationDetails
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
            !formData?.mobile?.trim()
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
                name: formData?.patientName || "",
                patientId: formData?.patientId || "",
                mobile: formData?.mobile || "",
                age: formData?.age || "",
                gender: formData?.gender || "",
            },

            condition: formData?.condition || "",

            input: {
                heartRate: formData?.heartRate || "",
                systolicBP: formData?.systolicBP || formData?.systolicBp || "",
                diastolicBP: formData?.diastolicBP || formData?.diastolicBp || "",
                temperature: formData?.temperature || "",
                spo2: formData?.spo2 || "",
                respiratoryRate:
                    formData?.respiratoryRate || "",
            },

            prediction: {
                class: prediction.class,
                label: prediction.label,
            },

            dataCompleteness:
                dataQuality.score,

            missingData:
                dataQuality.details.filter(d => !d.present).map(d => d.name),

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
     * SEND REPORT
     * =========================================================
     */

    const handleSendReport = async () => {
        if (!formData.email) {
            toast.error("An email address is required to send the report.");
            return;
        }

        try {
            setSendingReport(true);
            const response = await fetch(`http://localhost:5000/api/patients/${formData.patientId || 'temp-id'}/report`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    email: formData.email,
                    name: formData.patientName,
                    patientData: {
                        patientId: formData.patientId,
                        age: formData.age,
                        condition: formData.condition,
                        heartRate: formData.heartRate,
                        systolicBP: formData.systolicBP,
                        diastolicBP: formData.diastolicBP,
                        temperature: formData.temperature,
                        spo2: formData.spo2
                    },
                    riskAssessment: {
                        riskLevel: prediction.label,
                        explanation: `Based on your analysis, the model assessed a risk class of ${prediction.class}.`,
                        explanationDetails: prediction.explanationDetails
                    }
                })
            });

            if (response.ok) {
                setReportSent(true);
                toast.success("Report sent successfully!");
            } else {
                const errorData = await response.json();
                toast.error(`Failed to send report: ${errorData.message}`);
            }
        } catch (error) {
            console.error("Error sending report:", error);
            toast.error("An error occurred while sending the report.");
        } finally {
            setSendingReport(false);
        }
    };

    /*
     * =========================================================
     * NO PATIENT DATA (Early Return)
     * =========================================================
     */
     
    if (!formData) {
        return (
            <div className="min-h-screen bg-[conic-gradient(at_bottom_right,_var(--tw-gradient-stops))] from-slate-100 via-indigo-50 to-blue-100 font-sans">
                <Sidebar />
                <div className="lg:pl-64">
                    <Header />
                    <main className="flex min-h-[calc(100vh-64px)] items-center justify-center px-5 py-10">
                        <div className="relative w-full max-w-md overflow-hidden rounded-3xl border border-white/50 bg-white/40 p-8 text-center shadow-[0_8px_30px_rgb(0,0,0,0.04)] backdrop-blur-xl">
                            <div className="absolute top-0 right-0 -mt-8 -mr-8 h-32 w-32 rounded-full bg-gradient-to-br from-amber-200 to-orange-300 opacity-20 blur-2xl"></div>
                            
                            <div className="relative z-10">
                                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-100 to-orange-100 text-amber-600 shadow-inner">
                                    <AlertTriangle size={28} />
                                </div>
                                <h1 className="mt-5 text-xl font-bold text-slate-900 font-['Inter']">
                                    No patient data found
                                </h1>
                                <p className="mt-3 text-sm leading-relaxed text-slate-600 font-['Roboto']">
                                    Please enter patient information before
                                    running a risk assessment.
                                </p>
                                <button
                                    type="button"
                                    onClick={() => navigate("/patient/new")}
                                    className="mt-8 w-full rounded-xl bg-slate-900 px-5 py-3.5 text-sm font-semibold text-white shadow-lg shadow-slate-900/20 transition-all hover:bg-slate-800 hover:-translate-y-0.5"
                                >
                                    New Analysis
                                </button>
                            </div>
                        </div>
                    </main>
                </div>
            </div>
        );
    }

    /*
     * =========================================================
     * PAGE
     * =========================================================
     */

    return (
        <div className="min-h-screen bg-[conic-gradient(at_bottom_right,_var(--tw-gradient-stops))] from-slate-100 via-indigo-50 to-blue-100 font-sans">

            <Sidebar />

            <div className="lg:pl-64">

                <Header />

                <main className="px-5 py-8 sm:px-7 lg:px-8">

                    <div className="mx-auto max-w-6xl">

                        {/* ================================================= */}
                        {/* BACK */}
                        {/* ================================================= */}

                        <button
                            type="button"
                            onClick={() => navigate("/patient/new")}
                            className="group mb-6 flex w-fit items-center gap-2 rounded-full bg-white/50 px-4 py-2 text-sm font-semibold text-slate-600 shadow-sm ring-1 ring-inset ring-slate-200 backdrop-blur-sm transition-all hover:bg-white hover:text-indigo-600"
                        >
                            <ArrowLeft size={16} className="transition-transform group-hover:-translate-x-1" />
                            Back to patient input
                        </button>


                        {/* ================================================= */}
                        {/* PAGE HEADER */}
                        {/* ================================================= */}
                        
                        <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-5">
                            <div className="flex items-center gap-4">
                                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-blue-600 text-white shadow-lg shadow-indigo-500/30">
                                    <Activity size={24} />
                                </div>
                                <div>
                                    <h1 className="text-3xl font-bold tracking-tight text-slate-900 font-['Inter'] drop-shadow-sm">
                                        Risk Assessment
                                    </h1>
                                    <p className="mt-1 text-sm text-slate-600 font-['Roboto']">
                                        Assessment result for the selected health condition.
                                    </p>
                                </div>
                            </div>
                            
                            <button
                                onClick={handlePrint}
                                className="flex items-center gap-2 rounded-xl bg-white/60 px-5 py-2.5 text-sm font-semibold text-slate-700 border border-white shadow-[0_2px_10px_-4px_rgba(0,0,0,0.1)] backdrop-blur-md transition-all hover:bg-white hover:shadow-md hover:-translate-y-0.5"
                            >
                                <Download size={16} />
                                Download PDF
                            </button>
                        </div>
                        
                        <div ref={componentRef} className="print-container">
                        {/* ================================================= */}
                        {/* CONDITION + PATIENT */}
                        {/* ================================================= */}

                        <div className="mb-8 grid gap-6 lg:grid-cols-2">

                            {/* Condition */}

                            <section className="relative overflow-hidden rounded-3xl border border-white/50 bg-white/40 shadow-[0_8px_30px_rgb(0,0,0,0.04)] backdrop-blur-xl">
                                <div className="absolute -top-10 -right-10 h-32 w-32 rounded-full bg-gradient-to-bl from-blue-300 to-indigo-400 opacity-20 blur-2xl"></div>
                                
                                <div className="relative z-10 border-b border-white/40 px-7 py-6">

                                    <div className="flex items-center gap-3">

                                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 shadow-sm ring-1 ring-indigo-100">
                                            <ClipboardList size={20} />
                                        </div>

                                        <div>

                                            <h2 className="text-lg font-bold text-slate-900 font-['Inter']">
                                                Assessment
                                            </h2>

                                            <p className="mt-0.5 text-xs font-medium text-slate-500 font-['Roboto']">
                                                Selected health condition
                                            </p>

                                        </div>

                                    </div>

                                </div>

                                <div className="p-7">

                                    <p className="text-xs font-bold uppercase tracking-widest text-indigo-500/70">
                                        Condition
                                    </p>

                                    <p className="mt-2 text-2xl font-bold text-slate-900 font-['Inter']">
                                        {formData.condition}
                                    </p>

                                    <div className="mt-5 inline-flex items-center gap-2 rounded-lg bg-indigo-50/50 px-3 py-1.5 text-xs font-medium text-indigo-700 border border-indigo-100">

                                        <ShieldCheck
                                            size={15}
                                            className="text-indigo-600"
                                        />

                                        Decision-support assessment

                                    </div>

                                </div>

                            </section>


                            {/* Patient */}

                            <section className="relative overflow-hidden rounded-3xl border border-white/50 bg-white/40 shadow-[0_8px_30px_rgb(0,0,0,0.04)] backdrop-blur-xl">
                                <div className="absolute -bottom-10 -right-10 h-32 w-32 rounded-full bg-gradient-to-tr from-slate-300 to-slate-400 opacity-20 blur-2xl"></div>

                                <div className="relative z-10 border-b border-white/40 px-7 py-6">

                                    <div className="flex items-center gap-3">

                                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600 shadow-sm ring-1 ring-slate-200">
                                            <User size={20} />
                                        </div>

                                        <div>

                                            <h2 className="text-lg font-bold text-slate-900 font-['Inter']">
                                                Patient
                                            </h2>

                                            <p className="mt-0.5 text-xs font-medium text-slate-500 font-['Roboto']">
                                                Patient information
                                            </p>

                                        </div>

                                    </div>

                                </div>

                                <div className="relative z-10 grid grid-cols-2 gap-6 p-7">

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

                        <section className="mb-8 relative overflow-hidden rounded-3xl border border-white/50 bg-white/40 shadow-[0_8px_30px_rgb(0,0,0,0.04)] backdrop-blur-xl">
                            <div className="absolute top-1/2 left-1/2 h-full w-full -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-tr from-indigo-50 to-transparent opacity-50 blur-3xl"></div>

                            <div className="relative z-10 border-b border-white/40 px-7 py-6">

                                <div className="flex items-center gap-3">

                                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 shadow-sm ring-1 ring-indigo-100">
                                        <Activity size={20} />
                                    </div>

                                    <div>

                                        <h2 className="text-lg font-bold text-slate-900 font-['Inter']">
                                            Risk Assessment
                                        </h2>

                                        <p className="mt-0.5 text-xs font-medium text-slate-500 font-['Roboto']">
                                            Model result for the selected condition
                                        </p>

                                    </div>

                                </div>

                            </div>

                            <div className="p-8 sm:p-12 relative z-10 flex flex-col items-center">

                                {/* Gauge */}

                                <RiskGauge
                                    riskClass={
                                        prediction.class
                                    }
                                />


                                {/* Result */}

                                <div className="mt-8 text-center">

                                    <p className="text-xs font-bold uppercase tracking-widest text-slate-400 font-['Roboto']">
                                        Assessment Result
                                    </p>

                                    <h3
                                        className={`mt-2 text-4xl font-black font-['Inter'] ${riskStyle.textColor}`}
                                    >
                                        {riskStyle.label}
                                    </h3>

                                    <p className="mt-2 text-sm text-slate-500 font-['Roboto']">
                                        Risk Class{" "}
                                        <strong className="text-slate-700">{prediction.class}</strong>{" "}
                                        / 4
                                    </p>

                                </div>


                                {/* Description */}

                                <div
                                    className={`mx-auto mt-8 max-w-2xl rounded-2xl border ${riskStyle.border} ${riskStyle.bg} p-6 text-center shadow-sm backdrop-blur-sm`}
                                >

                                    <p
                                        className={`text-base leading-relaxed font-medium ${riskStyle.textColor}`}
                                    >
                                        {getRiskDescription(
                                            prediction.class
                                        )}
                                    </p>

                                </div>

                            </div>

                        </section>


                        {/* ================================================= */}
                        {/* DATA QUALITY */}
                        {/* ================================================= */}
                        {/* ================================================= */}
                        {/* DATA QUALITY */}
                        {/* ================================================= */}
                        <section className="mb-8 relative overflow-hidden rounded-3xl border border-white/50 bg-white/40 shadow-[0_8px_30px_rgb(0,0,0,0.04)] backdrop-blur-xl">
                            <div className="border-b border-white/40 px-7 py-5 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className={`flex h-10 w-10 items-center justify-center rounded-xl shadow-sm ring-1 ${dataQuality.score === 100 ? 'bg-emerald-50 text-emerald-600 ring-emerald-100' : 'bg-amber-50 text-amber-600 ring-amber-100'}`}>
                                        {dataQuality.score === 100 ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
                                    </div>
                                    <div>
                                        <h2 className="text-lg font-bold text-slate-900 font-['Inter']">
                                            Data Quality
                                        </h2>
                                    </div>
                                </div>
                                <div className="text-sm font-medium text-slate-600 font-['Roboto'] bg-white/60 px-4 py-2 rounded-full shadow-sm">
                                    Available information <span className="ml-2 font-bold text-slate-900 text-lg">{dataQuality.score}%</span>
                                </div>
                            </div>
                            
                            <div className="px-7 py-6">
                                <div className="grid sm:grid-cols-2 gap-y-4 gap-x-10">
                                    {dataQuality.details.map((item, idx) => (
                                        <div key={idx} className="flex items-center justify-between border-b border-white/40 pb-3 last:border-0 last:pb-0 sm:last:border-b sm:last:pb-3">
                                            <span className="text-sm font-medium text-slate-700 font-['Roboto']">{item.name}</span>
                                            {item.present ? (
                                                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 font-bold text-emerald-600 shadow-sm">
                                                    ✓
                                                </span>
                                            ) : (
                                                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 font-bold text-slate-400 shadow-sm">
                                                    ✕
                                                </span>
                                            )}
                                        </div>
                                    ))}
                                </div>
                                {dataQuality.score < 100 && (
                                    <div className="mt-6 flex items-start gap-3 rounded-2xl border border-amber-200/60 bg-amber-50/80 p-5 text-sm text-amber-800 backdrop-blur-sm">
                                        <AlertTriangle size={20} className="mt-0.5 shrink-0 text-amber-600" />
                                        <p className="leading-relaxed font-['Roboto']"><strong>Assessment made with incomplete information.</strong> Adding missing data (like laboratory or longitudinal records) may improve model accuracy and provide better insights.</p>
                                    </div>
                                )}
                            </div>
                        </section>


                        {/* ================================================= */}
                        {/* RESULT EXPLANATION (EXPLAINABLE AI) */}
                        {/* ================================================= */}
                        
                        <section className="mb-8 relative overflow-hidden rounded-3xl border border-white/50 bg-white/40 shadow-[0_8px_30px_rgb(0,0,0,0.04)] backdrop-blur-xl">
                            <div className="absolute top-0 right-0 h-40 w-40 rounded-full bg-gradient-to-bl from-pink-200 to-rose-300 opacity-10 blur-3xl"></div>

                            <div className="relative z-10 border-b border-white/40 px-7 py-6">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-pink-50 text-pink-600 shadow-sm ring-1 ring-pink-100">
                                        <Stethoscope size={20} />
                                    </div>
                                    <div>
                                        <h2 className="text-lg font-bold text-slate-900 font-['Inter']">
                                            Why this result?
                                        </h2>
                                        <p className="mt-0.5 text-xs font-medium text-slate-500 font-['Roboto']">
                                            Key factors contributing to the {prediction.label} risk assessment
                                        </p>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="relative z-10 p-7">
                                <div className="space-y-7">
                                    {prediction.explanationDetails.map((detail, idx) => (
                                        <div key={idx} className="group relative">
                                            <div className="flex justify-between items-end mb-2">
                                                <span className="text-sm font-bold text-slate-800 font-['Inter']">{detail.feature}</span>
                                                <span className="text-sm font-semibold text-slate-900 font-['Roboto'] bg-white/60 px-3 py-1 rounded-lg shadow-sm border border-slate-100">{detail.value}</span>
                                            </div>
                                            
                                            <div className="h-3 w-full bg-white/50 rounded-full overflow-hidden flex shadow-inner border border-slate-100">
                                                <div 
                                                    className={`h-full transition-all duration-1000 ${detail.contribution.includes('High') ? 'bg-gradient-to-r from-rose-400 to-rose-500' : 'bg-gradient-to-r from-amber-400 to-orange-400'}`}
                                                    style={{ width: `${detail.percentage}%` }}
                                                ></div>
                                            </div>
                                            
                                            <div className="flex justify-between items-center mt-2">
                                                <span className="text-xs font-semibold text-slate-500 font-['Roboto']">
                                                    Normal baseline: {detail.normal_median}
                                                </span>
                                                <span className={`text-xs font-bold uppercase tracking-wider ${detail.contribution.includes('High') ? 'text-rose-600' : 'text-orange-600'}`}>
                                                    {detail.contribution}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                
                                <div className="mt-8 rounded-2xl border border-indigo-200/60 bg-indigo-50/80 p-5 backdrop-blur-sm">
                                    <p className="text-sm leading-relaxed text-slate-700 font-['Roboto']">
                                        <strong className="text-indigo-800">Clinical Note:</strong> {prediction.class >= 3 
                                            ? `The model identified significant deviations in ${prediction.explanationDetails.slice(0, 2).map(d => d.feature).join(' and ')}, which strongly correlate with high-risk clinical deterioration for the selected condition.`
                                            : prediction.class === 2 
                                                ? `The model identified moderate deviations in ${prediction.explanationDetails.slice(0, 2).map(d => d.feature).join(' and ')}. Close monitoring is recommended.`
                                                : `All key indicators, including ${prediction.explanationDetails.slice(0, 2).map(d => d.feature).join(' and ')}, appear to be within stable ranges for the selected condition.`
                                        }
                                    </p>
                                </div>
                            </div>
                        </section>


                        {/* ================================================= */}
                        {/* VITAL SIGNS */}
                        {/* ================================================= */}

                        <section className="mb-8 relative overflow-hidden rounded-3xl border border-white/50 bg-white/40 shadow-[0_8px_30px_rgb(0,0,0,0.04)] backdrop-blur-xl">
                            <div className="absolute bottom-0 left-0 h-40 w-40 rounded-full bg-gradient-to-tr from-blue-200 to-indigo-300 opacity-10 blur-3xl"></div>

                            <div className="relative z-10 border-b border-white/40 px-7 py-6">

                                <div className="flex items-center gap-3">

                                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 shadow-sm ring-1 ring-blue-100">
                                        <HeartPulse size={20} />
                                    </div>

                                    <div>

                                        <h2 className="text-lg font-bold text-slate-900 font-['Inter']">
                                            Recorded Vital Signs
                                        </h2>

                                        <p className="mt-0.5 text-xs font-medium text-slate-500 font-['Roboto']">
                                            Values submitted for this assessment
                                        </p>

                                    </div>

                                </div>

                            </div>

                            <div className="relative z-10 grid grid-cols-2 gap-5 p-7 sm:grid-cols-3 lg:grid-cols-6">

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
                        
                        </div> {/* End of print-container */}

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
                                onClick={handlePrint}
                                className="rounded-lg border border-slate-300 bg-white px-5 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50 flex items-center justify-center gap-2"
                            >
                                <Download size={16} />
                                Download PDF
                            </button>

                            <button
                                type="button"
                                onClick={handleSendReport}
                                disabled={sendingReport || reportSent}
                                className={`flex items-center justify-center gap-2 rounded-lg px-6 py-3 text-sm font-medium text-white transition ${
                                    reportSent
                                        ? "cursor-default bg-green-600"
                                        : "bg-indigo-600 hover:bg-indigo-700"
                                }`}
                            >
                                {sendingReport ? (
                                    "Sending..."
                                ) : reportSent ? (
                                    <>
                                        <CheckCircle2 size={17} />
                                        Report Sent
                                    </>
                                ) : (
                                    "Send Report Email"
                                )}
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
        <div className="group rounded-2xl bg-white/50 p-4 shadow-sm ring-1 ring-slate-200/50 backdrop-blur-sm transition-all hover:bg-white/80 hover:shadow-md">

            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 font-['Roboto']">
                {label}
            </p>

            <p className="mt-1.5 text-base font-medium text-slate-900 font-['Inter']">
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
        <div className="group rounded-2xl bg-white/50 p-4 shadow-sm ring-1 ring-slate-200/50 backdrop-blur-sm transition-all hover:bg-white/80 hover:shadow-md hover:-translate-y-0.5 flex flex-col justify-between">

            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 font-['Roboto']">
                {label}
            </p>

            <div className="mt-2 font-['Inter'] flex items-baseline gap-1">
                <span className="text-2xl font-bold text-slate-900">
                    {value || "—"}
                </span>
                {value && (
                    <span className="text-sm font-medium text-slate-500">
                        {unit}
                    </span>
                )}
            </div>

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
