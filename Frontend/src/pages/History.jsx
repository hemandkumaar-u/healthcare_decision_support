import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    Search,
    Plus,
    Clock3,
    User,
    Activity,
    FileText,
    AlertTriangle,
    CheckCircle2,
    ChevronDown,
    ChevronUp,
    Trash2,
    Pill,
    ClipboardList,
    CalendarDays,
} from "lucide-react";

import Sidebar from "../components/Sidebar";
import Header from "../components/Header";

function History() {
    const navigate = useNavigate();

    const [history, setHistory] = useState(() => {
        try {
            return JSON.parse(
                localStorage.getItem("analysisHistory") || "[]"
            );
        } catch {
            return [];
        }
    });

    const [search, setSearch] = useState("");
    const [expandedId, setExpandedId] = useState(null);

    /*
     * =========================================================
     * FILTER HISTORY
     * =========================================================
     */

    const filteredHistory = useMemo(() => {
        const query = search.trim().toLowerCase();

        if (!query) {
            return history;
        }

        return history.filter((item) => {
            const patientName =
                item.patient?.name?.toLowerCase() || "";

            const patientId =
                item.patient?.patientId?.toLowerCase() || "";

            const condition =
                item.condition?.toLowerCase() || "";

            const risk =
                item.prediction?.label?.toLowerCase() || "";

            return (
                patientName.includes(query) ||
                patientId.includes(query) ||
                condition.includes(query) ||
                risk.includes(query)
            );
        });
    }, [history, search]);

    /*
     * =========================================================
     * DELETE ANALYSIS
     * =========================================================
     */

    const handleDelete = (id) => {
        const confirmed = window.confirm(
            "Are you sure you want to remove this analysis from history?"
        );

        if (!confirmed) {
            return;
        }

        const updatedHistory = history.filter(
            (item) => item.id !== id
        );

        setHistory(updatedHistory);

        localStorage.setItem(
            "analysisHistory",
            JSON.stringify(updatedHistory)
        );

        if (expandedId === id) {
            setExpandedId(null);
        }
    };

    /*
     * =========================================================
     * EXPAND / COLLAPSE
     * =========================================================
     */

    const toggleExpanded = (id) => {
        setExpandedId((previous) =>
            previous === id ? null : id
        );
    };

    return (
        <div className="min-h-screen bg-slate-50">

            <Sidebar />

            <div className="lg:pl-64">

                <Header />

                <main className="px-5 py-6 sm:px-7 lg:px-8">

                    <div className="mx-auto max-w-7xl">

                        {/* ================================================= */}
                        {/* PAGE HEADER */}
                        {/* ================================================= */}

                        <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                            <div>

                                <div className="flex items-center gap-3">

                                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
                                        <Clock3 size={21} />
                                    </div>

                                    <div>

                                        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
                                            Analysis History
                                        </h1>

                                        <p className="mt-1 text-sm text-slate-500">
                                            Review previous patient risk assessments.
                                        </p>

                                    </div>

                                </div>

                            </div>


                            <button
                                type="button"
                                onClick={() =>
                                    navigate("/patient/new")
                                }
                                className="flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700"
                            >
                                <Plus size={17} />
                                New Analysis
                            </button>

                        </div>


                        {/* ================================================= */}
                        {/* SEARCH + SUMMARY */}
                        {/* ================================================= */}

                        <section className="mb-6 rounded-xl border border-slate-200 bg-white shadow-sm">

                            <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">

                                {/* Search */}

                                <div className="relative w-full sm:max-w-md">

                                    <Search
                                        size={18}
                                        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                                    />

                                    <input
                                        type="text"
                                        value={search}
                                        onChange={(event) =>
                                            setSearch(
                                                event.target.value
                                            )
                                        }
                                        placeholder="Search patient, ID or condition..."
                                        className="w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 hover:border-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                    />

                                </div>


                                {/* Count */}

                                <div className="text-sm text-slate-500">

                                    Showing{" "}

                                    <span className="font-semibold text-slate-800">
                                        {filteredHistory.length}
                                    </span>

                                    {" "}of{" "}

                                    <span className="font-semibold text-slate-800">
                                        {history.length}
                                    </span>

                                    {" "}analyses

                                </div>

                            </div>

                        </section>


                        {/* ================================================= */}
                        {/* EMPTY STATE */}
                        {/* ================================================= */}

                        {history.length === 0 ? (

                            <EmptyHistory
                                onNewAnalysis={() =>
                                    navigate("/patient/new")
                                }
                            />

                        ) : filteredHistory.length === 0 ? (

                            <NoSearchResults />

                        ) : (

                            <div className="space-y-4">

                                {filteredHistory.map(
                                    (analysis) => (

                                        <HistoryCard
                                            key={analysis.id}
                                            analysis={analysis}
                                            expanded={
                                                expandedId ===
                                                analysis.id
                                            }
                                            onToggle={() =>
                                                toggleExpanded(
                                                    analysis.id
                                                )
                                            }
                                            onDelete={() =>
                                                handleDelete(
                                                    analysis.id
                                                )
                                            }
                                        />

                                    )
                                )}

                            </div>

                        )}

                    </div>

                </main>

            </div>

        </div>
    );
}


/*
 * =========================================================
 * HISTORY CARD
 * =========================================================
 */

function HistoryCard({
    analysis,
    expanded,
    onToggle,
    onDelete,
}) {
    const risk = getRiskStyle(
        analysis.prediction?.class
    );

    const medications =
        analysis.prescription?.medications || [];

    return (
        <article className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">

            {/* ================================================= */}
            {/* MAIN HISTORY ROW */}
            {/* ================================================= */}

            <div className="p-5 sm:p-6">

                <div
                    className="
                        grid
                        items-center
                        gap-x-6
                        gap-y-5
                        lg:grid-cols-[minmax(220px,1.5fr)_180px_165px_175px_120px]
                    "
                >

                    {/* ================================================= */}
                    {/* PATIENT */}
                    {/* ================================================= */}

                    <div className="flex min-w-0 items-center gap-4">

                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
                            <User size={21} />
                        </div>

                        <div className="min-w-0">

                            <h2 className="truncate text-base font-semibold text-slate-900">
                                {analysis.patient?.name ||
                                    "Unknown patient"}
                            </h2>

                            <div className="mt-1 flex flex-wrap items-center gap-x-2 text-xs text-slate-500">

                                <span>
                                    ID:{" "}
                                    {analysis.patient?.patientId ||
                                        "—"}
                                </span>

                                <span className="text-slate-300">
                                    •
                                </span>

                                <span>
                                    {analysis.patient?.age ||
                                        "—"}{" "}
                                    years
                                </span>

                                <span className="text-slate-300">
                                    •
                                </span>

                                <span>
                                    {analysis.patient?.gender ||
                                        "—"}
                                </span>

                            </div>

                        </div>

                    </div>


                    {/* ================================================= */}
                    {/* CONDITION */}
                    {/* ================================================= */}

                    <div className="min-w-0">

                        <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
                            Condition
                        </p>

                        <p className="mt-1 truncate text-sm font-medium text-slate-800">
                            {analysis.condition || "—"}
                        </p>

                    </div>


                    {/* ================================================= */}
                    {/* RISK */}
                    {/* ================================================= */}

                    <div className="flex">

                        <RiskBadge
                            riskClass={
                                analysis.prediction?.class
                            }
                            label={
                                analysis.prediction?.label ||
                                risk.label
                            }
                        />

                    </div>


                    {/* ================================================= */}
                    {/* DATE */}
                    {/* ================================================= */}

                    <div className="min-w-0">

                        <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
                            Date
                        </p>

                        <p className="mt-1 whitespace-nowrap text-sm text-slate-700">
                            {formatDate(
                                analysis.createdAt
                            )}
                        </p>

                    </div>


                    {/* ================================================= */}
                    {/* ACTIONS */}
                    {/* ================================================= */}

                    <div className="flex items-center justify-end gap-2">

                        <button
                            type="button"
                            onClick={onToggle}
                            className="flex h-9 items-center gap-2 rounded-lg border border-slate-300 bg-white px-3.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                        >

                            <span>
                                {expanded
                                    ? "Hide"
                                    : "View"}
                            </span>

                            {expanded ? (
                                <ChevronUp size={16} />
                            ) : (
                                <ChevronDown size={16} />
                            )}

                        </button>

                        <button
                            type="button"
                            onClick={onDelete}
                            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-200 text-slate-400 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                            title="Delete analysis"
                        >
                            <Trash2 size={16} />
                        </button>

                    </div>

                </div>


                {/* ================================================= */}
                {/* QUICK STATUS */}
                {/* ================================================= */}

                <div className="mt-5 flex flex-wrap gap-2 border-t border-slate-100 pt-4">

                    <InfoPill
                        icon={<ClipboardList size={14} />}
                        text={`${analysis.dataCompleteness ?? 0}% data`}
                    />

                    <InfoPill
                        icon={<AlertTriangle size={14} />}
                        text={`${analysis.missingData?.length || 0} missing`}
                    />

                    <InfoPill
                        icon={<Pill size={14} />}
                        text={
                            analysis.prescription
                                ? `${medications.length} medication${
                                      medications.length !== 1
                                          ? "s"
                                          : ""
                                  }`
                                : "No prescription"
                        }
                    />

                </div>

            </div>


            {/* ================================================= */}
            {/* EXPANDED DETAILS */}
            {/* ================================================= */}

            {expanded && (

                <div className="border-t border-slate-200 bg-slate-50/70 px-5 py-6 sm:px-6">

                    <div className="grid gap-6 lg:grid-cols-2">

                        {/* Patient details */}

                        <DetailSection
                            title="Patient Information"
                            icon={
                                <User size={17} />
                            }
                        >

                            <div className="grid grid-cols-2 gap-x-5 gap-y-4">

                                <DetailValue
                                    label="Name"
                                    value={
                                        analysis.patient?.name
                                    }
                                />

                                <DetailValue
                                    label="Patient ID"
                                    value={
                                        analysis.patient?.patientId
                                    }
                                />

                                <DetailValue
                                    label="Age"
                                    value={
                                        analysis.patient?.age
                                    }
                                />

                                <DetailValue
                                    label="Gender"
                                    value={
                                        analysis.patient?.gender
                                    }
                                />

                                <DetailValue
                                    label="Mobile"
                                    value={
                                        analysis.patient?.mobile ||
                                        "Not provided"
                                    }
                                />

                                <DetailValue
                                    label="Condition"
                                    value={
                                        analysis.condition
                                    }
                                />

                            </div>

                        </DetailSection>


                        {/* Risk */}

                        <DetailSection
                            title="Risk Assessment"
                            icon={
                                <Activity size={17} />
                            }
                        >

                            <div className="flex items-center gap-5">

                                <div
                                    className={`flex h-20 w-20 shrink-0 items-center justify-center rounded-full border-4 ${risk.border} ${risk.bg}`}
                                >

                                    <span
                                        className={`text-2xl font-bold ${risk.textColor}`}
                                    >
                                        {
                                            analysis.prediction
                                                ?.class ?? "—"
                                        }
                                    </span>

                                </div>

                                <div>

                                    <p
                                        className={`text-lg font-semibold ${risk.textColor}`}
                                    >
                                        {
                                            analysis.prediction
                                                ?.label ||
                                            risk.label
                                        }
                                    </p>

                                    <p className="mt-1 text-xs text-slate-500">
                                        Risk Class{" "}
                                        {
                                            analysis.prediction
                                                ?.class
                                        }{" "}
                                        / 4
                                    </p>

                                    <p className="mt-3 text-xs text-slate-500">
                                        Assessment recorded on{" "}
                                        {formatDate(
                                            analysis.createdAt
                                        )}
                                    </p>

                                </div>

                            </div>

                        </DetailSection>


                        {/* Vital signs */}

                        <DetailSection
                            title="Recorded Vital Signs"
                            icon={
                                <Activity size={17} />
                            }
                        >

                            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">

                                <SmallValue
                                    label="Heart rate"
                                    value={
                                        analysis.input
                                            ?.heartRate
                                    }
                                    unit="bpm"
                                />

                                <SmallValue
                                    label="Systolic BP"
                                    value={
                                        analysis.input
                                            ?.systolicBP
                                    }
                                    unit="mmHg"
                                />

                                <SmallValue
                                    label="Diastolic BP"
                                    value={
                                        analysis.input
                                            ?.diastolicBP
                                    }
                                    unit="mmHg"
                                />

                                <SmallValue
                                    label="Temperature"
                                    value={
                                        analysis.input
                                            ?.temperature
                                    }
                                    unit="°C"
                                />

                                <SmallValue
                                    label="SpO₂"
                                    value={
                                        analysis.input?.spo2
                                    }
                                    unit="%"
                                />

                                <SmallValue
                                    label="Respiratory rate"
                                    value={
                                        analysis.input
                                            ?.respiratoryRate
                                    }
                                    unit="/min"
                                />

                            </div>

                        </DetailSection>


                        {/* Data */}

                        <DetailSection
                            title="Data Availability"
                            icon={
                                <FileText size={17} />
                            }
                        >

                            <div className="space-y-4">

                                <div>

                                    <div className="flex items-center justify-between">

                                        <p className="text-xs text-slate-500">
                                            Data completeness
                                        </p>

                                        <p className="text-sm font-semibold text-slate-800">
                                            {analysis.dataCompleteness ??
                                                0}
                                            %
                                        </p>

                                    </div>

                                    <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-200">

                                        <div
                                            className="h-full rounded-full bg-blue-600"
                                            style={{
                                                width: `${analysis.dataCompleteness ?? 0}%`,
                                            }}
                                        />

                                    </div>

                                </div>


                                <div>

                                    <p className="mb-2 text-xs font-medium text-slate-500">
                                        Missing information
                                    </p>

                                    {analysis.missingData?.length ? (

                                        <div className="flex flex-wrap gap-2">

                                            {analysis.missingData.map(
                                                (item) => (
                                                    <span
                                                        key={item}
                                                        className="rounded-md border border-amber-200 bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700"
                                                    >
                                                        {item}
                                                    </span>
                                                )
                                            )}

                                        </div>

                                    ) : (

                                        <div className="flex items-center gap-2 text-xs text-green-700">

                                            <CheckCircle2
                                                size={15}
                                            />

                                            No missing information recorded.

                                        </div>

                                    )}

                                </div>

                            </div>

                        </DetailSection>

                    </div>


                    {/* ================================================= */}
                    {/* PRESCRIPTION */}
                    {/* ================================================= */}

                    <div className="mt-6">

                        <DetailSection
                            title="Prescription"
                            icon={
                                <Pill size={17} />
                            }
                        >

                            {!analysis.prescription ? (

                                <p className="text-sm text-slate-500">
                                    No prescription was provided for
                                    this analysis.
                                </p>

                            ) : (

                                <div>

                                    <div className="mb-5 flex items-center gap-2 text-xs text-slate-500">

                                        <Phone size={14} />

                                        Patient mobile:

                                        <span className="font-medium text-slate-700">
                                            {
                                                analysis
                                                    .prescription
                                                    ?.mobile || "—"
                                            }
                                        </span>

                                    </div>

                                    <div className="space-y-4">

                                        {medications.map(
                                            (
                                                medication,
                                                index
                                            ) => (

                                                <div
                                                    key={`${medication.medication}-${index}`}
                                                    className="rounded-lg border border-slate-200 bg-white p-4"
                                                >

                                                    <p className="text-sm font-semibold text-slate-900">
                                                        {
                                                            medication.medication
                                                        }
                                                    </p>

                                                    <p className="mt-1 text-xs text-slate-500">
                                                        Medication{" "}
                                                        {index + 1}
                                                    </p>

                                                    <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3">

                                                        <DetailValue
                                                            label="Dosage"
                                                            value={
                                                                medication.dosage
                                                            }
                                                        />

                                                        <DetailValue
                                                            label="Frequency"
                                                            value={
                                                                medication.frequency
                                                            }
                                                        />

                                                        <DetailValue
                                                            label="Duration"
                                                            value={
                                                                medication.duration
                                                            }
                                                        />

                                                    </div>

                                                    {medication.instructions && (
                                                        <div className="mt-4 border-t border-slate-100 pt-4">

                                                            <p className="text-xs font-medium text-slate-500">
                                                                Instructions
                                                            </p>

                                                            <p className="mt-1 text-sm leading-5 text-slate-700">
                                                                {
                                                                    medication.instructions
                                                                }
                                                            </p>

                                                        </div>
                                                    )}

                                                </div>

                                            )
                                        )}

                                    </div>

                                </div>

                            )}

                        </DetailSection>

                    </div>


                    {/* ================================================= */}
                    {/* MODEL EXPLANATION */}
                    {/* ================================================= */}

                    <div className="mt-6">

                        <DetailSection
                            title="Model Explanation"
                            icon={
                                <ClipboardList size={17} />
                            }
                        >

                            <p className="text-sm leading-6 text-slate-600">
                                Model explanation will be displayed here
                                when the backend returns the contributing
                                features or factors for this analysis.
                            </p>

                        </DetailSection>

                    </div>

                </div>

            )}

        </article>
    );
}


/*
 * =========================================================
 * RISK STYLE
 * =========================================================
 */

function getRiskStyle(riskClass) {
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
}


/*
 * =========================================================
 * RISK BADGE
 * =========================================================
 */

function RiskBadge({ riskClass, label }) {
    const risk = getRiskStyle(riskClass);

    return (
        <div
            className={`flex items-center gap-3 rounded-lg border px-4 py-2.5 ${risk.border} ${risk.bg}`}
        >

            <div
                className={`flex h-8 w-8 items-center justify-center rounded-full bg-white text-sm font-bold ${risk.textColor}`}
            >
                {riskClass ?? "—"}
            </div>

            <div>

                <p
                    className={`text-sm font-semibold ${risk.textColor}`}
                >
                    {label || risk.label}
                </p>

                <p className="text-[11px] text-slate-500">
                    Class {riskClass ?? "—"} / 4
                </p>

            </div>

        </div>
    );
}


/*
 * =========================================================
 * INFO PILL
 * =========================================================
 */

function InfoPill({ icon, text }) {
    return (
        <div className="flex items-center gap-1.5 rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs text-slate-500">

            {icon}

            <span>{text}</span>

        </div>
    );
}


/*
 * =========================================================
 * DETAIL SECTION
 * =========================================================
 */

function DetailSection({
    title,
    icon,
    children,
}) {
    return (
        <section className="rounded-lg border border-slate-200 bg-white p-5">

            <div className="mb-4 flex items-center gap-2.5">

                <div className="flex h-8 w-8 items-center justify-center rounded-md bg-slate-100 text-slate-600">
                    {icon}
                </div>

                <h3 className="text-sm font-semibold text-slate-800">
                    {title}
                </h3>

            </div>

            {children}

        </section>
    );
}


/*
 * =========================================================
 * DETAIL VALUE
 * =========================================================
 */

function DetailValue({ label, value }) {
    return (
        <div>

            <p className="text-[11px] text-slate-400">
                {label}
            </p>

            <p className="mt-1 text-sm font-medium text-slate-700">
                {value || "—"}
            </p>

        </div>
    );
}


/*
 * =========================================================
 * SMALL VALUE
 * =========================================================
 */

function SmallValue({
    label,
    value,
    unit,
}) {
    return (
        <div className="rounded-md border border-slate-200 bg-slate-50 p-3">

            <p className="text-[11px] text-slate-400">
                {label}
            </p>

            <p className="mt-1 text-sm font-semibold text-slate-800">
                {value || "—"}
            </p>

            <p className="mt-0.5 text-[11px] text-slate-400">
                {unit}
            </p>

        </div>
    );
}


/*
 * =========================================================
 * EMPTY HISTORY
 * =========================================================
 */

function EmptyHistory({ onNewAnalysis }) {
    return (
        <div className="rounded-xl border border-slate-200 bg-white px-6 py-16 text-center shadow-sm">

            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                <ClipboardList size={25} />
            </div>

            <h2 className="mt-5 text-lg font-semibold text-slate-900">
                No analyses yet
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                Completed patient risk assessments will appear here
                after they are saved from the prediction page.
            </p>

            <button
                type="button"
                onClick={onNewAnalysis}
                className="mt-6 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700"
            >
                <Plus size={17} />
                Start New Analysis
            </button>

        </div>
    );
}


/*
 * =========================================================
 * NO SEARCH RESULTS
 * =========================================================
 */

function NoSearchResults() {
    return (
        <div className="rounded-xl border border-slate-200 bg-white px-6 py-14 text-center shadow-sm">

            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-500">
                <Search size={22} />
            </div>

            <h2 className="mt-4 text-base font-semibold text-slate-900">
                No matching analyses
            </h2>

            <p className="mt-2 text-sm text-slate-500">
                Try searching with a different patient name,
                patient ID or condition.
            </p>

        </div>
    );
}


/*
 * =========================================================
 * DATE FORMAT
 * =========================================================
 */

function formatDate(date) {
    if (!date) {
        return "Unknown";
    }

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
        return "Unknown";
    }

    return parsedDate.toLocaleString(
        "en-IN",
        {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        }
    );
}

export default History;