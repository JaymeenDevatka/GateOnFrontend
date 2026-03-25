/**
 * AdminPaymentsTab.jsx
 *
 * Drop this component into AdminDashboard.jsx.
 *
 * HOW TO INTEGRATE INTO AdminDashboard.jsx:
 * ─────────────────────────────────────────
 * 1. Import at top:
 *      import AdminPaymentsTab from "./AdminPaymentsTab.jsx";
 *
 * 2. Add to TABS array:
 *      { id: "payments", label: "Payments", icon: "💰" },
 *
 * 3. Add state in AdminDashboard:
 *      const [payments, setPayments] = useState([]);
 *      const [paymentSummary, setPaymentSummary] = useState([]);
 *
 * 4. Fetch in loadData():
 *      import { fetchAdminPayments, fetchAdminPaymentSummary } from "../services/api.js";
 *      const [paymentsData, summaryData] = await Promise.all([
 *        fetchAdminPayments(user.id),
 *        fetchAdminPaymentSummary(user.id),
 *      ]);
 *      setPayments(paymentsData);
 *      setPaymentSummary(summaryData);
 *
 * 5. Render inside the tab switcher:
 *      {activeTab === "payments" && (
 *        <AdminPaymentsTab
 *          payments={payments}
 *          summary={paymentSummary}
 *          adminUserId={user.id}
 *          onRefresh={loadData}
 *        />
 *      )}
 */

import { useState } from "react";
import { distributePaymentApi, refundPaymentApi } from "../services/api.js";

// ── Status badge colours ─────────────────────────────────────────────────────
const STATUS_STYLE = {
  pending:     "bg-yellow-50 text-yellow-700 border-yellow-200",
  paid:        "bg-emerald-50 text-emerald-700 border-emerald-200",
  failed:      "bg-red-50 text-red-600 border-red-200",
  refunded:    "bg-slate-100 text-slate-600 border-slate-200",
  distributed: "bg-blue-50 text-blue-700 border-blue-200",
};

function StatusBadge({ status }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border ${STATUS_STYLE[status] || "bg-slate-100 text-slate-500 border-slate-200"}`}>
      {status}
    </span>
  );
}

// ── Distribute modal ─────────────────────────────────────────────────────────
function DistributeModal({ payment, adminUserId, onClose, onSuccess }) {
  const [amount, setAmount] = useState(String(payment.amountRupees || ""));
  const [note,   setNote]   = useState("");
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");

  const handleSubmit = async () => {
    if (!amount || Number(amount) <= 0) { setError("Enter a valid amount"); return; }
    setLoading(true);
    try {
      await distributePaymentApi(adminUserId, payment.id, { amount: Number(amount), note });
      onSuccess();
    } catch (err) {
      setError(err?.message || "Failed to mark as distributed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-5">
        <h3 className="text-lg font-bold text-slate-900">Mark Payment as Distributed</h3>

        <div className="bg-slate-50 rounded-xl p-4 text-sm space-y-1">
          <p className="text-slate-500">Event: <span className="font-semibold text-slate-800">{payment.event?.title}</span></p>
          <p className="text-slate-500">Organizer: <span className="font-semibold text-slate-800">{payment.organizer?.name || "—"}</span></p>
          <p className="text-slate-500">Collected: <span className="font-semibold text-emerald-700">₹{payment.amountRupees?.toLocaleString()}</span></p>
        </div>

        <p className="text-xs text-slate-500">
          Record the amount you transferred to the organizer outside GateOn (bank transfer, UPI, etc.)
        </p>

        <div className="space-y-3">
          <div>
            <label className="text-sm font-semibold text-slate-700">Amount distributed (₹)</label>
            <input
              type="number" min="1"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="mt-1 w-full px-4 py-2.5 bg-white border border-slate-300 rounded-lg text-sm focus:border-brand focus:ring-1 focus:ring-brand outline-none"
              placeholder="e.g. 450"
            />
          </div>
          <div>
            <label className="text-sm font-semibold text-slate-700">Reference / Note (optional)</label>
            <input
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="mt-1 w-full px-4 py-2.5 bg-white border border-slate-300 rounded-lg text-sm focus:border-brand focus:ring-1 focus:ring-brand outline-none"
              placeholder="e.g. UPI to 9876543210 / NEFT ref #12345"
            />
          </div>
        </div>

        {error && <p className="text-xs text-red-600 bg-red-50 p-2 rounded-lg">{error}</p>}

        <div className="flex gap-3 pt-1">
          <button onClick={onClose} className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50">
            Cancel
          </button>
          <button onClick={handleSubmit} disabled={loading}
            className="flex-1 px-4 py-2.5 rounded-xl bg-brand text-white text-sm font-semibold hover:bg-brand-dark disabled:opacity-60">
            {loading ? "Saving…" : "Confirm Distribution"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main Tab Component ────────────────────────────────────────────────────────
export default function AdminPaymentsTab({ payments, summary, adminUserId, onRefresh }) {
  const [activeView,    setActiveView]    = useState("transactions"); // "transactions" | "summary"
  const [statusFilter,  setStatusFilter]  = useState("all");
  const [distributeFor, setDistributeFor] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);

  const filtered = statusFilter === "all"
    ? payments
    : payments.filter((p) => p.status === statusFilter);

  const handleRefund = async (payment) => {
    if (!confirm(`Refund ₹${payment.amountRupees?.toLocaleString()} to the attendee? This cannot be undone.`)) return;
    setActionLoading(payment.id);
    try {
      await refundPaymentApi(adminUserId, payment.id);
      onRefresh();
    } catch (err) {
      alert(err?.message || "Refund failed. Please check your Razorpay dashboard.");
    } finally {
      setActionLoading(null);
    }
  };

  // ── Revenue totals ────────────────────────────────────────────────────────
  const totalCollected    = payments.filter((p) => ["paid","distributed"].includes(p.status))
                                    .reduce((s, p) => s + (p.amountRupees || 0), 0);
  const totalDistributed  = payments.filter((p) => p.status === "distributed")
                                    .reduce((s, p) => s + (p.distributedAmountRupees || 0), 0);
  const totalPending      = totalCollected - totalDistributed;

  return (
    <div className="space-y-6">

      {/* ── KPI cards ──────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: "Total Collected",       value: `₹${totalCollected.toLocaleString()}`,    color: "text-emerald-600", bg: "bg-emerald-50" },
          { label: "Distributed to Organizers", value: `₹${totalDistributed.toLocaleString()}`, color: "text-blue-600",    bg: "bg-blue-50" },
          { label: "Pending Distribution",  value: `₹${totalPending.toLocaleString()}`,      color: "text-orange-600",  bg: "bg-orange-50" },
        ].map(({ label, value, color, bg }) => (
          <div key={label} className={`${bg} rounded-2xl p-5 border border-white`}>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{label}</p>
            <p className={`text-2xl font-bold mt-1 ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* ── View toggle ────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-1 bg-slate-100 rounded-xl p-1 w-fit">
        {[
          { id: "transactions", label: "All Transactions" },
          { id: "summary",      label: "Organizer Summary" },
        ].map(({ id, label }) => (
          <button key={id} onClick={() => setActiveView(id)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${activeView === id ? "bg-white shadow text-slate-900" : "text-slate-500 hover:text-slate-700"}`}>
            {label}
          </button>
        ))}
      </div>

      {/* ── Transactions view ──────────────────────────────────────────────── */}
      {activeView === "transactions" && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          {/* Toolbar */}
          <div className="flex items-center gap-3 p-4 border-b border-slate-100 flex-wrap">
            <p className="text-sm font-semibold text-slate-700 mr-auto">Payments ({filtered.length})</p>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-1.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-brand">
              <option value="all">All statuses</option>
              <option value="pending">Pending</option>
              <option value="paid">Paid</option>
              <option value="distributed">Distributed</option>
              <option value="refunded">Refunded</option>
              <option value="failed">Failed</option>
            </select>
          </div>

          {filtered.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-12">No payments found</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-100">
                    <th className="px-5 py-3">Event</th>
                    <th className="px-5 py-3">Organizer</th>
                    <th className="px-5 py-3">Attendee</th>
                    <th className="px-5 py-3 text-right">Amount</th>
                    <th className="px-5 py-3">Status</th>
                    <th className="px-5 py-3">Date</th>
                    <th className="px-5 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filtered.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-5 py-3 font-medium text-slate-800 max-w-[160px] truncate">
                        {p.event?.title || "—"}
                      </td>
                      <td className="px-5 py-3 text-slate-600">
                        <div>{p.organizer?.name || <span className="text-slate-400 italic">Platform</span>}</div>
                        {p.organizer?.email && <div className="text-xs text-slate-400">{p.organizer.email}</div>}
                      </td>
                      <td className="px-5 py-3 text-slate-600">
                        <div>{p.booking?.attendeeName || "—"}</div>
                        {p.booking?.attendeeEmail && <div className="text-xs text-slate-400">{p.booking.attendeeEmail}</div>}
                      </td>
                      <td className="px-5 py-3 text-right font-semibold text-slate-900">
                        ₹{(p.amountRupees || 0).toLocaleString()}
                        {p.status === "distributed" && p.distributedAmountRupees != null && (
                          <div className="text-xs text-blue-600 font-normal">
                            dist: ₹{p.distributedAmountRupees.toLocaleString()}
                          </div>
                        )}
                      </td>
                      <td className="px-5 py-3"><StatusBadge status={p.status} /></td>
                      <td className="px-5 py-3 text-slate-500 text-xs whitespace-nowrap">
                        {new Date(p.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2">
                          {p.status === "paid" && (
                            <>
                              <button
                                onClick={() => setDistributeFor(p)}
                                className="px-3 py-1 bg-brand text-white rounded-lg text-xs font-semibold hover:bg-brand-dark transition-colors"
                              >
                                Distribute
                              </button>
                              <button
                                onClick={() => handleRefund(p)}
                                disabled={actionLoading === p.id}
                                className="px-3 py-1 bg-red-50 text-red-600 border border-red-200 rounded-lg text-xs font-semibold hover:bg-red-100 transition-colors disabled:opacity-50"
                              >
                                {actionLoading === p.id ? "…" : "Refund"}
                              </button>
                            </>
                          )}
                          {p.status === "distributed" && p.distributionNote && (
                            <span className="text-xs text-slate-400 italic truncate max-w-[120px]" title={p.distributionNote}>
                              {p.distributionNote}
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ── Organizer summary view ─────────────────────────────────────────── */}
      {activeView === "summary" && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <div className="p-4 border-b border-slate-100">
            <p className="text-sm font-semibold text-slate-700">Revenue by Organizer</p>
            <p className="text-xs text-slate-400 mt-0.5">Shows confirmed + distributed payments only</p>
          </div>
          {summary.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-12">No data yet</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-100">
                    <th className="px-5 py-3">Organizer</th>
                    <th className="px-5 py-3 text-right">Payments</th>
                    <th className="px-5 py-3 text-right">Collected</th>
                    <th className="px-5 py-3 text-right">Distributed</th>
                    <th className="px-5 py-3 text-right">Pending</th>
                    <th className="px-5 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {summary.map((row) => (
                    <tr key={row.organizerId || "platform"} className="hover:bg-slate-50 transition-colors">
                      <td className="px-5 py-3">
                        <div className="font-medium text-slate-800">{row.organizerName}</div>
                        <div className="text-xs text-slate-400">{row.organizerEmail}</div>
                      </td>
                      <td className="px-5 py-3 text-right text-slate-600">{row.paymentCount}</td>
                      <td className="px-5 py-3 text-right font-semibold text-slate-900">
                        ₹{row.totalCollected.toLocaleString()}
                      </td>
                      <td className="px-5 py-3 text-right text-blue-600 font-medium">
                        ₹{row.totalDistributed.toLocaleString()}
                      </td>
                      <td className="px-5 py-3 text-right font-semibold">
                        <span className={row.pendingDistribution > 0 ? "text-orange-600" : "text-slate-400"}>
                          ₹{row.pendingDistribution.toLocaleString()}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        {row.pendingDistribution > 0 ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-orange-50 text-orange-700 border border-orange-200">
                            Needs distribution
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            All distributed
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ── Distribute modal ────────────────────────────────────────────────── */}
      {distributeFor && (
        <DistributeModal
          payment={distributeFor}
          adminUserId={adminUserId}
          onClose={() => setDistributeFor(null)}
          onSuccess={() => { setDistributeFor(null); onRefresh(); }}
        />
      )}
    </div>
  );
}
