import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Image from 'next/image';
import Head from 'next/head';
import { toast } from 'react-toastify';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { loginUser, clearError } from '../../store/slices/authSlice';
import { FiMail, FiLock, FiEye, FiEyeOff, FiArrowRight, FiShield, FiCheckCircle, FiCreditCard } from 'react-icons/fi';

export default function Login() {
    const dispatch = useAppDispatch();
    const router = useRouter();
    const { loading, error } = useAppSelector((state) => state.auth);
    const [email, setEmail] = useState('');

    useEffect(() => {
        dispatch(clearError());
    }, [dispatch]);
    const [password, setPassword] = useState('');
    const [showPass, setShowPass] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const result = await dispatch(loginUser({ email, password }));
        if (loginUser.fulfilled.match(result)) {
            const data = result.payload;
            if (data.requiresOtp) {
                toast.info('Verification code sent to your email 📧');
                router.push('/auth/verify-otp');
            } else {
                toast.success('Welcome back! 🎉');
                router.push(data.user?.role === 'ADMIN' ? '/admin' : '/dashboard');
            }
        } else {
            const payload = result.payload as any;
            if (payload?.requiresBankDetails) {
                toast.info('Please complete your bank details setup');
                router.push('/auth/bank-details');
            } else if (payload?.requiresOtp) {
                toast.info('Verification required');
                router.push('/auth/verify-otp');
            } else {
                toast.error(payload?.error || 'Login failed');
            }
        }
    };

    return (
        <>
            <Head>
                <title>Sign In | FUTA Housing</title>
                <meta name="description" content="Sign in to your FUTA Housing account to manage bookings and wallet." />
                <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />
            </Head>

            <div className="min-h-screen flex" style={{ fontFamily: "'Inter', sans-serif" }}>

                {/* ── Left Panel: Branding ───────────────────────── */}
                <div className="hidden lg:flex lg:w-[55%] relative bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-700 overflow-hidden">
                    {/* Background decoration */}
                    <div className="absolute inset-0">
                        <div className="absolute top-20 left-10 w-72 h-72 bg-white/10 rounded-full blur-3xl" />
                        <div className="absolute bottom-20 right-10 w-96 h-96 bg-pink-400/10 rounded-full blur-3xl" />
                        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.3) 1px, transparent 1px)', backgroundSize: '30px 30px' }} />
                    </div>

                    <div className="relative z-10 flex flex-col justify-between p-12 w-full">
                        {/* Top: Logo */}
                        <Link href="/" className="flex items-center gap-3 group">
                            <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center shadow-xl border border-white/10 group-hover:rotate-6 transition-transform">
                                <Image src="/logo.png" alt="FUTA Housing" width={28} height={28} priority />
                            </div>
                            <span className="text-2xl font-black text-white group-hover:text-indigo-300 transition-colors uppercase italic tracking-tight">FUTA Housing</span>
                        </Link>

                        {/* Center: Hero content */}
                        <div className="max-w-lg">
                            <h1 className="text-4xl xl:text-5xl font-black text-white leading-tight mb-6">
                                Welcome back to your
                                <span className="block bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent mt-1">
                                    Housing Dashboard
                                </span>
                            </h1>
                            <p className="text-white/70 text-lg leading-relaxed mb-10">
                                Sign in to browse hostels, manage bookings, fund your wallet, and access your personalized dashboard.
                            </p>

                            {/* Feature highlights */}
                            <div className="space-y-4">
                                {[
                                    { icon: FiShield, text: 'Escrow-protected payments for every booking' },
                                    { icon: FiCheckCircle, text: 'All agents verified with government-issued ID' },
                                    { icon: FiCreditCard, text: 'Instant wallet funding with secure transactions' },
                                ].map((item, i) => (
                                    <div key={i} className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-xl px-5 py-3 border border-white/10">
                                        <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center shrink-0">
                                            <item.icon className="text-white text-sm" />
                                        </div>
                                        <p className="text-white/90 text-sm font-medium">{item.text}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Bottom: Social proof */}
                        <div className="flex items-center gap-4">
                            <div className="flex -space-x-2">
                                {['B', 'K', 'F', 'A'].map((letter, i) => (
                                    <div key={i} className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-400 to-purple-400 border-2 border-indigo-600 flex items-center justify-center text-white text-xs font-bold">
                                        {letter}
                                    </div>
                                ))}
                            </div>
                            <div>
                                <p className="text-white text-sm font-semibold">2,500+ tenants trust us</p>
                                <p className="text-white/50 text-xs">Secure housing at FUTA</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── Right Panel: Login Form ────────────────────── */}
                <div className="w-full lg:w-[45%] flex items-center justify-center bg-gray-50 px-6 py-12">
                    <div className="w-full max-w-md">

                        {/* Mobile logo (hidden on desktop) */}
                        <div className="lg:hidden flex justify-center mb-8">
                            <Link href="/" className="inline-flex items-center gap-3">
                                <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center shadow-sm border border-indigo-100">
                                    <Image src="/logo.png" alt="FUTA Housing" width={28} height={28} priority />
                                </div>
                                <span className="text-2xl font-black text-indigo-600 uppercase italic tracking-tight">FUTA Housing</span>
                            </Link>
                        </div>

                        {/* Form Header */}
                        <div className="mb-8">
                            <h2 className="text-3xl font-black text-gray-900">Sign in</h2>
                            <p className="text-gray-500 mt-2">
                                Don&apos;t have an account?{' '}
                                <Link href="/auth/register" className="text-indigo-600 font-semibold hover:text-indigo-700 transition">
                                    Create one free
                                </Link>
                            </p>
                        </div>

                        {/* Error Alert */}
                        {error && (
                            <div className="mb-6 flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl">
                                <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center shrink-0">
                                    <span className="text-red-500 text-sm">✕</span>
                                </div>
                                <p className="text-red-600 text-sm font-medium">{error}</p>
                            </div>
                        )}

                        {/* Form */}
                        <form onSubmit={handleSubmit} className="space-y-5">

                            {/* Email */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Email address</label>
                                <div className="relative group">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 w-8 h-8 bg-gray-100 group-focus-within:bg-indigo-50 rounded-lg flex items-center justify-center transition-colors">
                                        <FiMail className="text-gray-400 group-focus-within:text-indigo-500 text-sm transition-colors" />
                                    </div>
                                    <input
                                        type="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="you@example.com"
                                        className="w-full pl-14 pr-4 py-3.5 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 text-sm text-gray-900 placeholder-gray-400 transition-all"
                                    />
                                </div>
                            </div>

                            {/* Password */}
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <label className="block text-sm font-semibold text-gray-700">Password</label>
                                    <Link href="/auth/forgot-password" className="text-xs text-indigo-600 hover:text-indigo-700 font-semibold transition">
                                        Forgot password?
                                    </Link>

                                </div>
                                <div className="relative group">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 w-8 h-8 bg-gray-100 group-focus-within:bg-indigo-50 rounded-lg flex items-center justify-center transition-colors">
                                        <FiLock className="text-gray-400 group-focus-within:text-indigo-500 text-sm transition-colors" />
                                    </div>
                                    <input
                                        type={showPass ? 'text' : 'password'}
                                        required
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="••••••••"
                                        className="w-full pl-14 pr-12 py-3.5 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 text-sm text-gray-900 placeholder-gray-400 transition-all"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPass(!showPass)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
                                    >
                                        {showPass ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                                    </button>
                                </div>
                            </div>

                            {/* Remember me */}
                            <div className="flex items-center gap-2">
                                <input type="checkbox" id="remember" className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" />
                                <label htmlFor="remember" className="text-sm text-gray-600">Keep me signed in</label>
                            </div>

                            {/* Submit */}
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full group flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-indigo-200/50 transform hover:-translate-y-0.5 active:translate-y-0 text-sm"
                            >
                                {loading ? (
                                    <div className="flex items-center gap-2">
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        Signing in...
                                    </div>
                                ) : (
                                    <>
                                        Sign In
                                        <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
                                    </>
                                )}
                            </button>
                        </form>

                        {/* Divider */}
                        <div className="my-8 flex items-center gap-4">
                            <div className="flex-1 h-px bg-gray-200" />
                            <span className="text-xs text-gray-400 font-medium uppercase tracking-wider">Or continue as</span>
                            <div className="flex-1 h-px bg-gray-200" />
                        </div>

                        {/* Role options */}
                        <div className="grid grid-cols-2 gap-3">
                            <Link href="/auth/register"
                                className="flex items-center justify-center gap-2 p-3.5 border-2 border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:border-indigo-300 hover:text-indigo-600 hover:bg-indigo-50/50 transition-all">
                                🏠 Tenant Sign Up
                            </Link>
                            <Link href="/auth/agent-register"
                                className="flex items-center justify-center gap-2 p-3.5 border-2 border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:border-violet-300 hover:text-violet-600 hover:bg-violet-50/50 transition-all">
                                🏘️ Agent Sign Up
                            </Link>
                        </div>

                        {/* Bottom text */}
                        <p className="text-xs text-gray-400 text-center mt-8 leading-relaxed">
                            By signing in, you agree to our{' '}
                            <Link href="/terms" className="text-indigo-600 hover:underline">Terms of Service</Link>
                            {' '}and{' '}
                            <Link href="/privacy" className="text-indigo-600 hover:underline">Privacy Policy</Link>
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
}
