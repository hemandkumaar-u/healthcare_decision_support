import {
    Plus,
    ArrowRight,
    Clock3,
    FileText,
} from "lucide-react";

import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";

function Dashboard() {
    const navigate = useNavigate();
    const [recentAnalyses, setRecentAnalyses] = useState([]);

    useEffect(() => {
        const fetchPatients = async () => {
            try {
                const response = await axios.get("http://localhost:5000/api/patients");
                const formattedData = response.data.map(patient => ({
                    id: `PT-${patient._id.substring(patient._id.length - 5).toUpperCase()}`,
                    patient: patient.name || "Unknown",
                    condition: "General Assessment",
                    risk: patient.riskAssessment?.riskLevel === "High" ? 85 : patient.riskAssessment?.riskLevel === "Medium" ? 55 : patient.riskAssessment?.riskLevel === "Low" ? 15 : 0,
                    level: patient.riskAssessment?.riskLevel || "Unknown",
                    date: new Date(patient.createdAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })
                }));
                setRecentAnalyses(formattedData.reverse());
            } catch (error) {
                console.error("Error fetching analyses:", error);
            }
        };
        fetchPatients();
    }, []);

    const getRiskStyle = (level) => {
        switch (level) {
            case "High":
                return "bg-red-50 text-red-600";

            case "Moderate":
                return "bg-amber-50 text-amber-600";

            case "Low":
                return "bg-emerald-50 text-emerald-600";

            default:
                return "bg-slate-50 text-slate-600";
        }
    };

    return (
        <div className="min-h-screen bg-slate-50">

            <Sidebar />

            {/* Main application area */}
            <div className="lg:pl-64">

                <Header />

                <main className="mx-auto max-w-7xl px-5 py-7 sm:px-7 lg:px-8">

                    {/* Welcome */}
                    <section className="mb-7">

                        <p className="mb-1 text-sm font-medium text-blue-600">
                            Welcome back
                        </p>

                        <h1 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
                            Patient Risk Assessment
                        </h1>

                        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                            Analyze patient information and identify elevated
                            risk for a selected health condition.
                        </p>

                    </section>


                    {/* Main action cards */}
                    <section className="grid gap-5 lg:grid-cols-[1.4fr_1fr]">

                        {/* New analysis */}
                        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-7">

                            <div className="flex h-full flex-col justify-between">

                                <div>

                                    <h2 className="text-lg font-semibold text-slate-900">
                                        Start a new analysis
                                    </h2>

                                    <p className="mt-2 max-w-lg text-sm leading-6 text-slate-500">
                                        Enter patient information, upload
                                        clinical data, select a health
                                        condition and generate a risk
                                        assessment.
                                    </p>

                                </div>


                                <button
                                    onClick={() => navigate("/patient/new")}
                                    className="mt-7 flex w-fit items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                                >
                                    <Plus size={17} />

                                    New Analysis

                                    <ArrowRight
                                        size={16}
                                        className="ml-1"
                                    />
                                </button>

                            </div>

                        </div>


                        {/* System information */}
                        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

                            <div className="flex items-start gap-4">
                                <div>

                                    <h2 className="text-sm font-semibold text-slate-900">
                                        Decision Support
                                    </h2>

                                    <p className="mt-2 text-sm leading-6 text-slate-500">
                                        The system analyzes available patient
                                        information and provides a model-based
                                        risk assessment for the selected
                                        condition.
                                    </p>

                                </div>

                            </div>

                            <div className="mt-5 border-t border-slate-100 pt-4">

                                <p className="text-xs leading-5 text-slate-400">
                                    This prototype supports clinical decision
                                    making and does not replace professional
                                    medical judgment.
                                </p>

                            </div>

                        </div>

                    </section>


                    {/* Recent analyses */}
                    <section className="mt-7">

                        <div className="mb-4 flex items-center justify-between">

                            <div>
                                <h2 className="text-base font-semibold text-slate-900">
                                    Recent analyses
                                </h2>

                                <p className="mt-1 text-xs text-slate-500">
                                    Recently completed patient assessments
                                </p>
                            </div>

                            <button
                                onClick={() => navigate("/history")}
                                className="flex items-center gap-1.5 text-sm font-medium text-blue-600 transition hover:text-blue-700"
                            >
                                View history

                                <ArrowRight size={15} />
                            </button>

                        </div>


                        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

                            {/* Desktop table */}
                            <div className="hidden overflow-x-auto md:block">

                                <table className="w-full text-left">

                                    <thead className="border-b border-slate-100 bg-slate-50/70">

                                        <tr>

                                            <th className="px-5 py-3.5 text-xs font-semibold text-slate-500">
                                                Patient
                                            </th>

                                            <th className="px-5 py-3.5 text-xs font-semibold text-slate-500">
                                                Condition
                                            </th>

                                            <th className="px-5 py-3.5 text-xs font-semibold text-slate-500">
                                                Risk
                                            </th>

                                            <th className="px-5 py-3.5 text-xs font-semibold text-slate-500">
                                                Date
                                            </th>

                                        </tr>

                                    </thead>


                                    <tbody className="divide-y divide-slate-100">

                                        {recentAnalyses.map((item) => (

                                            <tr
                                                key={item.id}
                                                className="transition hover:bg-slate-50"
                                            >

                                                <td className="px-5 py-4">

                                                    <div>
                                                        <p className="text-sm font-medium text-slate-800">
                                                            {item.patient}
                                                        </p>

                                                        <p className="mt-0.5 text-xs text-slate-400">
                                                            {item.id}
                                                        </p>
                                                    </div>

                                                </td>


                                                <td className="px-5 py-4 text-sm text-slate-600">
                                                    {item.condition}
                                                </td>


                                                <td className="px-5 py-4">

                                                    <span
                                                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${getRiskStyle(
                                                            item.level
                                                        )}`}
                                                    >
                                                        <span className="h-1.5 w-1.5 rounded-full bg-current" />

                                                        {item.risk}% · {item.level}
                                                    </span>

                                                </td>


                                                <td className="px-5 py-4">

                                                    <div className="flex items-center gap-2 text-xs text-slate-400">
                                                        <Clock3 size={14} />
                                                        {item.date}
                                                    </div>

                                                </td>

                                            </tr>

                                        ))}

                                    </tbody>

                                </table>

                            </div>


                            {/* Mobile cards */}
                            <div className="divide-y divide-slate-100 md:hidden">

                                {recentAnalyses.map((item) => (

                                    <div
                                        key={item.id}
                                        className="p-4"
                                    >

                                        <div className="flex items-start justify-between gap-4">

                                            <div>

                                                <p className="text-sm font-medium text-slate-800">
                                                    {item.patient}
                                                </p>

                                                <p className="mt-0.5 text-xs text-slate-400">
                                                    {item.id}
                                                </p>

                                            </div>

                                            <span
                                                className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${getRiskStyle(
                                                    item.level
                                                )}`}
                                            >
                                                {item.risk}% · {item.level}
                                            </span>

                                        </div>

                                        <div className="mt-3 flex items-center justify-between">

                                            <div className="flex items-center gap-2 text-xs text-slate-500">
                                                <FileText size={14} />
                                                {item.condition}
                                            </div>

                                            <div className="flex items-center gap-1.5 text-xs text-slate-400">
                                                <Clock3 size={13} />
                                                {item.date}
                                            </div>

                                        </div>

                                    </div>

                                ))}

                            </div>

                        </div>

                    </section>


                    {/* About application */}
                    <section className="mt-7 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-7">

                        <div className="flex flex-col gap-5 sm:flex-row sm:items-start">

                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-pink-50 text-pink-500">
                                <FileText size={19} />
                            </div>

                            <div>

                                <h2 className="text-base font-semibold text-slate-900">
                                    About MedRisk AI
                                </h2>

                                <p className="mt-2 max-w-4xl text-sm leading-6 text-slate-500">
                                    MedRisk AI is a clinical decision-support
                                    prototype that analyzes patient
                                    information to identify elevated risk
                                    for a selected health condition. The
                                    system can consider patient details,
                                    vital signs, laboratory information,
                                    medical history and longitudinal
                                    measurements.
                                </p>

                                <button
                                    onClick={() => navigate("/about")}
                                    className="mt-4 text-sm font-medium text-blue-600 hover:text-blue-700"
                                >
                                    Learn more →
                                </button>

                            </div>

                        </div>

                    </section>

                </main>

            </div>

        </div>
    );
}

export default Dashboard;