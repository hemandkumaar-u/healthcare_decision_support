import { Bell, UserCircle } from "lucide-react";
import { useEffect, useState } from "react";

function Header() {
    const [userName, setUserName] = useState("Doctor");
    const [userRole, setUserRole] = useState("Healthcare Professional");

    useEffect(() => {
        const storedName = localStorage.getItem("userName");
        const storedEmail = localStorage.getItem("userEmail");
        if (storedName) {
            setUserName(storedName);
        }
        if (storedEmail) {
            setUserRole(storedEmail);
        }
    }, []);
    return (
        <header className="sticky top-0 z-30 h-16 border-b border-slate-200 bg-white/95 backdrop-blur">

            <div className="flex h-full items-center justify-between px-5 sm:px-7">

                {/* Page context */}
                <div>
                    <p className="text-sm font-medium text-slate-900">
                        Clinical Dashboard
                    </p>

                    <p className="hidden text-xs text-slate-500 sm:block">
                        Patient risk assessment and analysis
                    </p>
                </div>


                {/* Right side */}
                <div className="flex items-center gap-3">

                    <button
                        className="relative rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
                        aria-label="Notifications"
                    >
                        <Bell size={19} />

                        <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-pink-500" />
                    </button>


                    <div className="hidden h-6 w-px bg-slate-200 sm:block" />


                    <button className="flex items-center gap-2 rounded-lg px-2 py-1.5 transition hover:bg-slate-50">

                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                            <UserCircle size={20} />
                        </div>

                        <div className="hidden text-left sm:block">
                            <p className="text-xs font-medium text-slate-800">
                                {userName}
                            </p>

                            <p className="text-[11px] text-slate-400">
                                {userRole}
                            </p>
                        </div>

                    </button>

                </div>

            </div>

        </header>
    );
}

export default Header;