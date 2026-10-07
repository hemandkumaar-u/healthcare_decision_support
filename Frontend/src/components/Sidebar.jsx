import {
    LayoutDashboard,
    Plus,
    History,
    Info,
    LogOut,
} from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";

function Sidebar() {
    const navigate = useNavigate();

    const navItems = [
        {
            name: "Dashboard",
            path: "/dashboard",
            icon: LayoutDashboard,
        },
        {
            name: "New Analysis",
            path: "/patient/new",
            icon: Plus,
        },
        {
            name: "History",
            path: "/history",
            icon: History,
        },
        {
            name: "About",
            path: "/about",
            icon: Info,
        },
    ];

    const handleLogout = () => {
        navigate("/login");
    };

    return (
        <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 border-r border-slate-200 bg-white lg:flex lg:flex-col">

            {/* Logo */}
            <div className="flex h-16 items-center border-b border-slate-200 px-5">

                <div className="flex items-center gap-3">

                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 text-white">
                        <Plus size={20} strokeWidth={2.4} />
                    </div>

                    <div className="leading-tight">
                        <h1 className="text-sm font-semibold text-slate-900">
                            MedRisk AI
                        </h1>

                        <p className="text-[10px] text-slate-500">
                            Clinical Decision Support
                        </p>
                    </div>

                </div>

            </div>


            {/* Navigation */}
            <nav className="flex-1 px-3 py-5">

                <p className="mb-3 px-3 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                    Main Menu
                </p>

                <div className="space-y-1">

                    {navItems.map((item) => {

                        const Icon = item.icon;

                        return (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                className={({ isActive }) =>
                                    `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                                        isActive
                                            ? "bg-blue-50 text-blue-600"
                                            : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                                    }`
                                }
                            >
                                {({ isActive }) => (
                                    <>
                                        <Icon
                                            size={18}
                                            strokeWidth={isActive ? 2.2 : 1.8}
                                        />

                                        <span>{item.name}</span>
                                    </>
                                )}
                            </NavLink>
                        );
                    })}

                </div>

            </nav>


            {/* Bottom */}
            <div className="border-t border-slate-200 p-3">

                <button
                    onClick={handleLogout}
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-500 transition hover:bg-red-50 hover:text-red-600"
                >
                    <LogOut size={18} />
                    Sign out
                </button>

            </div>

        </aside>
    );
}

export default Sidebar;