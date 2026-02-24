import React from 'react';
import { FiHome, FiCheckCircle, FiActivity, FiTarget, FiShield } from 'react-icons/fi';

interface Transaction {
    id: string;
    _id?: string;
    amount: number;
    type: string;
    description: string;
    status: string;
    purpose: string;
    createdAt: string;
}

interface ReceiptProps {
    transaction: Transaction;
    user: any;
}

const Receipt: React.FC<ReceiptProps> = ({ transaction, user }) => {
    const isDebit = transaction.type === 'DEBIT';
    const registryRef = (transaction.id || transaction._id || 'TX-REF').slice(-12).toUpperCase();

    return (
        <div id="receipt-content" className="w-full max-w-[440px] bg-white text-slate-900 font-sans border border-slate-200 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] rounded-[2.5rem] overflow-hidden relative mx-auto">
            {/* 🛡️ SECURITY WATERMARK */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none select-none overflow-hidden flex flex-wrap gap-4 p-4 rotate-12">
                {Array.from({ length: 40 }).map((_, i) => (
                    <span key={i} className="text-[10px] font-black uppercase tracking-widest whitespace-nowrap">FUTA HOUSING OFFICIAL REGISTRY • </span>
                ))}
            </div>

            {/* Header / Ribbon */}
            <div className={`h-2 w-full ${isDebit ? 'bg-rose-500' : 'bg-emerald-500'}`} />

            <div className="p-6 sm:p-10 relative z-10">
                {/* Brand Header */}
                <div className="flex items-center justify-between mb-10">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-slate-950 rounded-2xl flex items-center justify-center text-white shadow-xl">
                            <FiHome size={20} className="sm:w-6 sm:h-6" />
                        </div>
                        <div>
                            <h2 className="text-base sm:text-lg font-black tracking-tighter uppercase text-slate-950 leading-none">FUTA Housing</h2>
                            <p className="text-[7px] sm:text-[8px] font-black text-slate-400 uppercase tracking-[0.2em] mt-1.5 font-mono">Registry Node: FH-NG-001</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="text-[7px] sm:text-[8px] font-black text-slate-400 uppercase tracking-widest">Digital Voucher</p>
                        <p className="text-[9px] sm:text-[10px] font-black text-slate-950 mt-0.5">#{registryRef}</p>
                    </div>
                </div>

                {/* Main Transaction Magnifier */}
                <div className="flex flex-col items-center mb-10 py-6 sm:py-8 bg-slate-50/50 rounded-[2rem] border border-slate-100/50">
                    <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center mb-4 ${isDebit ? 'bg-rose-500/10 text-rose-600' : 'bg-emerald-500/10 text-emerald-600'}`}>
                        {isDebit ? <FiTarget size={20} className="sm:w-6 sm:h-6" /> : <FiCheckCircle size={20} className="sm:w-6 sm:h-6" />}
                    </div>
                    <p className="text-[8px] sm:text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] mb-2">{isDebit ? 'Debit Expenditure' : 'Registry Credit'}</p>
                    <h3 className={`text-3xl sm:text-5xl font-black tracking-tight ${isDebit ? 'text-rose-600' : 'text-emerald-600'}`}>
                        {isDebit ? '-' : '+'}₦{transaction.amount.toLocaleString()}
                    </h3>
                    <p className="text-[9px] sm:text-[10px] font-bold text-slate-400 mt-3 font-mono">Transaction Integrity: SEALED</p>
                </div>

                {/* Data Grid */}
                <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4 sm:gap-8 border-b border-slate-100 pb-6">
                        <div className="space-y-1.5">
                            <p className="text-[7px] sm:text-[8px] font-black text-slate-400 uppercase tracking-widest">Timestamp</p>
                            <p className="text-[10px] sm:text-[11px] font-black text-slate-900">{new Date(transaction.createdAt).toLocaleString('en-NG', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                        </div>
                        <div className="space-y-1.5 text-right">
                            <p className="text-[7px] sm:text-[8px] font-black text-slate-400 uppercase tracking-widest">Protocol Sync</p>
                            <p className="text-[10px] sm:text-[11px] font-black text-emerald-600 uppercase tracking-tight">Verified Live</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                        <div className="flex justify-between items-start">
                            <span className="text-[7px] sm:text-[8px] font-black text-slate-400 uppercase tracking-widest">Identity Record</span>
                            <div className="text-right">
                                <p className="text-[10px] sm:text-[11px] font-black text-slate-900 uppercase leading-none mb-1">{user?.name}</p>
                                <p className="text-[8px] font-bold text-slate-400 lowercase">{user?.email}</p>
                                <p className="text-[8px] font-bold text-slate-400">{user?.phone || '+234 Registry-00'}</p>
                            </div>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-[7px] sm:text-[8px] font-black text-slate-400 uppercase tracking-widest">Payment Purpose</span>
                            <span className="text-[10px] sm:text-[11px] font-black text-slate-900 uppercase">{transaction.purpose}</span>
                        </div>
                        <div className="flex justify-between items-start gap-8">
                            <span className="text-[7px] sm:text-[8px] font-black text-slate-400 uppercase tracking-widest shrink-0">Ledger Entry</span>
                            <span className="text-[10px] sm:text-[11px] font-bold text-slate-600 text-right leading-tight line-clamp-2">{transaction.description}</span>
                        </div>
                    </div>
                </div>

                {/* 🔳 VERIFICATION QR PLACEHOLDER */}
                <div className="mt-10 p-5 sm:p-6 bg-slate-950 rounded-[2rem] flex items-center justify-between text-white">
                    <div className="flex-1">
                        <p className="text-[7px] sm:text-[8px] font-black text-indigo-400 uppercase tracking-widest mb-1.5">Verification Scan</p>
                        <p className="text-[9px] sm:text-[10px] font-bold text-white/60 leading-relaxed pr-4">Scan to verify this transaction on the FUTA Housing Registry nodes.</p>
                    </div>
                    <div className="w-14 h-14 sm:w-16 sm:h-16 bg-white rounded-xl p-1 shrink-0 relative flex items-center justify-center">
                        <div className="w-full h-full border-[3px] border-slate-950 flex flex-wrap p-0.5">
                            {Array.from({ length: 16 }).map((_, i) => (
                                <div key={i} className={`w-1/4 h-1/4 ${Math.random() > 0.5 ? 'bg-black' : 'bg-transparent'}`} />
                            ))}
                        </div>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-4 h-4 bg-white flex items-center justify-center">
                                <FiActivity size={8} className="text-slate-950" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Platform Signoff */}
                <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-between">
                    <div>
                        <p className="text-[6px] sm:text-[7px] font-black text-slate-300 uppercase tracking-[0.4em] mb-1">Official Digital Seal</p>
                        <div className="flex items-center gap-2">
                            <FiShield className="text-emerald-500" size={12} />
                            <p className="text-[8px] sm:text-[9px] font-black text-slate-900 uppercase tracking-widest italic">PLATFORM SECURED</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="text-[6px] font-black text-slate-300 uppercase tracking-widest">End of Record</p>
                        <p className="text-[8px] sm:text-[9px] font-black text-slate-950 uppercase tracking-widest">© FUTA HOUSING</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Receipt;
