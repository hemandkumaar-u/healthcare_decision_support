import {
    Plus,
    ArrowRight,
    Clock3,
    FileText,
    Activity,
    Users,
    Server
} from "lucide-react";

import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";

function Dashboard() {
    const navigate = useNavigate();
    const [recentAnalyses, setRecentAnalyses] = useState([]);
    const [stats, setStats] = useState({
        systemVersion: "...",
        totalPatients: "...",
        totalAssessments: "...",
        status: "Checking...",
        modelStatus: "..."
    });

    useEffect(() => {
        const fetchData = async () => {
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

            try {
                const statsResponse = await axios.get("http://localhost:5000/api/system/stats");
                setStats(statsResponse.data);
            } catch (error) {
                console.error("Error fetching stats:", error);
                setStats(prev => ({ ...prev, status: "Offline" }));
            }
        };
        fetchData();
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
        <div className="min-h-screen bg-[conic-gradient(at_bottom_right,_var(--tw-gradient-stops))] from-slate-100 via-indigo-50 to-blue-100 font-sans">

            <Sidebar />

            {/* Main application area */}
            <div className="lg:pl-64">

                <Header />

                <main className="mx-auto max-w-7xl px-5 py-7 sm:px-7 lg:px-8">

                    {/* Welcome */}
                    <section className="mb-8">

                        <p className="mb-1 text-sm font-semibold tracking-wide text-indigo-600 uppercase font-['Roboto']">
                            Overview
                        </p>

                        <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl font-['Inter'] drop-shadow-sm">
                            Patient Risk Assessment
                        </h1>

                        <p className="mt-3 max-w-2xl text-base leading-relaxed text-slate-600 font-['Roboto']">
                            Analyze patient information and identify elevated
                            risk for a selected health condition.
                        </p>

                    </section>


                    {/* Main action cards */}
                    <section className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">

                        {/* New analysis */}
                        <div className="relative overflow-hidden rounded-3xl border border-white/50 bg-white/40 p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] backdrop-blur-xl transition-all duration-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:-translate-y-1">
                            <div className="absolute top-0 right-0 -mt-4 -mr-4 h-32 w-32 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 opacity-20 blur-2xl"></div>

                            <div className="relative z-10 flex h-full flex-col justify-between">

                                <div>
                                    <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg shadow-indigo-500/30">
                                        <Plus size={24} />
                                    </div>
                                    <h2 className="text-xl font-bold text-slate-900 font-['Inter']">
                                        Start a new analysis
                                    </h2>

                                    <p className="mt-3 max-w-lg text-sm leading-relaxed text-slate-600 font-['Roboto']">
                                        Enter patient information, upload
                                        clinical data, select a health
                                        condition and generate a risk
                                        assessment.
                                    </p>

                                </div>


                                <button
                                    onClick={() => navigate("/patient/new")}
                                    className="group mt-8 flex w-fit items-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition-all duration-300 hover:bg-slate-800 hover:shadow-lg hover:shadow-slate-900/20 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-2"
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
                        <div className="relative overflow-hidden rounded-3xl border border-white/50 bg-white/40 p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] backdrop-blur-xl flex flex-col justify-between">
                            <div className="absolute -bottom-10 -left-10 h-40 w-40 rounded-full bg-gradient-to-tr from-emerald-400 to-teal-500 opacity-20 blur-2xl"></div>

                            <div className="relative z-10">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 text-white shadow-lg shadow-teal-500/30">
                                        <Server size={20} />
                                    </div>
                                    <h2 className="text-xl font-bold text-slate-900 font-['Inter']">
                                        System Status
                                    </h2>
                                </div>

                                <div className="grid grid-cols-2 gap-y-6 gap-x-4">
                                    <div>
                                        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 font-['Inter']">Backend</p>
                                        <div className="mt-2 flex items-center gap-2">
                                            <span className={`relative flex h-2.5 w-2.5`}>
                                              {stats.status === "Online" ? (
                                                  <>
                                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                                                  </>
                                              ) : (
                                                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
                                              )}
                                            </span>
                                            <span className={`text-sm font-semibold font-['Roboto'] ${stats.status === "Online" ? "text-emerald-600" : "text-red-500"}`}>{stats.status}</span>
                                        </div>
                                    </div>
                                    <div>
                                        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 font-['Inter']">Model</p>
                                        <p className="mt-2 text-sm font-semibold text-slate-800 font-['Roboto']">{stats.modelStatus}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 font-['Inter']">Patients</p>
                                        <p className="mt-2 text-xl font-bold text-indigo-600 font-['Roboto'] flex items-center gap-2"><Users size={18} /> {stats.totalPatients}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 font-['Inter']">Assessments</p>
                                        <p className="mt-2 text-xl font-bold text-indigo-600 font-['Roboto'] flex items-center gap-2"><Activity size={18} /> {stats.totalAssessments}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </section>


                    {/* Recent analyses */}
                    <section className="mt-10">

                        <div className="mb-5 flex items-center justify-between">

                            <div>
                                <h2 className="text-xl font-bold text-slate-900 font-['Inter']">
                                    Recent analyses
                                </h2>

                                <p className="mt-1 text-sm text-slate-500 font-['Roboto']">
                                    Recently completed patient assessments
                                </p>
                            </div>

                            <button
                                onClick={() => navigate("/history")}
                                className="group flex items-center gap-1.5 rounded-full bg-white/60 px-4 py-2 text-sm font-semibold text-indigo-600 shadow-sm ring-1 ring-inset ring-indigo-100 backdrop-blur-sm transition-all hover:bg-white hover:shadow-md"
                            >
                                View history
                                <ArrowRight size={15} className="transition-transform group-hover:translate-x-1" />
                            </button>

                        </div>


                        <div className="overflow-hidden rounded-3xl border border-white/60 bg-white/50 shadow-[0_8px_30px_rgb(0,0,0,0.06)] backdrop-blur-xl">

                            {/* Desktop table */}
                            <div className="hidden overflow-x-auto md:block">

                                <table className="w-full text-left border-collapse">

                                    <thead className="bg-slate-900/5 backdrop-blur-md">

                                        <tr>

                                            <th className="px-6 py-4 text-xs font-bold tracking-wider text-slate-500 uppercase font-['Inter']">
                                                Patient
                                            </th>

                                            <th className="px-6 py-4 text-xs font-bold tracking-wider text-slate-500 uppercase font-['Inter']">
                                                Condition
                                            </th>

                                            <th className="px-6 py-4 text-xs font-bold tracking-wider text-slate-500 uppercase font-['Inter']">
                                                Risk
                                            </th>

                                            <th className="px-6 py-4 text-xs font-bold tracking-wider text-slate-500 uppercase font-['Inter']">
                                                Date
                                            </th>

                                        </tr>

                                    </thead>


                                    <tbody className="divide-y divide-white/50">

                                        {recentAnalyses.length > 0 ? recentAnalyses.map((item) => (

                                            <tr
                                                key={item.id}
                                                className="transition-colors hover:bg-white/60 group cursor-pointer"
                                                onClick={() => navigate("/history")}
                                            >

                                                <td className="px-6 py-5">

                                                    <div className="flex items-center gap-3">
                                                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-100 to-blue-100 text-indigo-700 font-bold shadow-inner">
                                                            {item.patient.charAt(0)}
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors">
                                                                {item.patient}
                                                            </p>

                                                            <p className="mt-0.5 text-xs text-slate-400">
                                                                {item.id}
                                                            </p>
                                                        </div>
                                                    </div>
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

                                        )) : (
                                            <tr>
                                                <td colSpan="4" className="px-6 py-12 text-center">
                                                    <div className="flex flex-col items-center justify-center text-slate-400">
                                                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 mb-3 text-slate-400">
                                                            <FileText size={24} />
                                                        </div>
                                                        <p className="text-sm font-medium font-['Inter'] text-slate-600">No assessments found</p>
                                                        <p className="text-xs mt-1 font-['Roboto'] max-w-sm text-slate-500">Start a new analysis to see patient risk assessment results appear here.</p>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}

                                    </tbody>

                                </table>

                            </div>


                            {/* Mobile cards */}
                            <div className="divide-y divide-white/50 md:hidden">

                                {recentAnalyses.length > 0 ? recentAnalyses.map((item) => (

                                    <div
                                        key={item.id}
                                        className="p-5 cursor-pointer transition-colors hover:bg-white/60 group"
                                        onClick={() => navigate("/history")}
                                    >

                                        <div className="flex items-start justify-between gap-4">

                                            <div className="flex items-center gap-3">
                                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-100 to-blue-100 text-indigo-700 font-bold shadow-inner">
                                                    {item.patient.charAt(0)}
                                                </div>
                                                <div>

                                                    <p className="text-sm font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors">
                                                        {item.patient}
                                                    </p>

                                                    <p className="mt-0.5 text-xs text-slate-400">
                                                        {item.id}
                                                    </p>

                                                </div>
                                            </div>

                                            <span
                                                className={`shrink-0 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${getRiskStyle(
                                                    item.level
                                                )}`}
                                            >
                                                <span className="h-1.5 w-1.5 rounded-full bg-current" />
                                                {item.risk}% · {item.level}
                                            </span>

                                        </div>

                                        <div className="mt-4 flex items-center justify-between pl-13">

                                            <div className="flex items-center gap-2 text-xs font-medium text-slate-600">
                                                <FileText size={14} />
                                                {item.condition}
                                            </div>

                                            <div className="flex items-center gap-1.5 text-xs text-slate-400">
                                                <Clock3 size={13} />
                                                {item.date}
                                            </div>

                                        </div>

                                    </div>

                                )) : (
                                    <div className="px-6 py-10 text-center">
                                        <div className="flex flex-col items-center justify-center text-slate-400">
                                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 mb-3 text-slate-400">
                                                <FileText size={20} />
                                            </div>
                                            <p className="text-sm font-medium font-['Inter'] text-slate-600">No assessments</p>
                                        </div>
                                    </div>
                                )}

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