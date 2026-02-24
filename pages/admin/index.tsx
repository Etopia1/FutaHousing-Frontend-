'use client';
import { useEffect, useState } from 'react';
import api from '../../lib/apiClient';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Image from 'next/image';
import { toast } from 'react-toastify';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend, LineChart, Line,
} from 'recharts';
import {
    FiUsers, FiHome, FiFileText, FiGrid, FiLogOut,
    FiCheckCircle, FiXCircle, FiBook, FiTrendingUp,
    FiCheck
} from 'react-icons/fi';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { logout } from '../../store/slices/authSlice';
import {
    fetchAdminStats, fetchAllUsers, verifyUserAction, rejectUserAction,
    fetchPendingDocs, reviewDoc, fetchAllBookings, fetchAllHostels, deleteHostelAction,
    fetchUserDocsAction, updateAdminBankAction, adminWithdrawAction
} from '../../store/slices/adminSlice';

type Tab = 'overview' | 'agents' | 'students' | 'documents' | 'bookings' | 'hostels' | 'payouts';

const COLORS = ['#7c3aed', '#06b6d4', '#f59e0b', '#ef4444', '#10b981'];

export default function AdminDashboard() {
    const dispatch = useAppDispatch();
    const router = useRouter();
    const { user } = useAppSelector((s) => s.auth);
    const { stats, users, pendingDocs, bookings, hostels, selectedUserDocs, loading } = useAppSelector((s) => s.admin);
    const [tab, setTab] = useState<Tab>('overview');
    const [search, setSearch] = useState('');
    const [roleFilter, setRoleFilter] = useState('');
    const [banks, setBanks] = useState<any[]>([]);
    const [withdrawAmount, setWithdrawAmount] = useState('');
    const [bankForm, setBankForm] = useState({ accountNumber: '', bankCode: '', bankName: '' });

    useEffect(() => {
        if (!user) { router.push('/auth/login'); return; }
        if (user.role !== 'ADMIN') { toast.error('Access denied'); router.push('/dashboard'); return; }
        dispatch(fetchAdminStats());
        dispatch(fetchAllUsers({}));
        dispatch(fetchPendingDocs());
        dispatch(fetchAllBookings());
        dispatch(fetchAllHostels());

        // Fetch Banks
        fetch('https://api.paystack.co/bank', {
            headers: { 'Authorization': `Bearer ${process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || 'pk_test_11a98df086b1cbacde8fd146f17de2e451874753'}` }
        }).then(res => res.json()).then(data => { if (data.status) setBanks(data.data); });
    }, [user, router, dispatch]);

    const handleVerify = async (id: string, name: string) => {
        await dispatch(verifyUserAction(id));
        toast.success(`${name} verified ✅`);
    };

    const handleReject = async (id: string, name: string) => {
        if (!window.confirm(`Warning: Rejecting ${name} will permanently delete their account and all uploaded documents from the database. This action cannot be undone. Proceed?`)) return;
        await dispatch(rejectUserAction(id));
        toast.info(`${name} has been rejected and permanently removed`);
    };

    const handleReviewDoc = async (id: string, status: 'APPROVED' | 'REJECTED') => {
        await dispatch(reviewDoc({ id, status }));
        toast.success(`Document ${status.toLowerCase()}`);
    };

    const [selectedUser, setSelectedUser] = useState<any>(null);

    const handleUserClick = (u: any) => {
        setSelectedUser(u);
        dispatch(fetchUserDocsAction(u._id));
    };

    const handleDeleteHostel = async (id: string, title: string) => {
        if (!window.confirm(`Are you sure you want to delete "${title}"?`)) return;
        await dispatch(deleteHostelAction(id));
        toast.info('Hostel deleted');
    };

    const handleLogout = () => { dispatch(logout()); router.push('/auth/login'); };

    const handleBankUpdate = async (e: any) => {
        e.preventDefault();
        const res = await dispatch(updateAdminBankAction(bankForm));
        if (updateAdminBankAction.fulfilled.match(res)) toast.success('Corporate bank account linked');
        else toast.error(res.payload as string);
    };

    const handleWithdraw = async (e: any) => {
        e.preventDefault();
        const amt = parseFloat(withdrawAmount);
        if (isNaN(amt) || amt <= 0) return toast.error('Enter valid amount');
        const res = await dispatch(adminWithdrawAction(amt));
        if (adminWithdrawAction.fulfilled.match(res)) {
            toast.success(`₦${amt.toLocaleString()} withdrawn to your bank`);
            setWithdrawAmount('');
        } else toast.error(res.payload as string);
    };

    // Filter users
    const filteredUsers = users.filter(u =>
        (!roleFilter || u.role === roleFilter) &&
        (!search || u.name?.toLowerCase().includes(search.toLowerCase()) || u.email?.toLowerCase().includes(search.toLowerCase()))
    );

    // Chart data
    const bookingStatusData = (stats?.bookingsByStatus || []).map((b: any) => ({
        name: b._id, value: b.count
    }));

    const userGrowthData = (stats?.userGrowth || []).map((g: any) => ({
        month: g._id, users: g.count
    }));

    const dailyRevenueData = (stats?.dailyRevenue || []).map((d: any) => ({
        date: d._id.split('-').slice(1).join('/'), amount: d.amount
    }));

    const identityStatsData = (stats?.identityStats || []).map((i: any, idx: number) => ({
        name: i._id === true ? 'AI PASSED' : i._id === false ? 'AI FAILED' : 'REJECTED/PENDING',
        value: i.count
    }));

    const navItems: { icon: any; label: string; id: Tab }[] = [
        { icon: FiGrid, label: 'Overview', id: 'overview' },
        { icon: FiHome, label: 'Verified Agents', id: 'agents' },
        { icon: FiCheckCircle, label: 'Renters/Students', id: 'students' },
        { icon: FiFileText, label: 'Documents', id: 'documents' },
        { icon: FiBook, label: 'Bookings', id: 'bookings' },
        { icon: FiHome, label: 'Hostels', id: 'hostels' },
        { icon: FiTrendingUp, label: 'Corporate Treasury', id: 'payouts' },
    ];

    if (!user || user.role !== 'ADMIN') return null;

    const statCards = [
        { label: 'Platform Users', value: stats?.totalUsers || 0, icon: '👥', color: 'from-violet-600 to-violet-800' },
        { label: 'Active Students', value: stats?.totalStudents || 0, icon: '🎓', color: 'from-cyan-600 to-cyan-800' },
        { label: 'Verified Agents', value: stats?.totalAgents || 0, icon: '🏘️', color: 'from-amber-500 to-amber-700' },
        { label: 'Escrow Funds', value: `₦${(stats?.escrowBalance || 0).toLocaleString()}`, icon: '🔒', color: 'from-pink-600 to-pink-800' },
        { label: 'Total Hostels', value: stats?.totalHostels || 0, icon: '🏠', color: 'from-emerald-500 to-emerald-700' },
        { label: 'Pending Reviews', value: stats?.pendingDocs || 0, icon: '⏳', color: 'from-orange-500 to-orange-700' },
    ];

    const setTabWithDismiss = (newTab: Tab) => {
        toast.dismiss();
        setTab(newTab);
    };

    return (
        <>
            <Head>
                <title>Admin Panel | FUTA Housing</title>
            </Head>

            <div className="min-h-screen bg-[#0f1117] text-white flex">

                {/* ── Sidebar ── */}
                <aside className="w-64 shrink-0 bg-[#161b27] border-r border-white/5 hidden lg:flex flex-col">
                    <div className="p-6 border-b border-white/5">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center shadow-xl border border-white/10 group-hover:rotate-6 transition-transform">
                                <Image src="/logo.png" alt="FUTA Housing" width={28} height={28} priority />
                            </div>
                            <div>
                                <p className="font-black text-sm uppercase italic tracking-tighter text-white">Admin Panel</p>
                                <p className="text-white/30 text-[10px] font-bold uppercase tracking-widest">FUTA Housing</p>
                            </div>
                        </div>
                    </div>

                    <div className="p-4 m-4 rounded-2xl bg-gradient-to-br from-violet-600/20 to-cyan-600/20 border border-white/10">
                        <p className="font-bold text-sm">{user.name}</p>
                        <p className="text-xs text-white/40">{user.email}</p>
                        <span className="mt-2 inline-block bg-violet-500/30 text-violet-300 text-xs font-bold px-2.5 py-0.5 rounded-full">SUPER ADMIN</span>
                    </div>

                    <nav className="flex-1 px-4 space-y-1">
                        {navItems.map((item) => (
                            <button key={item.id} onClick={() => setTabWithDismiss(item.id)}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${tab === item.id ? 'bg-violet-600/20 text-violet-400' : 'text-white/50 hover:text-white hover:bg-white/5'}`}>
                                <item.icon className="text-base" /> {item.label}
                            </button>
                        ))}
                    </nav>

                    <div className="p-4 border-t border-white/5">
                        <button onClick={handleLogout}
                            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 transition text-sm font-medium">
                            <FiLogOut /> Sign Out
                        </button>
                    </div>
                </aside>

                {/* ── Content ── */}
                <div className="flex-1 flex flex-col min-w-0">
                    <header className="bg-[#0f1117]/80 backdrop-blur-md border-b border-white/5 px-8 py-5">
                        <h1 className="text-xl font-black capitalize">
                            {tab === 'overview' ? '📊 Dashboard Overview'
                                : tab === 'agents' ? '🏘️ Agent Management'
                                    : tab === 'students' ? '🎓 Renter Management'
                                        : tab === 'documents' ? '📄 Verification Documents'
                                            : tab === 'hostels' ? '🏠 Hostel Registry'
                                                : '📋 All Bookings'}
                        </h1>
                        <p className="text-white/30 text-sm mt-0.5">Logged in as Super Admin</p>
                    </header>

                    <main className="flex-1 overflow-y-auto p-8 space-y-8">

                        {/* ════════ OVERVIEW TAB ════════ */}
                        {tab === 'overview' && (
                            <>
                                {/* Stats Cards */}
                                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
                                    {statCards.map((card) => (
                                        <div key={card.label} className={`p-5 rounded-2xl bg-gradient-to-br ${card.color} relative overflow-hidden`}>
                                            <div className="absolute -right-3 -top-3 text-5xl opacity-20">{card.icon}</div>
                                            <p className="text-white/70 text-xs font-semibold mb-1">{card.label}</p>
                                            <p className="text-3xl font-black">{loading ? '—' : card.value.toLocaleString()}</p>
                                        </div>
                                    ))}
                                </div>

                                {/* Platform Treasury */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="p-6 rounded-3xl bg-gradient-to-br from-emerald-600/20 to-emerald-600/5 border border-emerald-500/20 flex flex-col justify-between gap-4">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 flex items-center justify-center text-3xl">💰</div>
                                                <div>
                                                    <p className="text-white/40 text-xs font-bold uppercase tracking-wider">Gross Platform Revenue</p>
                                                    <p className="text-3xl font-black text-white">₦{(stats?.totalRevenue || 0).toLocaleString()}</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-emerald-400 text-xs font-black uppercase">5% Net Commission</p>
                                                <p className="text-xl font-black text-emerald-400">₦{(stats?.commissionRevenue || 0).toLocaleString()}</p>
                                            </div>
                                        </div>
                                        <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                                            <p className="text-xs text-white/40 font-bold uppercase">Total Inspection Fees (Inspect)</p>
                                            <p className="text-sm font-black text-emerald-400/80">₦{(stats?.totalInspectionRevenue || 0).toLocaleString()}</p>
                                        </div>
                                    </div>

                                    <div className="p-6 rounded-3xl bg-gradient-to-br from-violet-600/20 to-violet-600/5 border border-violet-500/20 flex items-center gap-4">
                                        <div className="w-14 h-14 rounded-2xl bg-violet-500/20 flex items-center justify-center text-3xl">🛡️</div>
                                        <div>
                                            <p className="text-white/40 text-xs font-bold uppercase tracking-wider">Active Escrow Balance</p>
                                            <p className="text-3xl font-black text-violet-400">₦{(stats?.escrowBalance || 0).toLocaleString()}</p>
                                            <p className="text-[10px] text-white/30 italic">Held funds for pending bookings</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Charts */}
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    {/* User Growth */}
                                    <div className="p-6 rounded-3xl bg-[#161b27] border border-white/5 shadow-2xl">
                                        <div className="flex items-center justify-between mb-6">
                                            <h3 className="font-bold text-white/70 flex items-center gap-2"><FiTrendingUp /> User Acquisition</h3>
                                            <span className="text-[10px] font-black px-2 py-1 bg-violet-500/10 text-violet-400 rounded-lg uppercase">Last 6 Months</span>
                                        </div>
                                        {userGrowthData.length > 0 ? (
                                            <ResponsiveContainer width="100%" height={220}>
                                                <LineChart data={userGrowthData}>
                                                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                                                    <XAxis dataKey="month" stroke="#ffffff20" tick={{ fontSize: 10, fontWeight: 'bold' }} />
                                                    <YAxis stroke="#ffffff20" tick={{ fontSize: 10, fontWeight: 'bold' }} />
                                                    <Tooltip contentStyle={{ background: '#1a1f2e', border: '1px solid #ffffff10', borderRadius: '16px', boxShadow: '0 20px 50px rgba(0,0,0,0.5)' }} />
                                                    <Line type="monotone" dataKey="users" stroke="#7c3aed" strokeWidth={4} dot={{ r: 4, fill: '#7c3aed', strokeWidth: 2, stroke: '#161b27' }} activeDot={{ r: 6 }} />
                                                </LineChart>
                                            </ResponsiveContainer>
                                        ) : (
                                            <div className="h-48 flex items-center justify-center text-white/20 text-sm italic">Initializing acquisition data...</div>
                                        )}
                                    </div>

                                    {/* Daily Revenue Trend */}
                                    <div className="p-6 rounded-3xl bg-[#161b27] border border-white/5 shadow-2xl">
                                        <div className="flex items-center justify-between mb-6">
                                            <h3 className="font-bold text-white/70 flex items-center gap-2">📈 Revenue Trend</h3>
                                            <span className="text-[10px] font-black px-2 py-1 bg-emerald-500/10 text-emerald-400 rounded-lg uppercase">Daily (30 Days)</span>
                                        </div>
                                        {dailyRevenueData.length > 0 ? (
                                            <ResponsiveContainer width="100%" height={220}>
                                                <BarChart data={dailyRevenueData}>
                                                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                                                    <XAxis dataKey="date" stroke="#ffffff20" tick={{ fontSize: 9 }} />
                                                    <YAxis stroke="#ffffff20" tick={{ fontSize: 10 }} />
                                                    <Tooltip cursor={{ fill: '#ffffff05' }} contentStyle={{ background: '#1a1f2e', border: '1px solid #ffffff10', borderRadius: '16px' }} />
                                                    <Bar dataKey="amount" fill="#10b981" radius={[4, 4, 0, 0]} />
                                                </BarChart>
                                            </ResponsiveContainer>
                                        ) : (
                                            <div className="h-48 flex items-center justify-center text-white/20 text-sm italic">Waiting for confirmed bookings...</div>
                                        )}
                                    </div>

                                    {/* Scam Intelligence / Identity Stats */}
                                    <div className="p-6 rounded-3xl bg-[#161b27] border border-white/5 shadow-2xl">
                                        <div className="flex items-center justify-between mb-6">
                                            <h3 className="font-bold text-white/70 flex items-center gap-2">🧠 AI Scam Intelligence</h3>
                                            <span className="text-[10px] font-black px-2 py-1 bg-red-500/10 text-red-400 rounded-lg uppercase">Identity Health</span>
                                        </div>
                                        <div className="flex flex-col md:flex-row items-center gap-4">
                                            <div className="w-full md:w-1/2">
                                                <ResponsiveContainer width="100%" height={200}>
                                                    <PieChart>
                                                        <Pie data={identityStatsData} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                                                            {identityStatsData.map((_: any, index: number) => (
                                                                <Cell key={`cell-${index}`} fill={index === 0 ? '#10b981' : '#ef4444'} />
                                                            ))}
                                                        </Pie>
                                                        <Tooltip contentStyle={{ background: '#1a1f2e', border: '1px solid #ffffff10', borderRadius: '16px' }} />
                                                    </PieChart>
                                                </ResponsiveContainer>
                                            </div>
                                            <div className="w-full md:w-1/2 space-y-3">
                                                {identityStatsData.map((d: any, i: number) => (
                                                    <div key={d.name} className="flex items-center justify-between p-3 rounded-2xl bg-white/5 border border-white/5">
                                                        <div className="flex items-center gap-2">
                                                            <div className={`w-2 h-2 rounded-full ${i === 0 ? 'bg-emerald-500' : 'bg-red-500'}`} />
                                                            <span className="text-xs font-bold text-white/60">{d.name}</span>
                                                        </div>
                                                        <span className="text-sm font-black">{d.value}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Booking Breakdown */}
                                    <div className="p-6 rounded-3xl bg-[#161b27] border border-white/5 shadow-2xl">
                                        <h3 className="font-bold text-white/70 mb-6 flex items-center gap-2">📊 Booking Lifecycle</h3>
                                        <ResponsiveContainer width="100%" height={220}>
                                            <PieChart>
                                                <Pie data={bookingStatusData} cx="50%" cy="50%" innerRadius={10} outerRadius={80} dataKey="value">
                                                    {bookingStatusData.map((_: any, index: number) => (
                                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                    ))}
                                                </Pie>
                                                <Tooltip contentStyle={{ background: '#161b27', border: '1px solid #ffffff15', borderRadius: '12px' }} />
                                                <Legend iconType="circle" wrapperStyle={{ fontSize: '10px', fontWeight: 'bold' }} />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>

                                {/* Pending Docs Alert */}
                                {pendingDocs.length > 0 && (
                                    <div className="p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <span className="text-2xl">⏳</span>
                                            <div>
                                                <p className="font-bold text-amber-400">{pendingDocs.length} Pending Document{pendingDocs.length > 1 ? 's' : ''}</p>
                                                <p className="text-white/40 text-sm">Require your review</p>
                                            </div>
                                        </div>
                                        <button onClick={() => setTabWithDismiss('documents')}
                                            className="bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 font-semibold text-sm px-4 py-2 rounded-xl transition">
                                            Review Now →
                                        </button>
                                    </div>
                                )}
                            </>
                        )}

                        {/* ════════ AGENTS & STUDENTS TABS ════════ */}
                        {(tab === 'agents' || tab === 'students') && (
                            <>
                                {/* Search & Sub-header */}
                                <div className="flex flex-col sm:flex-row items-end justify-between gap-4">
                                    <div className="relative flex-1 max-w-lg">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30 text-sm">🔍</span>
                                        <input value={search} onChange={(e) => setSearch(e.target.value)}
                                            placeholder={`Search ${tab === 'agents' ? 'agents' : 'renters'} by name or email...`}
                                            className="w-full pl-9 pr-4 py-2.5 bg-[#161b27] border border-white/10 rounded-xl text-sm text-white placeholder-white/30 focus:outline-none focus:border-violet-500" />
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[10px] font-black text-white/30 uppercase tracking-widest">Total {tab === 'agents' ? 'Agents' : 'Renters'}</p>
                                        <p className="text-2xl font-black text-violet-400">
                                            {users.filter(u => u.role === (tab === 'agents' ? 'AGENT' : 'STUDENT')).length}
                                        </p>
                                    </div>
                                </div>

                                {/* Table */}
                                <div className="rounded-3xl bg-[#161b27] border border-white/5 overflow-hidden shadow-2xl">
                                    <div className="overflow-x-auto">
                                        <table className="w-full">
                                            <thead>
                                                <tr className="border-b border-white/5 bg-white/[0.02]">
                                                    <th className="text-left px-6 py-5 text-white/40 text-[10px] font-black uppercase tracking-widest">Identity Info</th>
                                                    <th className="text-left px-4 py-5 text-white/40 text-[10px] font-black uppercase tracking-widest">Access Status</th>
                                                    <th className="text-left px-4 py-5 text-white/40 text-[10px] font-black uppercase tracking-widest">Join Date</th>
                                                    <th className="text-right px-6 py-5 text-white/40 text-[10px] font-black uppercase tracking-widest">Administrative Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-white/5">
                                                {users
                                                    .filter(u => u.role === (tab === 'agents' ? 'AGENT' : 'STUDENT'))
                                                    .filter(u => !search || u.name?.toLowerCase().includes(search.toLowerCase()) || u.email?.toLowerCase().includes(search.toLowerCase()))
                                                    .map((u: any) => (
                                                        <tr key={u._id} onClick={() => handleUserClick(u)} className="hover:bg-white/[0.04] transition-all cursor-pointer group">
                                                            <td className="px-6 py-4">
                                                                <div className="flex items-center gap-4">
                                                                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-violet-500/20 to-cyan-500/20 border border-white/10 flex items-center justify-center font-black text-xs text-violet-400 group-hover:scale-110 transition relative overflow-hidden">
                                                                        {u.profilePicture ? (
                                                                            <img src={u.profilePicture.startsWith('http') ? u.profilePicture : `http://localhost:5000/${u.profilePicture.startsWith('/') ? u.profilePicture.substring(1) : u.profilePicture}`} alt="" className="w-full h-full object-cover" />
                                                                        ) : u.name?.charAt(0)}
                                                                    </div>
                                                                    <div>
                                                                        <p className="font-bold text-sm text-white/90">{u.name}</p>
                                                                        <p className="text-white/30 text-xs">{u.email}</p>
                                                                    </div>
                                                                </div>
                                                            </td>
                                                            <td className="px-4 py-4">
                                                                <span className={`text-[10px] font-black px-3 py-1 rounded-full border ${u.verificationStatus === 'APPROVED' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : u.verificationStatus === 'REJECTED' ? 'bg-red-500/10 text-red-400 border-red-500/20' : 'bg-amber-500/10 text-amber-400 border-amber-500/20'}`}>
                                                                    {u.verificationStatus}
                                                                </span>
                                                            </td>
                                                            <td className="px-4 py-4 text-white/40 text-xs font-medium">
                                                                {new Date(u.createdAt).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })}
                                                            </td>
                                                            <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                                                                <div className="flex items-center justify-end gap-2">
                                                                    {u.verificationStatus !== 'APPROVED' && (
                                                                        <button onClick={() => handleVerify(u._id, u.name)}
                                                                            className="flex items-center gap-1.5 bg-emerald-500 text-white text-[10px] font-black px-3 py-2 rounded-xl hover:bg-emerald-600 transition shadow-lg shadow-emerald-500/20">
                                                                            <FiCheckCircle className="text-xs" /> APPROVE
                                                                        </button>
                                                                    )}
                                                                    <button onClick={() => handleReject(u._id, u.name)}
                                                                        className="flex items-center gap-1.5 bg-red-500/10 text-red-400 text-[10px] font-black px-3 py-2 rounded-xl hover:bg-red-500 hover:text-white transition">
                                                                        <FiXCircle className="text-xs" /> PURGE
                                                                    </button>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    ))}
                                            </tbody>
                                        </table>
                                        {users.filter(u => u.role === (tab === 'agents' ? 'AGENT' : 'STUDENT')).length === 0 && (
                                            <div className="text-center py-24 text-white/10">
                                                <div className="text-6xl mb-4">📂</div>
                                                <p className="font-black text-sm uppercase tracking-widest">Database Empty</p>
                                                <p className="text-xs mt-1 italic">No {tab} records found matching your criteria</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </>
                        )}

                        {/* ════════ DOCUMENTS TAB ════════ */}
                        {tab === 'documents' && (
                            <div className="space-y-4">
                                {pendingDocs.length === 0 ? (
                                    <div className="rounded-2xl bg-[#161b27] border border-white/5 text-center py-20 text-white/20">
                                        <p className="text-5xl mb-3">📄</p>
                                        <p className="font-medium">No pending documents</p>
                                        <p className="text-sm mt-1">All documents have been reviewed</p>
                                    </div>
                                ) : (
                                    pendingDocs.map((doc: any) => (
                                        <div key={doc._id} className="p-5 rounded-2xl bg-[#161b27] border border-white/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-xl bg-amber-500/15 flex items-center justify-center text-xl">📎</div>
                                                <div>
                                                    <p className="font-bold text-sm">{doc.userId?.name || 'Unknown'}</p>
                                                    <p className="text-white/40 text-xs">{doc.userId?.email} · <span className="text-amber-400">{doc.type}</span></p>
                                                    <p className="text-white/20 text-xs mt-0.5">{new Date(doc.createdAt).toLocaleString()}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                {doc.fileUrl && (
                                                    <a href={doc.fileUrl.startsWith('http') ? doc.fileUrl : `http://localhost:5000/${doc.fileUrl.startsWith('/') ? doc.fileUrl.substring(1) : doc.fileUrl}`} target="_blank" rel="noreferrer"
                                                        className="text-cyan-400 hover:text-cyan-300 text-xs font-semibold px-3 py-1.5 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 transition">
                                                        View File ↗
                                                    </a>
                                                )}
                                                <button onClick={() => handleReviewDoc(doc._id, 'APPROVED')}
                                                    className="flex items-center gap-1 bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 text-sm font-semibold px-4 py-1.5 rounded-lg transition">
                                                    <FiCheckCircle /> Approve
                                                </button>
                                                <button onClick={() => handleReviewDoc(doc._id, 'REJECTED')}
                                                    className="flex items-center gap-1 bg-red-500/15 hover:bg-red-500/25 text-red-400 text-sm font-semibold px-4 py-1.5 rounded-lg transition">
                                                    <FiXCircle /> Reject
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        )}

                        {/* ════════ BOOKINGS TAB ════════ */}
                        {tab === 'bookings' && (
                            <div className="rounded-2xl bg-[#161b27] border border-white/5 overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="border-b border-white/5">
                                                <th className="text-left px-6 py-4 text-white/40 text-xs font-semibold uppercase">Student</th>
                                                <th className="text-left px-4 py-4 text-white/40 text-xs font-semibold uppercase">Hostel</th>
                                                <th className="text-left px-4 py-4 text-white/40 text-xs font-semibold uppercase">Amount</th>
                                                <th className="text-left px-4 py-4 text-white/40 text-xs font-semibold uppercase">Status</th>
                                                <th className="text-left px-4 py-4 text-white/40 text-xs font-semibold uppercase">Date</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-white/5">
                                            {bookings.map((b: any) => (
                                                <tr key={b._id} className="hover:bg-white/[0.02] transition">
                                                    <td className="px-6 py-4">
                                                        <p className="font-semibold text-sm">{b.studentId?.name || '—'}</p>
                                                        <p className="text-white/30 text-xs">{b.studentId?.email}</p>
                                                    </td>
                                                    <td className="px-4 py-4">
                                                        <p className="font-semibold text-sm">{b.hostelId?.title || '—'}</p>
                                                        <p className="text-white/30 text-xs">{b.hostelId?.location}</p>
                                                    </td>
                                                    <td className="px-4 py-4 font-bold text-violet-400">₦{b.amount?.toLocaleString()}</td>
                                                    <td className="px-4 py-4">
                                                        <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${b.status === 'CONFIRMED' ? 'bg-emerald-500/20 text-emerald-400' : b.status === 'CANCELLED' ? 'bg-red-500/20 text-red-400' : 'bg-amber-500/20 text-amber-400'}`}>
                                                            {b.status}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-4 text-white/30 text-xs">
                                                        {new Date(b.createdAt).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                    {bookings.length === 0 && (
                                        <div className="text-center py-16 text-white/20">
                                            <p className="text-4xl mb-3">📋</p>
                                            <p>No bookings yet</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* ════════ HOSTELS TAB ════════ */}
                        {tab === 'hostels' && (
                            <div className="rounded-2xl bg-[#161b27] border border-white/5 overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="border-b border-white/5">
                                                <th className="text-left px-6 py-4 text-white/40 text-xs font-semibold uppercase">Hostel</th>
                                                <th className="text-left px-4 py-4 text-white/40 text-xs font-semibold uppercase">Agent</th>
                                                <th className="text-left px-4 py-4 text-white/40 text-xs font-semibold uppercase">Pricing</th>
                                                <th className="text-left px-4 py-4 text-white/40 text-xs font-semibold uppercase">Status</th>
                                                <th className="text-right px-6 py-4 text-white/40 text-xs font-semibold uppercase">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-white/5">
                                            {hostels.map((h: any) => (
                                                <tr key={h._id} className="hover:bg-white/[0.02] transition">
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-3">
                                                            {h.images?.[0] ? (
                                                                <Image src={h.images[0].startsWith('http') ? h.images[0] : `http://localhost:5000/${h.images[0]}`} alt="" width={40} height={40} className="rounded-lg object-cover w-10 h-10" />
                                                            ) : (
                                                                <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center text-xl">🏠</div>
                                                            )}
                                                            <div>
                                                                <p className="font-semibold text-sm">{h.title}</p>
                                                                <p className="text-white/30 text-xs">{h.location}</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-4">
                                                        <p className="text-sm font-medium">{h.agentId?.name || '—'}</p>
                                                        <p className="text-white/30 text-xs">{h.agentId?.email}</p>
                                                    </td>
                                                    <td className="px-4 py-4">
                                                        <p className="font-bold text-violet-400">₦{h.price?.toLocaleString()}</p>
                                                        <p className="text-[10px] text-white/30 uppercase font-black tracking-widest mt-0.5">Rent per Session</p>
                                                    </td>
                                                    <td className="px-4 py-4">
                                                        <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${h.isVerified ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-amber-500/10 border-amber-500/20 text-amber-400'}`}>
                                                            {h.isVerified ? 'VERIFIED' : 'PENDING'}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        <button onClick={() => handleDeleteHostel(h._id, h.title)}
                                                            className="p-2 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500/20 transition">
                                                            <FiXCircle />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                    {hostels.length === 0 && (
                                        <div className="text-center py-20 text-white/20">
                                            <p className="text-5xl mb-3">🏠</p>
                                            <p>No hostels registered yet</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* ════════ PAYOUTS TAB ════════ */}
                        {tab === 'payouts' && (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">

                                {/* Wallet & Withdrawal */}
                                <div className="space-y-6">
                                    <div className="p-8 rounded-[2.5rem] bg-gradient-to-br from-violet-600 to-indigo-800 shadow-2xl shadow-violet-500/20 relative overflow-hidden">
                                        <div className="absolute -right-10 -bottom-10 text-[12rem] opacity-10">💰</div>
                                        <p className="text-white/60 text-xs font-black uppercase tracking-widest mb-2">Available for Withdrawal</p>
                                        <h2 className="text-5xl font-black mb-8">₦{(stats?.adminBalance || 0).toLocaleString()}</h2>

                                        <form onSubmit={handleWithdraw} className="relative z-10 flex gap-2">
                                            <div className="relative flex-1">
                                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 font-bold">₦</span>
                                                <input type="number" value={withdrawAmount} onChange={(e) => setWithdrawAmount(e.target.value)}
                                                    placeholder="Enter amount"
                                                    className="w-full bg-white/10 border border-white/20 rounded-2xl py-4 pl-10 pr-4 text-white font-bold placeholder-white/30 focus:outline-none focus:bg-white/20 transition" />
                                            </div>
                                            <button type="submit" className="px-8 bg-white text-violet-600 font-black rounded-2xl hover:bg-violet-50 transition shadow-xl">
                                                WITHDRAW
                                            </button>
                                        </form>
                                        <p className="mt-4 text-[10px] text-white/40 italic font-medium">Payouts are processed instantly to your linked bank account.</p>
                                    </div>

                                    <div className="p-6 rounded-3xl bg-[#161b27] border border-white/5 space-y-4">
                                        <h3 className="font-bold text-white/70 flex items-center gap-2">📜 Recent Treasury Actions</h3>
                                        <div className="space-y-3">
                                            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 flex justify-between items-center">
                                                <div>
                                                    <p className="text-sm font-bold text-white/80">Commission Realization</p>
                                                    <p className="text-[10px] text-white/30 lowercase">Automatic platform split</p>
                                                </div>
                                                <p className="text-emerald-400 font-bold text-sm">+₦{(stats?.commissionRevenue || 0).toLocaleString()}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Bank Configuration */}
                                <div className="space-y-6">
                                    <div className="p-8 rounded-[2.5rem] bg-[#161b27] border border-white/5 shadow-2xl">
                                        <div className="flex items-center justify-between mb-8">
                                            <div>
                                                <h3 className="text-xl font-black text-white">Settlement Bank</h3>
                                                <p className="text-white/30 text-xs font-medium">Where your profits are deposited</p>
                                            </div>
                                            <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-2xl">🏦</div>
                                        </div>

                                        {stats?.adminBankDetails ? (
                                            <div className="mb-8 p-6 rounded-3xl bg-violet-500/5 border border-violet-500/10 flex items-center justify-between">
                                                <div>
                                                    <p className="text-[10px] font-black text-violet-400 uppercase tracking-widest mb-1">Active Payout account</p>
                                                    <p className="text-lg font-black text-white">{stats.adminBankDetails.accountName}</p>
                                                    <p className="text-sm text-white/40 font-bold">{stats.adminBankDetails.bankName} · {stats.adminBankDetails.accountNumber}</p>
                                                </div>
                                                <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                                                    <FiCheck />
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="mb-8 p-6 rounded-3xl bg-amber-500/5 border border-amber-500/10 text-center">
                                                <p className="text-amber-400 font-bold text-sm">No bank account linked yet</p>
                                                <p className="text-white/30 text-[10px] mt-1">Add details below to receive realizations</p>
                                            </div>
                                        )}

                                        <form onSubmit={handleBankUpdate} className="space-y-4">
                                            <div className="space-y-1.5">
                                                <label className="text-[10px] font-black text-white/30 uppercase tracking-widest ml-1">Select Bank</label>
                                                <select value={bankForm.bankName} onChange={(e) => {
                                                    const bank = banks.find(b => b.name === e.target.value);
                                                    setBankForm({ ...bankForm, bankName: e.target.value, bankCode: bank?.code || '' });
                                                }}
                                                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-4 text-white text-sm font-bold focus:outline-none focus:border-violet-500 transition">
                                                    <option value="" className="bg-[#161b27]">Select Corporate Bank</option>
                                                    {banks.map(b => <option key={b.id} value={b.name} className="bg-[#161b27]">{b.name}</option>)}
                                                </select>
                                            </div>

                                            <div className="space-y-1.5">
                                                <label className="text-[10px] font-black text-white/30 uppercase tracking-widest ml-1">Account Number</label>
                                                <input type="text" value={bankForm.accountNumber} onChange={(e) => setBankForm({ ...bankForm, accountNumber: e.target.value })}
                                                    placeholder="10-digit account number"
                                                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-4 text-white text-sm font-bold placeholder-white/20 focus:outline-none focus:border-violet-500 transition" />
                                            </div>

                                            <button type="submit"
                                                className="w-full py-4 bg-violet-600 hover:bg-violet-500 text-white font-black rounded-2xl transition shadow-xl shadow-violet-600/20 mt-4 uppercase tracking-widest text-xs">
                                                Link Settlement Account
                                            </button>
                                        </form>
                                    </div>
                                </div>
                            </div>
                        )}

                    </main>
                </div>

                {/* ── User Detail Modal ── */}
                {selectedUser && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setSelectedUser(null)}></div>
                        <div className="relative w-full max-w-4xl bg-[#161b27] border border-white/10 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
                            <header className="p-6 border-b border-white/5 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center text-2xl font-black relative overflow-hidden">
                                        {selectedUser.profilePicture ? (
                                            <img src={selectedUser.profilePicture.startsWith('http') ? selectedUser.profilePicture : `http://localhost:5000/${selectedUser.profilePicture.startsWith('/') ? selectedUser.profilePicture.substring(1) : selectedUser.profilePicture}`} alt="" className="w-full h-full object-cover" />
                                        ) : selectedUser.name?.charAt(0)}
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-black">{selectedUser.name}</h2>
                                        <p className="text-white/40 text-sm">{selectedUser.email}</p>
                                        <span className={`mt-1 inline-block text-[10px] font-black px-2 py-0.5 rounded-full border ${selectedUser.role === 'AGENT' ? 'bg-amber-500/10 border-amber-500/20 text-amber-400' : 'bg-cyan-500/10 border-cyan-500/20 text-cyan-400'}`}>{selectedUser.role}</span>
                                    </div>
                                </div>
                                <button onClick={() => setSelectedUser(null)} className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center transition text-white/50 hover:text-white">
                                    <FiXCircle className="text-xl" />
                                </button>
                            </header>

                            <div className="flex-1 overflow-y-auto p-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
                                {/* Left Side: Profile Info */}
                                <div className="space-y-6">
                                    <section>
                                        <h3 className="text-white/30 text-[10px] font-black uppercase tracking-widest mb-3">Core Information</h3>
                                        <div className="space-y-3">
                                            {selectedUser.businessName && (
                                                <div className="p-4 rounded-2xl bg-violet-500/10 border border-violet-500/20">
                                                    <p className="text-violet-400/50 text-[10px] uppercase font-bold">Business Name</p>
                                                    <p className="font-bold text-violet-400">{selectedUser.businessName}</p>
                                                </div>
                                            )}
                                            <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                                                <p className="text-white/30 text-[10px] uppercase font-bold">Phone Number</p>
                                                <p className="font-semibold">{selectedUser.phone || 'N/A'}</p>
                                            </div>
                                            <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                                                <p className="text-white/30 text-[10px] uppercase font-bold">NIN / ID Number</p>
                                                <p className="font-semibold">{selectedUser.nin || selectedUser.idNumber || 'N/A'}</p>
                                            </div>
                                            <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                                                <p className="text-white/30 text-[10px] uppercase font-bold">Physical Address</p>
                                                <p className="font-semibold">{selectedUser.address || 'Not Provided'}</p>
                                            </div>
                                            <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                                                <p className="text-white/30 text-[10px] uppercase font-bold">Joined On</p>
                                                <p className="font-semibold">{new Date(selectedUser.createdAt).toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                    </section>

                                    {selectedUser.bankDetails && (
                                        <section>
                                            <h3 className="text-white/30 text-[10px] font-black uppercase tracking-widest mb-3">Bank Details</h3>
                                            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
                                                <p className="text-emerald-400/50 text-[10px] uppercase font-bold">{selectedUser.bankDetails.bankName}</p>
                                                <p className="font-bold text-lg">{selectedUser.bankDetails.accountNumber}</p>
                                                <p className="text-emerald-400/70 text-sm font-medium">{selectedUser.bankDetails.accountName}</p>
                                            </div>
                                        </section>
                                    )}

                                    {selectedUser.aiVerification && (
                                        <section>
                                            <div className="flex items-center justify-between mb-3">
                                                <h3 className="text-white/30 text-[10px] font-black uppercase tracking-widest">AI Identity Intelligence</h3>
                                                <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${selectedUser.aiVerification.passed ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                                                    {selectedUser.aiVerification.passed ? 'AI PASSED' : 'AI FAILED'}
                                                </span>
                                            </div>
                                            <div className={`p-4 rounded-2xl border ${selectedUser.aiVerification.passed ? 'bg-violet-500/10 border-violet-500/20' : 'bg-red-500/10 border-red-500/20'}`}>
                                                <div className="flex items-end justify-between mb-2">
                                                    <div>
                                                        <p className="text-white/30 text-[10px] uppercase font-bold">Similarity Score</p>
                                                        <p className={`text-2xl font-black ${selectedUser.aiVerification.passed ? 'text-violet-400' : 'text-red-400'}`}>
                                                            {selectedUser.aiVerification.similarityPercent}
                                                        </p>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-white/30 text-[10px] uppercase font-bold">Raw Score</p>
                                                        <p className="font-mono text-xs opacity-50">{selectedUser.aiVerification.score}</p>
                                                    </div>
                                                </div>
                                                <p className="text-xs text-white/50 leading-relaxed italic border-t border-white/5 pt-2 mt-2">
                                                    "{selectedUser.aiVerification.message}"
                                                </p>
                                            </div>
                                        </section>
                                    )}

                                    <div className="pt-4 space-y-3">
                                        <button onClick={() => { handleVerify(selectedUser._id, selectedUser.name); setSelectedUser(null); }}
                                            className="w-full py-4 rounded-2xl bg-emerald-500 text-black font-black hover:bg-emerald-400 transition shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2">
                                            <FiCheckCircle /> Verify Account
                                        </button>
                                        <button onClick={() => { handleReject(selectedUser._id, selectedUser.name); setSelectedUser(null); }}
                                            className="w-full py-4 rounded-2xl bg-white/5 text-red-500 font-bold hover:bg-red-500/10 transition border border-red-500/20">
                                            Reject Account
                                        </button>
                                    </div>
                                </div>

                                {/* Right Side: Documents */}
                                <div className="lg:col-span-2 space-y-6">
                                    <h3 className="text-white/30 text-[10px] font-black uppercase tracking-widest mb-3">Verification Documents</h3>
                                    {loading && selectedUserDocs.length === 0 ? (
                                        <div className="py-20 text-center text-white/20 italic">Loading documents...</div>
                                    ) : selectedUserDocs.length === 0 && !selectedUser.profilePicture && !selectedUser.ninImage ? (
                                        <div className="py-20 text-center rounded-3xl bg-white/5 border border-white/5 border-dashed text-white/20">
                                            No documents uploaded yet
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {/* Formal Documents */}
                                            {selectedUserDocs.map((doc: any) => (
                                                <div key={doc._id} className="p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-white/10 transition flex flex-col">
                                                    <div className="flex items-center justify-between mb-4">
                                                        <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${doc.status === 'APPROVED' ? 'bg-emerald-500/20 text-emerald-400' : doc.status === 'REJECTED' ? 'bg-red-500/20 text-red-400' : 'bg-amber-500/20 text-amber-400'}`}>
                                                            {doc.status}
                                                        </span>
                                                        <p className="text-xs font-bold text-white/50">{doc.type}</p>
                                                    </div>

                                                    <div className="relative aspect-video rounded-xl overflow-hidden bg-black/20 mb-4 group">
                                                        <Image src={doc.fileUrl.startsWith('http') ? doc.fileUrl : `http://localhost:5000/${doc.fileUrl.startsWith('/') ? doc.fileUrl.substring(1) : doc.fileUrl}`}
                                                            alt={doc.type} fill className="object-cover" />
                                                        <a href={doc.fileUrl.startsWith('http') ? doc.fileUrl : `http://localhost:5000/${doc.fileUrl.startsWith('/') ? doc.fileUrl.substring(1) : doc.fileUrl}`}
                                                            target="_blank" rel="noreferrer"
                                                            className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-sm font-black text-white">
                                                            View Full Image ↗
                                                        </a>
                                                    </div>

                                                    <div className="mt-auto flex items-center gap-2">
                                                        <button onClick={() => handleReviewDoc(doc._id, 'APPROVED')} disabled={doc.status === 'APPROVED'}
                                                            className="flex-1 py-2 rounded-xl bg-emerald-500/10 text-emerald-500 text-[10px] font-black hover:bg-emerald-500/20 disabled:opacity-30 disabled:grayscale transition">
                                                            APPROVE
                                                        </button>
                                                        <button onClick={() => handleReviewDoc(doc._id, 'REJECTED')} disabled={doc.status === 'REJECTED'}
                                                            className="flex-1 py-2 rounded-xl bg-red-500/10 text-red-500 text-[10px] font-black hover:bg-red-500/20 disabled:opacity-30 disabled:grayscale transition">
                                                            REJECT
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}

                                            {/* Registration Images Fallback (if not in docs) */}
                                            {selectedUserDocs.length === 0 && selectedUser.profilePicture && (
                                                <div className="p-4 rounded-2xl bg-white/5 border border-violet-500/20 flex flex-col">
                                                    <div className="flex items-center justify-between mb-4">
                                                        <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-violet-500/20 text-violet-400">REGISTRATION</span>
                                                        <p className="text-xs font-bold text-white/50">PROFILE PIC</p>
                                                    </div>
                                                    <div className="relative aspect-video rounded-xl overflow-hidden bg-black/20 mb-4 group">
                                                        <Image src={selectedUser.profilePicture} alt="Profile" fill className="object-cover" />
                                                        <a href={selectedUser.profilePicture} target="_blank" rel="noreferrer"
                                                            className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-sm font-black text-white">
                                                            View Full Image ↗
                                                        </a>
                                                    </div>
                                                    <p className="text-[10px] text-white/30 italic">Upload during signup</p>
                                                </div>
                                            )}

                                            {selectedUserDocs.length === 0 && selectedUser.ninImage && (
                                                <div className="p-4 rounded-2xl bg-white/5 border border-violet-500/20 flex flex-col">
                                                    <div className="flex items-center justify-between mb-4">
                                                        <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-violet-500/20 text-violet-400">REGISTRATION</span>
                                                        <p className="text-xs font-bold text-white/50">NIN IMAGE</p>
                                                    </div>
                                                    <div className="relative aspect-video rounded-xl overflow-hidden bg-black/20 mb-4 group">
                                                        <Image src={selectedUser.ninImage} alt="NIN" fill className="object-cover" />
                                                        <a href={selectedUser.ninImage} target="_blank" rel="noreferrer"
                                                            className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-sm font-black text-white">
                                                            View Full Image ↗
                                                        </a>
                                                    </div>
                                                    <p className="text-[10px] text-white/30 italic">Upload during signup</p>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}
