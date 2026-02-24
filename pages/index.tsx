import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import {
    FiShield, FiCheckCircle, FiCreditCard, FiSearch,
    FiUsers, FiStar, FiArrowRight, FiChevronDown, FiMapPin
} from 'react-icons/fi';
import { useState } from 'react';
import { useRouter } from 'next/router';

/* ─── FAQ Data ─────────────────────────────────────────── */
const faqs = [
    {
        q: 'How does FUTA Housing protect my payment?',
        a: 'We use an Escrow system. When you book a hostel, your payment is held securely in our digital wallet. The agent only receives funds after you physically inspect and confirm your satisfaction during move-in. If anything is wrong, you get a full refund.',
    },
    {
        q: 'How do agents get verified?',
        a: 'Every agent must submit valid government-issued ID (NIN or National ID) and proof of hostel ownership. Our admin team manually reviews and approves each application to ensure only legitimate agents list on the platform.',
    },
    {
        q: 'Is there a fee for tenants?',
        a: 'No! Tenants can sign up, browse hostels, and make bookings completely free. We only charge agents a small 5% commission on successful bookings.',
    },
    {
        q: "What happens if the hostel doesn't match the listing?",
        a: "You can cancel your booking before confirming move-in. Your full payment will be refunded from escrow to your wallet. We also review and take action against agents with misleading listings.",
    },
    {
        q: 'Can I use FUTA Housing from my phone?',
        a: 'Absolutely! The platform is fully responsive and works perfectly on mobile, tablet, and desktop. Access it from any browser — no app download required.',
    },
];

/* ─── Testimonials ──────────────────────────────────────── */
const testimonials = [
    {
        name: 'Blessing Adeyemi',
        role: '400L Computer Science',
        text: 'I was scammed twice by fake agents before I found FUTA Housing. The escrow system gave me peace of mind. I got exactly what was shown in the photos!',
        rating: 5,
    },
    {
        name: 'Kehinde Ogunleye',
        role: 'Hostel Agent, Apatite Area',
        text: 'As an agent, this platform helped me reach more tenants and build trust. Payments are fast and secure. My bookings increased by 300%!',
        rating: 5,
    },
    {
        name: 'Fatima Abdullahi',
        role: '200L Engineering',
        text: 'The whole process was seamless. I funded my wallet, booked a hostel near campus, inspected it, and confirmed — all in one day. Amazing platform!',
        rating: 5,
    },
];

const stats = [
    { value: '2,500+', label: 'Tenants Housed' },
    { value: '450+', label: 'Verified Listings' },
    { value: '120+', label: 'Trusted Agents' },
    { value: '₦0', label: 'Lost to Scams' },
];

const steps = [
    { num: '01', title: 'Create Account', desc: 'Sign up as a Tenant or Agent in seconds. No hidden fees.', color: 'from-violet-500 to-violet-600' },
    { num: '02', title: 'Browse Hostels', desc: 'Search verified listings with photos, prices, and real reviews.', color: 'from-cyan-500 to-cyan-600' },
    { num: '03', title: 'Fund Wallet', desc: 'Add money to your secure wallet. Your funds are protected at all times.', color: 'from-emerald-500 to-emerald-600' },
    { num: '04', title: 'Book & Inspect', desc: 'Book your preferred hostel. Funds are held in escrow until you inspect.', color: 'from-amber-500 to-amber-600' },
    { num: '05', title: 'Confirm Move-in', desc: 'Happy with the hostel? Confirm and the agent gets paid. Not happy? Get a full refund.', color: 'from-pink-500 to-pink-600' },
];

const features = [
    { icon: FiShield, title: 'Escrow Protection', desc: 'Payments held in secure escrow until you confirm satisfaction. Zero risk for tenants.', color: 'bg-emerald-50 text-emerald-600 border-emerald-100' },
    { icon: FiCheckCircle, title: 'Verified Agents', desc: 'Every agent undergoes ID verification and admin approval. Only genuine listings.', color: 'bg-blue-50 text-blue-600 border-blue-100' },
    { icon: FiCreditCard, title: 'Digital Wallet', desc: 'Fund your wallet instantly and pay for bookings with one click.', color: 'bg-violet-50 text-violet-600 border-violet-100' },
    { icon: FiSearch, title: 'Smart Search', desc: 'Filter by location, price range, and amenities. Find your ideal hostel fast.', color: 'bg-cyan-50 text-cyan-600 border-cyan-100' },
    { icon: FiUsers, title: 'Tenant Community', desc: 'Read reviews from real tenants and share your experiences.', color: 'bg-amber-50 text-amber-600 border-amber-100' },
    { icon: FiStar, title: 'Instant Booking', desc: 'Book without leaving your room. Manage everything from your dashboard.', color: 'bg-pink-50 text-pink-600 border-pink-100' },
];

export default function Home() {
    const [openFaq, setOpenFaq] = useState<number | null>(null);
    const [search, setSearch] = useState('');
    const router = useRouter();

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.push(search.trim() ? `/hostels?search=${encodeURIComponent(search)}` : '/hostels');
    };

    return (
        <div className="min-h-screen bg-white flex flex-col" style={{ fontFamily: "'Inter', sans-serif" }}>
            <Head>
                <title>FUTA Housing | Verify, Pay, Move-in — Secure Tenant Accommodation</title>
                <meta name="description" content="FUTA Housing is the safest way for tenants to find verified hostels. Escrow protection, verified agents, and instant booking." />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <link rel="icon" href="/logo.png" />
                <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />
            </Head>

            <Header />

            <main className="flex-grow">

                {/* ── HERO ──────────────────────────────────────────────── */}
                <section className="relative min-h-[90vh] sm:min-h-[85vh] flex items-center bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 overflow-hidden pt-16 pb-12">
                    {/* Background decorations */}
                    <div className="absolute inset-0 pointer-events-none">
                        <div className="absolute top-10 left-4 sm:top-20 sm:left-10 w-48 h-48 sm:w-72 sm:h-72 bg-white/10 rounded-full blur-3xl animate-pulse" />
                        <div className="absolute bottom-10 right-4 sm:bottom-10 sm:right-10 w-64 h-64 sm:w-96 sm:h-96 bg-yellow-400/10 rounded-full blur-3xl" />
                        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.3) 1px, transparent 1px)', backgroundSize: '30px 30px' }} />
                    </div>

                    <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">

                            {/* Left: Copy */}
                            <div className="text-white text-center lg:text-left">
                                <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm text-white text-xs sm:text-sm font-semibold px-3 sm:px-4 py-2 rounded-full mb-5 border border-white/20">
                                    <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse shrink-0" />
                                    Trusted by 2,500+ Tenants & Residents
                                </div>

                                <h1 className="text-4xl sm:text-5xl md:text-6xl xl:text-7xl font-black leading-tight mb-4 sm:mb-6 tracking-tight">
                                    Secure Housing.
                                    <br />
                                    <span className="bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">
                                        Verified Agents.
                                    </span>
                                </h1>

                                <p className="text-base sm:text-lg md:text-xl text-white/80 max-w-xl mx-auto lg:mx-0 mb-6 leading-relaxed">
                                    The smartest way to find your perfect hostel at FUTA. With our Escrow protection, your money is safe until you confirm satisfaction. No more scams.
                                </p>

                                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-center justify-center lg:justify-start mt-8">
                                    <Link href="/hostels"
                                        className="group inline-flex items-center justify-center gap-3 bg-white text-indigo-700 font-black px-10 py-5 rounded-2xl hover:bg-yellow-300 hover:text-indigo-900 transition-all shadow-2xl shadow-white/10 text-lg transform hover:-translate-y-1 w-full sm:w-auto">
                                        Find Your Hostel
                                        <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
                                    </Link>
                                    <Link href="/auth/register?role=AGENT"
                                        className="inline-flex items-center justify-center gap-3 border-2 border-white/20 text-white font-bold px-10 py-5 rounded-2xl hover:bg-white/10 transition-all text-lg backdrop-blur-sm w-full sm:w-auto">
                                        Partner as Agent
                                    </Link>
                                </div>
                            </div>

                            {/* Right: Visual Card (hidden on mobile, shown from lg) */}
                            <div className="hidden lg:block">
                                <div className="relative">
                                    <div className="bg-white/10 backdrop-blur-md rounded-3xl border border-white/20 p-8 shadow-2xl">
                                        <div className="flex items-center gap-3 mb-6">
                                            <Image src="/logo.png" alt="FUTA Housing" width={48} height={48} className="rounded-xl" />
                                            <div>
                                                <p className="text-white font-bold text-lg">FUTA Housing</p>
                                                <p className="text-white/60 text-sm">Secure · Verified · Fast</p>
                                            </div>
                                        </div>
                                        <div className="space-y-4">
                                            <div className="bg-white/10 rounded-2xl p-5">
                                                <p className="text-white/60 text-xs mb-1">Wallet Balance</p>
                                                <p className="text-white text-3xl font-black">₦150,000</p>
                                                <p className="text-emerald-300 text-sm mt-1">+₦10,000 funded today</p>
                                            </div>
                                            <div className="grid grid-cols-2 gap-3">
                                                <div className="bg-white/10 rounded-xl p-4">
                                                    <p className="text-white/60 text-xs mb-1">Escrow</p>
                                                    <p className="text-amber-300 text-xl font-bold">₦75,000</p>
                                                </div>
                                                <div className="bg-white/10 rounded-xl p-4">
                                                    <p className="text-white/60 text-xs mb-1">Bookings</p>
                                                    <p className="text-cyan-300 text-xl font-bold">3 Active</p>
                                                </div>
                                            </div>
                                            <div className="bg-emerald-500/20 border border-emerald-400/30 rounded-xl p-4 flex items-center gap-3">
                                                <FiCheckCircle className="text-emerald-400 text-lg shrink-0" />
                                                <p className="text-emerald-200 text-sm font-medium">Move-in confirmed! ₦75,000 released to agent</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="absolute -top-4 -right-4 bg-white rounded-2xl px-4 py-2.5 shadow-xl">
                                        <p className="text-sm font-bold text-emerald-600 flex items-center gap-1"><FiShield /> Escrow Active</p>
                                    </div>
                                    <div className="absolute -bottom-4 -left-4 bg-white rounded-2xl px-4 py-2.5 shadow-xl">
                                        <p className="text-sm font-bold text-violet-600 flex items-center gap-1"><FiCheckCircle /> Agent Verified</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ── STATS BAR ─────────────────────────────────────────── */}
                <section className="relative z-20 -mt-6 sm:-mt-8">
                    <div className="max-w-5xl mx-auto px-4 sm:px-6">
                        <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl shadow-indigo-200/50 border border-gray-100 grid grid-cols-2 md:grid-cols-4">
                            {stats.map((stat, i) => (
                                <div key={stat.label} className={`p-5 sm:p-8 text-center ${i < stats.length - 1 ? 'border-r border-b md:border-b-0 border-gray-100' : ''} ${i >= 2 ? 'border-b-0' : ''}`}>
                                    <p className="text-2xl sm:text-3xl md:text-4xl font-black text-indigo-600">{stat.value}</p>
                                    <p className="text-gray-500 text-xs sm:text-sm font-medium mt-1">{stat.label}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ── HOW IT WORKS ──────────────────────────────────────── */}
                <section className="py-16 sm:py-24 bg-gray-50">
                    <div className="max-w-6xl mx-auto px-4 sm:px-6">
                        <div className="text-center mb-10 sm:mb-16">
                            <span className="text-indigo-600 font-bold text-xs sm:text-sm uppercase tracking-widest">How It Works</span>
                            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-gray-900 mt-3">
                                Book your hostel in <span className="text-indigo-600">5 simple steps</span>
                            </h2>
                            <p className="text-gray-500 text-base sm:text-lg mt-4 max-w-2xl mx-auto">
                                From sign-up to move-in, the entire process is streamlined, secure, and transparent.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-6">
                            {steps.map((step, i) => (
                                <div key={step.num} className="relative group">
                                    <div className="bg-white rounded-2xl p-5 sm:p-6 border border-gray-100 hover:border-indigo-200 hover:shadow-xl transition-all duration-300 h-full">
                                        <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br ${step.color} flex items-center justify-center text-white text-xs sm:text-sm font-black mb-3 sm:mb-4 group-hover:scale-110 transition-transform`}>
                                            {step.num}
                                        </div>
                                        <h3 className="font-bold text-gray-900 mb-2 text-sm sm:text-base">{step.title}</h3>
                                        <p className="text-gray-500 text-xs sm:text-sm leading-relaxed">{step.desc}</p>
                                    </div>
                                    {i < steps.length - 1 && (
                                        <div className="hidden lg:block absolute top-1/2 -right-3 z-10 text-gray-300">
                                            <FiArrowRight />
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ── FEATURES ──────────────────────────────────────────── */}
                <section className="py-16 sm:py-24 bg-white">
                    <div className="max-w-6xl mx-auto px-4 sm:px-6">
                        <div className="text-center mb-10 sm:mb-16">
                            <span className="text-indigo-600 font-bold text-xs sm:text-sm uppercase tracking-widest">Why Choose Us</span>
                            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-gray-900 mt-3">
                                Everything you need for <span className="text-indigo-600">safe housing</span>
                            </h2>
                            <p className="text-gray-500 text-base sm:text-lg mt-4 max-w-2xl mx-auto">
                                FUTA Housing provides all the tools and protections you need to find reliable, verified accommodation.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-8">
                            {features.map((feat) => (
                                <div key={feat.title} className="group p-6 sm:p-8 rounded-2xl border border-gray-100 hover:border-indigo-200 hover:shadow-xl transition-all duration-300 bg-white">
                                    <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl ${feat.color} border flex items-center justify-center text-xl sm:text-2xl mb-4 sm:mb-5 group-hover:scale-110 transition-transform`}>
                                        <feat.icon />
                                    </div>
                                    <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 sm:mb-3">{feat.title}</h3>
                                    <p className="text-gray-500 text-sm sm:text-base leading-relaxed">{feat.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ── ESCROW DEEP-DIVE ───────────────────────────────────── */}
                <section className="py-16 sm:py-24 bg-gradient-to-br from-indigo-50 via-white to-purple-50">
                    <div className="max-w-6xl mx-auto px-4 sm:px-6">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">

                            {/* Visual */}
                            <div className="relative">
                                <div className="bg-white rounded-2xl sm:rounded-3xl shadow-xl border border-gray-100 p-6 sm:p-8">
                                    <h3 className="text-xl sm:text-2xl font-black text-gray-900 mb-5 sm:mb-6">How Escrow Works</h3>
                                    <div className="space-y-4 sm:space-y-5">
                                        {[
                                            { step: '1', title: 'Tenant pays', desc: 'Payment goes to escrow, NOT the agent', icon: '💰', line: 'border-violet-300' },
                                            { step: '2', title: 'Tenant inspects hostel', desc: 'Visit the hostel and verify everything', icon: '🏠', line: 'border-cyan-300' },
                                            { step: '3', title: 'Tenant confirms', desc: 'Happy? Confirm and agent gets paid', icon: '✅', line: 'border-emerald-300' },
                                        ].map((item, i) => (
                                            <div key={item.step} className="flex items-start gap-3 sm:gap-4">
                                                <div className="flex flex-col items-center">
                                                    <div className="w-9 h-9 sm:w-10 sm:h-10 bg-indigo-600 text-white rounded-full flex items-center justify-center font-bold text-sm shrink-0">
                                                        {item.step}
                                                    </div>
                                                    {i < 2 && <div className={`w-0.5 h-6 sm:h-8 border-l-2 border-dashed ${item.line} mt-1`} />}
                                                </div>
                                                <div className="flex-1 pb-2">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-lg sm:text-xl">{item.icon}</span>
                                                        <h4 className="font-bold text-gray-900 text-sm sm:text-base">{item.title}</h4>
                                                    </div>
                                                    <p className="text-gray-500 text-xs sm:text-sm mt-1">{item.desc}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="mt-5 sm:mt-6 p-3 sm:p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                                        <p className="text-emerald-700 text-xs sm:text-sm font-semibold flex items-center gap-2">
                                            <FiShield className="text-emerald-500 shrink-0" />
                                            Not satisfied? Your full payment is refunded automatically.
                                        </p>
                                    </div>
                                </div>
                                <div className="absolute -z-10 -bottom-4 -right-4 sm:-bottom-6 sm:-right-6 w-full h-full bg-indigo-100/50 rounded-3xl" />
                            </div>

                            {/* Copy */}
                            <div className="mt-4 lg:mt-0">
                                <span className="text-indigo-600 font-bold text-xs sm:text-sm uppercase tracking-widest">Zero Risk</span>
                                <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-gray-900 mt-3 leading-tight">
                                    Your money is <span className="text-indigo-600">100% protected</span>
                                </h2>
                                <p className="text-gray-500 text-base sm:text-lg mt-5 sm:mt-6 leading-relaxed">
                                    Traditional hostel hunting is risky. Agents can disappear with your money, photos can be misleading, and there&apos;s no recourse if things go wrong.
                                </p>
                                <p className="text-gray-500 text-base sm:text-lg mt-4 leading-relaxed">
                                    <strong className="text-gray-900">FUTA Housing changes everything.</strong> Our escrow system holds your payment until you physically inspect the hostel and confirm it meets your expectations.
                                </p>
                                <div className="mt-6 sm:mt-8 grid grid-cols-2 gap-3 sm:gap-4">
                                    {[
                                        { val: '100%', label: 'Refund guarantee' },
                                        { val: '5%', label: 'Agent commission only' },
                                        { val: '24hrs', label: 'Average resolution' },
                                        { val: '₦0', label: 'Tenant fees' },
                                    ].map((item) => (
                                        <div key={item.label} className="bg-white rounded-xl p-3 sm:p-4 border border-gray-100 shadow-sm">
                                            <p className="text-xl sm:text-2xl font-black text-indigo-600">{item.val}</p>
                                            <p className="text-gray-500 text-xs sm:text-sm mt-0.5">{item.label}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ── TESTIMONIALS ──────────────────────────────────────── */}
                <section className="py-16 sm:py-24 bg-white">
                    <div className="max-w-6xl mx-auto px-4 sm:px-6">
                        <div className="text-center mb-10 sm:mb-16">
                            <span className="text-indigo-600 font-bold text-xs sm:text-sm uppercase tracking-widest">Testimonials</span>
                            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-gray-900 mt-3">
                                Loved by <span className="text-indigo-600">tenants & agents</span>
                            </h2>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-8">
                            {testimonials.map((t) => (
                                <div key={t.name} className="bg-gray-50 rounded-2xl p-6 sm:p-8 border border-gray-100 hover:shadow-lg transition-shadow">
                                    <div className="flex gap-1 text-amber-400 mb-4">
                                        {Array.from({ length: t.rating }).map((_, i) => (
                                            <FiStar key={i} className="fill-current" />
                                        ))}
                                    </div>
                                    <p className="text-gray-600 leading-relaxed mb-5 sm:mb-6 italic text-sm sm:text-base">&ldquo;{t.text}&rdquo;</p>
                                    <div className="flex items-center gap-3">
                                        <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm shrink-0">
                                            {t.name.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-900 text-sm">{t.name}</p>
                                            <p className="text-gray-500 text-xs">{t.role}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ── FOR AGENTS ────────────────────────────────────────── */}
                <section className="py-16 sm:py-24 bg-gradient-to-r from-violet-600 to-indigo-600 text-white">
                    <div className="max-w-6xl mx-auto px-4 sm:px-6">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-12 items-center">
                            <div>
                                <span className="text-violet-200 font-bold text-xs sm:text-sm uppercase tracking-widest">For Agents</span>
                                <h2 className="text-3xl sm:text-4xl md:text-5xl font-black mt-3 leading-tight">
                                    Grow your hostel business with us
                                </h2>
                                <p className="text-violet-200 text-base sm:text-lg mt-5 sm:mt-6 leading-relaxed">
                                    Reach thousands of tenants looking for accommodation. List your properties, get verified, and receive payments directly to your wallet. We only take a 5% commission on successful bookings.
                                </p>
                                <div className="mt-6 sm:mt-8 space-y-3 sm:space-y-4">
                                    {[
                                        'Instant access to 2,500+ active tenants',
                                        'Secure automated payments via escrow',
                                        'Verified badge builds trust with tenants',
                                        'Dashboard to manage all your listings',
                                    ].map((benefit) => (
                                        <div key={benefit} className="flex items-start gap-3">
                                            <div className="w-5 h-5 sm:w-6 sm:h-6 bg-white/20 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                                                <FiCheckCircle className="text-emerald-300 text-xs" />
                                            </div>
                                            <p className="text-white/90 text-sm sm:text-base">{benefit}</p>
                                        </div>
                                    ))}
                                </div>
                                <Link href="/auth/agent-register"
                                    className="mt-7 sm:mt-8 inline-flex items-center gap-2 bg-white text-indigo-700 font-bold px-7 py-4 rounded-2xl hover:bg-gray-100 transition-all shadow-lg text-base sm:text-lg">
                                    Register as Agent <FiArrowRight />
                                </Link>
                            </div>

                            {/* Agent preview — hidden on mobile */}
                            <div className="hidden lg:block">
                                <div className="bg-white/10 backdrop-blur-sm rounded-3xl border border-white/20 p-8">
                                    <div className="text-center mb-6">
                                        <p className="text-white/60 text-sm">Agent Dashboard Preview</p>
                                        <p className="text-4xl font-black mt-2">₦2,450,000</p>
                                        <p className="text-emerald-300 text-sm mt-1">Total Earnings</p>
                                    </div>
                                    <div className="space-y-3">
                                        {[
                                            { label: 'Active Listings', value: '12', color: 'text-cyan-300' },
                                            { label: 'Confirmed Bookings', value: '47', color: 'text-emerald-300' },
                                            { label: 'Pending Bookings', value: '5', color: 'text-amber-300' },
                                            { label: 'Rating', value: '⭐ 4.9/5', color: 'text-yellow-300' },
                                        ].map((item) => (
                                            <div key={item.label} className="flex items-center justify-between bg-white/10 rounded-xl px-5 py-3">
                                                <p className="text-white/70 text-sm">{item.label}</p>
                                                <p className={`font-bold ${item.color}`}>{item.value}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ── FAQ ───────────────────────────────────────────────── */}
                <section className="py-16 sm:py-24 bg-gray-50">
                    <div className="max-w-3xl mx-auto px-4 sm:px-6">
                        <div className="text-center mb-10 sm:mb-16">
                            <span className="text-indigo-600 font-bold text-xs sm:text-sm uppercase tracking-widest">FAQ</span>
                            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-gray-900 mt-3">
                                Common <span className="text-indigo-600">questions</span>
                            </h2>
                        </div>

                        <div className="space-y-3 sm:space-y-4">
                            {faqs.map((faq, i) => (
                                <div key={i} className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
                                    <button
                                        onClick={() => setOpenFaq(openFaq === i ? null : i)}
                                        className="w-full text-left flex items-center justify-between p-5 sm:p-6 hover:bg-gray-50 transition"
                                    >
                                        <span className="font-bold text-gray-900 pr-4 text-sm sm:text-base">{faq.q}</span>
                                        <FiChevronDown className={`text-gray-400 shrink-0 transition-transform duration-200 ${openFaq === i ? 'rotate-180' : ''}`} />
                                    </button>
                                    {openFaq === i && (
                                        <div className="px-5 sm:px-6 pb-5 sm:pb-6 -mt-2">
                                            <p className="text-gray-500 leading-relaxed text-sm sm:text-base">{faq.a}</p>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ── CTA ───────────────────────────────────────────────── */}
                <section className="py-16 sm:py-24 bg-white">
                    <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
                        <Image src="/logo.png" alt="FUTA Housing" width={56} height={56} className="mx-auto rounded-2xl mb-5 sm:mb-6" />
                        <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-gray-900 leading-tight">
                            Ready to find your <span className="text-indigo-600">perfect hostel?</span>
                        </h2>
                        <p className="text-gray-500 text-base sm:text-lg mt-4 max-w-xl mx-auto">
                            Join thousands of tenants who have found safe, verified accommodation through our platform. It&apos;s free to sign up.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center mt-7 sm:mt-8">
                            <Link href="/auth/register"
                                className="group inline-flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-7 py-4 rounded-2xl transition-all shadow-lg shadow-indigo-200 text-base sm:text-lg">
                                Get Started Free <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
                            </Link>
                            <Link href="/hostels"
                                className="inline-flex items-center justify-center gap-2 border-2 border-gray-200 text-gray-700 font-bold px-7 py-4 rounded-2xl hover:border-indigo-200 hover:text-indigo-600 transition-all text-base sm:text-lg">
                                Browse Hostels
                            </Link>
                        </div>
                    </div>
                </section>

            </main>

            <Footer />
        </div>
    );
}
