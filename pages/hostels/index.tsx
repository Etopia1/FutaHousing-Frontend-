'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';
import { FiMapPin, FiSearch, FiFilter, FiHome, FiArrowRight, FiShield, FiChevronLeft, FiGrid, FiTag } from 'react-icons/fi';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { fetchHostels } from '../../store/slices/hostelSlice';

const PROPERTY_TYPES = ['All', 'Self-Contained', 'One Bedroom Flat', 'Two Bedroom Flat', 'Three Bedroom Flat', 'Single Room', 'Shared Room', 'Mini Flat', 'Duplex', 'Penthouse', 'Bungalow'];

export default function HostelMarketplace() {
    const dispatch = useAppDispatch();
    const router = useRouter();
    const { hostels, loading } = useAppSelector((s) => s.hostels);
    const [search, setSearch] = useState('');
    const [selectedType, setSelectedType] = useState('All');

    useEffect(() => {
        dispatch(fetchHostels());
        if (router.query.search) {
            setSearch(router.query.search as string);
        }
    }, [dispatch, router.query.search]);

    const filteredHostels = hostels.filter(h => {
        const query = search.toLowerCase();
        const matchesSearch =
            h.title?.toLowerCase().includes(query) ||
            h.location?.toLowerCase().includes(query) ||
            h.propertyType?.toLowerCase().includes(query) ||
            h.description?.toLowerCase().includes(query);

        const matchesType = selectedType === 'All' || h.propertyType === selectedType;
        return matchesSearch && matchesType;
    });

    return (
        <>
            <Head>
                <title>Registry | FUTA Housing</title>
            </Head>

            <div className="min-h-screen bg-[#fcfdfe] text-slate-800 selection:bg-indigo-50 selection:text-indigo-900">
                {/* ── Header ───────────────────────────────────── */}
                <header className="h-20 border-b border-slate-100 bg-white/70 backdrop-blur-md fixed top-0 w-full z-50 px-6 flex items-center justify-between">
                    <Link href="/dashboard" className="flex items-center gap-2 group text-slate-400 hover:text-indigo-600 transition-all font-semibold text-xs uppercase tracking-wider">
                        <FiChevronLeft size={16} />
                        Back to Dashboard
                    </Link>

                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-indigo-50 rounded-xl flex items-center justify-center shadow-sm">
                            <Image src='/logo.png' width={24} height={24} alt="Logo" priority />
                        </div>
                        <span className="text-lg font-black text-slate-900 tracking-tight uppercase italic">FUTA Housing</span>
                    </div>

                    <div className="hidden md:flex items-center gap-6">
                        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Validated 2026 Registry</span>
                    </div>
                </header>

                <main className="pt-32 pb-20 px-6 max-w-6xl mx-auto">
                    {/* Hero Section - Muted & Clean */}
                    <div className="mb-12">
                        <h1 className="text-4xl font-bold text-slate-900 tracking-tight mb-2">Housing Discovery</h1>
                        <p className="text-slate-500 font-medium text-base">Find secure and verified accommodations across the FUTA ecosystem.</p>
                    </div>

                    {/* Filters & Search - Sleek Minimalist */}
                    <div className="flex flex-col md:flex-row gap-4 mb-10 items-center">
                        <div className="flex-1 relative group w-full">
                            <FiSearch className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-500 transition-colors" />
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search by area or property name..."
                                className="w-full h-14 bg-white border border-slate-200 rounded-2xl pl-12 pr-6 text-slate-900 focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 transition-all font-medium placeholder:text-slate-300 shadow-sm"
                            />
                        </div>

                        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
                            {PROPERTY_TYPES.map(type => (
                                <button
                                    key={type}
                                    onClick={() => setSelectedType(type)}
                                    className={`whitespace-nowrap px-4 py-2 rounded-xl text-[10px] font-bold transition-all border ${selectedType === type
                                        ? 'bg-slate-900 border-slate-900 text-white shadow-lg'
                                        : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'
                                        }`}
                                >
                                    {type}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Results Grid */}
                    {loading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {[1, 2, 3, 4, 5, 6].map(i => (
                                <div key={i} className="bg-white h-96 rounded-3xl border border-slate-100 animate-pulse shadow-sm" />
                            ))}
                        </div>
                    ) : (
                        <>
                            <div className="flex items-center justify-between mb-8">
                                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                    <FiGrid className="text-indigo-600" /> {filteredHostels.length} Units Found
                                </h3>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {filteredHostels.map((hostel: any) => (
                                    <Link
                                        href={`/hostels/${hostel._id || hostel.id}`}
                                        key={hostel._id || hostel.id}
                                        className="group"
                                    >
                                        <div className="bg-white border border-slate-100 rounded-[2.5rem] overflow-hidden hover:border-indigo-100 transition-all duration-500 hover:shadow-xl hover:shadow-indigo-500/5 flex flex-col h-full">
                                            <div className="h-60 relative overflow-hidden">
                                                {hostel.images?.[0] ? (
                                                    <Image
                                                        src={typeof hostel.images[0] === 'string' ? hostel.images[0] : hostel.images[0].url}
                                                        alt={typeof hostel.images[0] === 'object' ? hostel.images[0].description || hostel.title : hostel.title}
                                                        layout="fill"
                                                        objectFit="cover"
                                                        className="group-hover:scale-105 transition-transform duration-700"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full bg-slate-50 flex items-center justify-center">
                                                        <FiHome size={32} className="text-slate-200" />
                                                    </div>
                                                )}

                                                <div className="absolute top-4 left-4 flex gap-2">
                                                    <div className="bg-white/90 backdrop-blur-md text-emerald-600 text-[9px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-lg flex items-center gap-1.5 shadow-sm">
                                                        <FiShield size={12} /> Verified
                                                    </div>
                                                </div>

                                                {hostel.propertyType && (
                                                    <div className="absolute top-4 right-4 bg-slate-900/80 backdrop-blur-md text-white text-[9px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-lg">
                                                        {hostel.propertyType}
                                                    </div>
                                                )}
                                            </div>

                                            <div className="p-6 flex flex-col flex-1">
                                                <div className="flex items-center justify-between mb-2">
                                                    <h3 className="text-lg font-bold text-slate-900 group-hover:text-indigo-600 transition-colors truncate pr-4">
                                                        {hostel.title}
                                                    </h3>
                                                    <p className="text-base font-bold text-slate-900 whitespace-nowrap">₦{hostel.price.toLocaleString()}</p>
                                                </div>

                                                <div className="flex items-center gap-1.5 text-slate-400 text-xs font-semibold mb-6">
                                                    <FiMapPin className="text-indigo-500" />
                                                    <span className="truncate">{hostel.location}</span>
                                                </div>

                                                <div className="mt-auto flex items-center justify-between pt-5 border-t border-slate-50">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-500 uppercase">
                                                            {hostel.agentId?.name?.charAt(0) || 'A'}
                                                        </div>
                                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Agent Partner</span>
                                                    </div>

                                                    {hostel.inspectionFee > 0 && (
                                                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-indigo-500 bg-indigo-50 px-2.5 py-1.5 rounded-lg">
                                                            <FiTag size={12} /> Inspect: ₦{hostel.inspectionFee.toLocaleString()}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </>
                    )}

                    {!loading && filteredHostels.length === 0 && (
                        <div className="py-24 text-center">
                            <div className="w-16 h-16 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                                <FiHome size={24} className="text-slate-200" />
                            </div>
                            <h2 className="text-xl font-bold text-slate-900 mb-2">No results found</h2>
                            <p className="text-slate-400 text-sm font-medium">Try adjusting your filters or search terms.</p>
                            <button onClick={() => { setSearch(''); setSelectedType('All'); }} className="mt-8 text-indigo-600 font-bold uppercase tracking-widest text-[10px] hover:underline">Reset Filters</button>
                        </div>
                    )}
                </main>
            </div>
        </>
    );
}
