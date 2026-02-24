import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Image from 'next/image';
import Head from 'next/head';
import { toast } from 'react-toastify';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { registerUser } from '../../store/slices/authSlice';
import { FiUser, FiMail, FiLock, FiPhone, FiEye, FiEyeOff, FiCreditCard, FiArrowRight, FiTrendingUp, FiStar, FiCheckCircle, FiMapPin, FiHome, FiShield, FiCheck } from 'react-icons/fi';

export default function AgentRegister() {
    const dispatch = useAppDispatch();
    const router = useRouter();
    const { loading, error } = useAppSelector((state) => state.auth);

    const [form, setForm] = useState({
        name: '', email: '', password: '', confirmPassword: '',
        phone: '', nin: '', address: '', businessName: '',
        bankName: '', accountNumber: '', bankCode: ''
    });
    const [banks, setBanks] = useState<any[]>([]);
    const [loadingBanks, setLoadingBanks] = useState(false);
    const [profilePicture, setProfilePicture] = useState<File | null>(null);
    const [ninImage, setNinImage] = useState<File | null>(null);
    const [previews, setPreviews] = useState({ profile: '', nin: '' });
    const [showPass, setShowPass] = useState(false);

    useEffect(() => {
        const fetchBanks = async () => {
            setLoadingBanks(true);
            try {
                const res = await fetch('https://api.paystack.co/bank', {
                    headers: { 'Authorization': `Bearer ${process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || 'pk_test_11a98df086b1cbacde8fd146f17de2e451874753'}` }
                });
                const data = await res.json();
                if (data.status) setBanks(data.data);
            } catch (err) {
                console.error('Failed to fetch banks');
            } finally {
                setLoadingBanks(false);
            }
        };
        fetchBanks();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        if (name === 'bankName') {
            const bank = banks.find(b => b.name === value);
            setForm({ ...form, bankName: value, bankCode: bank?.code || '' });
        } else {
            setForm({ ...form, [name]: value });
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'profile' | 'nin') => {
        const file = e.target.files?.[0];
        if (file) {
            if (type === 'profile') {
                setProfilePicture(file);
                setPreviews(prev => ({ ...prev, profile: URL.createObjectURL(file) }));
            } else {
                setNinImage(file);
                setPreviews(prev => ({ ...prev, nin: URL.createObjectURL(file) }));
            }
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (form.password !== form.confirmPassword) {
            return toast.error('Passwords do not match');
        }

        const formData = new FormData();
        Object.entries(form).forEach(([key, value]) => formData.append(key, value));
        formData.append('role', 'AGENT');
        if (profilePicture) formData.append('profilePicture', profilePicture);
        if (ninImage) formData.append('ninImage', ninImage);

        const result = await dispatch(registerUser(formData));
        if (registerUser.fulfilled.match(result)) {
            const data = result.payload;

            if (data.requiresOtp) {
                toast.info('Success! Verification code sent to your email and phone 📱');
                router.push('/auth/verify-otp');
            } else {
                toast.success('Agent account created! Success 🏠');
                router.push('/dashboard');
            }
        } else {
            toast.error(result.payload as string);
        }
    };

    return (
        <>
            <Head>
                <title>Agent Registration | FUTA Housing</title>
                <meta name="description" content="Register as a hostel agent on FUTA Housing. Reach thousands of tenants with verified listings." />
                <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />
            </Head>

            <div className="min-h-screen flex" style={{ fontFamily: "'Inter', sans-serif" }}>

                {/* ── Left Panel: Branding ───────────────────────── */}
                <div className="hidden lg:flex lg:w-[50%] relative bg-gradient-to-br from-violet-700 via-purple-600 to-fuchsia-600 overflow-hidden">
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

                        {/* Center */}
                        <div className="max-w-lg">
                            <h1 className="text-4xl xl:text-5xl font-black text-white leading-tight mb-6">
                                Grow your hostel
                                <span className="block bg-gradient-to-r from-amber-300 to-yellow-300 bg-clip-text text-transparent mt-1">
                                    Business with us
                                </span>
                            </h1>
                            <p className="text-white/70 text-lg leading-relaxed mb-10">
                                List your properties, reach thousands of tenants, and receive secure, automated payments through our escrow system.
                            </p>

                            {/* Agent benefits */}
                            <div className="space-y-4">
                                {[
                                    { icon: FiTrendingUp, text: 'Reach 2,500+ tenants actively searching for hostels' },
                                    { icon: FiCheckCircle, text: 'Verified badge builds instant trust with tenants' },
                                    { icon: FiStar, text: 'Only 5% commission — keep 95% of every booking' },
                                ].map((item, i) => (
                                    <div key={i} className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-xl px-5 py-3 border border-white/10">
                                        <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center shrink-0">
                                            <item.icon className="text-white text-sm" />
                                        </div>
                                        <p className="text-white/90 text-sm font-medium">{item.text}</p>
                                    </div>
                                ))}
                            </div>

                            {/* Agent earnings preview */}
                            <div className="mt-8 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/15 p-6">
                                <p className="text-white/50 text-xs font-semibold uppercase tracking-wider mb-3">Average agent earnings</p>
                                <div className="grid grid-cols-3 gap-4">
                                    {[
                                        { val: '₦350K', label: 'Monthly' },
                                        { val: '47', label: 'Bookings' },
                                        { val: '4.9★', label: 'Rating' },
                                    ].map((stat) => (
                                        <div key={stat.label} className="text-center">
                                            <p className="text-2xl font-black text-white">{stat.val}</p>
                                            <p className="text-white/50 text-xs mt-0.5">{stat.label}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Bottom */}
                        <p className="text-white/40 text-sm">
                            After registration, upload your NIN for verification to start listing properties.
                        </p>
                    </div>
                </div>

                {/* ── Right Panel: Form ──────────────────────────── */}
                <div className="w-full lg:w-[50%] flex items-center justify-center bg-gray-50 px-6 py-10 overflow-y-auto">
                    <div className="w-full max-w-md">

                        {/* Mobile logo */}
                        <div className="lg:hidden flex justify-center mb-6">
                            <Link href="/" className="inline-flex items-center gap-3">
                                <div className="w-10 h-10 bg-violet-50 rounded-xl flex items-center justify-center shadow-sm border border-violet-100">
                                    <Image src="/logo.png" alt="FUTA Housing" width={28} height={28} priority />
                                </div>
                                <span className="text-2xl font-black text-violet-600 uppercase italic tracking-tight">FUTA Housing</span>
                            </Link>
                        </div>

                        {/* Header */}
                        <div className="mb-6">
                            <div className="flex items-center gap-3 mb-2">
                                <h2 className="text-3xl font-black text-gray-900">Agent Sign Up</h2>
                                <span className="bg-violet-100 text-violet-700 text-xs font-bold px-3 py-1 rounded-full uppercase">Agent</span>
                            </div>
                            <p className="text-gray-500">
                                Already have an account?{' '}
                                <Link href="/auth/login" className="text-violet-600 font-semibold hover:text-violet-700 transition">
                                    Sign in
                                </Link>
                            </p>
                        </div>

                        {/* Strict Warning Alert */}
                        <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-2xl flex gap-4 items-start animate-pulse">
                            <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center shrink-0">
                                <FiShield className="text-amber-600" />
                            </div>
                            <div>
                                <p className="text-[10px] font-black uppercase text-amber-600 tracking-widest mb-1">Strict Identity Policy</p>
                                <p className="text-xs font-bold text-amber-800 leading-relaxed">
                                    Your registered name MUST match your Bank and NIN records perfectly. Any mismatch will result in automatic registration failure.
                                </p>
                            </div>
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
                            {/* Name & Business Name & NIN */}
                            <div className="grid grid-cols-1 gap-4">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Full Name</label>
                                        <div className="relative group">
                                            <div className="absolute left-3 top-1/2 -translate-y-1/2 w-7 h-7 bg-gray-100 group-focus-within:bg-violet-50 rounded-md flex items-center justify-center transition-colors">
                                                <FiUser className="text-gray-400 group-focus-within:text-violet-500 text-xs transition-colors" />
                                            </div>
                                            <input name="name" type="text" required value={form.name} onChange={handleChange}
                                                placeholder="John Doe"
                                                className="w-full pl-12 pr-3 py-3 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-50 text-sm text-gray-900 placeholder-gray-400 transition-all" />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Business Name <span className="text-gray-400 font-normal">(optional)</span></label>
                                        <div className="relative group">
                                            <div className="absolute left-3 top-1/2 -translate-y-1/2 w-7 h-7 bg-gray-100 group-focus-within:bg-violet-50 rounded-md flex items-center justify-center transition-colors">
                                                <FiHome className="text-gray-400 group-focus-within:text-violet-500 text-xs transition-colors" />
                                            </div>
                                            <input name="businessName" type="text" value={form.businessName} onChange={handleChange}
                                                placeholder="e.g. Royal Shelters"
                                                className="w-full pl-12 pr-3 py-3 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-50 text-sm text-gray-900 placeholder-gray-400 transition-all" />
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">National ID / NIN</label>
                                    <div className="relative group">
                                        <div className="absolute left-3 top-1/2 -translate-y-1/2 w-7 h-7 bg-gray-100 group-focus-within:bg-violet-50 rounded-md flex items-center justify-center transition-colors">
                                            <FiCreditCard className="text-gray-400 group-focus-within:text-violet-500 text-xs transition-colors" />
                                        </div>
                                        <input name="nin" type="text" required value={form.nin} onChange={handleChange}
                                            placeholder="12345678901" maxLength={11}
                                            className="w-full pl-12 pr-3 py-3 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-50 text-sm text-gray-900 placeholder-gray-400 transition-all" />
                                    </div>
                                </div>
                            </div>

                            {/* Uploads: Selfie & NIN Doc */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Profile Photo</label>
                                    <div className="relative h-24 bg-white border-2 border-dashed border-gray-200 rounded-2xl flex flex-col items-center justify-center overflow-hidden hover:border-violet-500 transition-all cursor-pointer group">
                                        <input type="file" accept="image/*" onChange={e => handleFileChange(e, 'profile')} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
                                        {previews.profile ? (
                                            <img src={previews.profile} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="text-center">
                                                <div className="w-8 h-8 bg-violet-50 rounded-full flex items-center justify-center mx-auto mb-1 group-hover:scale-110 transition-transform">
                                                    <FiUser className="text-violet-500 text-xs" />
                                                </div>
                                                <span className="text-[10px] font-bold text-gray-400">Selfie</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">NIN Document</label>
                                    <div className="relative h-24 bg-white border-2 border-dashed border-gray-200 rounded-2xl flex flex-col items-center justify-center overflow-hidden hover:border-violet-500 transition-all cursor-pointer group">
                                        <input type="file" accept="image/*" onChange={e => handleFileChange(e, 'nin')} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
                                        {previews.nin ? (
                                            <img src={previews.nin} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="text-center">
                                                <div className="w-8 h-8 bg-violet-50 rounded-full flex items-center justify-center mx-auto mb-1 group-hover:scale-110 transition-transform">
                                                    <FiCreditCard className="text-violet-500 text-xs" />
                                                </div>
                                                <span className="text-[10px] font-bold text-gray-400">ID Image</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Email */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email Address</label>
                                <div className="relative group">
                                    <div className="absolute left-3 top-1/2 -translate-y-1/2 w-7 h-7 bg-gray-100 group-focus-within:bg-violet-50 rounded-md flex items-center justify-center transition-colors">
                                        <FiMail className="text-gray-400 group-focus-within:text-violet-500 text-xs transition-colors" />
                                    </div>
                                    <input name="email" type="email" required value={form.email} onChange={handleChange}
                                        placeholder="you@example.com"
                                        className="w-full pl-12 pr-3 py-3 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-50 text-sm text-gray-900 placeholder-gray-400 transition-all" />
                                </div>
                            </div>

                            {/* Phone & Address */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Phone Number</label>
                                    <div className="relative group">
                                        <div className="absolute left-3 top-1/2 -translate-y-1/2 w-7 h-7 bg-gray-100 group-focus-within:bg-violet-50 rounded-md flex items-center justify-center transition-colors">
                                            <FiPhone className="text-gray-400 group-focus-within:text-violet-500 text-xs transition-colors" />
                                        </div>
                                        <input name="phone" type="tel" required value={form.phone} onChange={handleChange}
                                            placeholder="080XXXXXXXX"
                                            className="w-full pl-12 pr-3 py-3 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-50 text-sm text-gray-900 placeholder-gray-400 transition-all" />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Physical Address</label>
                                    <div className="relative group">
                                        <div className="absolute left-3 top-1/2 -translate-y-1/2 w-7 h-7 bg-gray-100 group-focus-within:bg-violet-50 rounded-md flex items-center justify-center transition-colors">
                                            <FiMapPin className="text-gray-400 group-focus-within:text-violet-500 text-xs transition-colors" />
                                        </div>
                                        <input name="address" type="text" required value={form.address} onChange={handleChange}
                                            placeholder="Office or Home Address"
                                            className="w-full pl-12 pr-3 py-3 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-50 text-sm text-gray-900 placeholder-gray-400 transition-all" />
                                    </div>
                                </div>
                            </div>

                            {/* Payout Details (Required for Identity Check) */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Payout Bank</label>
                                    <div className="relative group">
                                        <div className="absolute left-3 top-1/2 -translate-y-1/2 w-7 h-7 bg-gray-100 group-focus-within:bg-violet-50 rounded-md flex items-center justify-center transition-colors">
                                            <FiHome className="text-gray-400 group-focus-within:text-violet-500 text-xs transition-colors" />
                                        </div>
                                        <select name="bankName" required value={form.bankName} onChange={handleChange}
                                            className="w-full pl-12 pr-8 py-3 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-50 text-sm text-gray-900 appearance-none transition-all cursor-pointer">
                                            <option value="">Select your bank</option>
                                            {banks.map(b => (
                                                <option key={b.code} value={b.name}>{b.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Account Number</label>
                                    <div className="relative group">
                                        <div className="absolute left-3 top-1/2 -translate-y-1/2 w-7 h-7 bg-gray-100 group-focus-within:bg-violet-50 rounded-md flex items-center justify-center transition-colors">
                                            <FiCreditCard className="text-gray-400 group-focus-within:text-violet-500 text-xs transition-colors" />
                                        </div>
                                        <input name="accountNumber" type="text" required value={form.accountNumber} onChange={handleChange}
                                            placeholder="10-digit Nuban" maxLength={10}
                                            className="w-full pl-12 pr-3 py-3 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-50 text-sm text-gray-900 placeholder-gray-400 transition-all tracking-widest" />
                                    </div>
                                </div>
                            </div>

                            {/* Passwords */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Password</label>
                                    <div className="relative group">
                                        <div className="absolute left-3 top-1/2 -translate-y-1/2 w-7 h-7 bg-gray-100 group-focus-within:bg-violet-50 rounded-md flex items-center justify-center transition-colors">
                                            <FiLock className="text-gray-400 group-focus-within:text-violet-500 text-xs transition-colors" />
                                        </div>
                                        <input name="password" type={showPass ? 'text' : 'password'} required value={form.password} onChange={handleChange}
                                            placeholder="Min. 8 chars"
                                            className="w-full pl-12 pr-10 py-3 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-50 text-sm text-gray-900 placeholder-gray-400 transition-all" />
                                        <button type="button" onClick={() => setShowPass(!showPass)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition">
                                            {showPass ? <FiEyeOff size={14} /> : <FiEye size={14} />}
                                        </button>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Confirm Password</label>
                                    <div className="relative group">
                                        <div className="absolute left-3 top-1/2 -translate-y-1/2 w-7 h-7 bg-gray-100 group-focus-within:bg-violet-50 rounded-md flex items-center justify-center transition-colors">
                                            <FiLock className="text-gray-400 group-focus-within:text-violet-500 text-xs transition-colors" />
                                        </div>
                                        <input name="confirmPassword" type="password" required value={form.confirmPassword} onChange={handleChange}
                                            placeholder="Re-enter"
                                            className="w-full pl-12 pr-3 py-3 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-50 text-sm text-gray-900 placeholder-gray-400 transition-all" />
                                    </div>
                                </div>
                            </div>

                            {/* Terms */}
                            <div className="flex items-start gap-2 pt-1">
                                <input type="checkbox" id="agentTerms" required className="w-4 h-4 mt-0.5 rounded border-gray-300 text-violet-600 focus:ring-violet-500" />
                                <label htmlFor="agentTerms" className="text-sm text-gray-500 leading-snug">
                                    I agree to the{' '}
                                    <Link href="/terms" className="text-violet-600 hover:underline font-medium">Terms of Service</Link>
                                    {' '}and{' '}
                                    <Link href="/terms" className="text-violet-600 hover:underline font-medium">Agent Agreement</Link>
                                </label>
                            </div>

                            {/* Submit */}
                            <button type="submit" disabled={loading}
                                className="w-full group flex items-center justify-center gap-2 bg-violet-600 hover:bg-violet-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-violet-200/50 transform hover:-translate-y-0.5 active:translate-y-0 text-sm mt-2">
                                {loading ? (
                                    <div className="flex items-center gap-2">
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        Creating Account...
                                    </div>
                                ) : (
                                    <>
                                        Create Agent Account
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

                        <Link href="/auth/register"
                            className="w-full flex items-center justify-center gap-2 p-3.5 border-2 border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:border-indigo-300 hover:text-indigo-600 hover:bg-indigo-50/50 transition-all">
                            🏠 Register as Tenant instead
                        </Link>
                    </div>
                </div>
            </div>
        </>
    );
}
