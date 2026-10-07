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
                <label className="block text-sm font-medium text-slate-700">
                    {label}

                    {required && (
                        <span className="ml-1 text-red-500">*</span>
                    )}
                </label>

                {description && (
                    <p className="mt-1 text-xs leading-5 text-slate-500">
                        {description}
                    </p>
                )}
            </div>

            {/* Selected file */}
            {file ? (
                <div className="flex items-center justify-between rounded-lg border border-blue-200 bg-blue-50 px-4 py-3">

                    <div className="flex min-w-0 items-center gap-3">

                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white text-blue-600">
                            <FileText size={19} />
                        </div>

                        <div className="min-w-0">
                            <p className="truncate text-sm font-medium text-slate-800">
                                {file.name}
                            </p>

                            <p className="mt-0.5 text-xs text-slate-500">
                                {formatFileSize(file.size)}
                            </p>
                        </div>

                    </div>

                    <button
                        type="button"
                        onClick={handleRemove}
                        className="ml-3 flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-slate-400 transition hover:bg-white hover:text-red-500"
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
                    className="group flex w-full items-center gap-4 rounded-lg border border-dashed border-slate-300 bg-white px-5 py-5 text-left transition hover:border-blue-400 hover:bg-blue-50/30"
                >
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500 transition group-hover:bg-blue-100 group-hover:text-blue-600">
                        <Upload size={20} />
                    </div>

                    <div>
                        <p className="text-sm font-medium text-slate-700">
                            Choose a file
                        </p>

                        <p className="mt-1 text-xs text-slate-500">
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