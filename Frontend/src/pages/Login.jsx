import { useState } from "react";
import { Eye, EyeOff, ShieldCheck, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

function Login() {
    const navigate = useNavigate();

    const [showPassword, setShowPassword] = useState(false);

    const [formData, setFormData] = useState({
        email: "",
        password: "",
    });

    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        // Temporary frontend login
        // Backend authentication will replace this later.
        navigate("/dashboard");
    };

    return (
        <div className="relative min-h-screen overflow-hidden bg-white">

            {/* Background decorations */}
            <div className="pointer-events-none absolute -left-32 -top-32 h-96 w-96 rounded-full bg-blue-100 blur-3xl" />

            <div className="pointer-events-none absolute -bottom-40 -right-32 h-96 w-96 rounded-full bg-pink-100 blur-3xl" />

            <div className="pointer-events-none absolute right-1/4 top-1/4 h-64 w-64 rounded-full bg-blue-50 blur-3xl" />

            {/* Main */}
            <div className="relative z-10 flex min-h-screen items-center justify-center px-5 py-10">

                <div className="grid w-full max-w-5xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl shadow-blue-100/40 md:grid-cols-2">

                    {/* Login section */}
                    <div className="flex items-center p-7 sm:p-10 lg:p-14">

                        <div className="w-full max-w-md mx-auto">

                            {/* Mobile logo */}
                            <div className="mb-10 flex items-center gap-3 md:hidden">
                                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 text-white shadow-lg shadow-blue-200">
                                    <ShieldCheck size={24} />
                                </div>

                                <div>
                                    <h1 className="text-xl font-bold text-slate-900">
                                        MedRisk AI
                                    </h1>

                                    <p className="text-xs text-slate-500">
                                        Clinical Decision Support
                                    </p>
                                </div>
                            </div>

                            <div className="mb-8">
                                <p className="mb-2 text-sm font-semibold text-blue-600">
                                    Welcome back
                                </p>

                                <h2 className="text-3xl font-bold tracking-tight text-slate-900">
                                    Sign in to your account
                                </h2>

                                <p className="mt-3 text-sm leading-6 text-slate-500">
                                    Access your patient risk assessment dashboard.
                                </p>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-5">

                                {/* Email */}
                                <div>
                                    <label className="mb-2 block text-sm font-medium text-slate-700">
                                        Email address
                                    </label>

                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        placeholder="doctor@example.com"
                                        required
                                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
                                    />
                                </div>

                                {/* Password */}
                                <div>
                                    <label className="mb-2 block text-sm font-medium text-slate-700">
                                        Password
                                    </label>

                                    <div className="relative">

                                        <input
                                            type={showPassword ? "text" : "password"}
                                            name="password"
                                            value={formData.password}
                                            onChange={handleChange}
                                            placeholder="Enter your password"
                                            required
                                            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 pr-12 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
                                        />

                                        <button
                                            type="button"
                                            onClick={() => setShowPassword((prev) => !prev)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                                        >
                                            {showPassword ? (
                                                <EyeOff size={18} />
                                            ) : (
                                                <Eye size={18} />
                                            )}
                                        </button>

                                    </div>
                                </div>

                                {/* Login */}
                                <button
                                    type="submit"
                                    className="group flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-200 transition hover:bg-blue-700 hover:shadow-xl hover:shadow-blue-200 active:scale-[0.99]"
                                >
                                    Sign in

                                    <ArrowRight
                                        size={18}
                                        className="transition-transform group-hover:translate-x-1"
                                    />
                                </button>

                            </form>

                            <div className="mt-8 flex items-center justify-center gap-2 text-xs text-slate-400">
                                <ShieldCheck size={14} />
                                Secure clinical decision-support environment
                            </div>

                            <p className="mt-6 text-center text-xs leading-5 text-slate-400">
                                This system is a research/educational prototype and
                                does not replace professional medical judgment.
                            </p>

                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}

export default Login;