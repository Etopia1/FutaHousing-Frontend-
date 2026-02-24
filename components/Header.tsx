import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { logout } from '../store/slices/authSlice';
import { FiLogOut, FiLogIn, FiUserPlus, FiGrid, FiShield, FiSearch, FiMenu, FiX, FiHome, FiMapPin } from 'react-icons/fi';
import { useState, useEffect } from 'react';

const Header = () => {
    const dispatch = useAppDispatch();
    const router = useRouter();
    const { user } = useAppSelector((state) => state.auth);

    const [mounted, setMounted] = useState(false);
    const [search, setSearch] = useState('');
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Close menu when route changes
    useEffect(() => {
        setIsMenuOpen(false);
    }, [router.pathname]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (search.trim()) {
            router.push(`/hostels?search=${encodeURIComponent(search)}`);
            setSearch('');
            setIsMenuOpen(false);
        }
    };

    const handleLogout = () => {
        dispatch(logout());
        router.push('/auth/login');
    };

    return (
        <header className="bg-white/80 backdrop-blur-xl border-b border-slate-100 sticky top-0 z-[100]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-20">

                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition group shrink-0">
                        <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center shadow-sm group-hover:rotate-3 transition-transform border border-indigo-100/50">
                            <Image src="/logo.png" alt="FUTA Housing" width={28} height={28} priority />
                        </div>
                        <span className="text-lg sm:text-xl font-black text-slate-900 tracking-tighter uppercase italic">FUTA Housing</span>
                    </Link>

                    {/* Compact Search Bar - Desktop Only */}
                    <div className="hidden lg:flex flex-1 max-w-sm xl:max-w-lg mx-8 xl:mx-12">
                        <form onSubmit={handleSearch} className="relative w-full group">
                            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors z-10" />
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search hostels, locations..."
                                className="w-full h-11 bg-slate-50 border border-slate-100 rounded-xl pl-12 pr-4 text-[11px] font-bold text-slate-700 focus:outline-none focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/5 transition-all outline-none"
                            />
                        </form>
                    </div>

                    {/* Nav Links - Desktop Only */}
                    <nav className="hidden md:flex items-center gap-6 xl:gap-8">
                        <Link href="/hostels"
                            className={`text-[11px] font-black uppercase tracking-widest transition ${router.pathname.startsWith('/hostels') ? 'text-indigo-600' : 'text-slate-500 hover:text-indigo-600'}`}>
                            Browse
                        </Link>
                        {mounted && user && (
                            <Link href="/dashboard"
                                className={`text-[11px] font-black uppercase tracking-widest transition flex items-center gap-1.5 ${router.pathname === '/dashboard' ? 'text-indigo-600' : 'text-slate-500 hover:text-indigo-600'}`}>
                                <FiGrid className="text-xs" /> Dashboard
                            </Link>
                        )}
                    </nav>

                    {/* Auth & Menu Toggle */}
                    <div className="flex items-center gap-3 sm:gap-4 ml-4 sm:ml-8 md:border-l md:border-slate-100 md:pl-8">
                        {!mounted ? (
                            <div className="w-20 h-8 bg-slate-100 animate-pulse rounded-xl" />
                        ) : user ? (
                            <div className="flex items-center gap-2 sm:gap-3">
                                <div className="text-right hidden sm:block">
                                    <p className="text-[10px] font-black text-slate-900 leading-none">{user.name.split(' ')[0]}</p>
                                    <p className="text-[7px] font-black text-indigo-500 uppercase tracking-widest mt-1">Active</p>
                                </div>
                                <Link href="/dashboard" className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-slate-950 flex items-center justify-center text-white text-xs font-black hover:bg-black transition-all shadow-lg shadow-black/10 shrink-0">
                                    {user.name.charAt(0)}
                                </Link>
                                <button onClick={handleLogout}
                                    className="p-2 sm:p-2.5 bg-slate-50 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-xl transition border border-slate-100 shrink-0">
                                    <FiLogOut size={16} />
                                </button>
                            </div>
                        ) : (
                            <div className="flex items-center gap-4">
                                <Link href="/auth/login"
                                    className="hidden sm:block text-[11px] font-black uppercase tracking-widest text-slate-500 hover:text-indigo-600 transition">
                                    Login
                                </Link>
                                <Link href="/auth/register"
                                    className="bg-slate-900 hover:bg-black text-white text-[10px] sm:text-[11px] font-black uppercase tracking-widest px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl transition shadow-lg shadow-black/10 whitespace-nowrap">
                                    Get Started
                                </Link>
                            </div>
                        )}

                        {/* Mobile Menu Toggle */}
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="md:hidden p-2.5 bg-slate-100 text-slate-600 rounded-xl hover:bg-slate-200 transition-colors"
                        >
                            {isMenuOpen ? <FiX size={20} /> : <FiMenu size={20} />}
                        </button>
                    </div>
                </div>

                {/* Mobile Menu Dropdown */}
                {isMenuOpen && (
                    <div className="md:hidden py-6 border-t border-slate-100 animate-in slide-in-from-top-2 duration-300">
                        {/* Mobile Search */}
                        <form onSubmit={handleSearch} className="relative w-full mb-6">
                            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search hostels..."
                                className="w-full h-12 bg-slate-50 border border-slate-100 rounded-2xl pl-12 pr-4 text-sm font-bold text-slate-700 focus:outline-none focus:border-indigo-500 focus:bg-white transition-all shadow-sm"
                            />
                        </form>

                        {/* Mobile Links */}
                        <div className="space-y-2">
                            <Link href="/hostels" className="flex items-center gap-4 p-4 rounded-2xl hover:bg-slate-50 transition-all font-black uppercase text-[11px] tracking-widest text-slate-600 hover:text-indigo-600">
                                <FiMapPin className="text-lg" /> Browse Hostels
                            </Link>
                            {user && (
                                <Link href="/dashboard" className="flex items-center gap-4 p-4 rounded-2xl hover:bg-slate-50 transition-all font-black uppercase text-[11px] tracking-widest text-indigo-600">
                                    <FiGrid className="text-lg" /> Dashboard
                                </Link>
                            )}
                            {!user && (
                                <Link href="/auth/login" className="flex items-center gap-4 p-4 rounded-2xl hover:bg-slate-50 transition-all font-black uppercase text-[11px] tracking-widest text-slate-600">
                                    <FiLogIn className="text-lg" /> Member Login
                                </Link>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </header>
    );
};

export default Header;
