import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Image from 'next/image';
import { FiCreditCard, FiCheck, FiArrowRight, FiShield, FiAlertCircle, FiActivity } from 'react-icons/fi';
import { toast } from 'react-toastify';
import api from '../../lib/apiClient';
import { useAppSelector } from '../../store/hooks';

export default function BankDetailsSetup() {
    const router = useRouter();
    const { user } = useAppSelector((state) => state.auth);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        accountNumber: '',
        bankName: '',
        accountName: ''
    });

    useEffect(() => {
        if (user && user.role !== 'AGENT') {
            router.push('/dashboard');
        }
    }, [user, router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.post('/verification/bank-details', formData);
            toast.success('Registry Payout Route Verified! ✅');
            router.push('/dashboard');
        } catch (error: any) {
            toast.error(error.response?.data?.error || 'Validation failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col font-['Inter']">
            <Head>
                <title>Payout Configuration | FUTA Housing</title>
            </Head>

            <header className="p-8 flex justify-between items-center max-w-7xl mx-auto w-full">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-xl">
                        <Image src="/logo.png" alt="Logo" width={24} height={24} />
                    </div>
                    <span className="text-xl font-black text-slate-900 uppercase italic tracking-tighter">FUTA Housing</span>
                </div>
                <div className="hidden sm:flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest bg-white px-4 py-2 rounded-full border border-slate-200">
                    <FiShield className="text-emerald-500" /> Secure Protocol FH-NG-001
                </div>
            </header>

            <main className="flex-1 flex items-center justify-center p-6">
                <div className="w-full max-w-xl">
                    <div className="bg-white rounded-[2.5rem] shadow-2xl border border-slate-200 overflow-hidden">
                        <div className="bg-slate-950 p-10 text-white relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-[80px] -mr-32 -mt-32" />
                            <div className="relative z-10">
                                <span className="inline-block px-3 py-1 bg-white/10 border border-white/10 rounded-lg text-[9px] font-black uppercase tracking-widest mb-4">Payout Route Config</span>
                                <h1 className="text-3xl font-black tracking-tight mb-2">Setup Your Wallet Settlements</h1>
                                <p className="text-slate-400 text-sm font-medium">Link a verified Nigerian bank account to receive automated rent payouts.</p>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit} className="p-10 space-y-8">
                            <div className="grid grid-cols-1 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Bank Institution</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="e.g. Zenith Bank, GTBank"
                                        className="w-full px-5 py-4 bg-slate-50 border-0 rounded-2xl focus:ring-2 focus:ring-indigo-500 font-bold text-slate-900 transition-all"
                                        value={formData.bankName}
                                        onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Account Number</label>
                                    <input
                                        type="text"
                                        required
                                        maxLength={10}
                                        placeholder="10-digit NUBAN"
                                        className="w-full px-5 py-4 bg-slate-50 border-0 rounded-2xl focus:ring-2 focus:ring-indigo-500 font-bold text-slate-900 transition-all font-mono"
                                        value={formData.accountNumber}
                                        onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Account Holder Name</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="Must match your legal name"
                                        className="w-full px-5 py-4 bg-slate-50 border-0 rounded-2xl focus:ring-2 focus:ring-indigo-500 font-bold text-slate-900 transition-all"
                                        value={formData.accountName}
                                        onChange={(e) => setFormData({ ...formData, accountName: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="p-6 bg-amber-50 rounded-2xl border border-amber-100 flex gap-4">
                                <FiAlertCircle className="text-amber-600 shrink-0 mt-1" />
                                <p className="text-[11px] text-amber-800 font-bold leading-relaxed italic">
                                    "Anti-fraud protocol: Your bank account name must exactly match your registry profile name to ensure secure settlements."
                                </p>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full h-16 bg-slate-950 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-indigo-600 transition-all shadow-xl shadow-slate-200 disabled:opacity-50 flex items-center justify-center gap-3 active:scale-[0.98]"
                            >
                                {loading ? (
                                    <><FiActivity className="animate-spin" /> Verifying Route...</>
                                ) : (
                                    <>Verify & Continue <FiArrowRight /></>
                                )}
                            </button>
                        </form>
                    </div>

                    <div className="mt-8 flex items-center justify-center gap-8 text-slate-400 grayscale opacity-50">
                        <div className="flex items-center gap-2">
                            <FiCheck className="text-emerald-500" />
                            <span className="text-[9px] font-black uppercase tracking-widest">PCI-DSS Compliant</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <FiCheck className="text-emerald-500" />
                            <span className="text-[9px] font-black uppercase tracking-widest">256-bit Encrypted</span>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
