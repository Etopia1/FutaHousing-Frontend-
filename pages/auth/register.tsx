import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Image from 'next/image';
import Head from 'next/head';
import { toast } from 'react-toastify';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { registerUser, clearError } from '../../store/slices/authSlice';
import { FiUser, FiMail, FiLock, FiPhone, FiEye, FiEyeOff, FiHash, FiArrowRight, FiShield, FiCheckCircle, FiCreditCard, FiMapPin } from 'react-icons/fi';

export default function Register() {
    const dispatch = useAppDispatch();
    const router = useRouter();
    const { loading, error } = useAppSelector((state) => state.auth);

    useEffect(() => {
        dispatch(clearError());
    }, [dispatch]);

    const [form, setForm] = useState({
        name: '', email: '', password: '', confirmPassword: '',
        phone: '', idNumber: '', address: '',
    });
    const [showPass, setShowPass] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (form.password !== form.confirmPassword) {
            return toast.error('Passwords do not match');
        }

        const formData = new FormData();
        Object.entries(form).forEach(([key, value]) => {
            if (value) formData.append(key, value);
        });
        formData.append('role', 'STUDENT');

        const result = await dispatch(registerUser(formData));
        if (registerUser.fulfilled.match(result)) {
            const data = result.payload;
            if (data.requiresOtp) {
                toast.info('Verification code sent to your email and phone 📱');
                router.push('/auth/verify-otp');
            } else {
                toast.success('Account created! Welcome 🎉');
                router.push('/dashboard');
            }
        } else {
            toast.error(result.payload as string);
        }
    };

    return (
        <>
            <Head>
                <title>Sign Up | FUTA Housing</title>
                <meta name="description" content="Create your FUTA Housing account for secure hostel booking around FUTA." />
                <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />
            </Head>

            <div className="min-h-screen flex" style={{ fontFamily: "'Inter', sans-serif" }}>

                {/* ── Left Panel: Branding ───────────────────────── */}
                <div className="hidden lg:flex lg:w-[50%] relative bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-700 overflow-hidden">
                    <div className="absolute inset-0">
                        <div className="absolute top-20 left-10 w-72 h-72 bg-white/10 rounded-full blur-3xl" />
                        <div className="absolute bottom-20 right-10 w-96 h-96 bg-pink-400/10 rounded-full blur-3xl" />
                        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.3) 1px, transparent 1px)', backgroundSize: '30px 30px' }} />
                    </div>

                    <div className="relative z-10 flex flex-col justify-between p-12 w-full">
                        {/* Logo */}
                        <Link href="/" className="flex items-center gap-3 group">
                            <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center shadow-xl border border-white/10 group-hover:rotate-6 transition-transform">
                                <Image src="/logo.png" alt="FUTA Housing" width={28} height={28} priority />
                            </div>
                            <span className="text-2xl font-black text-white group-hover:text-indigo-300 transition-colors uppercase italic tracking-tight">FUTA Housing</span>
                        </Link>

                        {/* Center content */}
                        <div className="max-w-lg">
                            <h1 className="text-4xl xl:text-5xl font-black text-white leading-tight mb-6">
                                Start your journey to
                                <span className="block bg-gradient-to-r from-cyan-300 to-emerald-300 bg-clip-text text-transparent mt-1">
                                    Safe Housing
                                </span>
                            </h1>
                            <p className="text-white/70 text-lg leading-relaxed mb-10">
                                Create your free account and get access to hundreds of verified hostel listings near FUTA campus. Verified by phone and email for security.
                            </p>

                            <div className="space-y-4">
                                {[
                                    { icon: FiShield, text: 'Your payments are protected by our escrow system' },
                                    { icon: FiCheckCircle, text: 'Only verified agents with real listings' },
                                    { icon: FiCreditCard, text: 'Free to register — no hidden charges' },
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

                        {/* Bottom */}
                        <div className="flex items-center gap-4">
                            <div className="flex -space-x-2">
                                {['B', 'K', 'F', 'A'].map((letter, i) => (
                                    <div key={i} className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-400 to-purple-400 border-2 border-indigo-600 flex items-center justify-center text-white text-xs font-bold">
                                        {letter}
                                    </div>
                                ))}
                            </div>
                            <div>
                                <p className="text-white text-sm font-semibold">Join 2,500+ tenants & residents</p>
                                <p className="text-white/50 text-xs">Sign up takes less than 2 minutes</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── Right Panel: Form ──────────────────────────── */}
                <div className="w-full lg:w-[50%] flex items-center justify-center bg-gray-50 px-6 py-10 overflow-y-auto">
                    <div className="w-full max-w-md">

                        {/* Mobile logo */}
                        <div className="lg:hidden flex justify-center mb-6">
                            <Link href="/" className="inline-flex items-center gap-3">
                                <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center shadow-sm border border-indigo-100">
                                    <Image src="/logo.png" alt="FUTA Housing" width={28} height={28} priority />
                                </div>
                                <span className="text-2xl font-black text-indigo-600 uppercase italic tracking-tight">FUTA Housing</span>
                            </Link>
                        </div>

                        {/* Header */}
                        <div className="mb-6">
                            <div className="flex items-center gap-3 mb-2">
                                <h2 className="text-3xl font-black text-gray-900">Create Account</h2>
                                <span className="bg-indigo-100 text-indigo-700 text-xs font-bold px-3 py-1 rounded-full uppercase">User</span>
                            </div>
                            <p className="text-gray-500">
                                Already have an account?{' '}
                                <Link href="/auth/login" className="text-indigo-600 font-semibold hover:text-indigo-700 transition">
                                    Sign in
                                </Link>
                            </p>
                        </div>

                        {/* Error */}
                        {error && (
                            <div className="mb-5 flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl">
                                <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center shrink-0">
                                    <span className="text-red-500 text-sm">✕</span>
                                </div>
                                <p className="text-red-600 text-sm font-medium">{error}</p>
                            </div>
                        )}

                        {/* Form */}
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {/* Name & Matric Number - side by side */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Full Name</label>
                                    <div className="relative group">
                                        <div className="absolute left-3 top-1/2 -translate-y-1/2 w-7 h-7 bg-gray-100 group-focus-within:bg-indigo-50 rounded-md flex items-center justify-center transition-colors">
                                            <FiUser className="text-gray-400 group-focus-within:text-indigo-500 text-xs transition-colors" />
                                        </div>
                                        <input name="name" type="text" required value={form.name} onChange={handleChange}
                                            placeholder="John Doe"
                                            className="w-full pl-12 pr-3 py-3 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 text-sm text-gray-900 placeholder-gray-400 transition-all" />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">National ID / NIN <span className="text-gray-400 font-normal">(optional)</span></label>
                                    <div className="relative group">
                                        <div className="absolute left-3 top-1/2 -translate-y-1/2 w-7 h-7 bg-gray-100 group-focus-within:bg-indigo-50 rounded-md flex items-center justify-center transition-colors">
                                            <FiCreditCard className="text-gray-400 group-focus-within:text-indigo-500 text-xs transition-colors" />
                                        </div>
                                        <input name="idNumber" type="text" value={form.idNumber} onChange={handleChange}
                                            placeholder="NIN or ID Number"
                                            className="w-full pl-12 pr-3 py-3 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 text-sm text-gray-900 placeholder-gray-400 transition-all" />
                                    </div>
                                </div>
                            </div>

                            {/* Email */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email Address</label>
                                <div className="relative group">
                                    <div className="absolute left-3 top-1/2 -translate-y-1/2 w-7 h-7 bg-gray-100 group-focus-within:bg-indigo-50 rounded-md flex items-center justify-center transition-colors">
                                        <FiMail className="text-gray-400 group-focus-within:text-indigo-500 text-xs transition-colors" />
                                    </div>
                                    <input name="email" type="email" required value={form.email} onChange={handleChange}
                                        placeholder="you@example.com"
                                        className="w-full pl-12 pr-3 py-3 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 text-sm text-gray-900 placeholder-gray-400 transition-all" />
                                </div>
                            </div>

                            {/* Phone & Address */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Phone Number</label>
                                    <div className="relative group">
                                        <div className="absolute left-3 top-1/2 -translate-y-1/2 w-7 h-7 bg-gray-100 group-focus-within:bg-indigo-50 rounded-md flex items-center justify-center transition-colors">
                                            <FiPhone className="text-gray-400 group-focus-within:text-indigo-500 text-xs transition-colors" />
                                        </div>
                                        <input name="phone" type="tel" required value={form.phone} onChange={handleChange}
                                            placeholder="080XXXXXXXX"
                                            className="w-full pl-12 pr-3 py-3 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 text-sm text-gray-900 placeholder-gray-400 transition-all" />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Physical Address</label>
                                    <div className="relative group">
                                        <div className="absolute left-3 top-1/2 -translate-y-1/2 w-7 h-7 bg-gray-100 group-focus-within:bg-indigo-50 rounded-md flex items-center justify-center transition-colors">
                                            <FiMapPin className="text-gray-400 group-focus-within:text-indigo-500 text-xs transition-colors" />
                                        </div>
                                        <input name="address" type="text" required value={form.address} onChange={handleChange}
                                            placeholder="Your current address"
                                            className="w-full pl-12 pr-3 py-3 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 text-sm text-gray-900 placeholder-gray-400 transition-all" />
                                    </div>
                                </div>
                            </div>

                            {/* Password & Confirm - side by side */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Password</label>
                                    <div className="relative group">
                                        <div className="absolute left-3 top-1/2 -translate-y-1/2 w-7 h-7 bg-gray-100 group-focus-within:bg-indigo-50 rounded-md flex items-center justify-center transition-colors">
                                            <FiLock className="text-gray-400 group-focus-within:text-indigo-500 text-xs transition-colors" />
                                        </div>
                                        <input name="password" type={showPass ? 'text' : 'password'} required value={form.password} onChange={handleChange}
                                            placeholder="Min. 8 chars"
                                            className="w-full pl-12 pr-10 py-3 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 text-sm text-gray-900 placeholder-gray-400 transition-all" />
                                        <button type="button" onClick={() => setShowPass(!showPass)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition">
                                            {showPass ? <FiEyeOff size={14} /> : <FiEye size={14} />}
                                        </button>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Confirm Password</label>
                                    <div className="relative group">
                                        <div className="absolute left-3 top-1/2 -translate-y-1/2 w-7 h-7 bg-gray-100 group-focus-within:bg-indigo-50 rounded-md flex items-center justify-center transition-colors">
                                            <FiLock className="text-gray-400 group-focus-within:text-indigo-500 text-xs transition-colors" />
                                        </div>
                                        <input name="confirmPassword" type="password" required value={form.confirmPassword} onChange={handleChange}
                                            placeholder="Re-enter"
                                            className="w-full pl-12 pr-3 py-3 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 text-sm text-gray-900 placeholder-gray-400 transition-all" />
                                    </div>
                                </div>
                            </div>

                            {/* Terms */}
                            <div className="flex items-start gap-2 pt-1">
                                <input type="checkbox" id="terms" required className="w-4 h-4 mt-0.5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" />
                                <label htmlFor="terms" className="text-sm text-gray-500 leading-snug">
                                    I agree to the{' '}
                                    <Link href="/terms" className="text-indigo-600 hover:underline font-medium">Terms of Service</Link>
                                    {' '}and{' '}
                                    <Link href="/privacy" className="text-indigo-600 hover:underline font-medium">Privacy Policy</Link>
                                </label>
                            </div>

                            {/* Submit */}
                            <button type="submit" disabled={loading}
                                className="w-full group flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-indigo-200/50 transform hover:-translate-y-0.5 active:translate-y-0 text-sm mt-2">
                                {loading ? (
                                    <div className="flex items-center gap-2">
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        Creating Account...
                                    </div>
                                ) : (
                                    <>
                                        Create Tenant Account
                                        <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
                                    </>
                                )}
                            </button>
                        </form>

                        {/* Alternative */}
                        <div className="my-6 flex items-center gap-4">
                            <div className="flex-1 h-px bg-gray-200" />
                            <span className="text-xs text-gray-400 font-medium uppercase tracking-wider">Or</span>
                            <div className="flex-1 h-px bg-gray-200" />
                        </div>

                        <Link href="/auth/agent-register"
                            className="w-full flex items-center justify-center gap-2 p-3.5 border-2 border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:border-violet-300 hover:text-violet-600 hover:bg-violet-50/50 transition-all">
                            🏘️ Register as Hostel Agent instead
                        </Link>
                    </div>
                </div>
            </div>
        </>
    );
}
