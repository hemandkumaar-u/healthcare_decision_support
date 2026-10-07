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
        <div className="min-h-screen bg-slate-50">

            {/* Top Header */}
            <header className="border-b border-slate-200 bg-white">
                <div className="mx-auto flex h-16 max-w-7xl items-center px-6 lg:px-8">

                    <div className="flex items-center gap-3">

                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-pink-600 text-white">
                            <ShieldCheck size={20} strokeWidth={2.2} />
                        </div>

                        <div className="leading-tight">
                            <h1 className="text-base font-semibold text-slate-900">
                                MedRisk AI
                            </h1>

                            <p className="text-[11px] text-slate-500">
                                Clinical Decision Support
                            </p>
                        </div>

                    </div>

                </div>
            </header>


            {/* Main Content */}
            <main className="flex min-h-[calc(100vh-64px)] items-center justify-center px-5 py-12">

                <div className="w-full max-w-md">

                    {/* Login Card */}
                    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">

                        <div className="p-7 sm:p-9">

                            {/* Heading */}
                            <div className="mb-8">

                                <h2 className="text-2xl font-semibold tracking-tight text-slate-900">
                                    Sign in
                                </h2>

                                <p className="mt-2 text-sm leading-6 text-slate-500">
                                    Sign in to access the patient risk assessment system.
                                </p>

                            </div>


                            <form onSubmit={handleSubmit} className="space-y-5">

                                {/* Email */}
                                <div>

                                    <label
                                        htmlFor="email"
                                        className="mb-2 block text-sm font-medium text-slate-700"
                                    >
                                        Email address
                                    </label>

                                    <input
                                        id="email"
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        placeholder="Enter your email"
                                        autoComplete="email"
                                        required
                                        className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 hover:border-slate-400 focus:border-pink-500 focus:ring-2 focus:ring-blue-100"
                                    />

                                </div>


                                {/* Password */}
                                <div>

                                    <label
                                        htmlFor="password"
                                        className="mb-2 block text-sm font-medium text-slate-700"
                                    >
                                        Password
                                    </label>

                                    <div className="relative">

                                        <input
                                            id="password"
                                            type={showPassword ? "text" : "password"}
                                            name="password"
                                            value={formData.password}
                                            onChange={handleChange}
                                            placeholder="Enter your password"
                                            autoComplete="current-password"
                                            required
                                            className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-3 pr-11 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 hover:border-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                        />

                                        <button
                                            type="button"
                                            onClick={() =>
                                                setShowPassword((prev) => !prev)
                                            }
                                            className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
                                            aria-label={
                                                showPassword
                                                    ? "Hide password"
                                                    : "Show password"
                                            }
                                        >
                                            {showPassword ? (
                                                <EyeOff size={18} />
                                            ) : (
                                                <Eye size={18} />
                                            )}
                                        </button>

                                    </div>

                                </div>


                                {/* Login Button */}
                                <button
                                    type="submit"
                                    className="group flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-3 text-sm font-medium text-white transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 active:bg-blue-800"
                                >
                                    Sign in

                                    <ArrowRight
                                        size={17}
                                        className="transition-transform group-hover:translate-x-0.5"
                                    />
                                </button>

                            </form>

                        </div>
                    </div>

                </div>

            </main>

        </div>
    );
}

export default Login;