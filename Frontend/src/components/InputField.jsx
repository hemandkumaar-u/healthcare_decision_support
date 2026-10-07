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
                className="mb-2 block text-sm font-medium text-slate-700"
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
                    className={`w-full rounded-lg border bg-white px-3.5 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 ${
                        unit ? "pr-16" : ""
                    } ${
                        error
                            ? "border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-100"
                            : "border-slate-300 hover:border-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
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