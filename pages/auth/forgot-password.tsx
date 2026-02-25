import { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Image from 'next/image';
import Head from 'next/head';
import { toast } from 'react-toastify';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { forgotPassword, clearError } from '../../store/slices/authSlice';
import { FiMail, FiArrowLeft, FiArrowRight, FiShield, FiLock } from 'react-icons/fi';

export default function ForgotPassword() {
    const dispatch = useAppDispatch();
    const router = useRouter();
    const { loading, error } = useAppSelector((state) => state.auth);
    const [email, setEmail] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const result = await dispatch(forgotPassword(email));
        if (forgotPassword.fulfilled.match(result)) {
            toast.success('Reset code sent! check your email 📧');
            router.push('/auth/verify-otp');
        } else {
            toast.error(result.payload as string || 'Failed to send reset code');
        }
    };

    return (
        <>
            <Head>
                <title>Forgot Password | FUTA Housing</title>
                <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />
            </Head>

            <div className="min-h-screen flex bg-gray-50" style={{ fontFamily: "'Inter', sans-serif" }}>
                
                {/* ── Left Panel: Design ───────────────────────── */}
                <div className="hidden lg:flex lg:w-[45%] relative bg-slate-900 overflow-hidden">
                    <div className="absolute inset-0">
                        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl -mr-32 -mt-32" />
                        <div className="absolute bottom-0 left-0 w-96 h-96 bg-violet-500/20 rounded-full blur-3xl -ml-32 -mb-32" />
                    </div>
                    
                    <div className="relative z-10 flex flex-col justify-between p-12 w-full text-white">
                        <Link href="/" className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center border border-white/10">
                                <Image src="/logo.png" alt="Logo" width={28} height={28} />
                            </div>
                            <span className="text-2xl font-black uppercase italic tracking-tight">FUTA Housing</span>
                        </Link>

                        <div>
                            <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mb-8 border border-white/10">
                                <FiLock className="text-3xl text-indigo-400" />
                            </div>
                            <h1 className="text-4xl font-black mb-6 leading-tight">Secure Account Recovery</h1>
                            <p className="text-white/60 text-lg leading-relaxed">
                                Don&apos;t worry! It happens. Provide your email and we&apos;ll help you regain access to your dashboard in minutes.
                            </p>
                        </div>

                        <div className="flex items-center gap-4 py-8 border-t border-white/10">
                            <div className="w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center font-bold">SH</div>
                            <p className="text-sm font-medium text-white/80 italic">"Secure housing starts with a secure account."</p>
                        </div>
                    </div>
                </div>

                {/* ── Right Panel: Form ────────────────────────── */}
                <div className="w-full lg:w-[55%] flex items-center justify-center px-6 py-12">
                    <div className="w-full max-w-md">
                        
                        <div className="mb-10 text-center lg:text-left">
                            <Link href="/auth/login" className="inline-flex items-center gap-2 text-sm font-bold text-indigo-600 hover:text-indigo-700 transition mb-8">
                                <FiArrowLeft /> Back to login
                            </Link>
                            <h2 className="text-3xl font-black text-gray-900">Forgot password?</h2>
                            <p className="text-gray-500 mt-2">Enter your email and we&apos;ll send you a recovery code.</p>
                        </div>

                        {error && (
                            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 text-red-600 text-sm font-medium">
                                <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center shrink-0">✕</div>
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Email address</label>
                                <div className="relative group">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 w-8 h-8 bg-gray-100 group-focus-within:bg-indigo-50 rounded-lg flex items-center justify-center transition-colors">
                                        <FiMail className="text-gray-400 group-focus-within:text-indigo-500 text-sm" />
                                    </div>
                                    <input
                                        type="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="you@example.com"
                                        className="w-full pl-14 pr-4 py-4 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 text-sm text-gray-900 placeholder-gray-400 transition-all"
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full group flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-indigo-200/50 transform hover:-translate-y-0.5 active:translate-y-0"
                            >
                                {loading ? (
                                    <div className="flex items-center gap-2">
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        Sending code...
                                    </div>
                                ) : (
                                    <>
                                        Send Reset Code
                                        <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
                                    </>
                                )}
                            </button>
                        </form>

                        <div className="mt-12 p-6 bg-indigo-50 rounded-2xl border border-indigo-100">
                            <div className="flex gap-4">
                                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shrink-0 shadow-sm border border-indigo-100">
                                    <FiShield className="text-indigo-600" />
                                </div>
                                <div>
                                    <h4 className="text-sm font-bold text-gray-900 mb-1">Secure Process</h4>
                                    <p className="text-xs text-gray-500 leading-relaxed">
                                        We use 256-bit encryption to protect your account. The code sent to your email is valid for 10 minutes.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
