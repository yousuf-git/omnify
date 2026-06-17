import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Search as SearchIcon,
  MapPin,
  Phone,
  RefreshCw,
  ClipboardList,
  Store,
  CheckCircle2,
  Clock,
  AlertCircle,
  Home,
  Loader2,
  ArrowRight
} from "lucide-react";
import api from "../api/api";

interface TicketStatus {
  _id: string;
  name: string;
  description: string;
}

interface StoreData {
  _id: string;
  storeName: string;
  storeAddress: string;
  storeCity: string;
  smContactNo: string;
}

interface TicketInfo {
  ticketStatus: TicketStatus;
  store?: StoreData | null;
}

const CheckTicketStatus: React.FC = () => {
  const [ticketId, setTicketId] = useState("");
  const [ticketInfo, setTicketInfo] = useState<TicketInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searched, setSearched] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const isValidTicketId = (id: string): boolean => {
    return /^[A-Z0-9]{6}$/i.test(id);
  };

  const handleSearch = async () => {
    if (!ticketId.trim()) {
      setError("Please enter a ticket ID");
      setValidationError("Please enter a ticket ID");
      return;
    }

    if (!isValidTicketId(ticketId.trim())) {
      const errorMsg = "Invalid format. Expected 6-character alphanumeric.";
      setError(errorMsg);
      setValidationError(errorMsg);
      return;
    }

    setLoading(true);
    setError(null);
    setValidationError(null);
    setSearched(true);

    try {
      const response = await api.get(`/ticket/${ticketId.trim()}/public`);
      setTicketInfo(response.data);
    } catch (err: any) {
      if (err.response?.status === 400) {
        setError("Invalid format. Expected 6-character alphanumeric.");
      } else if (err.response?.status === 404) {
        setError("Ticket not found. Verify your ID and try again.");
      } else {
        setError("An error occurred while fetching ticket information. Please try again.");
      }
      setTicketInfo(null);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setTicketId("");
    setTicketInfo(null);
    setError(null);
    setValidationError(null);
    setSearched(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toUpperCase();
    setTicketId(value);
    if (validationError) setValidationError(null);
    if (error) setError(null);
  };

  const getStatusVisuals = (statusName: string) => {
    const status = statusName.toLowerCase();
    if (status.includes("completed") || status.includes("delivered") || status.includes("resolved")) {
      return { icon: <CheckCircle2 size={16} />, colorClass: "text-emerald-500", bgClass: "bg-emerald-50 border-emerald-500" };
    } else if (status.includes("pending") || status.includes("in progress") || status.includes("processing")) {
      return { icon: <Clock size={16} />, colorClass: "text-amber-500", bgClass: "bg-amber-50 border-amber-500" };
    } else if (status.includes("cancelled") || status.includes("failed") || status.includes("rejected")) {
      return { icon: <AlertCircle size={16} />, colorClass: "text-rose-500", bgClass: "bg-rose-50 border-rose-500" };
    }
    return { icon: <ClipboardList size={16} />, colorClass: "text-[var(--omni-brand)]", bgClass: "bg-[var(--omni-bg-muted)] border-[var(--omni-brand)]" };
  };

  return (
    <div className="min-h-screen bg-[var(--omni-bg-muted)] flex flex-col font-sans">
      {/* Header */}
      <header className="bg-[var(--omni-ink)] text-white p-6 border-b-4 border-[var(--omni-brand)]">
        <div className="mx-auto max-w-7xl flex items-center gap-4">
          <Link to="/" className="text-white hover:text-[var(--omni-brand)] transition-colors">
            <Home size={24} />
          </Link>
          <div className="h-6 w-px bg-white/20" />
          <h1 className="font-logo text-xl font-extrabold uppercase tracking-tight">Ticket Status Portal</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-start p-6 pt-12 md:p-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-3xl"
        >
          <div className="mb-12 text-center">
            <ClipboardList size={48} className="mx-auto text-[var(--omni-ink)] mb-6" />
            <h2 className="font-logo text-4xl md:text-5xl font-extrabold uppercase tracking-tight text-[var(--omni-ink)]">
              Query Ticket
            </h2>
            <p className="mt-4 font-mono text-[14px] text-[var(--omni-text-secondary)]">
              Enter your 6-character reference ID to retrieve current operational status.
            </p>
          </div>

          {/* Search Box */}
          <div className="bg-white border-2 border-[var(--omni-ink)] shadow-[8px_8px_0px_0px_var(--omni-brand)] p-6 md:p-8 mb-12">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--omni-text-muted)]" size={20} />
                <input
                  type="text"
                  placeholder="e.g. A1B2C3"
                  value={ticketId}
                  onChange={handleInputChange}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  maxLength={6}
                  className={`w-full h-14 pl-12 pr-4 bg-[var(--omni-bg-subtle)] border-2 border-b-4 outline-none font-mono text-lg uppercase transition-colors focus:bg-white ${
                    validationError ? "border-rose-500 focus:border-rose-600" : "border-[var(--omni-border)] focus:border-[var(--omni-brand)]"
                  }`}
                />
              </div>
              <button
                onClick={handleSearch}
                disabled={loading || (ticketId !== "" && !isValidTicketId(ticketId))}
                className="h-14 px-8 bg-[var(--omni-ink)] text-white font-mono text-[14px] font-bold uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-[#1a2f4c] disabled:opacity-50 transition-colors shadow-[0_4px_0_0_var(--omni-brand)] hover:translate-y-px hover:shadow-[0_3px_0_0_var(--omni-brand)]"
              >
                {loading ? <Loader2 size={18} className="animate-spin" /> : "Search"}
              </button>
              {searched && (
                <button
                  onClick={handleReset}
                  className="h-14 w-14 bg-white border-2 border-[var(--omni-ink)] text-[var(--omni-ink)] flex items-center justify-center hover:bg-[var(--omni-bg-subtle)] transition-colors shadow-[0_4px_0_0_var(--omni-ink)] hover:translate-y-px hover:shadow-[0_3px_0_0_var(--omni-ink)]"
                  title="Reset"
                >
                  <RefreshCw size={20} />
                </button>
              )}
            </div>
            {validationError && (
              <p className="mt-3 font-mono text-[12px] font-bold text-rose-500">{validationError}</p>
            )}
          </div>

          {/* Error State */}
          {error && (
            <div className="bg-rose-50 border-2 border-rose-500 p-6 mb-8 flex items-start gap-4">
              <AlertCircle className="text-rose-600 shrink-0 mt-0.5" size={24} />
              <p className="font-mono text-[14px] font-bold text-rose-800">{error}</p>
            </div>
          )}

          {/* Empty State */}
          {searched && !ticketInfo && !loading && !error && (
            <div className="bg-white border-2 border-[var(--omni-ink)] p-12 text-center border-dashed">
              <ClipboardList size={48} className="mx-auto text-[var(--omni-text-muted)] mb-4" />
              <h3 className="font-mono text-[16px] font-bold text-[var(--omni-ink)] uppercase">No record found</h3>
              <p className="mt-2 text-[14px] text-[var(--omni-text-secondary)] mb-6">
                The ID provided does not match any active records.
              </p>
              <button
                onClick={handleReset}
                className="inline-flex items-center gap-2 text-[13px] font-mono font-bold uppercase tracking-widest text-[var(--omni-brand)] hover:underline"
              >
                <SearchIcon size={16} /> Try another ID
              </button>
            </div>
          )}

          {/* Result View */}
          {ticketInfo && (
            <div className="bg-white border-2 border-[var(--omni-ink)] shadow-[8px_8px_0px_0px_rgba(10,37,64,0.1)]">
              <div className="bg-[var(--omni-ink)] p-6 flex items-center gap-3 text-white border-b-4 border-[var(--omni-brand)]">
                <ClipboardList size={24} />
                <h3 className="font-logo text-2xl font-extrabold uppercase tracking-tight">Record Data</h3>
              </div>

              <div className="p-6 md:p-10 space-y-10">
                {/* Details Section */}
                <div>
                  <h4 className="font-mono text-[12px] font-bold uppercase tracking-widest text-[var(--omni-text-secondary)] mb-6 border-b-2 border-[var(--omni-border)] pb-2 flex items-center gap-2">
                    <ClipboardList size={16} /> Ticket Details
                  </h4>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                    <div>
                      <span className="block font-mono text-[10px] font-bold uppercase tracking-widest text-[var(--omni-text-muted)] mb-2">Reference ID</span>
                      <span className="font-mono text-2xl font-bold text-[var(--omni-ink)]">{ticketId}</span>
                    </div>

                    <div>
                      <span className="block font-mono text-[10px] font-bold uppercase tracking-widest text-[var(--omni-text-muted)] mb-2">Current Status</span>
                      <div className="mt-1">
                        {(() => {
                          const visual = getStatusVisuals(ticketInfo.ticketStatus.name);
                          return (
                            <div className={`inline-flex items-center gap-2 px-3 py-1.5 border-2 ${visual.bgClass}`}>
                              <span className={visual.colorClass}>{visual.icon}</span>
                              <span className={`font-mono text-[12px] font-bold uppercase tracking-wider ${visual.colorClass}`}>
                                {ticketInfo.ticketStatus.name}
                              </span>
                            </div>
                          );
                        })()}
                        {ticketInfo.ticketStatus.description && (
                          <p className="mt-3 text-[13px] text-[var(--omni-text-secondary)] font-medium">
                            {ticketInfo.ticketStatus.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Store Section */}
                <div>
                  <h4 className="font-mono text-[12px] font-bold uppercase tracking-widest text-[var(--omni-text-secondary)] mb-6 border-b-2 border-[var(--omni-border)] pb-2 flex items-center gap-2">
                    <Store size={16} /> Location Information
                  </h4>
                  
                  {ticketInfo.store ? (
                    <div className="space-y-6">
                      <div>
                        <span className="block font-mono text-[10px] font-bold uppercase tracking-widest text-[var(--omni-text-muted)] mb-1">Store Name</span>
                        <span className="font-mono text-[15px] font-bold text-[var(--omni-ink)]">{ticketInfo.store.storeName}</span>
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div>
                          <span className="flex items-center gap-1.5 font-mono text-[10px] font-bold uppercase tracking-widest text-[var(--omni-text-muted)] mb-1">
                            <MapPin size={12} /> Address
                          </span>
                          <span className="text-[14px] text-[var(--omni-ink)] font-medium block">
                            {ticketInfo.store.storeAddress}
                          </span>
                          {ticketInfo.store.storeCity && (
                            <span className="text-[14px] text-[var(--omni-text-secondary)] block mt-0.5">
                              {ticketInfo.store.storeCity}
                            </span>
                          )}
                        </div>

                        {ticketInfo.store.smContactNo && (
                          <div>
                            <span className="flex items-center gap-1.5 font-mono text-[10px] font-bold uppercase tracking-widest text-[var(--omni-text-muted)] mb-1">
                              <Phone size={12} /> Contact
                            </span>
                            <span className="font-mono text-[14px] font-bold text-[var(--omni-ink)]">
                              {ticketInfo.store.smContactNo}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="bg-[var(--omni-bg-subtle)] border border-[var(--omni-border)] p-6 text-center">
                      <p className="font-mono text-[12px] uppercase text-[var(--omni-text-secondary)]">No location data linked to this record.</p>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="pt-6 border-t border-[var(--omni-border)] flex flex-wrap justify-center gap-4">
                  <button
                    onClick={handleSearch}
                    className="flex items-center gap-2 px-6 py-3 border-2 border-[var(--omni-ink)] text-[var(--omni-ink)] font-mono text-[12px] font-bold uppercase tracking-widest hover:bg-[var(--omni-bg-subtle)] transition-colors"
                  >
                    <RefreshCw size={16} /> Refresh Status
                  </button>
                  <button
                    onClick={handleReset}
                    className="flex items-center gap-2 px-6 py-3 border-2 border-[var(--omni-ink)] bg-[var(--omni-ink)] text-white font-mono text-[12px] font-bold uppercase tracking-widest hover:bg-[#1a2f4c] transition-colors"
                  >
                    <SearchIcon size={16} /> New Query
                  </button>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="bg-[var(--omni-ink)] text-white py-12 mt-20 border-t border-white/10">
        <div className="mx-auto max-w-7xl px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div>
            <h2 className="font-logo text-xl font-extrabold uppercase tracking-tight mb-2">Omnify Systems</h2>
            <p className="font-mono text-[12px] text-white/50">Tracking portal for distributed operations.</p>
          </div>
          <div className="font-mono text-[10px] font-bold uppercase tracking-widest text-white/40">
            © {new Date().getFullYear()} Omnify. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default CheckTicketStatus;
