import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Image from 'next/image';
import Head from 'next/head';
import { toast } from 'react-toastify';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { resetPassword, clearError } from '../../store/slices/authSlice';
import { FiLock, FiEye, FiEyeOff, FiCheckCircle, FiArrowRight, FiShield } from 'react-icons/fi';

export default function ResetPassword() {
    const dispatch = useAppDispatch();
    const router = useRouter();
    const { loading, error } = useAppSelector((state) => state.auth);
    
    const { token } = router.query;
    
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPass, setShowPass] = useState(false);

    useEffect(() => {
        if (router.isReady && !token) {
            toast.error('Invalid link or missing reset token.');
            router.replace('/auth/login');
        }
    }, [router.isReady, token, router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }

        const result = await dispatch(resetPassword({ 
            token: token as string, 
            password, 
            confirmPassword 
        }));

        if (resetPassword.fulfilled.match(result)) {
            toast.success('Password reset successfully! 🎉');
            router.push('/auth/login');
        } else {
            toast.error(result.payload as string || 'Failed to reset password');
        }
    };

    return (
        <>
            <Head>
                <title>Reset Password | FUTA Housing</title>
                <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />
            </Head>

            <div className="min-h-screen flex bg-white" style={{ fontFamily: "'Inter', sans-serif" }}>
                
                {/* ── Left Panel: Feature ───────────────────────── */}
                <div className="hidden lg:flex lg:w-[45%] relative bg-gradient-to-br from-indigo-900 to-slate-900 overflow-hidden">
                    <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
                    
                    <div className="relative z-10 flex flex-col justify-between p-12 w-full text-white">
                        <Link href="/" className="flex items-center gap-3">
                            <Image src="/logo.png" alt="Logo" width={32} height={32} />
                            <span className="text-2xl font-black uppercase italic tracking-tight">FUTA Housing</span>
                        </Link>

                        <div className="max-w-md">
                            <div className="w-20 h-20 bg-white/10 rounded-[2rem] flex items-center justify-center mb-8 border border-white/10 backdrop-blur-xl">
                                <FiCheckCircle className="text-4xl text-emerald-400" />
                            </div>
                            <h1 className="text-5xl font-black mb-6 leading-tight">Almost there!</h1>
                            <p className="text-white/60 text-lg leading-relaxed">
                                Create a strong new password to protect your account. Make sure it&apos;s something unique that you don&apos;t use elsewhere.
                            </p>
                        </div>

                        <div className="p-8 bg-white/5 rounded-3xl border border-white/5 backdrop-blur-md">
                            <div className="flex gap-4 items-center">
                                <FiShield className="text-indigo-400 text-2xl" />
                                <p className="text-sm font-medium">Your data is secured with AES-256 encryption.</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── Right Panel: Reset Form ────────────────────── */}
                <div className="w-full lg:w-[55%] flex items-center justify-center px-6 py-12">
                    <div className="w-full max-w-sm">
                        
                        <div className="mb-10">
                            <h2 className="text-4xl font-black text-gray-900 tracking-tight">Set New Password</h2>
                            <p className="text-gray-500 mt-3 font-medium">Please enter and confirm your new password below.</p>
                        </div>

                        {error && (
                            <div className="mb-8 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-600 text-sm font-bold">
                                <div className="w-6 h-6 bg-white rounded-lg flex items-center justify-center shadow-sm text-red-500 font-black">!</div>
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* New Password */}
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">New Password</label>
                                <div className="relative group">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center border border-gray-100 group-focus-within:border-indigo-200 group-focus-within:bg-indigo-50 transition-all">
                                        <FiLock className="text-gray-400 group-focus-within:text-indigo-600 text-sm" />
                                    </div>
                                    <input
                                        type={showPass ? 'text' : 'password'}
                                        required
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="Min. 8 characters"
                                        className="w-full pl-14 pr-12 py-4 bg-white border-2 border-slate-100 rounded-2xl focus:outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-50 text-sm text-gray-900 font-medium transition-all"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPass(!showPass)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                    >
                                        {showPass ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                                    </button>
                                </div>
                            </div>

                            {/* Confirm Password */}
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Confirm New Password</label>
                                <div className="relative group">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center border border-gray-100 group-focus-within:border-indigo-200 group-focus-within:bg-indigo-50 transition-all">
                                        <FiCheckCircle className="text-gray-400 group-focus-within:text-indigo-600 text-sm" />
                                    </div>
                                    <input
                                        type={showPass ? 'text' : 'password'}
                                        required
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        placeholder="Repeat new password"
                                        className="w-full pl-14 pr-12 py-4 bg-white border-2 border-slate-100 rounded-2xl focus:outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-50 text-sm text-gray-900 font-medium transition-all"
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading || !password || password !== confirmPassword}
                                className="w-full h-16 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-30 text-white font-black rounded-2xl transition-all shadow-xl shadow-indigo-100 flex items-center justify-center gap-3 group"
                            >
                                {loading ? (
                                    <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <>
                                        Update Password
                                        <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
                                    </>
                                )}
                            </button>
                        </form>

                        <p className="text-center text-xs text-gray-400 mt-12 font-medium">
                            Suddenly remembered? <Link href="/auth/login" className="text-indigo-600 hover:underline font-bold">Go back to login</Link>
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
}
