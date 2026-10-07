import { useRef } from "react";
import { Upload, FileText, X } from "lucide-react";

function FileUpload({
    label,
    description,
    file,
    onChange,
    onRemove,
    accept = ".csv,.xlsx,.xls,.pdf,.png,.jpg,.jpeg",
    required = false,
}) {
    const inputRef = useRef(null);

    const formatFileSize = (bytes) => {
        if (!bytes) return "0 KB";

        if (bytes < 1024) {
            return `${bytes} B`;
        }

        if (bytes < 1024 * 1024) {
            return `${(bytes / 1024).toFixed(1)} KB`;
        }

        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    };

    const handleFileChange = (event) => {
        const selectedFile = event.target.files?.[0];

        if (!selectedFile) return;

        onChange(selectedFile);

        // Reset the input so the same file can be selected again
        event.target.value = "";
    };

    const handleRemove = () => {
        onRemove();

        if (inputRef.current) {
            inputRef.current.value = "";
        }
    };

    return (
        <div>
            {/* Label */}
            <div className="mb-2">
                <label className="block text-sm font-semibold text-slate-700 font-['Inter']">
                    {label}

                    {required && (
                        <span className="ml-1 text-red-500">*</span>
                    )}
                </label>

                {description && (
                    <p className="mt-1 text-xs leading-5 text-slate-500 font-['Roboto']">
                        {description}
                    </p>
                )}
            </div>

            {/* Selected file */}
            {file ? (
                <div className="flex items-center justify-between rounded-2xl border border-blue-200 bg-blue-50/80 px-4 py-4 backdrop-blur-sm shadow-sm transition-all hover:shadow">

                    <div className="flex min-w-0 items-center gap-4">

                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white text-blue-600 shadow-sm ring-1 ring-blue-100/50">
                            <FileText size={22} />
                        </div>

                        <div className="min-w-0">
                            <p className="truncate text-sm font-medium text-slate-800 font-['Inter']">
                                {file.name}
                            </p>

                            <p className="mt-0.5 text-xs text-slate-500 font-['Roboto']">
                                {formatFileSize(file.size)}
                            </p>
                        </div>

                    </div>

                    <button
                        type="button"
                        onClick={handleRemove}
                        className="ml-3 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-400 transition hover:bg-white hover:text-red-500 hover:shadow-sm"
                        aria-label={`Remove ${file.name}`}
                    >
                        <X size={17} />
                    </button>

                </div>
            ) : (
                /* Upload area */
                <button
                    type="button"
                    onClick={() => inputRef.current?.click()}
                    className="group flex w-full items-center gap-5 rounded-2xl border-2 border-dashed border-slate-200/80 bg-white/40 px-6 py-6 text-left transition-all hover:border-blue-400/60 hover:bg-blue-50/50 backdrop-blur-sm"
                >
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white shadow-sm ring-1 ring-slate-200/50 text-slate-400 transition-all group-hover:scale-110 group-hover:text-blue-600 group-hover:ring-blue-200">
                        <Upload size={22} />
                    </div>

                    <div>
                        <p className="text-sm font-semibold text-slate-700 font-['Inter']">
                            Choose a file
                        </p>

                        <p className="mt-1 text-xs font-medium text-slate-500 font-['Roboto']">
                            CSV, XLSX, PDF, PNG or JPG
                        </p>
                    </div>
                </button>
            )}

            {/* Hidden input */}
            <input
                ref={inputRef}
                type="file"
                accept={accept}
                onChange={handleFileChange}
                className="hidden"
            />
        </div>
    );
}

export default FileUpload;