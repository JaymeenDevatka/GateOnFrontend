import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import {
    fetchAdminStats,
    fetchAdminUsers,
    fetchAdminEvents,
    fetchAdminBookings,
    updateUserStatusApi,
    deleteAdminUser,
    deleteAdminEvent,
    fetchAdminAnalytics,
} from "../services/api.js";
import {
    AreaChart, Area, BarChart, Bar, LineChart, Line,
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";

/* ── Inline SVG Icons ─────────────────────────────────────── */
const UsersIcon = () => (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" /></svg>
);
const CalendarIcon = () => (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" /></svg>
);
const TicketIcon = () => (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16.5 6v.75m0 3v.75m0 3v.75m0 3V18m-9-5.25h5.25M7.5 15h3M3.375 5.25c-.621 0-1.125.504-1.125 1.125v3.026a2.999 2.999 0 010 5.198v3.026c0 .621.504 1.125 1.125 1.125h17.25c.621 0 1.125-.504 1.125-1.125v-3.026a2.999 2.999 0 010-5.198V6.375c0-.621-.504-1.125-1.125-1.125H3.375z" /></svg>
);
const CurrencyIcon = () => (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 8.25H9m6 3H9m3 6l-3-3h1.5a3 3 0 100-6M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
);
const SearchIcon = () => (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" /></svg>
);
const ShieldIcon = () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" /></svg>
);

/* ── Status badge component ────────────────────────────────── */
function StatusBadge({ status }) {
    const styles = {
        active: "bg-emerald-100 text-emerald-700 border-emerald-200",
        suspended: "bg-amber-100 text-amber-700 border-amber-200",
        banned: "bg-rose-100 text-rose-700 border-rose-200",
        published: "bg-emerald-100 text-emerald-700 border-emerald-200",
        draft: "bg-slate-100 text-slate-600 border-slate-200",
        cancelled: "bg-rose-100 text-rose-700 border-rose-200",
        confirmed: "bg-emerald-100 text-emerald-700 border-emerald-200",
        pending: "bg-amber-100 text-amber-700 border-amber-200",
    };
    return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border ${styles[status] || "bg-slate-100 text-slate-600 border-slate-200"}`}>
            {status}
        </span>
    );
}

/* ── Chart color palette ───────────────────────────────────── */
const COLORS = {
    brand: "#f59e42",
    brandDark: "#d97706",
    blue: "#3b82f6",
    emerald: "#10b981",
    violet: "#8b5cf6",
    rose: "#f43f5e",
};

/* ── Tab definitions ───────────────────────────────────────── */
const TABS = [
    { id: "overview", label: "Overview", icon: "📊" },
    { id: "users", label: "Users", icon: "👥" },
    { id: "events", label: "Events", icon: "📅" },
    { id: "bookings", label: "Bookings", icon: "🎫" },
    { id: "analytics", label: "Analytics", icon: "📈" },
];

/* ═══════════════════════════════════════════════════════════ */
/*  ADMIN DASHBOARD                                           */
/* ═══════════════════════════════════════════════════════════ */
export default function AdminDashboard() {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState("overview");
    const [stats, setStats] = useState(null);
    const [users, setUsers] = useState([]);
    const [events, setEvents] = useState([]);
    const [bookings, setBookings] = useState([]);
    const [recentUsers, setRecentUsers] = useState([]);
    const [recentEvents, setRecentEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [actionLoading, setActionLoading] = useState(null);
    const [analytics, setAnalytics] = useState(null);

    const loadData = useCallback(async () => {
        if (!user?.id) return;
        setLoading(true);
        try {
            const [statsData, usersData, eventsData, bookingsData, analyticsData] = await Promise.all([
                fetchAdminStats(user.id),
                fetchAdminUsers(user.id),
                fetchAdminEvents(user.id),
                fetchAdminBookings(user.id),
                fetchAdminAnalytics(user.id),
            ]);
            setStats(statsData.stats);
            setRecentUsers(statsData.recentUsers || []);
            setRecentEvents(statsData.recentEvents || []);
            setUsers(usersData);
            setEvents(eventsData);
            setBookings(bookingsData);
            setAnalytics(analyticsData);
        } catch (err) {
            console.error("Failed to load admin data:", err);
        } finally {
            setLoading(false);
        }
    }, [user?.id]);

    useEffect(() => { loadData(); }, [loadData]);

    /* ── User actions ─────────────────────────────────────────── */
    const handleUserStatusChange = async (targetUserId, newStatus) => {
        setActionLoading(targetUserId);
        try {
            await updateUserStatusApi(user.id, targetUserId, newStatus);
            setUsers((prev) =>
                prev.map((u) => (u.id === targetUserId ? { ...u, status: newStatus } : u))
            );
        } catch (err) {
            alert(err.message || "Failed to update user status");
        } finally {
            setActionLoading(null);
        }
    };

    /* ── Delete user ──────────────────────────────────────────── */
    const handleDeleteUser = async (targetUserId) => {
        if (!confirm("Are you sure you want to permanently delete this user? This will also delete all their events, bookings, and tickets. This action cannot be undone.")) return;
        setActionLoading(targetUserId);
        try {
            await deleteAdminUser(user.id, targetUserId);
            setUsers((prev) => prev.filter((u) => u.id !== targetUserId));
            if (stats) setStats((s) => ({ ...s, totalUsers: s.totalUsers - 1 }));
        } catch (err) {
            alert(err.message || "Failed to delete user");
        } finally {
            setActionLoading(null);
        }
    };

    /* ── Event actions ────────────────────────────────────────── */
    const handleDeleteEvent = async (eventId) => {
        if (!confirm("Are you sure you want to delete this event? This will also delete all its bookings and tickets.")) return;
        setActionLoading(`event-${eventId}`);
        try {
            await deleteAdminEvent(user.id, eventId);
            setEvents((prev) => prev.filter((e) => e.id !== eventId));
            if (stats) setStats((s) => ({ ...s, totalEvents: s.totalEvents - 1 }));
        } catch (err) {
            alert(err.message || "Failed to delete event");
        } finally {
            setActionLoading(null);
        }
    };

    /* ── Filtering ────────────────────────────────────────────── */
    const filteredUsers = users.filter(
        (u) =>
            (u.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
            u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
            u.role.toLowerCase().includes(searchQuery.toLowerCase())
    );
    const filteredEvents = events.filter(
        (e) =>
            e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (e.owner?.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
            (e.owner?.email || "").toLowerCase().includes(searchQuery.toLowerCase())
    );
    const filteredBookings = bookings.filter(
        (b) =>
            (b.ticketCode || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
            (b.attendeeName || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
            (b.event?.title || "").toLowerCase().includes(searchQuery.toLowerCase())
    );

    const formatDate = (d) =>
        d ? new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—";
    const formatCurrency = (v) => `₹${(v || 0).toLocaleString("en-IN")}`;

    if (loading) {
        return (
            <div className="container-page py-20 text-center">
                <div className="inline-flex items-center gap-3 text-slate-500">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" /></svg>
                    Loading admin dashboard…
                </div>
            </div>
        );
    }

    return (
        <div className="container-page py-6">
            {/* ── Header ──────────────────────────────────────────── */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-brand to-brand-dark flex items-center justify-center shadow-lg shadow-brand/30">
                        <ShieldIcon />
                    </div>
                    <div>
                        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Admin Dashboard</h1>
                        <p className="text-sm text-slate-500 font-medium">System management & oversight</p>
                    </div>
                </div>
                <button
                    onClick={loadData}
                    className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-bold rounded-xl bg-slate-800 text-white hover:bg-slate-700 shadow-sm transition-all hover:shadow-md"
                >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182" /></svg>
                    Refresh
                </button>
            </div>

            {/* ── Tab Navigation ──────────────────────────────────── */}
            <div className="flex items-center gap-1.5 p-1.5 bg-slate-200/80 rounded-2xl mb-6 overflow-x-auto">
                {TABS.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => { setActiveTab(tab.id); setSearchQuery(""); }}
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${activeTab === tab.id
                            ? "bg-white text-slate-900 shadow-sm"
                            : "text-slate-500 hover:text-slate-700 hover:bg-white/50"
                            }`}
                    >
                        <span>{tab.icon}</span>
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* ── Search Bar (except overview) ────────────────────── */}
            {activeTab !== "overview" && (
                <div className="relative mb-6">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                        <SearchIcon />
                    </div>
                    <input
                        type="text"
                        placeholder={`Search ${activeTab}…`}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full sm:w-96 pl-11 pr-4 py-3 bg-white border-2 border-slate-200 rounded-xl text-sm font-medium text-slate-800 placeholder:text-slate-400 focus:border-brand focus:ring-1 focus:ring-brand transition-all shadow-sm"
                    />
                </div>
            )}

            {/* ══════════════════════════════════════════════════════ */}
            {/*  OVERVIEW TAB                                         */}
            {/* ══════════════════════════════════════════════════════ */}
            {activeTab === "overview" && stats && (
                <div className="space-y-8">
                    {/* Stat Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                        {[
                            { label: "Total Users", value: stats.totalUsers, icon: <UsersIcon />, color: "from-blue-500 to-blue-600", shadow: "shadow-blue-200" },
                            { label: "Total Events", value: stats.totalEvents, icon: <CalendarIcon />, color: "from-emerald-500 to-emerald-600", shadow: "shadow-emerald-200" },
                            { label: "Total Bookings", value: stats.totalBookings, icon: <TicketIcon />, color: "from-violet-500 to-violet-600", shadow: "shadow-violet-200" },
                            { label: "Total Revenue", value: formatCurrency(stats.totalRevenue), icon: <CurrencyIcon />, color: "from-amber-500 to-amber-600", shadow: "shadow-amber-200" },
                        ].map((card) => (
                            <div
                                key={card.label}
                                className={`relative overflow-hidden bg-white rounded-2xl border border-slate-200 p-6 shadow-lg ${card.shadow} transition-all hover:shadow-xl hover:-translate-y-0.5`}
                            >
                                <div className={`inline-flex p-2.5 rounded-xl bg-gradient-to-br ${card.color} text-white mb-4 shadow-sm`}>
                                    {card.icon}
                                </div>
                                <p className="text-sm font-semibold text-slate-500 mb-1">{card.label}</p>
                                <p className="text-3xl font-extrabold text-slate-900 tracking-tight">{card.value}</p>
                                <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${card.color} opacity-5 rounded-bl-full`} />
                            </div>
                        ))}
                    </div>

                    {/* Recent Activity */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Recent Users */}
                        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                                <h3 className="font-bold text-slate-800">Recent Users</h3>
                                <button onClick={() => setActiveTab("users")} className="text-xs font-bold text-brand hover:text-brand-dark transition-colors">View all →</button>
                            </div>
                            <div className="divide-y divide-slate-50">
                                {recentUsers.map((u) => (
                                    <div key={u.id} className="px-6 py-3.5 flex items-center justify-between hover:bg-slate-50 transition-colors">
                                        <div>
                                            <p className="text-sm font-bold text-slate-800">{u.name || u.email}</p>
                                            <p className="text-xs text-slate-400">{u.email}</p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <StatusBadge status={u.status || "active"} />
                                            <span className="text-xs text-slate-400 font-medium">{u.role}</span>
                                        </div>
                                    </div>
                                ))}
                                {recentUsers.length === 0 && <p className="px-6 py-4 text-sm text-slate-400">No users yet</p>}
                            </div>
                        </div>

                        {/* Recent Events */}
                        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                                <h3 className="font-bold text-slate-800">Recent Events</h3>
                                <button onClick={() => setActiveTab("events")} className="text-xs font-bold text-brand hover:text-brand-dark transition-colors">View all →</button>
                            </div>
                            <div className="divide-y divide-slate-50">
                                {recentEvents.map((e) => (
                                    <div key={e.id} className="px-6 py-3.5 flex items-center justify-between hover:bg-slate-50 transition-colors">
                                        <div>
                                            <p className="text-sm font-bold text-slate-800">{e.title}</p>
                                            <p className="text-xs text-slate-400">{formatDate(e.createdAt)}</p>
                                        </div>
                                        <StatusBadge status={e.status} />
                                    </div>
                                ))}
                                {recentEvents.length === 0 && <p className="px-6 py-4 text-sm text-slate-400">No events yet</p>}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ══════════════════════════════════════════════════════ */}
            {/*  USERS TAB                                            */}
            {/* ══════════════════════════════════════════════════════ */}
            {activeTab === "users" && (
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-slate-100 bg-slate-50/80">
                                    <th className="text-left px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">User</th>
                                    <th className="text-left px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Role</th>
                                    <th className="text-left px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                                    <th className="text-left px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Events</th>
                                    <th className="text-left px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Bookings</th>
                                    <th className="text-left px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Joined</th>
                                    <th className="text-right px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {filteredUsers.map((u) => (
                                    <tr key={u.id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <p className="text-sm font-bold text-slate-800">{u.name || "—"}</p>
                                            <p className="text-xs text-slate-400">{u.email}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border ${u.role === "Admin" ? "bg-violet-100 text-violet-700 border-violet-200" :
                                                u.role === "EventManager" ? "bg-blue-100 text-blue-700 border-blue-200" :
                                                    "bg-slate-100 text-slate-600 border-slate-200"
                                                }`}>
                                                {u.role}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4"><StatusBadge status={u.status || "active"} /></td>
                                        <td className="px-6 py-4 text-sm font-semibold text-slate-600">{u._count?.events ?? 0}</td>
                                        <td className="px-6 py-4 text-sm font-semibold text-slate-600">{u._count?.bookings ?? 0}</td>
                                        <td className="px-6 py-4 text-sm text-slate-500">{formatDate(u.createdAt)}</td>
                                        <td className="px-6 py-4 text-right">
                                            {u.role !== "Admin" && (
                                                <div className="flex items-center justify-end gap-1.5">
                                                    {(u.status || "active") !== "active" && (
                                                        <button
                                                            onClick={() => handleUserStatusChange(u.id, "active")}
                                                            disabled={actionLoading === u.id}
                                                            className="px-3 py-1.5 text-xs font-bold rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 transition-all disabled:opacity-50"
                                                        >
                                                            Activate
                                                        </button>
                                                    )}
                                                    {(u.status || "active") !== "suspended" && (
                                                        <button
                                                            onClick={() => handleUserStatusChange(u.id, "suspended")}
                                                            disabled={actionLoading === u.id}
                                                            className="px-3 py-1.5 text-xs font-bold rounded-lg bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200 transition-all disabled:opacity-50"
                                                        >
                                                            Suspend
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={() => handleDeleteUser(u.id)}
                                                        disabled={actionLoading === u.id}
                                                        className="px-3 py-1.5 text-xs font-bold rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 transition-all disabled:opacity-50"
                                                    >
                                                        Delete
                                                    </button>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {filteredUsers.length === 0 && (
                        <div className="p-12 text-center text-sm text-slate-400 font-medium">
                            {searchQuery ? "No users match your search." : "No users found."}
                        </div>
                    )}
                </div>
            )}

            {/* ══════════════════════════════════════════════════════ */}
            {/*  EVENTS TAB                                           */}
            {/* ══════════════════════════════════════════════════════ */}
            {activeTab === "events" && (
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-slate-100 bg-slate-50/80">
                                    <th className="text-left px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Event</th>
                                    <th className="text-left px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Organizer</th>
                                    <th className="text-left px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                                    <th className="text-left px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Date</th>
                                    <th className="text-left px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Price</th>
                                    <th className="text-left px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Bookings</th>
                                    <th className="text-right px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {filteredEvents.map((e) => (
                                    <tr key={e.id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <p className="text-sm font-bold text-slate-800">{e.title}</p>
                                            <p className="text-xs text-slate-400">{e.category || "Uncategorized"}{e.location ? ` · ${e.location}` : ""}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-sm font-medium text-slate-700">{e.owner?.name || "—"}</p>
                                            <p className="text-xs text-slate-400">{e.owner?.email || "—"}</p>
                                        </td>
                                        <td className="px-6 py-4"><StatusBadge status={e.status} /></td>
                                        <td className="px-6 py-4 text-sm text-slate-500">{formatDate(e.date)}</td>
                                        <td className="px-6 py-4 text-sm font-semibold text-slate-600">{e.price === 0 ? "Free" : formatCurrency(e.price)}</td>
                                        <td className="px-6 py-4 text-sm font-semibold text-slate-600">{e._count?.bookings ?? 0}</td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={() => handleDeleteEvent(e.id)}
                                                disabled={actionLoading === `event-${e.id}`}
                                                className="px-3 py-1.5 text-xs font-bold rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 transition-all disabled:opacity-50"
                                            >
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {filteredEvents.length === 0 && (
                        <div className="p-12 text-center text-sm text-slate-400 font-medium">
                            {searchQuery ? "No events match your search." : "No events found."}
                        </div>
                    )}
                </div>
            )}

            {/* ══════════════════════════════════════════════════════ */}
            {/*  BOOKINGS TAB                                         */}
            {/* ══════════════════════════════════════════════════════ */}
            {activeTab === "bookings" && (
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-slate-100 bg-slate-50/80">
                                    <th className="text-left px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Ticket Code</th>
                                    <th className="text-left px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Attendee</th>
                                    <th className="text-left px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Event</th>
                                    <th className="text-left px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                                    <th className="text-left px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Qty</th>
                                    <th className="text-left px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Total</th>
                                    <th className="text-left px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Date</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {filteredBookings.map((b) => (
                                    <tr key={b.id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-slate-100 text-xs font-mono font-bold text-slate-700 border border-slate-200">
                                                {b.ticketCode}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-sm font-bold text-slate-800">{b.attendeeName || b.user?.name || "—"}</p>
                                            <p className="text-xs text-slate-400">{b.attendeeEmail || b.user?.email || "—"}</p>
                                        </td>
                                        <td className="px-6 py-4 text-sm font-medium text-slate-700">{b.event?.title || `Event #${b.eventId}`}</td>
                                        <td className="px-6 py-4"><StatusBadge status={b.status} /></td>
                                        <td className="px-6 py-4 text-sm font-semibold text-slate-600">{b.quantity}</td>
                                        <td className="px-6 py-4 text-sm font-bold text-slate-800">{formatCurrency(b.total)}</td>
                                        <td className="px-6 py-4 text-sm text-slate-500">{formatDate(b.createdAt)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {filteredBookings.length === 0 && (
                        <div className="p-12 text-center text-sm text-slate-400 font-medium">
                            {searchQuery ? "No bookings match your search." : "No bookings found."}
                        </div>
                    )}
                </div>
            )}

            {/* ══════════════════════════════════════════════════════ */}
            {/*  ANALYTICS TAB                                        */}
            {/* ══════════════════════════════════════════════════════ */}
            {activeTab === "analytics" && (
                <div className="space-y-6">
                    {!analytics ? (
                        <div className="p-12 text-center text-sm text-slate-400 font-medium">Loading analytics…</div>
                    ) : (
                        <>
                            {/* Row 1: Revenue + Bookings */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {/* Revenue Over Time */}
                                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                                    <h3 className="text-sm font-bold text-slate-800 mb-1">Revenue Over Time</h3>
                                    <p className="text-xs text-slate-400 mb-4">Monthly confirmed revenue (last 12 months)</p>
                                    {analytics.revenueByMonth.length === 0 ? (
                                        <p className="text-sm text-slate-400 py-8 text-center">No revenue data yet</p>
                                    ) : (
                                        <ResponsiveContainer width="100%" height={280}>
                                            <AreaChart data={analytics.revenueByMonth} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                                                <defs>
                                                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="5%" stopColor={COLORS.brand} stopOpacity={0.3} />
                                                        <stop offset="95%" stopColor={COLORS.brand} stopOpacity={0} />
                                                    </linearGradient>
                                                </defs>
                                                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                                                <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#94a3b8" }} />
                                                <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} tickFormatter={(v) => `₹${v >= 1000 ? (v / 1000).toFixed(0) + "k" : v}`} />
                                                <Tooltip
                                                    contentStyle={{ borderRadius: 12, border: "1px solid #e2e8f0", boxShadow: "0 4px 6px -1px rgb(0 0 0/0.1)", fontSize: 13 }}
                                                    formatter={(value) => [`₹${value.toLocaleString("en-IN")}`, "Revenue"]}
                                                />
                                                <Area type="monotone" dataKey="revenue" stroke={COLORS.brand} strokeWidth={2.5} fill="url(#colorRevenue)" />
                                            </AreaChart>
                                        </ResponsiveContainer>
                                    )}
                                </div>

                                {/* Bookings Trend */}
                                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                                    <h3 className="text-sm font-bold text-slate-800 mb-1">Bookings Trend</h3>
                                    <p className="text-xs text-slate-400 mb-4">Monthly bookings (last 12 months)</p>
                                    {analytics.bookingsByMonth.length === 0 ? (
                                        <p className="text-sm text-slate-400 py-8 text-center">No booking data yet</p>
                                    ) : (
                                        <ResponsiveContainer width="100%" height={280}>
                                            <BarChart data={analytics.bookingsByMonth} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                                                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                                                <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#94a3b8" }} />
                                                <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} allowDecimals={false} />
                                                <Tooltip
                                                    contentStyle={{ borderRadius: 12, border: "1px solid #e2e8f0", boxShadow: "0 4px 6px -1px rgb(0 0 0/0.1)", fontSize: 13 }}
                                                    formatter={(value) => [value, "Bookings"]}
                                                />
                                                <Bar dataKey="count" fill={COLORS.blue} radius={[6, 6, 0, 0]} />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    )}
                                </div>
                            </div>

                            {/* Row 2: Signups + Popular Events */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {/* User Signups */}
                                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                                    <h3 className="text-sm font-bold text-slate-800 mb-1">User Signups</h3>
                                    <p className="text-xs text-slate-400 mb-4">New users per month (last 12 months)</p>
                                    {analytics.signupsByMonth.length === 0 ? (
                                        <p className="text-sm text-slate-400 py-8 text-center">No signup data yet</p>
                                    ) : (
                                        <ResponsiveContainer width="100%" height={280}>
                                            <LineChart data={analytics.signupsByMonth} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                                                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                                                <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#94a3b8" }} />
                                                <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} allowDecimals={false} />
                                                <Tooltip
                                                    contentStyle={{ borderRadius: 12, border: "1px solid #e2e8f0", boxShadow: "0 4px 6px -1px rgb(0 0 0/0.1)", fontSize: 13 }}
                                                    formatter={(value) => [value, "Users"]}
                                                />
                                                <Line type="monotone" dataKey="count" stroke={COLORS.emerald} strokeWidth={2.5} dot={{ r: 4, fill: COLORS.emerald }} activeDot={{ r: 6 }} />
                                            </LineChart>
                                        </ResponsiveContainer>
                                    )}
                                </div>

                                {/* Most Popular Events */}
                                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                                    <h3 className="text-sm font-bold text-slate-800 mb-1">Most Popular Events</h3>
                                    <p className="text-xs text-slate-400 mb-4">Top 5 events by number of bookings</p>
                                    {analytics.popularEvents.length === 0 ? (
                                        <p className="text-sm text-slate-400 py-8 text-center">No events yet</p>
                                    ) : (
                                        <ResponsiveContainer width="100%" height={280}>
                                            <BarChart data={analytics.popularEvents} layout="vertical" margin={{ top: 5, right: 20, left: 5, bottom: 5 }}>
                                                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                                                <XAxis type="number" tick={{ fontSize: 11, fill: "#94a3b8" }} allowDecimals={false} />
                                                <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: "#475569" }} width={130} />
                                                <Tooltip
                                                    contentStyle={{ borderRadius: 12, border: "1px solid #e2e8f0", boxShadow: "0 4px 6px -1px rgb(0 0 0/0.1)", fontSize: 13 }}
                                                    formatter={(value) => [value, "Bookings"]}
                                                />
                                                <Bar dataKey="bookings" fill={COLORS.violet} radius={[0, 6, 6, 0]} />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    )}
                                </div>
                            </div>
                        </>
                    )}
                </div>
            )}
        </div>
    );
}
