'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';
import { toast } from 'react-toastify';
import {
    FiMapPin, FiShield, FiCheck, FiArrowLeft, FiClock,
    FiCreditCard, FiInfo, FiCalendar, FiArrowRight, FiShieldOff, FiTarget, FiBox, FiTag, FiEye, FiActivity, FiUsers
} from 'react-icons/fi';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { fetchHostelById, clearSelectedHostel } from '../../store/slices/hostelSlice';
import { createBooking } from '../../store/slices/bookingSlice';
import { fetchWallet } from '../../store/slices/walletSlice';
import { payInspection } from '../../store/slices/inspectionSlice';
import { User } from '../../types/interfaces';

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || '';

export default function HostelDetails() {
    const router = useRouter();
    const { id } = router.query;
    const dispatch = useAppDispatch();
    const { selectedHostel: hostel, loading } = useAppSelector((s) => s.hostels);
    const { balance } = useAppSelector((s) => s.wallet);
    const { user } = useAppSelector((s) => s.auth);

    const [isBooking, setIsBooking] = useState(false);
    const [isInspecting, setIsInspecting] = useState(false);

    useEffect(() => {
        if (id) {
            dispatch(fetchHostelById(id as string));
            dispatch(fetchWallet());
        }
        return () => { dispatch(clearSelectedHostel()); };
    }, [id, dispatch]);

    const handleBooking = async () => {
        if (!user) {
            toast.error('Please login to book a hostel');
            router.push('/auth/login');
            return;
        }
        if (!hostel) return;

        if (balance < hostel.price) {
            toast.error('Insufficient wallet balance. Please fund your wallet first.');
            return;
        }

        // Removed confirm() alarm as requested

        setIsBooking(true);
        try {
            await dispatch(createBooking({
                hostelId: hostel._id || hostel.id,
                amount: hostel.price
            })).unwrap();

            toast.success('🎉 Booking initiated! Check your dashboard.');
            router.push('/dashboard');
        } catch (err: any) {
            toast.error(err || 'Booking failed');
        } finally {
            setIsBooking(false);
        }
    };

    const handleInspection = async () => {
        if (!user) {
            toast.error('Please login to pay for inspection');
            router.push('/auth/login');
            return;
        }
        if (!hostel) return;

        const fee = hostel.inspectionFee || 0;
        if (fee > 0 && balance < fee) {
            toast.error('Insufficient funds for inspection fee.');
            return;
        }

        if (fee > 0) {
            // Removed confirm() alarm as requested
        }

        setIsInspecting(true);
        try {
            await dispatch(payInspection(hostel._id || hostel.id)).unwrap();
            toast.success('✅ Inspection fee paid! The agent will contact you shortly.');
        } catch (err: any) {
            toast.error(err || 'Inspection request failed');
        } finally {
            setIsInspecting(false);
        }
    };

    if (loading || !hostel) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-slate-100 border-t-indigo-600 rounded-full animate-spin" />
            </div>
        );
    }

    const agent = hostel.agentId as User;

    return (
        <>
            <Head>
                <title>{hostel.title} | FUTA Housing</title>
            </Head>

            <div className="min-h-screen bg-[#fcfdfe] text-slate-800 pb-20 selection:bg-indigo-50 selection:text-indigo-900">
                {/* ── Header ───────────────────────────────────── */}
                <header className="h-16 bg-white/70 backdrop-blur-md border-b border-slate-100 fixed top-0 w-full z-50 px-6 flex items-center justify-between">
                    <button onClick={() => router.back()} className="flex items-center gap-2 group text-slate-400 hover:text-indigo-600 transition-all font-bold text-[10px] uppercase tracking-widest">
                        <FiArrowLeft size={14} /> Back
                    </button>

                    <Link href="/" className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-indigo-50 rounded-lg flex items-center justify-center shadow-sm">
                            <Image src='/logo.png' width={22} height={22} alt="Logo" priority />
                        </div>
                        <span className="text-base font-black text-slate-900 tracking-tight uppercase italic">FUTA Housing</span>
                    </Link>

                    <Link href="/dashboard" className="text-[10px] font-bold text-slate-400 hover:text-indigo-600 uppercase tracking-widest transition-colors">My Portal</Link>
                </header>

                <main className="pt-24 px-6 max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10">

                    {/* ── Content ─────────────────────────────────── */}
                    <div className="lg:col-span-8 space-y-10">
                        {/* Gallery & Videos */}
                        <div className="grid grid-cols-12 gap-4 h-[400px]">
                            <div className="col-span-12 md:col-span-8 relative rounded-3xl overflow-hidden border border-slate-100 bg-slate-50">
                                {hostel.images?.[0] ? (
                                    <>
                                        <Image
                                            src={typeof hostel.images[0] === 'string' ? hostel.images[0] : (hostel.images[0] as any).url}
                                            layout="fill"
                                            objectFit="cover"
                                            alt={typeof hostel.images[0] === 'object' ? (hostel.images[0] as any).description || "Main" : "Main"}
                                        />
                                        {typeof hostel.images[0] === 'object' && (hostel.images[0] as any).description && (
                                            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-6 pt-12">
                                                <p className="text-white text-xs font-bold uppercase tracking-widest">{(hostel.images[0] as any).description}</p>
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-4xl">🏘️</div>
                                )}
                            </div>
                            <div className="hidden md:flex col-span-4 flex-col gap-4">
                                <div className="h-1/2 relative rounded-2xl overflow-hidden border border-slate-100 bg-slate-50">
                                    {hostel.images?.[1] ? (
                                        <>
                                            <Image
                                                src={typeof hostel.images[1] === 'string' ? hostel.images[1] : hostel.images[1].url}
                                                layout="fill"
                                                objectFit="cover"
                                                alt={typeof hostel.images[1] === 'object' ? hostel.images[1].description || "S1" : "S1"}
                                            />
                                            {typeof hostel.images[1] === 'object' && hostel.images[1].description && (
                                                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3 pt-8">
                                                    <p className="text-white text-[8px] font-bold uppercase tracking-widest truncate">{hostel.images[1].description}</p>
                                                </div>
                                            )}
                                        </>
                                    ) : <div className="w-full h-full" />}
                                </div>
                                <div className="h-1/2 relative rounded-2xl overflow-hidden border border-slate-100 bg-slate-50">
                                    {hostel.videos?.[0] ? (
                                        <div className="w-full h-full bg-slate-900 flex items-center justify-center group/vid relative">
                                            <video src={typeof hostel.videos[0] === 'string' ? hostel.videos[0] : (hostel.videos[0] as any).url} className="w-full h-full object-cover opacity-50" />
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white border border-white/30 group-hover/vid:scale-110 transition-transform">
                                                    <FiEye size={20} />
                                                </div>
                                            </div>
                                            <p className="absolute bottom-3 left-3 text-[8px] font-black text-white/70 uppercase tracking-widest">
                                                {typeof hostel.videos[0] === 'object' ? (hostel.videos[0] as any).description || 'Walkthrough Video' : 'Walkthrough Video'}
                                            </p>
                                        </div>
                                    ) : hostel.images?.[2] ? (
                                        <Image
                                            src={typeof hostel.images[2] === 'string' ? hostel.images[2] : (hostel.images[2] as any).url}
                                            layout="fill"
                                            objectFit="cover"
                                            alt={typeof hostel.images[2] === 'object' ? (hostel.images[2] as any).description || "S2" : "S2"}
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center font-bold text-slate-200 uppercase tracking-widest text-[8px]">Registry+</div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Title & Info */}
                        <div>
                            <div className="flex flex-wrap items-center gap-2 mb-4">
                                <span className="bg-indigo-50 text-indigo-600 px-3 py-1.5 rounded-lg text-[9px] font-bold uppercase tracking-widest">{hostel.propertyType || 'Residential'}</span>
                                {hostel.preferredTenants && Array.isArray(hostel.preferredTenants) && hostel.preferredTenants.map((type, idx) => (
                                    <span key={idx} className="bg-slate-100 text-slate-600 px-3 py-1.5 rounded-lg text-[9px] font-bold uppercase tracking-widest border border-slate-200 flex items-center gap-1.5">
                                        <FiUsers size={12} /> {type === 'Anyone' ? 'All Classes (Anyone)' : `${type}`}
                                    </span>
                                ))}
                                {(!hostel.preferredTenants || (Array.isArray(hostel.preferredTenants) && hostel.preferredTenants.length === 0)) && (
                                    <span className="bg-slate-100 text-slate-600 px-3 py-1.5 rounded-lg text-[9px] font-bold uppercase tracking-widest border border-slate-200 flex items-center gap-1.5">
                                        <FiUsers size={12} /> All Classes (Anyone)
                                    </span>
                                )}
                                <span className="bg-emerald-50 text-emerald-600 border border-emerald-100 px-3 py-1.5 rounded-lg text-[9px] font-bold uppercase tracking-widest flex items-center gap-1.5"><FiShield size={12} /> Verified Unit</span>
                            </div>
                            <h1 className="text-3xl font-bold text-slate-900 tracking-tight mb-4">{hostel.title}</h1>
                            <div className="flex flex-wrap items-center gap-4 text-slate-400 font-semibold text-sm">
                                <div className="flex items-center gap-1.5"><FiMapPin className="text-indigo-500" /> {hostel.location}</div>
                                <div className="w-1 h-1 rounded-full bg-slate-200" />
                                <div className="flex items-center gap-1.5"><FiCalendar className="text-indigo-500" /> Registry Entry: Feb 2026</div>
                            </div>
                        </div>

                        {/* Desc */}
                        <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm">
                            <h3 className="text-sm font-bold text-slate-900 mb-4 uppercase tracking-wider flex items-center gap-2">
                                <FiInfo className="text-indigo-600" /> Property Overview
                            </h3>
                            <p className="text-slate-500 leading-relaxed text-base font-medium">
                                {hostel.description}
                            </p>

                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 pt-8 mt-8 border-t border-slate-50">
                                {hostel.amenities?.map((a: string, i: number) => (
                                    <div key={i}>
                                        <p className="text-[9px] font-bold text-slate-300 uppercase tracking-widest mb-1">Amenity</p>
                                        <p className="text-xs font-bold text-slate-700">{a}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Map & Location Details */}
                        <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm space-y-6">
                            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                                <FiMapPin className="text-indigo-600" /> Location Registry
                            </h3>
                            <div className="relative h-64 w-full rounded-2xl overflow-hidden border border-slate-100 bg-slate-50">
                                {hostel.longitude && hostel.latitude ? (
                                    <Image
                                        src={`https://api.mapbox.com/styles/v1/mapbox/streets-v11/static/pin-s+ff0000(${hostel.longitude},${hostel.latitude})/${hostel.longitude},${hostel.latitude},15,0/800x400?access_token=${MAPBOX_TOKEN}`}
                                        layout="fill"
                                        objectFit="cover"
                                        alt="Map Location"
                                    />
                                ) : (
                                    <div className="w-full h-full flex flex-col items-center justify-center text-slate-300 gap-2">
                                        <FiTarget size={32} />
                                        <p className="text-[10px] font-bold uppercase tracking-widest">Awaiting Registry Sync</p>
                                    </div>
                                )}
                            </div>
                            <div className="p-4 bg-slate-50 rounded-xl">
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 leading-none">Verified Address</p>
                                <p className="text-xs font-bold text-slate-800 leading-relaxed">{hostel.location}</p>
                            </div>
                        </div>

                        {/* Health Registry (Damages) */}
                        <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm space-y-6">
                            <div className="flex items-center justify-between">
                                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                                    <FiActivity className="text-rose-500" /> Property Health Registry
                                </h3>
                                {(hostel as any).damages?.length === 0 ? (
                                    <span className="bg-emerald-50 text-emerald-600 px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border border-emerald-100 italic flex items-center gap-2"><FiCheck /> Zero Active Damages</span>
                                ) : (
                                    <span className="bg-rose-50 text-rose-600 px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border border-rose-100 italic flex items-center gap-2"><FiShieldOff /> Active Damage Node</span>
                                )}
                            </div>

                            <div className="space-y-4">
                                {(hostel as any).damages?.map((dmg: any, i: number) => (
                                    <div key={i} className="p-6 rounded-2xl border border-rose-100 bg-rose-50/20 flex flex-col md:flex-row md:items-center justify-between gap-4">
                                        <div className="space-y-1">
                                            <p className="text-[9px] font-black text-rose-500 uppercase tracking-widest">Entry ID: #{101 + i}</p>
                                            <p className="text-xs font-bold text-slate-800">{dmg.description}</p>
                                            <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Logged: {new Date(dmg.reportedAt).toLocaleDateString()}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[8px] font-bold text-slate-300 uppercase tracking-widest mb-1">Violation Fine</p>
                                            <p className="text-lg font-black text-rose-600">₦{dmg.fineAmount?.toLocaleString() || '0'}</p>
                                            <span className="text-[8px] font-black px-2 py-0.5 rounded bg-amber-500/10 text-amber-600 border border-amber-500/20 uppercase tracking-widest">{dmg.status}</span>
                                        </div>
                                    </div>
                                ))}
                                {(hostel as any).damages?.length === 0 && (
                                    <div className="py-12 flex flex-col items-center justify-center gap-4 bg-emerald-50/10 border border-emerald-100/50 border-dashed rounded-3xl">
                                        <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-600">
                                            <FiShield size={20} />
                                        </div>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest italic animate-pulse">Asset Integrity Synchronized with Registry</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* ── Sidebar ─────────────────────────────────── */}
                    <div className="lg:col-span-4">
                        <div className="sticky top-24 space-y-6">
                            <div className="bg-white border border-slate-100 rounded-[2.5rem] p-8 shadow-xl shadow-slate-200/40 relative overflow-hidden group">
                                <div className="relative z-10">
                                    <div className="mb-8">
                                        <p className="text-slate-400 text-[9px] font-bold uppercase tracking-widest mb-1">Annual Settlement</p>
                                        <div className="flex items-end gap-1.5">
                                            <span className="text-4xl font-bold text-slate-900 tracking-tight">₦{hostel.price.toLocaleString()}</span>
                                            <span className="text-slate-400 font-semibold mb-1 text-sm">/yr</span>
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-3 mb-8">
                                        <button
                                            onClick={handleBooking}
                                            disabled={isBooking}
                                            className="w-full h-14 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-200 text-white font-bold rounded-2xl flex items-center justify-center gap-2 transition-all active:scale-95 text-xs uppercase tracking-widest"
                                        >
                                            {isBooking ? 'Processing...' : <>Reserve This Unit <FiArrowRight /></>}
                                        </button>

                                        <button
                                            onClick={handleInspection}
                                            disabled={isInspecting}
                                            className="w-full h-14 bg-white border border-slate-200 hover:border-indigo-200 hover:bg-indigo-50/30 text-slate-600 font-bold rounded-2xl flex items-center justify-center gap-2 transition-all active:scale-95 text-xs uppercase tracking-widest"
                                        >
                                            {isInspecting ? 'Requesting...' : (
                                                <>
                                                    <FiEye /> Inspection
                                                    {hostel.inspectionFee > 0 && <span className="ml-1 text-indigo-600">(₦{hostel.inspectionFee.toLocaleString()})</span>}
                                                </>
                                            )}
                                        </button>
                                    </div>

                                    <div className="flex flex-col gap-3 pt-6 border-t border-slate-50">
                                        <div className="flex items-center gap-3 text-[10px] font-bold text-emerald-600 uppercase tracking-widest">
                                            <FiShield /> Escrow Enabled
                                        </div>
                                        <p className="text-[10px] text-slate-400 font-medium leading-relaxed">
                                            Your rent is held in digital escrow. Verification is required before move-in.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Agent */}
                            <div className="bg-white border border-slate-100 rounded-2xl p-6 flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-sm font-bold text-indigo-600">
                                    {agent?.name?.charAt(0) || 'A'}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Manager</p>
                                    <p className="text-sm font-bold text-slate-900 truncate">{agent?.name || 'Authorized Agent'}</p>
                                </div>
                            </div>

                            <div className="p-6 rounded-2xl bg-amber-50/50 border border-amber-100">
                                <p className="text-[9px] font-bold text-amber-700 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                                    <FiInfo size={12} /> Registry Notice
                                </p>
                                <p className="text-[10px] text-amber-900/60 font-medium leading-relaxed">
                                    Physical inspection is required. Only pay the fee via this platform to ensure your appointment is logged in our registry.
                                </p>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </>
    );
}
