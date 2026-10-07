import {
    Activity,
    ShieldCheck,
    FileText,
    Brain,
    Stethoscope,
    Database,
    Upload,
    ClipboardCheck,
    AlertTriangle,
    HeartPulse,
    Pill,
    Info,
    Server,
    Users
} from "lucide-react";
import { useEffect, useState } from "react";

import Sidebar from "../components/Sidebar";
import Header from "../components/Header";

function About() {
    const [stats, setStats] = useState({
        systemVersion: "Loading...",
        totalPatients: "...",
        totalAssessments: "...",
        status: "Checking...",
        modelStatus: "..."
    });

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await fetch("http://localhost:5000/api/system/stats");
                if (response.ok) {
                    const data = await response.json();
                    setStats(data);
                } else {
                    setStats(prev => ({ ...prev, status: "Offline" }));
                }
            } catch (err) {
                console.error("Error fetching stats:", err);
                setStats(prev => ({ ...prev, status: "Offline" }));
            }
        };
        fetchStats();
    }, []);

    return (
        <div className="min-h-screen bg-slate-50">

            <Sidebar />

            <div className="lg:pl-64">

                <Header />

                <main className="px-5 py-6 sm:px-7 lg:px-8">

                    <div className="mx-auto max-w-6xl">

                        {/* ================================================= */}
                        {/* PAGE HEADER */}
                        {/* ================================================= */}

                        <div className="mb-8">

                            <div className="flex items-center gap-3">

                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
                                    <Info size={21} />
                                </div>

                                <div>

                                    <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
                                        About MedRisk AI
                                    </h1>

                                    <p className="mt-1 text-sm text-slate-500">
                                        Clinical decision-support and patient risk assessment prototype.
                                    </p>

                                </div>

                            </div>

                        </div>


                        {/* ================================================= */}
                        {/* INTRODUCTION */}
                        {/* ================================================= */}

                        <section className="mb-6 rounded-xl border border-slate-200 bg-white shadow-sm">

                            <div className="p-6 sm:p-8">

                                <div className="grid gap-8 lg:grid-cols-[1.4fr_0.8fr] lg:items-center">

                                    <div>

                                        <div className="mb-4 flex items-center gap-2">

                                            <ShieldCheck
                                                size={19}
                                                className="text-blue-600"
                                            />

                                            <span className="text-xs font-semibold uppercase tracking-wider text-blue-600">
                                                Clinical Decision Support
                                            </span>

                                        </div>

                                        <h2 className="text-2xl font-semibold tracking-tight text-slate-900">
                                            Patient Risk Assessment System
                                        </h2>

                                        <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-600">
                                            MedRisk AI is a decision-support prototype
                                            designed to analyze available patient
                                            information and provide a risk
                                            classification for a selected health
                                            condition.
                                        </p>

                                        <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600">
                                            The system organizes patient information,
                                            processes the available clinical data
                                            through a machine learning model, and
                                            presents the resulting risk class in a
                                            form that can be reviewed by a healthcare
                                            professional.
                                        </p>

                                    </div>

                                </div>

                            </div>

                        </section>


                        {/* ================================================= */}
                        {/* SYSTEM STATUS */}
                        {/* ================================================= */}

                        <section className="mb-6 rounded-xl border border-slate-200 bg-white shadow-sm">
                            <SectionHeader
                                icon={<Server size={19} />}
                                title="System Status"
                                subtitle="Current real-time operational statistics of the MedRisk AI backend"
                            />
                            <div className="p-6 sm:p-8">
                                <div className="grid gap-6 md:grid-cols-4">
                                    <div className="flex flex-col">
                                        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Backend Status</span>
                                        <span className={`mt-2 text-lg font-medium ${stats.status === "Online" ? "text-green-600" : "text-red-500"}`}>{stats.status}</span>
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Model Status</span>
                                        <span className="mt-2 text-lg font-medium text-slate-800">{stats.modelStatus}</span>
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Patients</span>
                                        <span className="mt-2 text-lg font-medium text-blue-600 flex items-center gap-2"><Users size={18} /> {stats.totalPatients}</span>
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Assessments</span>
                                        <span className="mt-2 text-lg font-medium text-blue-600 flex items-center gap-2"><Activity size={18} /> {stats.totalAssessments}</span>
                                    </div>
                                </div>
                            </div>
                        </section>


                        {/* ================================================= */}
                        {/* WHAT THE SYSTEM DOES */}
                        {/* ================================================= */}

                        <section className="mb-6 rounded-xl border border-slate-200 bg-white shadow-sm">

                            <SectionHeader
                                icon={
                                    <ClipboardCheck size={19} />
                                }
                                title="What the system does"
                                subtitle="From patient information to a condition-specific risk assessment"
                            />

                            <div className="grid gap-4 p-6 md:grid-cols-2 lg:grid-cols-4">

                                <ProcessCard
                                    number="01"
                                    icon={
                                        <Stethoscope size={20} />
                                    }
                                    title="Select condition"
                                    description="Choose the health condition for which the patient is being assessed."
                                />

                                <ProcessCard
                                    number="02"
                                    icon={
                                        <FileText size={20} />
                                    }
                                    title="Enter patient data"
                                    description="Provide patient details, vital signs and available clinical information."
                                />

                                <ProcessCard
                                    number="03"
                                    icon={
                                        <Brain size={20} />
                                    }
                                    title="Run assessment"
                                    description="The available information is processed by the machine learning model."
                                />

                                <ProcessCard
                                    number="04"
                                    icon={
                                        <Activity size={20} />
                                    }
                                    title="Review result"
                                    description="Review the risk class, missing information and model explanation."
                                />

                            </div>

                        </section>


                        {/* ================================================= */}
                        {/* RISK CLASSIFICATION */}
                        {/* ================================================= */}

                        <section className="mb-6 rounded-xl border border-slate-200 bg-white shadow-sm">

                            <SectionHeader
                                icon={
                                    <Activity size={19} />
                                }
                                title="Risk classification"
                                subtitle="The model result is represented using five risk classes"
                            />

                            <div className="p-6">

                                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">

                                    <RiskLevel
                                        className="0"
                                        label="Normal"
                                        color="green"
                                        description="No elevated risk indicated by the model."
                                    />

                                    <RiskLevel
                                        className="1"
                                        label="Mild"
                                        color="yellow"
                                        description="Mild risk classification."
                                    />

                                    <RiskLevel
                                        className="2"
                                        label="Moderate"
                                        color="orange"
                                        description="Moderate risk classification."
                                    />

                                    <RiskLevel
                                        className="3"
                                        label="Severe"
                                        color="red"
                                        description="Severe risk classification."
                                    />

                                    <RiskLevel
                                        className="4"
                                        label="Critical"
                                        color="darkred"
                                        description="Critical risk classification."
                                    />

                                </div>

                                <div className="mt-5 rounded-lg border border-slate-200 bg-slate-50 px-5 py-4">

                                    <p className="text-sm leading-6 text-slate-600">
                                        The displayed class is the model's
                                        classification for the selected health
                                        condition. The classification should be
                                        interpreted together with the available
                                        patient information and professional
                                        clinical judgment.
                                    </p>

                                </div>

                            </div>

                        </section>


                        {/* ================================================= */}
                        {/* DATA USED */}
                        {/* ================================================= */}

                        <section className="mb-6 rounded-xl border border-slate-200 bg-white shadow-sm">

                            <SectionHeader
                                icon={
                                    <Database size={19} />
                                }
                                title="Patient information"
                                subtitle="Types of information that can be provided to the system"
                            />

                            <div className="grid gap-4 p-6 md:grid-cols-2 lg:grid-cols-3">

                                <DataCard
                                    icon={
                                        <UserIcon />
                                    }
                                    title="Patient details"
                                    description="Basic patient information such as name, patient ID, age and gender."
                                />

                                <DataCard
                                    icon={
                                        <HeartPulse size={20} />
                                    }
                                    title="Vital signs"
                                    description="Available vital measurements such as heart rate, blood pressure, temperature, SpO₂ and respiratory rate."
                                />

                                <DataCard
                                    icon={
                                        <Upload size={20} />
                                    }
                                    title="Clinical files"
                                    description="Laboratory values, medical history and longitudinal measurements can be uploaded."
                                />

                            </div>

                            <div className="border-t border-slate-100 px-6 py-4">

                                <p className="text-xs leading-5 text-slate-500">
                                    Supported upload formats in the current
                                    interface include CSV, XLSX, PDF, PNG and
                                    JPG files.
                                </p>

                            </div>

                        </section>


                        {/* ================================================= */}
                        {/* MISSING DATA */}
                        {/* ================================================= */}

                        <section className="mb-6 rounded-xl border border-slate-200 bg-white shadow-sm">

                            <SectionHeader
                                icon={
                                    <AlertTriangle size={19} />
                                }
                                title="Missing data"
                                subtitle="The system accounts for the information that is available for an assessment"
                            />

                            <div className="p-6">

                                <div className="grid gap-5 md:grid-cols-3">

                                    <FeatureItem
                                        title="Data completeness"
                                        description="The assessment can indicate how much of the expected information is available."
                                    />

                                    <FeatureItem
                                        title="Missing information"
                                        description="Information that was not provided can be shown alongside the result."
                                    />

                                    <FeatureItem
                                        title="Result context"
                                        description="The risk classification should be considered in the context of available data."
                                    />

                                </div>

                            </div>

                        </section>


                        {/* ================================================= */}
                        {/* PRESCRIPTION */}
                        {/* ================================================= */}

                        <section className="mb-6 rounded-xl border border-slate-200 bg-white shadow-sm">

                            <SectionHeader
                                icon={
                                    <Pill size={19} />
                                }
                                title="Prescription"
                                subtitle="Optional clinician-entered medication information"
                            />

                            <div className="p-6">

                                <div className="flex flex-col gap-5 md:flex-row md:items-start">

                                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-pink-50 text-pink-600">

                                        <Pill size={21} />

                                    </div>

                                    <div>

                                        <h3 className="text-sm font-semibold text-slate-800">
                                            Multiple medications are supported
                                        </h3>

                                        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
                                            If a healthcare professional chooses
                                            to provide a prescription, multiple
                                            medications can be entered along
                                            with dosage, frequency, duration and
                                            instructions for each medication.
                                        </p>

                                        <p className="mt-3 text-xs leading-5 text-slate-500">
                                            The prescription section is intended
                                            for clinician-entered information.
                                            The system does not automatically
                                            prescribe medication based on the
                                            risk classification.
                                        </p>

                                    </div>

                                </div>

                            </div>

                        </section>


                        {/* ================================================= */}
                        {/* SYSTEM APPROACH */}
                        {/* ================================================= */}

                        <section className="mb-6 rounded-xl border border-slate-200 bg-white shadow-sm">

                            <SectionHeader
                                icon={
                                    <Brain size={19} />
                                }
                                title="Machine learning component"
                                subtitle="Role of the model within the decision-support workflow"
                            />

                            <div className="grid gap-6 p-6 lg:grid-cols-2">

                                <div>

                                    <h3 className="text-sm font-semibold text-slate-800">
                                        Condition-specific assessment
                                    </h3>

                                    <p className="mt-2 text-sm leading-6 text-slate-600">
                                        The system is designed around a selected
                                        health condition. Patient information is
                                        submitted for that condition and the
                                        model returns the corresponding risk
                                        classification.
                                    </p>

                                </div>

                                <div>

                                    <h3 className="text-sm font-semibold text-slate-800">
                                        Decision support, not diagnosis
                                    </h3>

                                    <p className="mt-2 text-sm leading-6 text-slate-600">
                                        The model result is presented as an aid
                                        for reviewing patient information. It is
                                        not intended to independently diagnose a
                                        patient or replace professional medical
                                        decision-making.
                                    </p>

                                </div>

                            </div>

                        </section>


                      
                    </div>

                </main>

            </div>

        </div>
    );
}


/*
 * =========================================================
 * SECTION HEADER
 * =========================================================
 */

function SectionHeader({
    icon,
    title,
    subtitle,
}) {
    return (
        <div className="border-b border-slate-100 px-6 py-5">

            <div className="flex items-center gap-3">

                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                    {icon}
                </div>

                <div>

                    <h2 className="text-base font-semibold text-slate-900">
                        {title}
                    </h2>

                    <p className="mt-0.5 text-xs text-slate-500">
                        {subtitle}
                    </p>

                </div>

            </div>

        </div>
    );
}


/*
 * =========================================================
 * PROCESS CARD
 * =========================================================
 */

function ProcessCard({
    number,
    icon,
    title,
    description,
}) {
    return (
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-5">

            <div className="flex items-start justify-between">

                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white text-blue-600 shadow-sm">
                    {icon}
                </div>

                <span className="text-xs font-semibold text-slate-300">
                    {number}
                </span>

            </div>

            <h3 className="mt-5 text-sm font-semibold text-slate-800">
                {title}
            </h3>

            <p className="mt-2 text-xs leading-5 text-slate-500">
                {description}
            </p>

        </div>
    );
}


/*
 * =========================================================
 * RISK LEVEL
 * =========================================================
 */

function RiskLevel({
    className,
    label,
    color,
    description,
}) {
    const colors = {
        green: {
            border: "border-green-200",
            bg: "bg-green-50",
            circle: "bg-green-500",
            text: "text-green-700",
        },

        yellow: {
            border: "border-yellow-200",
            bg: "bg-yellow-50",
            circle: "bg-yellow-500",
            text: "text-yellow-700",
        },

        orange: {
            border: "border-orange-200",
            bg: "bg-orange-50",
            circle: "bg-orange-500",
            text: "text-orange-700",
        },

        red: {
            border: "border-red-200",
            bg: "bg-red-50",
            circle: "bg-red-500",
            text: "text-red-700",
        },

        darkred: {
            border: "border-red-300",
            bg: "bg-red-50",
            circle: "bg-red-800",
            text: "text-red-800",
        },
    };

    const style = colors[color];

    return (
        <div
            className={`rounded-lg border ${style.border} ${style.bg} p-4`}
        >

            <div className="flex items-center gap-3">

                <div
                    className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold text-white ${style.circle}`}
                >
                    {className}
                </div>

                <p
                    className={`text-sm font-semibold ${style.text}`}
                >
                    {label}
                </p>

            </div>

            <p className="mt-3 text-xs leading-5 text-slate-500">
                {description}
            </p>

        </div>
    );
}


/*
 * =========================================================
 * DATA CARD
 * =========================================================
 */

function DataCard({
    icon,
    title,
    description,
}) {
    return (
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-5">

            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white text-blue-600 shadow-sm">
                {icon}
            </div>

            <h3 className="mt-4 text-sm font-semibold text-slate-800">
                {title}
            </h3>

            <p className="mt-2 text-xs leading-5 text-slate-500">
                {description}
            </p>

        </div>
    );
}


/*
 * =========================================================
 * FEATURE ITEM
 * =========================================================
 */

function FeatureItem({
    title,
    description,
}) {
    return (
        <div className="border-l-2 border-blue-200 pl-4">

            <h3 className="text-sm font-semibold text-slate-800">
                {title}
            </h3>

            <p className="mt-2 text-xs leading-5 text-slate-500">
                {description}
            </p>

        </div>
    );
}


/*
 * =========================================================
 * USER ICON
 * =========================================================
 */

function UserIcon() {
    return (
        <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M20 21a8 8 0 0 0-16 0" />
            <circle cx="12" cy="7" r="4" />
        </svg>
    );
}

export default About;
