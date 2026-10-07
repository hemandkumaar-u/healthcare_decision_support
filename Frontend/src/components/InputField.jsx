function InputField({
    label,
    name,
    type = "text",
    value,
    onChange,
    placeholder = "",
    required = false,
    error = "",
    unit = "",
    min,
    max,
    step,
}) {
    return (
        <div>
            <label
                htmlFor={name}
                className="mb-2 block text-sm font-semibold text-slate-700 font-['Inter']"
            >
                {label}

                {required && (
                    <span className="ml-1 text-red-500">*</span>
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
                    required={required}
                    min={min}
                    max={max}
                    step={step}
                    className={`w-full rounded-2xl border bg-white/50 px-4 py-3.5 text-sm font-medium text-slate-900 shadow-sm outline-none backdrop-blur-sm transition-all placeholder:text-slate-400 font-['Roboto'] ${
                        unit ? "pr-16" : ""
                    } ${
                        error
                            ? "border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-100 bg-red-50/50"
                            : "border-slate-200/60 hover:bg-white/80 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                    }`}
                />

                {unit && (
                    <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-medium text-slate-400">
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

export default InputField;