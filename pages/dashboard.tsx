'use client';
import { useEffect, useState, useCallback } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Image from 'next/image';
import { toast } from 'react-toastify';
import dynamic from 'next/dynamic';
import type { ComponentType } from 'react';
const AreaChart = dynamic(() => import('recharts').then(mod => ({ default: mod.AreaChart as unknown as ComponentType<any> })), { ssr: false });
const Area = dynamic(() => import('recharts').then(mod => ({ default: mod.Area as unknown as ComponentType<any> })), { ssr: false });
const XAxis = dynamic(() => import('recharts').then(mod => ({ default: mod.XAxis as unknown as ComponentType<any> })), { ssr: false });
const YAxis = dynamic(() => import('recharts').then(mod => ({ default: mod.YAxis as unknown as ComponentType<any> })), { ssr: false });
const CartesianGrid = dynamic(() => import('recharts').then(mod => ({ default: mod.CartesianGrid as unknown as ComponentType<any> })), { ssr: false });
const Tooltip = dynamic(() => import('recharts').then(mod => ({ default: mod.Tooltip as unknown as ComponentType<any> })), { ssr: false });
const ResponsiveContainer = dynamic(() => import('recharts').then(mod => ({ default: mod.ResponsiveContainer as unknown as ComponentType<any> })), { ssr: false });

import {
    FiHome, FiGrid, FiCreditCard, FiFileText, FiLogOut,
    FiShield, FiInfo, FiTrendingUp, FiPlusCircle, FiSearch, FiBell, FiArrowDownLeft, FiArrowUpRight, FiChevronRight, FiX, FiCheckCircle, FiActivity, FiClock, FiMapPin, FiCalendar, FiArrowRight, FiShieldOff, FiLock, FiMail, FiPhone, FiPlus, FiBox, FiUsers, FiDollarSign, FiMenu, FiEye, FiTarget, FiUser
} from 'react-icons/fi';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { logout, getProfile, saveBankDetails } from '../store/slices/authSlice';
import { fetchWallet, initializeFunding, verifyFunding } from '../store/slices/walletSlice';
import { fetchMyBookings, confirmBooking, cancelBooking } from '../store/slices/bookingSlice';
import { fetchMyInspections } from '../store/slices/inspectionSlice';
import api from '../lib/apiClient';
import { socketService } from '../lib/socket';
import AgentKycModal from '../components/AgentKycModal';
import MapPickerModal from '../components/MapPickerModal';
import Receipt from '../components/Receipt';
import Settings from '../components/Settings';
import { jsPDF } from 'jspdf';
import { toPng } from 'html-to-image';
import { Hostel, Booking, Inspection, Notification as INotification } from '../types/interfaces';

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || '';
const PROPERTY_TYPES = ['Single Room', 'Self-Contained', '1 Bedroom Flat', '2 Bedroom Flat', '3+ Bedroom Flat', 'Duplex', 'Studio', 'Penthouse'];
const TENANT_TYPES = ['Anyone', 'Students', 'Professionals', 'Families', 'Couples', 'Corporate'];

export default function Dashboard() {
    const dispatch = useAppDispatch();
    const router = useRouter();
    const { user } = useAppSelector((s) => s.auth);
    const { balance, escrowBalance, transactions, loading: wLoading } = useAppSelector((s) => s.wallet);
    const { bookings, loading: bLoading } = useAppSelector((s) => s.bookings);
    const { inspections } = useAppSelector((s) => s.inspections);

    const [mounted, setMounted] = useState(false);
    const [activeTab, setActiveTabState] = useState('overview');
    const setActiveTab = (tab: string) => {
        toast.dismiss();
        setActiveTabState(tab);
    };
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [showFundModal, setShowFundModal] = useState(false);
    const [fundAmount, setFundAmount] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [showKycModal, setShowKycModal] = useState(false);

    // Agent Specific State
    const [myHostels, setMyHostels] = useState<Hostel[]>([]);
    const [agentBookings, setAgentBookings] = useState<Booking[]>([]);
    const [agentInspections, setAgentInspections] = useState<Inspection[]>([]);
    const [agentLoading, setAgentLoading] = useState(false);
    const [selectedTransaction, setSelectedTransaction] = useState<any>(null);
    const [showReceiptModal, setShowReceiptModal] = useState(false);
    const [printLoading, setPrintLoading] = useState(false);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showMapPicker, setShowMapPicker] = useState(false);
    const [notifications, setNotifications] = useState<INotification[]>([]);
    const [showNotifications, setShowNotifications] = useState(false);
    const [notifLoading, setNotifLoading] = useState(false);
    const [showWithdrawModal, setShowWithdrawModal] = useState(false);
    const [withdrawForm, setWithdrawForm] = useState({
        amount: '',
        bankName: user?.bankDetails?.bankName || '',
        accountNumber: user?.bankDetails?.accountNumber || '',
        accountName: user?.bankDetails?.accountName || '',
        bankCode: user?.bankDetails?.bankCode || ''
    });
    const [propertyForm, setPropertyForm] = useState({
        title: '', location: '', description: '', price: '',
        rent: '', cautionFee: '0', agentFee: '0', totalPackage: '',
        category: 'Hostel', propertyType: 'Self-Contained',
        inspectionFee: '0', amenities: [] as string[], rules: [] as string[],
        preferredTenants: [] as string[],
        images: [] as { url: string; description: string }[],
        videos: [] as { url: string; description: string }[],
        longitude: undefined as number | undefined,
        latitude: undefined as number | undefined,
        damages: [] as {
            description: string;
            media: { url: string; type: 'image' | 'video' }[];
            status: 'Broken' | 'Pending' | 'Repaired';
            fineAmount: number;
        }[]
    });
    const [uploading, setUploading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [saveToProfile, setSaveToProfile] = useState(false);
    const [banks, setBanks] = useState<any[]>([]);
    const [loadingBanks, setLoadingBanks] = useState(false);
    const [addressSuggestions, setAddressSuggestions] = useState<any[]>([]);
    const [isSearchingAddress, setIsSearchingAddress] = useState(false);
    const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null);
    const [showSuggestions, setShowSuggestions] = useState(false);

    const handleDownloadReceipt = async () => {
        const element = document.getElementById('receipt-content');
        if (!element) return;
        setPrintLoading(true);
        try {
            const dataUrl = await toPng(element, { quality: 0.95, pixelRatio: 2 });
            const pdf = new jsPDF('p', 'mm', 'a4');
            const imgProps = pdf.getImageProperties(dataUrl);
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
            pdf.addImage(dataUrl, 'PNG', 0, 0, pdfWidth, pdfHeight);
            pdf.save(`Receipt-${selectedTransaction.id || selectedTransaction._id || 'transaction'}.pdf`);
            toast.success('Professional Receipt Secured');
        } catch (err) {
            console.error('PDF Generation Failure:', err);
            toast.error('Registry Sync Failed');
        } finally {
            setPrintLoading(false);
        }
    };

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

    const isAgent = user?.role === 'AGENT';

    const fetchAgentData = useCallback(async () => {
        setAgentLoading(true);
        try {
            const [hostelsRes, bookingsRes, inspectionsRes] = await Promise.all([
                api.get('/hostels/my-hostels'),
                api.get('/bookings/agent-bookings'),
                api.get('/inspections/agent-inspections')
            ]);
            setMyHostels(hostelsRes.data);
            setAgentBookings(bookingsRes.data);
            setAgentInspections(inspectionsRes.data);
        } catch (err) {
            console.error('Fetch Agent Data Error:', err);
            toast.error('Failed to load agent dashboard data');
        } finally {
            setAgentLoading(false);
        }
    }, []);

    useEffect(() => {
        if (showWithdrawModal && user?.bankDetails) {
            setWithdrawForm(prev => ({
                ...prev,
                bankName: user.bankDetails?.bankName || '',
                accountNumber: user.bankDetails?.accountNumber || '',
                accountName: user.bankDetails?.accountName || '',
                bankCode: user.bankDetails?.bankCode || ''
            }));
        }
    }, [showWithdrawModal, user?.bankDetails]);

    // Initial Load & Auth Sync
    useEffect(() => {
        setMounted(true);
        if (!user) {
            router.push('/auth/login');
            return;
        }
        dispatch(getProfile());
        dispatch(fetchWallet());

        if (isAgent) {
            fetchAgentData();
        } else {
            dispatch(fetchMyBookings());
            dispatch(fetchMyInspections());
        }
        fetchNotifications();
    }, [user?.id, router, dispatch, isAgent, fetchAgentData]);

    // Dedicated Socket Connection Lifecycle
    useEffect(() => {
        if (!mounted || !user?.id) return;

        socketService.connect(user.id);

        return () => {
            socketService.disconnect();
        };
    }, [mounted, user?.id]);

    // Socket Event Listeners
    useEffect(() => {
        if (!mounted || !user?.id) return;

        socketService.onNotification((newNotif) => {
            setNotifications(prev => [newNotif, ...prev]);
            toast.info(newNotif.title + ': ' + newNotif.message, {
                icon: <FiBell className="text-indigo-500" />
            });
        });

        return () => {
            socketService.offNotification();
        };
    }, [mounted, user?.id]);

    const fetchNotifications = async () => {
        try {
            const res = await api.get('/notifications');
            setNotifications(res.data);
        } catch (err) {
            console.error('Failed to fetch notifications');
        }
    };

    const markNotificationsAsRead = async () => {
        try {
            await api.put('/notifications/read');
            setNotifications(prev => prev.map(n => ({ ...n, read: true })));
        } catch (err) {
            console.error('Failed to mark notifications as read');
        }
    };

    // Handle Payment Verification on callback
    useEffect(() => {
        const { reference } = router.query;
        if (reference && mounted) {
            const verify = async () => {
                try {
                    toast.info('Verifying payment...', { autoClose: false, toastId: 'verify-tx' });
                    await dispatch(verifyFunding(reference as string)).unwrap();
                    toast.update('verify-tx', {
                        render: 'Wallet funded successfully!',
                        type: 'success',
                        autoClose: 5000,
                        isLoading: false
                    });
                    // Clear query from URL
                    router.replace('/dashboard', undefined, { shallow: true });
                    dispatch(fetchWallet());
                } catch (err: any) {
                    toast.update('verify-tx', {
                        render: typeof err === 'string' ? err : 'Payment verification failed',
                        type: 'error',
                        autoClose: 5000,
                        isLoading: false
                    });
                }
            };
            verify();
        }
    }, [router.query, mounted, dispatch, router]);

    if (!mounted || !user) return null;

    const handleLogout = () => {
        dispatch(logout());
        router.push('/auth/login');
    };

    if (user.isBlocked) {
        return (
            <div className="min-h-screen bg-[#070b14] flex flex-col items-center justify-center p-10 text-center relative overflow-hidden">
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-rose-600/10 rounded-full blur-[120px] -mr-32 -mt-32" />
                <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-rose-600/5 rounded-full blur-[100px] -ml-24 -mb-24" />

                <div className="relative z-10 space-y-8 max-w-lg">
                    <div className="w-24 h-24 rounded-3xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mx-auto shadow-2xl shadow-rose-500/10">
                        <FiLock size={48} className="text-rose-500" />
                    </div>
                    <div className="space-y-4">
                        <h1 className="text-5xl font-black text-white tracking-tighter">ACCESS <span className="text-rose-500 uppercase">Suspended</span></h1>
                        <p className="text-white/40 font-medium text-lg leading-relaxed">
                            Your account has been flagged for a <span className="text-rose-400 font-bold">Policy Violation</span>.
                            Our security node detected a mismatch between your registered identity (User Name/NIN) and your financial information.
                        </p>
                    </div>
                    <div className="pt-8 border-t border-white/5">
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/20 mb-6">Security Protocol ID: FR-403-BLOCKED</p>
                        <button onClick={handleLogout} className="h-14 bg-white/5 hover:bg-rose-500/10 text-rose-500 border border-white/10 px-10 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all active:scale-95">
                            Secure Logout & Disconnect
                        </button>
                    </div>
                </div>
            </div>
        );
    }


    const handleFundWallet = async (e: React.FormEvent) => {
        e.preventDefault();
        const amount = parseFloat(fundAmount);
        if (isNaN(amount) || amount < 500) {
            toast.error('Minimum funding amount is ₦500');
            return;
        }

        setIsProcessing(true);
        try {
            const result = await dispatch(initializeFunding(amount)).unwrap();
            console.log('[Wallet Debug] Response Received:', result);

            // Robust extraction: check both flat and nested data structures
            const finalData = result?.data || result;
            const authUrl = finalData?.authorization_url || result?.authorization_url;
            const newBal = finalData?.newBalance ?? result?.newBalance;

            if (authUrl) {
                toast.info('Redirecting to Paystack checkout...');
                window.location.href = authUrl;
                return;
            }

            if (newBal !== undefined) {
                toast.success('Funds added successfully to your wallet.');
                setShowFundModal(false);
                setFundAmount('');
                dispatch(fetchWallet());
                return;
            }

            // Fallback for unexpected response structure
            const responsePreview = JSON.stringify(result).substring(0, 150);
            console.error('[CRITICAL] Wallet funding response structure mismatch:', result);
            throw new Error(`The payment gateway returned an unrecognized response format: ${responsePreview}. Please try again.`);
        } catch (err: any) {
            console.error('Wallet Funding Action Error:', err);
            const msg = typeof err === 'string' ? err : (err?.message || 'Transaction could not be initialized. Please try again later.');
            toast.error(msg);
        } finally {
            setIsProcessing(false);
        }
    };

    const handleConfirmMoveIn = async (id: string) => {
        // Removed confirm() alarm as requested
        const res = await dispatch(confirmBooking(id));
        if (confirmBooking.fulfilled.match(res)) {
            toast.success('Move-in confirmed! Funds released.');
            dispatch(fetchWallet());
        }
        else toast.error('Confirmation failed');
    };

    const handleCancelBooking = async (id: string) => {
        // Removed confirm() alarm as requested
        const res = await dispatch(cancelBooking(id));
        if (cancelBooking.fulfilled.match(res)) {
            toast.success('Booking cancelled and refund processed.');
            dispatch(fetchWallet());
        }
        else toast.error('Cancellation failed');
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'video') => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            const res = await api.post('/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
                timeout: 300000 // 5 minute timeout for large videos
            });
            const url = res.data.url;
            if (type === 'image') {
                setPropertyForm(prev => ({
                    ...prev,
                    images: [...prev.images, { url, description: '' }]
                }));
            } else {
                setPropertyForm(prev => ({
                    ...prev,
                    videos: [...prev.videos, { url, description: '' }]
                }));
            }
            toast.success(`${type === 'image' ? 'Image' : 'Video'} uploaded successfully`);
        } catch (err: any) {
            console.error('File upload error:', err);
            const errorMsg = err.response?.data?.error || err.message || 'Check your connection or file size.';
            toast.error(`Upload failed: ${errorMsg}`);
        } finally {
            setUploading(false);
        }
    };

    // Address autocomplete is handled by handleAddressSearch and selectSuggestion

    const handleAddressSearch = (query: string) => {
        setPropertyForm(prev => ({ ...prev, location: query, longitude: undefined, latitude: undefined }));

        if (searchTimeout) clearTimeout(searchTimeout);

        if (!query.trim() || query.length < 3) {
            setAddressSuggestions([]);
            setShowSuggestions(false);
            return;
        }

        const timeout = setTimeout(async () => {
            setIsSearchingAddress(true);
            try {
                const res = await fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?access_token=${MAPBOX_TOKEN}&autocomplete=true&limit=5`);
                const data = await res.json();
                setAddressSuggestions(data.features || []);
                setShowSuggestions(true);
            } catch (err) {
                console.error('Address search failed:', err);
            } finally {
                setIsSearchingAddress(false);
            }
        }, 500);

        setSearchTimeout(timeout);
    };

    const selectSuggestion = (feature: any) => {
        const [lon, lat] = feature.center;
        setPropertyForm(prev => ({
            ...prev,
            location: feature.place_name,
            longitude: lon,
            latitude: lat
        }));
        setAddressSuggestions([]);
        setShowSuggestions(false);
        toast.success('Location locked and verified!');
    };

    const handleMapSelect = (location: string, lon: number, lat: number) => {
        setPropertyForm(prev => ({
            ...prev,
            location,
            longitude: lon,
            latitude: lat
        }));
        setAddressSuggestions([]);
        setShowSuggestions(false);
        toast.success('Precision location locked via Map Nodes!');
    };

    const addListItem = (field: 'amenities' | 'rules', value: string) => {
        if (!value.trim()) return;
        if ((propertyForm[field] as string[]).includes(value.trim())) return;
        setPropertyForm(prev => ({
            ...prev,
            [field]: [...(prev[field] as string[]), value.trim()]
        }));
    };

    const removeListItem = (field: 'amenities' | 'rules', index: number) => {
        setPropertyForm(prev => ({
            ...prev,
            [field]: (prev[field] as string[]).filter((_, i) => i !== index)
        }));
    };

    const addDamage = (desc: string) => {
        if (!desc.trim()) return;
        setPropertyForm(prev => ({
            ...prev,
            damages: [...prev.damages, { description: desc.trim(), media: [], status: 'Broken', fineAmount: 0 }]
        }));
    };

    const handleAddProperty = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            const rentVal = parseFloat(propertyForm.rent || '0');
            const cautionVal = parseFloat(propertyForm.cautionFee || '0');
            const agentVal = parseFloat(propertyForm.agentFee || '0');
            const totalVal = rentVal + cautionVal + agentVal;

            const payload = {
                ...propertyForm,
                rent: rentVal,
                cautionFee: cautionVal,
                agentFee: agentVal,
                totalPackage: totalVal,
                price: totalVal,
                inspectionFee: parseFloat(propertyForm.inspectionFee || '0'),
            };

            if (!payload.longitude || !payload.latitude) {
                toast.error('Please verify the address location before deploying.');
                setIsSaving(false);
                return;
            }

            await api.post('/hostels', payload);
            toast.success('Property listed successfully on the registry!');
            setActiveTab('my_hostels');
            setPropertyForm({
                title: '', location: '', description: '', price: '',
                rent: '', cautionFee: '0', agentFee: '0', totalPackage: '',
                category: 'Hostel', propertyType: 'Self-Contained',
                inspectionFee: '0', amenities: [], rules: [],
                images: [],
                videos: [],
                preferredTenants: [],
                longitude: undefined,
                latitude: undefined,
                damages: []
            });
            fetchAgentData();
        } catch (err: any) {
            toast.error(err.response?.data?.error || 'Failed to list property');
        } finally {
            setIsSaving(false);
        }
    };

    const handleWithdraw = async (e: React.FormEvent) => {
        e.preventDefault();
        const amountStr = withdrawForm.amount.trim();
        const amount = amountStr ? parseFloat(amountStr) : 0;

        // If amount is provided, check balance
        if (amount > 0 && amount > balance) {
            toast.error('Insufficient balance for withdrawal');
            return;
        }

        setIsProcessing(true);
        try {
            // Only perform withdrawal if amount > 0
            if (amount > 0) {
                await api.post('/wallet/withdraw', {
                    amount,
                    bankDetails: {
                        bankName: withdrawForm.bankName,
                        accountNumber: withdrawForm.accountNumber,
                        accountName: withdrawForm.accountName,
                        bankCode: withdrawForm.bankCode
                    }
                });
            }

            // Always save bank details if saveToProfile is true OR if it's a "Link Only" action (amount is 0)
            if (saveToProfile || amount === 0) {
                await dispatch(saveBankDetails({
                    userId: user.id,
                    bankName: withdrawForm.bankName,
                    accountNumber: withdrawForm.accountNumber,
                    accountName: withdrawForm.accountName,
                    bankCode: withdrawForm.bankCode
                })).unwrap();
                toast.success('Bank identity linked to your profile!');
            }

            if (amount > 0) {
                toast.success('Withdrawal request initialized!');
            }

            setShowWithdrawModal(false);
            setWithdrawForm(prev => ({ ...prev, amount: '' }));
            dispatch(fetchWallet());
            dispatch(getProfile()); // Sync user data
        } catch (err: any) {
            toast.error(err.response?.data?.error || 'Registry operation failed');
        } finally {
            setIsProcessing(false);
        }
    };

    const getChartData = () => {
        if (isAgent) {
            return getAgentChartData();
        }
        // Tenant spending data: Aggregate DEBIT transactions by date
        const data: any[] = [];
        const last7Days = Array.from({ length: 7 }, (_, i) => {
            const d = new Date();
            d.setDate(d.getDate() - i);
            return d.toDateString();
        }).reverse();

        last7Days.forEach(dateStr => {
            const daySpending = transactions
                .filter(tx => tx.type === 'DEBIT' && new Date(tx.createdAt).toDateString() === dateStr)
                .reduce((sum, tx) => sum + tx.amount, 0);

            data.push({
                name: new Date(dateStr).toLocaleDateString('en-NG', { day: '2-digit', month: 'short' }),
                amount: daySpending
            });
        });
        return data;
    };

    const getAgentChartData = () => {
        // Aggregate bookings and inspections by date for the last 7 days
        const data: any[] = [];
        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const dateStr = date.toLocaleDateString('en-NG', { day: '2-digit', month: 'short' });

            const dayBookings = agentBookings.filter(b => new Date(b.createdAt).toDateString() === date.toDateString()).length;
            const dayInspections = agentInspections.filter(ins => new Date(ins.createdAt).toDateString() === date.toDateString()).length;

            data.push({
                name: dateStr,
                bookings: dayBookings,
                inspections: dayInspections
            });
        }
        return data;
    };

    const getStatusStyles = (status: string) => {
        const s = status?.toUpperCase();
        switch (s) {
            case 'APPROVED': case 'CONFIRMED': case 'PAID': case 'COMPLETED':
                return 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20 shadow-sm';
            case 'REJECTED': case 'CANCELLED':
                return 'bg-rose-500/10 text-rose-600 border-rose-500/20 shadow-sm';
            case 'PENDING':
                return 'bg-amber-500/10 text-amber-600 border-amber-500/20 shadow-sm';
            default:
                return 'bg-slate-100 text-slate-500 border-slate-200';
        }
    };

    const navItems = isAgent ? [
        { icon: FiGrid, label: 'Command Center', id: 'overview' },
        { icon: FiHome, label: 'Asset Inventory', id: 'my_hostels' },
        { icon: FiBox, label: 'Tenant Orders', id: 'agent_bookings' },
        { icon: FiEye, label: 'Site Visits', id: 'inspections' },
        { icon: FiCreditCard, label: 'Liquidity & Wallet', id: 'wallet' },
        { icon: FiShield, label: 'Registry Status', id: 'security' },
        { icon: FiUser, label: 'Account Settings', id: 'settings' },
    ] : [
        { icon: FiGrid, label: 'Secure Hub', id: 'overview' },
        { icon: FiFileText, label: 'Rental Ledger', id: 'bookings' },
        { icon: FiEye, label: 'Asset Inspections', id: 'inspections' },
        { icon: FiCreditCard, label: 'Financial Vault', id: 'wallet' },
        { icon: FiShield, label: 'Trust & Shield', id: 'security' },
        { icon: FiUser, label: 'Account Settings', id: 'settings' },
    ];

    return (
        <>
            <Head>
                <title>{isAgent ? 'Agent Console' : 'Resident Dashboard'} | FUTA Housing</title>
            </Head>

            <div className="min-h-screen bg-[#070b14] text-white flex font-sans selection:bg-violet-500/30 selection:text-white">

                {/* ── Sidebar ───────────────────────────────────── */}
                <aside className={`fixed inset-y-0 left-0 z-50 w-72 bg-[#111622] flex flex-col transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:static lg:flex border-r border-white/5`}>
                    <div className="p-8">
                        <Link href="/" className="flex items-center gap-3 group">
                            <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center shadow-xl border border-white/10 group-hover:rotate-6 transition-transform">
                                <Image src="/logo.png" alt="Logo" width={28} height={28} priority />
                            </div>
                            <span className="text-xl font-black tracking-tight text-white group-hover:text-indigo-400 transition-colors uppercase italic">FUTA Housing</span>
                        </Link>
                    </div>

                    <nav className="flex-1 px-4 space-y-1 mt-4">
                        <div className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] px-4 mb-4">{isAgent ? 'Agent Console' : 'Tenant Hub'}</div>
                        {navItems.map((item) => (
                            <button
                                key={item.id}
                                onClick={() => { setActiveTab(item.id); setSidebarOpen(false); }}
                                className={`w-full flex items-center gap-3 px-5 py-3 rounded-xl transition-all duration-300 group relative ${activeTab === item.id
                                    ? 'bg-violet-500/10 text-violet-400 border border-violet-500/20 shadow-lg shadow-violet-500/5'
                                    : 'text-white/40 hover:text-white hover:bg-white/5'
                                    }`}
                            >
                                <item.icon className={`text-lg transition-all ${activeTab === item.id ? 'scale-110' : 'group-hover:scale-110'}`} />
                                <span className={`text-sm font-bold tracking-tight ${activeTab === item.id ? 'font-black' : ''}`}>{item.label}</span>
                                {activeTab === item.id && (
                                    <div className="ml-auto">
                                        <div className="w-1.5 h-1.5 rounded-full bg-violet-400 shadow-[0_0_8px_rgba(139,92,246,0.8)]" />
                                    </div>
                                )}
                            </button>
                        ))}
                    </nav>

                    <div className="p-6 mt-auto">
                        <div className="relative group overflow-hidden bg-white/[0.03] rounded-[2.5rem] p-6 border border-white/5 backdrop-blur-md">
                            <div className="relative z-10 flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-500 flex items-center justify-center text-lg font-black text-white shadow-lg">
                                    {user.name.charAt(0)}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-black text-white truncate mb-0.5">{user.name}</p>
                                    <p className="text-[9px] font-bold text-indigo-300 flex items-center gap-1.5 uppercase tracking-[0.1em]">
                                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" /> {user.role}
                                    </p>
                                </div>
                            </div>
                            <button onClick={handleLogout} className="mt-6 w-full h-11 bg-white/5 hover:bg-red-500/10 hover:text-red-400 text-slate-400 rounded-xl transition-all flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest border border-white/5">
                                <FiLogOut size={14} /> Sign Out
                            </button>
                        </div>
                    </div>
                </aside>

                {/* Mobile sidebar overlay */}
                {sidebarOpen && (
                    <div className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-md lg:hidden transition-opacity" onClick={() => setSidebarOpen(false)} />
                )}

                {/* ── Main Content ──────────────────────────────── */}
                <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

                    {/* Top Header */}
                    <header className="h-20 bg-[#070b14]/60 backdrop-blur-2xl border-b border-white/5 px-6 sm:px-10 flex items-center justify-between sticky top-0 z-40">
                        <div className="flex items-center gap-6">
                            {/* Mobile Menu */}
                            <button onClick={() => setSidebarOpen(true)} className="lg:hidden w-10 h-10 rounded-xl bg-white/[0.03] border border-white/10 flex items-center justify-center text-white shadow-sm active:scale-95 transition-all">
                                <FiMenu size={20} />
                            </button>

                            <div className="hidden sm:block">
                                <div className="flex items-center gap-2 mb-0.5">
                                    <div className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse shadow-[0_0_10px_rgba(6,182,212,0.5)]" />
                                    <p className="text-[9px] font-black uppercase tracking-[0.2em] text-white/30">Registry Node Active</p>
                                </div>
                                <h1 className="text-2xl font-black text-white tracking-tighter leading-none flex items-center gap-2">
                                    Good {new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 17 ? 'Afternoon' : 'Evening'} {user.name.split(' ')[0]} <span className="text-xl">👋</span>
                                </h1>
                            </div>
                        </div>

                        <div className="flex items-center gap-5">
                            {/* Quick Stats Grid - Only on Desktop */}
                            <div className="hidden xl:flex items-center gap-6 pr-6 border-r border-white/10">
                                <div className="text-right">
                                    <p className="text-[8px] font-black text-white/30 uppercase tracking-widest mb-0.5">Asset Registry</p>
                                    <p className="text-xs font-black text-white tracking-tight">Sync Nominal</p>
                                </div>
                                {(activeTab === 'wallet' || activeTab === 'overview') && (
                                    <div className="text-right">
                                        <p className="text-[8px] font-black text-white/30 uppercase tracking-widest mb-0.5">Vault Liquidity</p>
                                        <p className="text-xs font-black text-violet-400 tracking-tight">₦{balance.toLocaleString()}</p>
                                    </div>
                                )}
                            </div>

                            <div className="flex items-center gap-3 relative">
                                <button
                                    onClick={() => {
                                        setShowNotifications(!showNotifications);
                                        if (!showNotifications) markNotificationsAsRead();
                                    }}
                                    className="relative w-12 h-12 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/10 transition-all group overflow-hidden"
                                >
                                    <FiBell size={20} className={`text-white/60 group-hover:rotate-12 transition-transform relative z-10 ${showNotifications ? 'text-violet-400' : ''}`} />
                                    {notifications.some(n => !n.read) && (
                                        <span className="absolute top-3.5 right-3.5 w-1.5 h-1.5 bg-rose-500 rounded-full z-20 shadow-[0_0_8px_rgba(244,63,94,0.6)]" />
                                    )}
                                </button>

                                {showNotifications && (
                                    <div className="absolute top-16 right-0 w-80 max-h-[450px] bg-[#111622] border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50 flex flex-col animate-in slide-in-from-top-4 duration-300">
                                        <div className="p-4 border-b border-white/5 flex items-center justify-between">
                                            <p className="text-[10px] font-black uppercase tracking-widest text-white/50">Registry Alerts</p>
                                            <button onClick={() => setShowNotifications(false)} className="text-white/20 hover:text-white transition-colors"><FiX size={14} /></button>
                                        </div>
                                        <div className="flex-1 overflow-y-auto scrollbar-hide py-2">
                                            {notifications.length === 0 ? (
                                                <div className="py-12 flex flex-col items-center justify-center opacity-20">
                                                    <FiBell size={32} className="text-white mb-2" />
                                                    <p className="text-[8px] font-black uppercase tracking-widest">No Alerts</p>
                                                </div>
                                            ) : (
                                                notifications.map((n) => (
                                                    <div key={n._id} className={`px-5 py-4 hover:bg-white/[0.02] border-b border-white/[0.02] last:border-0 transition-colors cursor-pointer group/n ${!n.read ? 'bg-violet-500/[0.03]' : ''}`}>
                                                        <div className="flex items-start gap-4">
                                                            <div className={`mt-1 w-2 h-2 rounded-full shrink-0 ${!n.read ? 'bg-violet-400 animate-pulse' : 'bg-transparent'}`} />
                                                            <div>
                                                                <p className="text-[10px] font-black text-white/90 uppercase tracking-tight mb-1">{n.title}</p>
                                                                <p className="text-[11px] text-white/40 leading-relaxed line-clamp-2">{n.message}</p>
                                                                <p className="text-[8px] font-bold text-white/20 uppercase tracking-widest mt-2">{new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {new Date(n.createdAt).toLocaleDateString()}</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                        {notifications.length > 0 && (
                                            <div className="p-3 bg-white/[0.01] border-t border-white/5 text-center">
                                                <p className="text-[8px] font-black text-white/20 uppercase tracking-widest leading-none">Archiving automatically after 50 nodes</p>
                                            </div>
                                        )}
                                    </div>
                                )}

                                <button onClick={() => setActiveTab('wallet')} className="flex items-center gap-3 bg-white/[0.03] border border-white/10 p-1 pr-5 rounded-xl hover:scale-[1.02] active:scale-95 transition-all shadow-xl group">
                                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center text-white text-xs font-black shadow-lg shadow-violet-500/20">
                                        {user.name.charAt(0)}
                                    </div>
                                    <div className="text-left hidden sm:block">
                                        <p className="text-[7px] font-black text-white/30 uppercase tracking-widest leading-none mb-0.5">COMMANDER</p>
                                        <p className="text-xs font-black text-white tracking-tight">{user.name.split(' ')[0]}</p>
                                    </div>
                                </button>
                            </div>
                        </div>
                    </header>

                    {/* Main Scroll Area */}
                    <main className="flex-1 overflow-y-auto p-8 scrollbar-hide">
                        <div className="max-w-7xl mx-auto space-y-10 pb-12">

                            {/* ── OVERVIEW TAB ──────────────────────────────── */}
                            {activeTab === 'overview' && (
                                <div className="space-y-10 animate-in fade-in duration-700 slide-in-from-bottom-6">

                                    {/* 🪐 SYSTEM HUB HERO */}
                                    <div className="relative group overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-[#111622] to-[#070b14] px-10 py-12 text-white shadow-2xl border border-white/5">
                                        <div className="absolute inset-0 overflow-hidden pointer-events-none">
                                            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-violet-600/10 rounded-full blur-[100px] -mr-32 -mt-32" />
                                            <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-cyan-600/5 rounded-full blur-[80px] -ml-24 -mb-24" />
                                        </div>

                                        <div className="relative z-10 flex flex-col xl:flex-row items-center justify-between gap-12">
                                            <div className="max-w-xl">
                                                <div className="inline-flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-xl mb-8">
                                                    <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_10px_rgba(6,182,212,0.8)]" />
                                                    <span className="text-[9px] font-black uppercase tracking-[0.2em] text-violet-300">
                                                        {isAgent ? 'Market Maker Protocol: Active' : 'Resident Identity: Verified'}
                                                    </span>
                                                </div>
                                                <h2 className="text-4xl md:text-5xl font-black tracking-tighter mb-6 leading-[0.9]">
                                                    {isAgent ? 'Portfolio' : 'Welcome'} <br />
                                                    <span className="text-violet-400">{isAgent ? 'Command.' : 'Home Base.'}</span>
                                                </h2>
                                                <p className="text-base text-white/40 font-medium mb-10 leading-relaxed max-w-md">
                                                    {isAgent
                                                        ? <>Deploy assets and monitor <span className="text-white font-black">{myHostels.length} nodes</span>. Your real-time revenue and performance metrics are locked in.</>
                                                        : <>Access <span className="text-white font-black">verified hostels</span> near FUTA. Your tenancy status and payments are cryptographically secured.</>
                                                    }
                                                </p>
                                                <div className="flex flex-wrap gap-4">
                                                    {isAgent ? (
                                                        <button onClick={() => setActiveTab('add_property')} className="h-14 bg-white text-black px-8 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2.5 transition-all hover:scale-[1.02] active:scale-95 shadow-xl">
                                                            <FiPlusCircle /> Deploy Asset
                                                        </button>
                                                    ) : (
                                                        <Link href="/hostels" className="h-14 bg-white text-black px-8 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2.5 transition-all hover:scale-[1.02] active:scale-95 shadow-xl">
                                                            Explore Registry <FiArrowRight />
                                                        </Link>
                                                    )}
                                                    <button onClick={() => setActiveTab('wallet')} className="h-14 bg-white/5 hover:bg-white/10 text-white border border-white/10 backdrop-blur-md px-8 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all flex items-center gap-2.5 active:scale-95">
                                                        <FiCreditCard /> Open Vault
                                                    </button>
                                                </div>
                                            </div>

                                            {/* 🔑 SYSTEM TELEMETRY */}
                                            <div className="hidden xl:block">
                                                <div className="w-80 h-[280px] rounded-[2.5rem] bg-[#070b14] p-8 relative overflow-hidden shadow-2xl border border-white/10">
                                                    <div className="relative z-10 space-y-6">
                                                        <div className="flex items-center justify-between">
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-violet-400 border border-white/10">
                                                                    <FiShield size={16} />
                                                                </div>
                                                                <span className="text-[9px] font-black uppercase tracking-widest text-white/40">Status</span>
                                                            </div>
                                                            <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/20">
                                                                <div className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
                                                                <span className="text-[7px] font-black text-emerald-500 uppercase">Secure</span>
                                                            </div>
                                                        </div>

                                                        <div className="space-y-4">
                                                            {[
                                                                { label: isAgent ? 'Asset Discovery' : 'Rental Search', status: 'ACTIVE' },
                                                                { label: isAgent ? 'Escrow Sync' : 'Identity Guard', status: 'LOCKED' },
                                                                { label: 'Network Shield', status: 'ACTIVE' }
                                                            ].map((step, i) => (
                                                                <div key={i} className="flex items-center gap-3">
                                                                    <div className="w-1.5 h-1.5 rounded-full bg-cyan-500 shadow-[0_0_8px_#06b6d4]" />
                                                                    <span className="text-[9px] font-black uppercase tracking-widest text-white/40">{step.label}: <span className="text-white/20">{step.status}</span></span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                        <div className="pt-6 border-t border-white/5">
                                                            <div className="flex items-center gap-2 mb-2">
                                                                <div className="w-1 h-3 bg-violet-500 rounded-full" />
                                                                <p className="text-[9px] font-black uppercase text-white/60">Registry Health</p>
                                                            </div>
                                                            <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                                                                <div className="h-full bg-violet-500 w-[94%] shadow-[0_0_10px_#8b5cf6]" />
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* 📈 PERFORMANCE NODES (SUMMARY CARDS) */}
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        {[
                                            { label: isAgent ? 'Total Revenue' : 'Wallet Points', value: isAgent ? `₦${(balance + escrowBalance).toLocaleString()}` : (balance / 100).toFixed(0), growth: '+3.2%', sub: 'Global Rank: #12', icon: <FiDollarSign />, color: 'violet' },
                                            { label: isAgent ? 'Active Properties' : 'Saved Listings', value: isAgent ? myHostels.length.toString() : '0', growth: '+1', sub: 'Updated 2m ago', icon: <FiHome />, color: 'cyan' },
                                            { label: isAgent ? 'Total Inspections' : 'Active Bookings', value: isAgent ? agentInspections.length.toString() : (bookings.length + inspections.length).toString(), growth: '+12%', sub: 'Registry Pulse', icon: <FiActivity />, color: 'emerald' }
                                        ].map((stat, i) => (
                                            <div key={i} className="bg-[#111622] rounded-[2rem] p-8 border border-white/5 relative overflow-hidden group hover:border-white/10 transition-all shadow-2xl">
                                                <div className={`absolute top-0 right-0 w-32 h-32 bg-${stat.color}-500/5 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-${stat.color}-500/10 transition-all`} />
                                                <div className="relative z-10 flex flex-col justify-between h-full">
                                                    <div className="flex items-center justify-between mb-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className={`w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center text-${stat.color}-400 border border-white/10`}>
                                                                {stat.icon}
                                                            </div>
                                                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30">{stat.label}</p>
                                                        </div>
                                                    </div>
                                                    <div className="space-y-1">
                                                        <h3 className="text-3xl font-black text-white tracking-tighter">{stat.value}</h3>
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-[10px] font-bold text-emerald-400">{stat.growth}</span>
                                                            <span className="text-[10px] font-medium text-white/20">{stat.sub}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
                                        {/* Left Column: Analytics & Reports */}
                                        <div className="xl:col-span-8 space-y-8">

                                            {/* Financial Chart Card */}
                                            <div className="bg-[#111622] rounded-[2.5rem] p-8 border border-white/5 shadow-2xl relative overflow-hidden">
                                                <div className="flex items-center justify-between mb-10">
                                                    <div>
                                                        <h4 className="text-xl font-black text-white tracking-tight leading-none mb-1.5 uppercase">{isAgent ? 'Revenue Node' : 'Spending Analytics'}</h4>
                                                        <p className="text-[10px] font-black text-white/20 uppercase tracking-widest">Registry telemetry Pulse</p>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-2.5 h-2.5 rounded-full bg-violet-500 shadow-[0_0_10px_#8b5cf6]" />
                                                        <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">Active Pulse</span>
                                                    </div>
                                                </div>

                                                <div className="h-72 w-full">
                                                    <ResponsiveContainer width="100%" height="100%">
                                                        <AreaChart data={getChartData()}>
                                                            <defs>
                                                                <linearGradient id="mainChartGrad" x1="0" y1="0" x2="0" y2="1">
                                                                    <stop offset="0%" stopColor={isAgent ? "#8b5cf6" : "#06b6d4"} stopOpacity={0.15} />
                                                                    <stop offset="100%" stopColor={isAgent ? "#8b5cf6" : "#06b6d4"} stopOpacity={0} />
                                                                </linearGradient>
                                                            </defs>
                                                            <CartesianGrid strokeDasharray="6 6" vertical={false} stroke="#ffffff03" />
                                                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#ffffff20', fontSize: 10, fontWeight: 800 }} dy={15} />
                                                            <YAxis hide />
                                                            <Tooltip
                                                                contentStyle={{ backgroundColor: '#1c2231', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.05)', color: '#fff' }}
                                                            />
                                                            <Area type="monotone" dataKey={isAgent ? "bookings" : "amount"} stroke={isAgent ? "#8b5cf6" : "#06b6d4"} strokeWidth={5} fill="url(#mainChartGrad)" />
                                                            {isAgent && <Area type="monotone" dataKey="inspections" stroke="#ec4899" strokeWidth={5} fill="transparent" />}
                                                        </AreaChart>
                                                    </ResponsiveContainer>
                                                </div>
                                            </div>

                                            {/* Role-Specific Report Area */}
                                            <div className="bg-[#111622] rounded-[2.5rem] p-10 border border-white/5 shadow-2xl relative overflow-hidden">
                                                <div className="flex items-center justify-between mb-10">
                                                    <div>
                                                        <h4 className="text-xl font-black text-white tracking-tight leading-none mb-1.5 uppercase">{isAgent ? 'Sales Report' : 'Recent Registry Events'}</h4>
                                                        <p className="text-[10px] font-black text-white/20 uppercase tracking-widest">Verified transaction ledger</p>
                                                    </div>
                                                    <button onClick={() => setActiveTab(isAgent ? 'agent_bookings' : 'bookings')} className="h-10 px-5 rounded-xl bg-white/5 border border-white/10 text-[9px] font-black text-white/40 uppercase tracking-[0.2em] hover:bg-white/10 transition-all flex items-center gap-2">
                                                        Full Archive <FiArrowRight />
                                                    </button>
                                                </div>

                                                <div className="overflow-x-auto">
                                                    <table className="w-full text-left">
                                                        <thead>
                                                            <tr className="border-b border-white/5">
                                                                <th className="pb-6 text-[10px] font-black uppercase tracking-widest text-white/30">Registry Asset</th>
                                                                <th className="pb-6 text-[10px] font-black uppercase tracking-widest text-white/30">{isAgent ? 'Sales Type' : 'Event Node'}</th>
                                                                <th className="pb-6 text-[10px] font-black uppercase tracking-widest text-white/30">Value</th>
                                                                <th className="pb-6 text-[10px] font-black uppercase tracking-widest text-white/30 text-right">Status</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody className="divide-y divide-white/[0.02]">
                                                            {(isAgent ? agentBookings : bookings).slice(0, 5).map((item: Booking) => (
                                                                <tr key={item._id} className="group hover:bg-white/[0.01] transition-colors">
                                                                    <td className="py-6 pr-6">
                                                                        <div className="flex items-center gap-4">
                                                                            <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 overflow-hidden relative shrink-0">
                                                                                {item.hostelId && typeof item.hostelId !== 'string' && item.hostelId.images?.[0] ?
                                                                                    <Image src={(typeof item.hostelId.images[0] === 'string' ? item.hostelId.images[0] : item.hostelId.images[0].url) as string} layout="fill" objectFit="cover" alt="H" /> :
                                                                                    <div className="w-full h-full flex items-center justify-center text-white/10"><FiHome size={20} /></div>
                                                                                }
                                                                            </div>
                                                                            <div className="min-w-0">
                                                                                <p className="text-sm font-black text-white tracking-tight truncate leading-none mb-1 group-hover:text-violet-400 transition-colors uppercase">
                                                                                    {item.hostelId && typeof item.hostelId !== 'string' ? item.hostelId.title : 'Registered Event'}
                                                                                </p>
                                                                                <p className="text-[9px] font-bold text-white/20 uppercase tracking-widest">
                                                                                    {new Date(item.createdAt).toLocaleDateString()} • {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                                                </p>
                                                                            </div>
                                                                        </div>
                                                                    </td>
                                                                    <td className="py-6 px-6">
                                                                        <div className="flex items-center gap-2">
                                                                            <div className={`w-1.5 h-1.5 rounded-full ${isAgent ? 'bg-cyan-500 shadow-[0_0_8px_#06b6d4]' : 'bg-violet-500 shadow-[0_0_8px_#8b5cf6]'}`} />
                                                                            <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">{isAgent ? 'Booking Node' : 'Record Node'}</span>
                                                                        </div>
                                                                    </td>
                                                                    <td className="py-6 px-6">
                                                                        <span className="text-sm font-black text-violet-400 tracking-tight">₦{item.amount?.toLocaleString()}</span>
                                                                    </td>
                                                                    <td className="py-6 pl-6 text-right">
                                                                        <span className={`px-3 py-1.5 rounded-lg border text-[8px] font-black uppercase tracking-widest ${getStatusStyles(item.status)}`}>
                                                                            {item.status}
                                                                        </span>
                                                                    </td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                    {(isAgent ? agentBookings : bookings).length === 0 && (
                                                        <div className="py-20 text-center opacity-20">
                                                            <FiBox size={48} className="mx-auto mb-4" />
                                                            <p className="text-[10px] font-black uppercase tracking-[0.25em]">No validated records found</p>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Right Column: Inventory & Stats */}
                                        <div className="xl:col-span-4 space-y-8">

                                            {/* Registry Inventory / Saved Nodes */}
                                            <div className="bg-[#111622] rounded-[2.5rem] p-8 border border-white/5 shadow-2xl">
                                                <div className="flex items-center justify-between mb-8">
                                                    <h4 className="text-xl font-black text-white tracking-tight uppercase">{isAgent ? 'Inventory' : 'Registry Discovery'}</h4>
                                                    <button onClick={() => isAgent ? setActiveTab('my_hostels') : (window.location.href = '/hostels')} className="text-[9px] font-black text-white/20 uppercase tracking-widest hover:text-white transition-colors">See All</button>
                                                </div>
                                                <div className="space-y-4">
                                                    {(isAgent ? myHostels.slice(0, 3) : []).map((hostel) => (
                                                        <div key={hostel._id} className="group relative overflow-hidden rounded-3xl bg-white/[0.02] border border-white/5 p-4 hover:border-white/10 transition-all cursor-pointer">
                                                            <div className="flex items-center gap-4">
                                                                <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 overflow-hidden relative shrink-0 shadow-lg">
                                                                    {hostel.images?.[0] ?
                                                                        <Image src={(typeof hostel.images[0] === 'string' ? hostel.images[0] : hostel.images[0].url) as string} layout="fill" objectFit="cover" alt="H" /> :
                                                                        <div className="w-full h-full flex items-center justify-center text-white/10"><FiHome size={24} /></div>
                                                                    }
                                                                </div>
                                                                <div className="min-w-0">
                                                                    <p className="text-sm font-black text-white tracking-tight truncate uppercase leading-none mb-1.5">{hostel.title}</p>
                                                                    <p className="text-[10px] font-black text-violet-400 mb-1.5 tracking-tight">₦{hostel.price.toLocaleString()}</p>
                                                                    <div className="flex items-center gap-2 opacity-30">
                                                                        <FiMapPin size={10} className="text-white" />
                                                                        <p className="text-[9px] font-bold text-white uppercase tracking-widest truncate">{hostel.location.split(',')[0]}</p>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                    {(isAgent ? myHostels.length === 0 : true) && !isAgent && (
                                                        <div className="py-12 text-center opacity-20 border-2 border-dashed border-white/10 rounded-3xl flex flex-col items-center">
                                                            <FiSearch size={32} className="mb-4" />
                                                            <p className="text-[9px] font-black uppercase tracking-widest">Discover New Assets</p>
                                                            <button className="mt-4 text-[8px] font-black text-violet-400 uppercase tracking-widest underline underline-offset-4">Open Map</button>
                                                        </div>
                                                    )}
                                                    {isAgent && myHostels.length === 0 && (
                                                        <div className="py-12 text-center opacity-20 border-2 border-dashed border-white/10 rounded-3xl flex flex-col items-center">
                                                            <FiPlusCircle size={32} className="mb-4" />
                                                            <p className="text-[9px] font-black uppercase tracking-widest">No assets deployed</p>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Protocol Authority (Security Shield) */}
                                            <div className="bg-[#111622] rounded-[2.5rem] p-8 border border-white/5 shadow-2xl relative overflow-hidden group">
                                                <div className="absolute top-0 right-0 w-48 h-48 bg-cyan-500/10 rounded-full blur-[60px] -mr-24 -mt-24 pointer-events-none" />
                                                <div className="relative z-10">
                                                    <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-6 shadow-xl">
                                                        <FiShield size={24} className="text-cyan-400" />
                                                    </div>
                                                    <h4 className="text-xl font-black text-white mb-2 uppercase tracking-tight">Identity Shield</h4>
                                                    <p className="text-[11px] text-white/40 font-medium leading-relaxed mb-8">
                                                        Protocol level encryption active. <br />Status: <span className="text-cyan-400 font-bold uppercase tracking-widest text-[9px]">{user.verificationStatus === 'APPROVED' ? 'Verified Node' : 'Verification PENDING'}</span>.
                                                    </p>
                                                    <div className="space-y-4">
                                                        <div className="flex justify-between items-center">
                                                            <span className="text-[9px] font-black uppercase tracking-widest text-white/20">Protocol Integrity</span>
                                                            <span className="text-[9px] font-black text-cyan-400">98% Secure</span>
                                                        </div>
                                                        <div className="h-1 bg-white/5 rounded-full overflow-hidden shadow-inner">
                                                            <div className="h-full bg-gradient-to-r from-cyan-600 to-cyan-400 rounded-full w-[98%] shadow-[0_0_12px_rgba(6,182,212,0.4)]" />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Global Market Pulse */}
                                            <div className="bg-[#111622] rounded-3xl p-6 border border-white/5 shadow-2xl flex items-center justify-between group">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 transition-transform group-hover:scale-110">
                                                        <FiActivity size={20} />
                                                    </div>
                                                    <div>
                                                        <p className="text-[9px] font-black text-white/20 uppercase tracking-widest mb-1 leading-none">Market Pulse</p>
                                                        <p className="text-lg font-black text-white tracking-tight leading-none uppercase">Nominal</p>
                                                    </div>
                                                </div>
                                                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_12px_rgba(16,185,129,0.8)]" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* ── INSPECTIONS TAB ─────────────────────────────── */}
                            {activeTab === 'inspections' && (
                                <div className="space-y-8 animate-in slide-in-from-bottom-8 duration-700">
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                        <div>
                                            <h2 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">{isAgent ? 'Visit Requests' : 'My Inspections'}</h2>
                                            <p className="text-slate-500 font-medium text-base mt-1">Track appointments and facility verification history.</p>
                                        </div>
                                    </div>

                                    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                                        <div className="p-6 space-y-3">
                                            {(isAgent ? agentInspections : inspections).length === 0 ? (
                                                <div className="py-24 flex flex-col items-center justify-center text-slate-300">
                                                    <FiEye size={48} className="mb-4 opacity-20" />
                                                    <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40 text-center">No Inspections Logged In Registry</p>
                                                </div>
                                            ) : (
                                                (isAgent ? agentInspections : inspections).map((item: Inspection) => (
                                                    <div key={item._id} className="group flex flex-col md:flex-row md:items-center justify-between p-6 rounded-2xl hover:bg-slate-50 transition-all border border-slate-100/50 hover:border-indigo-100 gap-6">
                                                        <div className="flex items-center gap-6">
                                                            <div className="w-20 h-20 rounded-xl bg-indigo-50 overflow-hidden relative border border-white shadow-sm transition-transform group-hover:scale-105 shrink-0">
                                                                {typeof item.hostelId !== 'string' && (item.hostelId as Hostel).images?.[0] ? (
                                                                    <Image src={(typeof (item.hostelId as Hostel).images[0] === 'string' ? (item.hostelId as Hostel).images[0] : ((item.hostelId as Hostel).images[0] as any).url) as string} layout="fill" objectFit="cover" alt="H" />
                                                                ) : (
                                                                    <div className="w-full h-full flex items-center justify-center text-indigo-300"><FiHome size={32} /></div>
                                                                )}
                                                            </div>
                                                            <div>
                                                                <div className="flex items-center gap-2.5 mb-1.5">
                                                                    <p className="text-xl font-black text-slate-950 tracking-tighter uppercase leading-none">
                                                                        {typeof item.hostelId !== 'string' ? (item.hostelId as Hostel).title : 'Registered Asset'}
                                                                    </p>
                                                                    <span className={`px-2 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest border ${getStatusStyles(item.status)}`}>{item.status}</span>
                                                                </div>
                                                                <div className="flex flex-wrap items-center gap-3 text-[9px] font-black text-slate-400 uppercase tracking-widest">
                                                                    <div className="flex items-center gap-1.5"><FiMapPin className="text-indigo-500" /> {typeof item.hostelId !== 'string' ? (item.hostelId as Hostel).location : 'Registry Site'}</div>
                                                                    <div className="w-1 h-1 rounded-full bg-slate-200" />
                                                                    <div className="flex items-center gap-1.5"><FiCalendar className="text-indigo-500" /> {new Date(item.createdAt).toLocaleDateString()}</div>
                                                                </div>
                                                                {isAgent && (() => {
                                                                    const student = item.studentId as any;
                                                                    return (
                                                                        <div className="mt-4 flex items-center gap-3">
                                                                            <div className="flex items-center gap-2 bg-white border border-slate-100 rounded-lg px-3 py-1.5 shadow-sm">
                                                                                <div className="w-5 h-5 rounded overflow-hidden bg-indigo-600 flex items-center justify-center text-[9px] font-black text-white">{student?.name?.charAt(0)}</div>
                                                                                <p className="text-[9px] font-black text-slate-900 uppercase tracking-tight">{student?.name}</p>
                                                                            </div>
                                                                            <a href={`tel:${student?.phone}`} className="h-8 px-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg flex items-center gap-1.5 text-[8px] font-black uppercase tracking-widest transition-all shadow-lg shadow-emerald-500/10">
                                                                                <FiPhone size={10} /> Contact
                                                                            </a>
                                                                        </div>
                                                                    );
                                                                })()}
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-6">
                                                            <div className="text-right">
                                                                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Fee</p>
                                                                <p className="text-xl font-black text-slate-950">₦{item.amount?.toLocaleString()}</p>
                                                            </div>
                                                            <button className="h-12 px-6 rounded-xl bg-slate-950 text-white text-[9px] font-black uppercase tracking-[0.2em] shadow-xl hover:bg-black transition-all active:scale-95 flex items-center gap-2.5">
                                                                Audit <FiArrowRight size={14} />
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </div>

                                    <div className="bg-indigo-950 rounded-2xl p-8 text-white relative overflow-hidden shadow-2xl">
                                        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20" />
                                        <FiShield className="absolute -bottom-10 -right-10 w-48 h-48 text-white/5 rotate-12" />
                                        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                                            <div className="max-w-xl text-center md:text-left">
                                                <h4 className="text-xl font-black mb-3 tracking-tight">Inspection Protocol</h4>
                                                <p className="text-[13px] text-indigo-200 font-medium leading-relaxed">
                                                    Inspections are the primary shield for our escrow system. Never release payment until you have physically verified the asset.
                                                </p>
                                            </div>
                                            <div className="shrink-0 flex gap-3">
                                                <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center border border-white/10 shadow-2xl">
                                                    <FiCheckCircle size={24} className="text-emerald-400" />
                                                </div>
                                                <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center border border-white/10 shadow-2xl">
                                                    <FiTarget size={24} className="text-amber-400" />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* ── BOOKINGS TABS ─────────────────────────────── */}
                            {(activeTab === 'bookings' || activeTab === 'agent_bookings') && (
                                <div className="space-y-6 animate-in slide-in-from-bottom-8 duration-700">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                        <h2 className="text-2xl font-black text-slate-950 tracking-tighter uppercase">{isAgent ? 'Registry: Asset Orders' : 'Rental Ledger'}</h2>
                                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full border border-indigo-100 text-[9px] font-black uppercase tracking-widest">
                                            <FiActivity size={10} /> {(isAgent ? agentBookings : bookings).length} Active Nodes
                                        </div>
                                    </div>

                                    {(isAgent ? agentBookings : bookings).length === 0 ? (
                                        <div className="bg-white rounded-[2rem] p-16 border border-slate-100 text-center shadow-sm flex flex-col items-center">
                                            <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-6 text-slate-200">
                                                <FiBox size={32} />
                                            </div>
                                            <h3 className="text-xl font-black text-slate-900 mb-2 tracking-tight uppercase">No Records Found</h3>
                                            <p className="text-slate-400 max-w-sm text-[13px] font-medium mb-8 leading-relaxed">No rental agreements or orders are currently registered in your local cluster.</p>
                                            {!isAgent && (
                                                <Link href="/hostels" className="h-12 bg-slate-950 text-white font-black px-8 rounded-xl hover:bg-black transition-all shadow-lg text-[10px] uppercase tracking-[0.2em] flex items-center gap-2">
                                                    Deploy Search <FiSearch size={14} />
                                                </Link>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                                            {(isAgent ? agentBookings : bookings).map((item: any) => (
                                                <div key={item._id} className="group bg-white rounded-[2rem] p-4 sm:p-5 border border-slate-100 hover:border-indigo-200 hover:shadow-2xl hover:shadow-indigo-500/5 transition-all duration-500 flex flex-col sm:flex-row gap-5">
                                                    <div className="relative w-full sm:w-44 h-48 sm:h-auto rounded-[1.5rem] overflow-hidden shadow-sm shrink-0">
                                                        {item.hostelId?.images?.[0] ? (
                                                            <Image src={typeof item.hostelId.images[0] === 'string' ? item.hostelId.images[0] : item.hostelId.images[0].url} layout="fill" objectFit="cover" alt="H" className="group-hover:scale-110 transition-transform duration-700" />
                                                        ) : (
                                                            <div className="w-full h-full bg-slate-50 flex items-center justify-center text-slate-200">
                                                                <FiHome size={40} />
                                                            </div>
                                                        )}
                                                        <div className="absolute top-3 left-3 z-10">
                                                            <div className={`px-3 py-1.5 rounded-xl text-[8px] font-black uppercase tracking-widest backdrop-blur-md border ${getStatusStyles(item.status)}`}>
                                                                {item.status}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="flex-1 flex flex-col justify-between py-1">
                                                        <div className="space-y-4">
                                                            <div className="flex items-center gap-2 opacity-50">
                                                                <FiMapPin size={10} className="text-indigo-600" />
                                                                <span className="text-[9px] font-black uppercase tracking-widest">{item.hostelId?.location || 'General Site'}</span>
                                                            </div>
                                                            <h3 className="text-xl font-black text-slate-950 leading-tight tracking-tighter uppercase group-hover:text-indigo-600 transition-colors line-clamp-2">
                                                                {item.hostelId?.title || 'Agreement Bundle'}
                                                            </h3>

                                                            <div className="flex items-center gap-6">
                                                                <div>
                                                                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1 font-mono">Settlement Value</p>
                                                                    <p className="text-lg font-black text-slate-950 tracking-tighter">₦{item.amount?.toLocaleString()}</p>
                                                                </div>
                                                                <div className="w-px h-8 bg-slate-100" />
                                                                <div>
                                                                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1 font-mono">Registered On</p>
                                                                    <p className="text-lg font-black text-slate-950 tracking-tighter">{new Date(item.createdAt).toLocaleDateString('en-NG', { day: '2-digit', month: 'short' })}</p>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div className="flex items-center gap-3 pt-6">
                                                            {(item.status?.toLowerCase() === 'paid' || item.status?.toLowerCase() === 'approved') && !isAgent && (
                                                                <button onClick={() => handleConfirmMoveIn(item._id)} className="flex-1 h-12 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-black text-[9px] uppercase tracking-widest transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2">
                                                                    <FiCheckCircle size={14} /> Release Funds
                                                                </button>
                                                            )}
                                                            {item.status === 'PENDING' && !isAgent && (
                                                                <button onClick={() => handleCancelBooking(item._id)} className="flex-1 h-12 bg-white border border-rose-100 text-rose-500 hover:bg-rose-50 rounded-xl font-black text-[9px] uppercase tracking-widest transition-all active:scale-95">
                                                                    Void Node
                                                                </button>
                                                            )}
                                                            <Link href={`/hostels/${item.hostelId?._id}`} className="w-12 h-12 bg-slate-950 text-white rounded-xl flex items-center justify-center hover:bg-black transition-all group/link shadow-md active:scale-95">
                                                                <FiArrowRight size={18} className="group-hover/link:translate-x-0.5 transition-transform" />
                                                            </Link>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* ── MY HOSTELS TAB ───────────────────────────── */}
                            {activeTab === 'my_hostels' && isAgent && (
                                <div className="space-y-12 animate-in slide-in-from-bottom-8 duration-700">
                                    <div className="flex items-center justify-between">
                                        <h2 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">Your Inventory</h2>
                                        <button
                                            onClick={() => setActiveTab('add_property')}
                                            className="bg-slate-950 text-white px-6 h-12 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-black transition-all flex items-center gap-2 shadow-xl active:scale-95"
                                        >
                                            <FiPlus size={16} /> Add Property
                                        </button>
                                    </div>

                                    {myHostels.length === 0 ? (
                                        <div className="bg-white rounded-2xl p-12 border border-slate-200 text-center shadow-sm flex flex-col items-center">
                                            <div className="w-16 h-16 bg-indigo-50 rounded-xl flex items-center justify-center mb-6">
                                                <FiHome size={24} className="text-indigo-600" />
                                            </div>
                                            <h3 className="text-lg font-black text-slate-900 mb-2 tracking-tight uppercase">Registry Empty</h3>
                                            <p className="text-slate-400 max-w-sm text-xs font-medium mb-8 uppercase tracking-wide">You haven't listed any properties on the node yet.</p>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                            {myHostels.map((hostel: any) => (
                                                <div key={hostel._id} className="group bg-white rounded-2xl border border-slate-200 overflow-hidden hover:border-indigo-300 hover:shadow-xl transition-all duration-300">
                                                    <div className="relative h-48 overflow-hidden">
                                                        {hostel.images?.[0] ? (
                                                            <div className="relative h-full w-full">
                                                                <Image src={typeof hostel.images[0] === 'string' ? hostel.images[0] : hostel.images[0].url} layout="fill" objectFit="cover" alt="H" className="group-hover:scale-110 transition-transform duration-700" />
                                                            </div>
                                                        ) : (
                                                            <div className="w-full h-full bg-slate-50 flex items-center justify-center text-slate-300"><FiHome size={32} /></div>
                                                        )}
                                                        <div className="absolute top-4 left-4 flex gap-2">
                                                            <span className="bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-100 text-[9px] font-black uppercase tracking-widest text-slate-900">{hostel.category}</span>
                                                            <span className={`px-3 py-1.5 rounded-xl border text-[9px] font-black uppercase tracking-widest backdrop-blur-md ${hostel.status === 'Available' ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' : 'bg-amber-500/10 text-amber-600 border-amber-500/20'}`}>{hostel.status}</span>
                                                        </div>
                                                    </div>
                                                    <div className="p-6">
                                                        <div className="flex items-center gap-2 mb-2">
                                                            <FiMapPin className="text-indigo-500" size={10} />
                                                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{hostel.location}</span>
                                                        </div>
                                                        <h3 className="text-lg font-black text-slate-900 mb-6 truncate uppercase tracking-tight">{hostel.title}</h3>
                                                        <div className="flex items-center justify-between pt-5 border-t border-slate-50">
                                                            <p className="text-xl font-black text-indigo-600">₦{hostel.price.toLocaleString()}<span className="text-[10px] text-slate-400 font-bold ml-1">/yr</span></p>
                                                            <button className="w-9 h-9 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all"><FiActivity size={16} /></button>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* ── ADD PROPERTY TAB ─────────────────────────────── */}
                            {activeTab === 'add_property' && isAgent && (
                                <div className="space-y-10 animate-in slide-in-from-bottom-8 duration-700">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h2 className="text-3xl font-black text-white tracking-tighter uppercase">List New Property</h2>
                                            <p className="text-white/40 text-base font-medium mt-1">Registry Command: Deploy Asset to the FUTA Housing Node.</p>
                                        </div>
                                        <button onClick={() => setActiveTab('my_hostels')} className="bg-white/5 hover:bg-white/10 text-white border border-white/10 px-6 h-12 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all active:scale-95 flex items-center gap-2">
                                            <FiX /> Cancel
                                        </button>
                                    </div>

                                    <form onSubmit={handleAddProperty} className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                                        {/* Form Fields - Left side */}
                                        <div className="lg:col-span-8 space-y-8">
                                            {/* Section 1: Registry Assets (Identity/Address) */}
                                            <div className="bg-white/[0.02] border border-white/5 rounded-[2.5rem] p-10 space-y-10 shadow-2xl">
                                                <div className="flex items-center justify-between border-b border-white/5 pb-6">
                                                    <div>
                                                        <h4 className="text-sm font-black text-white uppercase tracking-[0.2em]">Registry Assets</h4>
                                                        <p className="text-[8px] text-white/30 font-bold uppercase tracking-[0.2em] mt-1">Define the core unit characteristics</p>
                                                    </div>
                                                    <div className="flex items-center gap-2 px-3 py-1.5 bg-violet-500/10 border border-violet-500/20 rounded-full">
                                                        <div className="w-1.5 h-1.5 rounded-full bg-violet-500 animate-pulse" />
                                                        <span className="text-[8px] font-black text-violet-400 uppercase tracking-widest">Active Draft</span>
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                                    <div className="space-y-3">
                                                        <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] ml-1">Asset Identity</label>
                                                        <input
                                                            required
                                                            value={propertyForm.title}
                                                            onChange={e => setPropertyForm({ ...propertyForm, title: e.target.value })}
                                                            placeholder="e.g. Royal Palms Suite"
                                                            className="w-full h-14 bg-white/[0.03] border border-white/10 rounded-2xl px-6 font-bold text-white focus:bg-white/[0.05] focus:border-violet-500 outline-none transition-all shadow-sm"
                                                        />
                                                    </div>

                                                    <div className="space-y-3">
                                                        <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] ml-1">Asset Category</label>
                                                        <select
                                                            value={propertyForm.propertyType}
                                                            onChange={e => setPropertyForm({ ...propertyForm, propertyType: e.target.value })}
                                                            className="w-full h-14 bg-[#1c2231] border border-white/10 rounded-2xl px-6 font-bold text-white focus:border-violet-500 outline-none transition-all appearance-none cursor-pointer shadow-sm"
                                                        >
                                                            {PROPERTY_TYPES.map(type => <option key={type} value={type}>{type}</option>)}
                                                        </select>
                                                    </div>

                                                    <div className="space-y-3">
                                                        <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] ml-1">Preferred Tenants</label>
                                                        <div className="flex flex-wrap gap-2 p-4 bg-white/[0.02] border border-white/10 rounded-2xl min-h-[56px]">
                                                            {TENANT_TYPES.map(type => {
                                                                const isSelected = propertyForm.preferredTenants.includes(type);
                                                                return (
                                                                    <button
                                                                        key={type}
                                                                        type="button"
                                                                        onClick={() => {
                                                                            const current = propertyForm.preferredTenants;
                                                                            if (type === 'Anyone') {
                                                                                setPropertyForm({ ...propertyForm, preferredTenants: ['Anyone'] });
                                                                            } else {
                                                                                const newSelection = current.includes(type)
                                                                                    ? current.filter(t => t !== type)
                                                                                    : [...current.filter(t => t !== 'Anyone'), type];
                                                                                setPropertyForm({
                                                                                    ...propertyForm,
                                                                                    preferredTenants: newSelection.length === 0 ? ['Anyone'] : newSelection
                                                                                });
                                                                            }
                                                                        }}
                                                                        className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ${isSelected
                                                                            ? 'bg-violet-600 text-white border-violet-500 shadow-lg shadow-violet-600/20 scale-105'
                                                                            : 'bg-white/5 text-white/40 border-white/5 hover:bg-white/10 hover:text-white'
                                                                            }`}
                                                                    >
                                                                        {type}
                                                                    </button>
                                                                );
                                                            })}
                                                        </div>
                                                        <p className="text-[8px] font-bold text-white/20 uppercase tracking-widest ml-1">Select all that apply. "Anyone" covers all categories.</p>
                                                    </div>
                                                </div>

                                                <div className="space-y-3">
                                                    <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] ml-1">Registry Address</label>
                                                    <div className="relative group/loc">
                                                        <div className="relative">
                                                            <input
                                                                required
                                                                value={propertyForm.location}
                                                                onChange={e => handleAddressSearch(e.target.value)}
                                                                onFocus={() => addressSuggestions.length > 0 && setShowSuggestions(true)}
                                                                placeholder="Search for a real location..."
                                                                className={`w-full h-14 bg-white/[0.03] border rounded-2xl px-6 font-bold text-white focus:bg-white/[0.05] outline-none transition-all ${propertyForm.longitude ? 'border-emerald-500/50 pr-12' : 'border-white/10 focus:border-violet-500'} shadow-sm`}
                                                            />
                                                            {isSearchingAddress && (
                                                                <div className="absolute right-4 top-4">
                                                                    <div className="w-6 h-6 border-2 border-violet-500/20 border-t-violet-500 rounded-full animate-spin" />
                                                                </div>
                                                            )}
                                                            {propertyForm.longitude && !isSearchingAddress && (
                                                                <div className="absolute right-4 top-4 text-emerald-500">
                                                                    <FiCheckCircle size={24} />
                                                                </div>
                                                            )}
                                                        </div>

                                                        {/* Interactive Map Trigger */}
                                                        <div className="mt-4 flex items-center justify-between">
                                                            <button
                                                                type="button"
                                                                onClick={() => setShowMapPicker(true)}
                                                                className="flex items-center gap-2 px-4 py-2 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 border border-indigo-500/20 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95"
                                                            >
                                                                <FiMapPin size={14} /> Select on Map
                                                            </button>
                                                            {propertyForm.latitude && propertyForm.longitude && (
                                                                <p className="text-[9px] font-bold text-white/20 uppercase tracking-widest">
                                                                    Precision Coordinates Locked: {propertyForm.latitude.toFixed(4)}, {propertyForm.longitude.toFixed(4)}
                                                                </p>
                                                            )}
                                                        </div>

                                                        {showSuggestions && addressSuggestions.length > 0 && (
                                                            <div className="absolute z-50 mt-2 w-full bg-[#1c2231] border border-white/10 rounded-2xl shadow-2xl overflow-hidden backdrop-blur-xl border-t-0 ring-1 ring-white/10">
                                                                {addressSuggestions.map((feature) => (
                                                                    <button
                                                                        key={feature.id}
                                                                        type="button"
                                                                        onClick={() => selectSuggestion(feature)}
                                                                        className="w-full text-left px-6 py-4 hover:bg-white/5 transition-colors border-b border-white/5 last:border-0"
                                                                    >
                                                                        <p className="text-sm font-bold text-white mb-0.5">{feature.text}</p>
                                                                        <p className="text-[10px] font-medium text-white/40 truncate">{feature.place_name}</p>
                                                                    </button>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                    {propertyForm.longitude && (
                                                        <p className="text-[8px] font-bold text-emerald-400 uppercase tracking-widest ml-1 animate-pulse flex items-center gap-1.5">
                                                            <FiTarget size={10} /> Registry Node Verified: [{propertyForm.longitude.toFixed(4)}, {propertyForm.latitude?.toFixed(4)}]
                                                        </p>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Section 2: Narrative */}
                                            <div className="space-y-4">
                                                <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] ml-1">Asset Narrative</label>
                                                <textarea
                                                    required
                                                    value={propertyForm.description}
                                                    onChange={e => setPropertyForm({ ...propertyForm, description: e.target.value })}
                                                    placeholder="Provide a professional description of the asset..."
                                                    className="w-full h-40 bg-white/[0.03] border border-white/10 rounded-[2.5rem] p-8 font-bold text-white focus:bg-white/[0.05] focus:border-violet-500 outline-none transition-all resize-none shadow-sm text-base"
                                                />
                                            </div>

                                            {/* Section 3: Connectivity (Amenities/Rules) */}
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                                <div className="space-y-4">
                                                    <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] ml-1">Amenities</label>
                                                    <div className="flex flex-wrap gap-2 mb-2 min-h-[40px] p-4 bg-white/[0.02] border border-white/5 rounded-2xl">
                                                        {propertyForm.amenities.map((item, idx) => (
                                                            <span key={idx} className="bg-violet-500/10 text-violet-400 px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest flex items-center gap-2 border border-violet-500/20">
                                                                {item}
                                                                <button type="button" onClick={() => removeListItem('amenities', idx)} className="hover:text-white"><FiX size={10} /></button>
                                                            </span>
                                                        ))}
                                                        {propertyForm.amenities.length === 0 && <span className="text-white/10 text-[9px] font-bold uppercase tracking-widest">No amenities added</span>}
                                                    </div>
                                                    <input
                                                        onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addListItem('amenities', (e.target as any).value); (e.target as any).value = ''; } }}
                                                        placeholder="Type and press Enter (e.g. Security)"
                                                        className="w-full h-14 bg-white/[0.03] border border-white/10 rounded-2xl px-6 text-xs font-bold text-white outline-none focus:border-violet-500 transition-all shadow-sm"
                                                    />
                                                </div>
                                                <div className="space-y-4">
                                                    <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] ml-1">Rules</label>
                                                    <div className="flex flex-wrap gap-2 mb-2 min-h-[40px] p-4 bg-white/[0.02] border border-white/10 rounded-2xl">
                                                        {propertyForm.rules.map((item, idx) => (
                                                            <span key={idx} className="bg-rose-500/10 text-rose-400 px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest flex items-center gap-2 border border-rose-500/20">
                                                                {item}
                                                                <button type="button" onClick={() => removeListItem('rules', idx)} className="hover:text-white"><FiX size={10} /></button>
                                                            </span>
                                                        ))}
                                                        {propertyForm.rules.length === 0 && <span className="text-white/10 text-[9px] font-bold uppercase tracking-widest">No rules added</span>}
                                                    </div>
                                                    <input
                                                        onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addListItem('rules', (e.target as any).value); (e.target as any).value = ''; } }}
                                                        placeholder="Type and press Enter (e.g. No Pets)"
                                                        className="w-full h-14 bg-white/[0.03] border border-white/10 rounded-2xl px-6 text-xs font-bold text-white outline-none focus:border-violet-500 transition-all shadow-sm"
                                                    />
                                                </div>
                                            </div>

                                            {/* Section 4: Damage Registry */}
                                            <div className="bg-[#1c2231]/50 border border-white/5 rounded-[2.5rem] p-10 space-y-8">
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <h4 className="text-sm font-black text-white uppercase tracking-widest">Property Health Registry</h4>
                                                        <p className="text-[8px] text-white/30 font-bold uppercase tracking-[0.2em] mt-1">Registry of existing damages. Mandatory for deposit protection.</p>
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={() => addDamage("New damage entry")}
                                                        className="h-10 px-4 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all"
                                                    >
                                                        <FiPlus size={14} /> Log Damage
                                                    </button>
                                                </div>

                                                <div className="space-y-4">
                                                    {propertyForm.damages.map((dmg, idx) => (
                                                        <div key={idx} className="bg-white/[0.03] border border-white/5 rounded-3xl p-6 relative group/dmg overflow-hidden">
                                                            <div className="flex flex-col gap-4">
                                                                <div className="flex items-center justify-between">
                                                                    <span className="bg-rose-500/10 text-rose-500 px-3 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest border border-rose-500/20 shadow-lg">Damage ID: PDX-{idx + 101}</span>
                                                                    <button type="button" onClick={() => setPropertyForm(p => ({ ...p, damages: p.damages.filter((_, i) => i !== idx) }))} className="text-white/20 hover:text-rose-500 transition-colors"><FiX size={16} /></button>
                                                                </div>
                                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                                    <div className="space-y-2">
                                                                        <label className="text-[8px] font-black text-white/20 uppercase tracking-widest">Detailed Description</label>
                                                                        <input
                                                                            value={dmg.description}
                                                                            onChange={e => {
                                                                                const newDmgs = [...propertyForm.damages];
                                                                                newDmgs[idx].description = e.target.value;
                                                                                setPropertyForm({ ...propertyForm, damages: newDmgs });
                                                                            }}
                                                                            className="w-full h-11 bg-white/5 border border-white/5 rounded-xl px-4 text-xs font-bold text-white focus:border-rose-500/50 outline-none"
                                                                            placeholder="e.g. Leaking roof in lounge"
                                                                        />
                                                                    </div>
                                                                    <div className="space-y-2">
                                                                        <label className="text-[8px] font-black text-white/20 uppercase tracking-widest">Violation Fine (₦)</label>
                                                                        <input
                                                                            type="number"
                                                                            value={dmg.fineAmount}
                                                                            onChange={e => {
                                                                                const newDmgs = [...propertyForm.damages];
                                                                                newDmgs[idx].fineAmount = parseFloat(e.target.value || '0');
                                                                                setPropertyForm({ ...propertyForm, damages: newDmgs });
                                                                            }}
                                                                            className="w-full h-11 bg-white/5 border border-white/5 rounded-xl px-4 text-xs font-black text-rose-400 focus:border-rose-500/50 outline-none"
                                                                        />
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                    {propertyForm.damages.length === 0 && (
                                                        <div className="h-24 bg-emerald-500/5 border border-emerald-500/10 border-dashed rounded-[2rem] flex items-center justify-center gap-3">
                                                            <FiCheckCircle size={20} className="text-emerald-500/40" />
                                                            <p className="text-[9px] font-black text-emerald-500/40 uppercase tracking-widest">Asset Integrity Verified: 0 Active Damages</p>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Section 5: Media Manager */}
                                            <div className="bg-[#111622] rounded-[2.5rem] p-10 border border-white/5 shadow-2xl space-y-10">
                                                <div>
                                                    <h4 className="text-xl font-black text-white tracking-tight uppercase">Registry Visuals</h4>
                                                    <p className="text-[10px] text-white/30 font-bold uppercase tracking-widest mt-1">Upload HQ media for the property gallery.</p>
                                                </div>

                                                <div className="space-y-6">
                                                    <div className="flex items-center justify-between">
                                                        <p className="text-[10px] font-black text-violet-400 uppercase tracking-[0.2em]">Asset Images</p>
                                                        <label className="cursor-pointer h-10 px-4 bg-violet-600 hover:bg-violet-500 text-white rounded-xl flex items-center gap-2 text-[9px] font-black uppercase tracking-widest transition-all shadow-md">
                                                            <FiPlus /> Upload Image
                                                            <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileUpload(e, 'image')} />
                                                        </label>
                                                    </div>

                                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                                        {propertyForm.images.map((img, idx) => (
                                                            <div key={idx} className="group bg-white/[0.02] border border-white/5 rounded-2xl overflow-hidden shadow-xl">
                                                                <div className="relative h-48">
                                                                    <Image src={img.url} layout="fill" objectFit="cover" alt="Property" />
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => setPropertyForm(p => ({ ...p, images: p.images.filter((_, i) => i !== idx) }))}
                                                                        className="absolute top-3 right-3 w-8 h-8 rounded-full bg-red-500 text-white flex items-center justify-center shadow-lg transition-transform hover:scale-110"
                                                                    >
                                                                        <FiX size={14} />
                                                                    </button>
                                                                </div>
                                                                <div className="p-4">
                                                                    <textarea
                                                                        placeholder="Add image description..."
                                                                        value={img.description}
                                                                        onChange={(e) => {
                                                                            const newImages = [...propertyForm.images];
                                                                            newImages[idx].description = e.target.value;
                                                                            setPropertyForm({ ...propertyForm, images: newImages });
                                                                        }}
                                                                        className="w-full bg-[#070b14] border border-white/5 rounded-xl p-3 text-xs font-medium text-white/60 focus:border-violet-500/50 outline-none transition-all h-20 resize-none"
                                                                    />
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>

                                                <div className="space-y-6 pt-10 border-t border-white/5">
                                                    <div className="flex items-center justify-between">
                                                        <p className="text-[10px] font-black text-cyan-400 uppercase tracking-[0.2em]">Asset Videos</p>
                                                        <label className="cursor-pointer h-10 px-4 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl flex items-center gap-2 text-[9px] font-black uppercase tracking-widest transition-all shadow-md">
                                                            <FiPlus /> Upload Video
                                                            <input type="file" accept="video/*" className="hidden" onChange={(e) => handleFileUpload(e, 'video')} />
                                                        </label>
                                                    </div>

                                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                                        {propertyForm.videos.map((vid, idx) => (
                                                            <div key={idx} className="group bg-white/[0.02] border border-white/5 rounded-2xl overflow-hidden shadow-xl">
                                                                <div className="relative h-48 bg-black flex items-center justify-center">
                                                                    <video src={vid.url} className="w-full h-full object-contain" />
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => setPropertyForm(p => ({ ...p, videos: p.videos.filter((_, i) => i !== idx) }))}
                                                                        className="absolute top-3 right-3 w-8 h-8 rounded-full bg-red-500 text-white flex items-center justify-center shadow-lg transition-transform hover:scale-110"
                                                                    >
                                                                        <FiX size={14} />
                                                                    </button>
                                                                </div>
                                                                <div className="p-4">
                                                                    <textarea
                                                                        placeholder="Add video description..."
                                                                        value={vid.description}
                                                                        onChange={(e) => {
                                                                            const newVideos = [...propertyForm.videos];
                                                                            newVideos[idx].description = e.target.value;
                                                                            setPropertyForm({ ...propertyForm, videos: newVideos });
                                                                        }}
                                                                        className="w-full bg-[#070b14] border border-white/5 rounded-xl p-3 text-xs font-medium text-white/60 focus:border-cyan-500/50 outline-none transition-all h-20 resize-none"
                                                                    />
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Right Column - Financials & Submit */}
                                        <div className="lg:col-span-4 space-y-8">
                                            <div className="sticky top-28 space-y-8">
                                                <div className="bg-[#111622] rounded-[2.5rem] p-10 border border-white/5 shadow-2xl relative overflow-hidden group">
                                                    <div className="absolute top-0 right-0 w-32 h-32 bg-violet-600/10 rounded-full blur-[40px] -mr-16 -mt-16" />
                                                    <div className="relative z-10">
                                                        <h4 className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] mb-8">Financial Protocol</h4>

                                                        <div className="space-y-8">
                                                            <div className="space-y-3">
                                                                <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] ml-1">Annuity Rent (₦)</label>
                                                                <input
                                                                    required
                                                                    type="number"
                                                                    value={propertyForm.rent}
                                                                    onChange={e => setPropertyForm({ ...propertyForm, rent: e.target.value })}
                                                                    className="w-full h-16 bg-[#070b14] border border-white/10 rounded-[1.25rem] px-8 font-black text-white focus:border-emerald-500 transition-all text-2xl tracking-tighter shadow-inner"
                                                                />
                                                            </div>
                                                            <div className="grid grid-cols-1 gap-6">
                                                                <div className="space-y-3">
                                                                    <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] ml-1">Caution Fee (₦)</label>
                                                                    <input
                                                                        type="number"
                                                                        value={propertyForm.cautionFee}
                                                                        onChange={e => setPropertyForm({ ...propertyForm, cautionFee: e.target.value })}
                                                                        className="w-full h-14 bg-white/[0.03] border border-white/10 rounded-2xl px-6 font-bold text-white outline-none focus:border-violet-500 transition-all shadow-sm"
                                                                    />
                                                                </div>
                                                                <div className="space-y-3">
                                                                    <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] ml-1">Management Fee (₦)</label>
                                                                    <input
                                                                        type="number"
                                                                        value={propertyForm.agentFee}
                                                                        onChange={e => setPropertyForm({ ...propertyForm, agentFee: e.target.value })}
                                                                        className="w-full h-14 bg-white/[0.03] border border-white/10 rounded-2xl px-6 font-bold text-white outline-none focus:border-violet-500 transition-all shadow-sm"
                                                                    />
                                                                </div>
                                                                <div className="space-y-3">
                                                                    <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] ml-1">Inspection Fee (₦)</label>
                                                                    <input
                                                                        type="number"
                                                                        value={propertyForm.inspectionFee}
                                                                        onChange={e => setPropertyForm({ ...propertyForm, inspectionFee: e.target.value })}
                                                                        className="w-full h-14 bg-white/[0.03] border border-white/10 rounded-2xl px-6 font-bold text-white outline-none focus:border-violet-500 transition-all shadow-sm"
                                                                    />
                                                                </div>
                                                            </div>

                                                            <div className="pt-8 border-t border-white/5 space-y-6">
                                                                <div className="flex items-center justify-between">
                                                                    <span className="text-[10px] font-black text-white/30 uppercase tracking-widest">Calculated Total</span>
                                                                    <span className="text-2xl font-black text-white tracking-tighter">₦{(parseFloat(propertyForm.rent || '0') + parseFloat(propertyForm.cautionFee || '0') + parseFloat(propertyForm.agentFee || '0')).toLocaleString()}</span>
                                                                </div>

                                                                <button
                                                                    type="submit"
                                                                    disabled={isSaving}
                                                                    className="w-full h-16 bg-violet-600 hover:bg-violet-500 disabled:bg-white/10 text-white font-black rounded-2xl flex items-center justify-center gap-3 transition-all active:scale-95 shadow-xl shadow-violet-600/20 text-xs uppercase tracking-[0.2em]"
                                                                >
                                                                    {isSaving ? <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" /> : <>Deploy to Registry <FiArrowRight /></>}
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="p-8 bg-amber-500/5 border border-amber-500/10 rounded-[2rem]">
                                                    <div className="flex items-center gap-2 text-amber-500 mb-2">
                                                        <FiInfo size={14} />
                                                        <span className="text-[10px] font-black uppercase tracking-widest">Compliance Check</span>
                                                    </div>
                                                    <p className="text-[10px] text-amber-500/60 font-medium leading-relaxed uppercase">
                                                        Ensure all coordinates and health logs are accurate. Falsifying registry data results in immediate node suspension.
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </form>
                                </div>
                            )}



                            {
                                activeTab === 'wallet' && (
                                    <div className="space-y-8 animate-in slide-in-from-bottom-8 duration-700">
                                        {/* Unified Liquidity Hero */}
                                        <div className="relative group overflow-hidden rounded-[2rem] bg-slate-950 p-8 text-white shadow-2xl">
                                            <div className="absolute inset-0">
                                                <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-indigo-600/10 rounded-full blur-[100px] -mr-32 -mt-32" />
                                                <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-pink-500/5 rounded-full blur-[80px] -ml-24 -mb-24" />
                                            </div>
                                            <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-12">
                                                <div className="flex-1">
                                                    <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-8 backdrop-blur-xl">
                                                        <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.5)] animate-pulse" />
                                                        <span className="text-[9px] font-black uppercase tracking-[0.2em] text-indigo-300">{isAgent ? 'Net Registry Balance' : 'Housing Wallet Balance'}</span>
                                                    </div>
                                                    <h2 className="text-5xl font-black tracking-tighter mb-8 leading-none">
                                                        ₦{(balance + escrowBalance).toLocaleString()}
                                                    </h2>
                                                    <div className="flex flex-wrap gap-4">
                                                        <button onClick={() => setShowFundModal(true)} className="h-14 bg-white text-slate-950 px-8 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all shadow-xl hover:scale-105 active:scale-95">
                                                            {isAgent ? 'Inject Capital' : 'Top-up Wallet'}
                                                        </button>
                                                        {isAgent && (
                                                            <button onClick={() => setShowWithdrawModal(true)} className="h-14 bg-white/10 hover:bg-white/20 text-white border border-white/10 px-8 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all backdrop-blur-xl hover:scale-105 active:scale-95">
                                                                Settle to Bank
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="flex flex-col sm:flex-row gap-6">
                                                    <div className="p-8 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl min-w-[240px]">
                                                        <p className="text-[9px] font-black text-indigo-400 uppercase tracking-widest mb-3">{isAgent ? 'Available Funds' : 'Spendable Balance'}</p>
                                                        <p className="text-2xl font-black text-white tracking-tight">₦{balance.toLocaleString()}</p>
                                                        <div className="mt-6 h-1 bg-indigo-500/20 rounded-full overflow-hidden">
                                                            <div className="h-full bg-indigo-500 w-[70%]" />
                                                        </div>
                                                    </div>
                                                    <div className="p-8 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl min-w-[240px]">
                                                        <p className="text-[9px] font-black text-amber-400 uppercase tracking-widest mb-3">{isAgent ? 'Escrowed Yield' : 'Held for Rent'}</p>
                                                        <p className="text-2xl font-black text-white tracking-tight">₦{escrowBalance.toLocaleString()}</p>
                                                        <div className="mt-6 h-1 bg-amber-500/20 rounded-full overflow-hidden">
                                                            <div className="h-full bg-amber-500 w-[30%]" />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                                            <div className="lg:col-span-8 space-y-8">
                                                {/* 📊 WALLET ANALYTICS PULSE */}
                                                <div className="bg-[#111622] rounded-[2.5rem] p-8 border border-white/5 shadow-2xl relative overflow-hidden">
                                                    <div className="flex items-center justify-between mb-8">
                                                        <div>
                                                            <h4 className="text-xl font-black text-white tracking-tight uppercase leading-none mb-1.5">{isAgent ? 'Revenue Stream' : 'Spending Dynamics'}</h4>
                                                            <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em]">Telemetry Registry Pulse</p>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                                                            <span className="text-[9px] font-black text-indigo-400 uppercase tracking-widest">Real-time Node</span>
                                                        </div>
                                                    </div>

                                                    <div className="h-48 w-full">
                                                        <ResponsiveContainer width="100%" height="100%">
                                                            <AreaChart data={getChartData()}>
                                                                <defs>
                                                                    <linearGradient id="walletChartGrad" x1="0" y1="0" x2="0" y2="1">
                                                                        <stop offset="0%" stopColor={isAgent ? "#8b5cf6" : "#06b6d4"} stopOpacity={0.15} />
                                                                        <stop offset="100%" stopColor={isAgent ? "#8b5cf6" : "#06b6d4"} stopOpacity={0} />
                                                                    </linearGradient>
                                                                </defs>
                                                                <CartesianGrid strokeDasharray="6 6" vertical={false} stroke="#ffffff03" />
                                                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#ffffff20', fontSize: 10, fontWeight: 800 }} dy={10} />
                                                                <Tooltip
                                                                    contentStyle={{ backgroundColor: '#1c2231', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.05)', color: '#fff' }}
                                                                />
                                                                <Area type="monotone" dataKey={isAgent ? "bookings" : "amount"} stroke={isAgent ? "#8b5cf6" : "#06b6d4"} strokeWidth={4} fill="url(#walletChartGrad)" />
                                                            </AreaChart>
                                                        </ResponsiveContainer>
                                                    </div>
                                                </div>

                                                {/* Transaction Ledger */}
                                                <div className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-sm">
                                                    <div className="flex items-center justify-between mb-8">
                                                        <div>
                                                            <h3 className="text-xl font-black text-slate-900 tracking-tight uppercase leading-none mb-1.5">{isAgent ? 'Financial Records' : 'Wallet History'}</h3>
                                                            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-[0.2em]">{isAgent ? 'Audit-ready operation history' : 'Your recent rental payments and top-ups'}</p>
                                                        </div>
                                                        <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-200">
                                                            <FiActivity size={18} />
                                                        </div>
                                                    </div>

                                                    <div className="space-y-4">
                                                        {transactions.length === 0 ? (
                                                            <div className="py-20 text-center flex flex-col items-center">
                                                                <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-4 border border-slate-100">
                                                                    <FiActivity size={24} className="text-slate-100" />
                                                                </div>
                                                                <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em]">No records found</p>
                                                            </div>
                                                        ) : (
                                                            [...transactions].reverse().map((tx) => (
                                                                <div key={tx.id || tx._id} className="group flex items-center gap-6 p-4 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-all duration-300">
                                                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm ${tx.type === 'DEBIT' ? 'bg-rose-500/10 text-rose-500 border border-rose-500/20' : 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'}`}>
                                                                        {tx.type === 'DEBIT' ? <FiArrowUpRight size={16} /> : <FiArrowDownLeft size={16} />}
                                                                    </div>
                                                                    <div className="flex-1 min-w-0">
                                                                        <div className="flex items-center gap-2 mb-1">
                                                                            <p className="text-[11px] font-black text-slate-900 truncate tracking-tight uppercase leading-none">{tx.description}</p>
                                                                            <span className={`px-1.5 py-0.5 rounded text-[7px] font-black uppercase tracking-widest ${tx.type === 'DEBIT' ? 'bg-rose-500/10 text-rose-500' : 'bg-emerald-500/10 text-emerald-500'}`}>
                                                                                {tx.purpose}
                                                                            </span>
                                                                        </div>
                                                                        <div className="flex items-center gap-3">
                                                                            <p className="text-[8px] text-slate-400 font-bold uppercase tracking-widest">{new Date(tx.createdAt).toLocaleString('en-NG', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}</p>
                                                                            <button
                                                                                onClick={() => { setSelectedTransaction(tx); setShowReceiptModal(true); }}
                                                                                className="text-[7px] font-black text-violet-500 uppercase tracking-widest hover:text-violet-700 transition-colors flex items-center gap-1 group/btn"
                                                                            >
                                                                                <FiFileText size={8} /> View Receipt
                                                                            </button>
                                                                        </div>
                                                                    </div>
                                                                    <div className="text-right">
                                                                        <p className={`text-base font-black tracking-tighter ${tx.type === 'DEBIT' ? 'text-rose-500' : 'text-emerald-500'}`}>
                                                                            {tx.type === 'DEBIT' ? '-' : '+'}₦{tx.amount.toLocaleString()}
                                                                        </p>
                                                                        <p className="text-[7px] font-bold text-slate-300 uppercase tracking-[0.2em]">{isAgent ? 'Validated' : 'Confirmed'}</p>
                                                                    </div>
                                                                </div>
                                                            ))
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="lg:col-span-4 space-y-6">
                                                {/* 🏦 BANK SETTLEMENT CONFIG */}
                                                <div className="bg-[#111622] rounded-[2.5rem] p-8 border border-white/5 shadow-2xl transition-all hover:border-violet-500/30">
                                                    <div className="w-12 h-12 bg-violet-500/10 rounded-2xl flex items-center justify-center text-violet-400 mb-6 border border-violet-500/20">
                                                        <FiCreditCard size={20} />
                                                    </div>
                                                    <h4 className="text-base font-black text-white mb-1 tracking-tight uppercase leading-none">Settlement Route</h4>
                                                    <p className="text-[9px] text-white/30 font-bold uppercase tracking-widest mb-8">{isAgent ? 'Configured Automated Payouts' : 'Refund & Payment Gateway'}</p>

                                                    {user?.bankDetails?.accountNumber ? (
                                                        <div className="space-y-4">
                                                            <div className="p-6 bg-violet-500/5 rounded-[2rem] border border-violet-500/10">
                                                                <p className="text-[8px] font-black text-violet-400 uppercase tracking-widest mb-3">Verified Recipient</p>
                                                                <p className="text-base font-black text-white truncate leading-none mb-2">{user.bankDetails.accountName}</p>
                                                                <p className="text-xs font-bold text-white/40">{user.bankDetails.bankName} • {user.bankDetails.accountNumber}</p>
                                                            </div>
                                                            <button
                                                                onClick={() => setShowWithdrawModal(true)}
                                                                className="w-full h-14 bg-white/5 hover:bg-white/10 text-white rounded-2xl font-black text-[9px] uppercase tracking-widest transition-all border border-white/10 active:scale-95 flex items-center justify-center gap-2"
                                                            >
                                                                Swap Payout Route
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <div className="p-6 border-2 border-dashed border-white/5 rounded-[2rem] text-center">
                                                            <p className="text-[10px] font-bold text-white/20 mb-6">{isAgent ? 'No settlement bank configured.' : 'Link a bank account for easy rent processing.'}</p>
                                                            <button
                                                                onClick={() => { setWithdrawForm(prev => ({ ...prev, amount: '' })); setShowWithdrawModal(true); }}
                                                                className="w-full h-14 bg-violet-600 hover:bg-violet-500 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] transition-all shadow-xl shadow-violet-600/20 active:scale-95 flex items-center justify-center gap-3 group"
                                                            >
                                                                <FiPlus className="transition-transform group-hover:rotate-90" />
                                                                Configure Payouts
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="bg-slate-950 rounded-[3rem] p-12 text-white shadow-2xl relative overflow-hidden">
                                                    <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-indigo-500/10 rounded-full blur-[60px]" />
                                                    <h4 className="text-xl font-black mb-10 tracking-tight">{isAgent ? 'Protocol Shield' : 'Tenant Protection'}</h4>
                                                    <div className="space-y-10">
                                                        {[
                                                            { label: isAgent ? 'Cloud Validation' : 'Payment Security', status: 'Live', color: 'bg-indigo-500' },
                                                            { label: isAgent ? 'Asset Protection' : 'Rent Escrow', status: 'Active', color: 'bg-emerald-500' },
                                                            { label: isAgent ? 'Identity Sync' : 'Verified Hostels', status: 'Active', color: 'bg-indigo-500' },
                                                        ].map((item, i) => (
                                                            <div key={i} className="space-y-4">
                                                                <div className="flex justify-between text-[11px] font-black uppercase tracking-widest">
                                                                    <span className="text-slate-500">{item.label}</span>
                                                                    <span className="text-indigo-400">{item.status}</span>
                                                                </div>
                                                                <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                                                                    <div className={`h-full ${item.color} rounded-full w-full shadow-[0_0_12px_rgba(79,70,229,0.5)]`} />
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                    <div className="mt-14 p-8 bg-white/5 rounded-[2rem] border border-white/10">
                                                        <p className="text-xs font-bold text-slate-400 leading-relaxed italic text-center">
                                                            {isAgent
                                                                ? '"256-bit encryption protocol active across all financial registry nodes."'
                                                                : '"Your payments are held in secure escrow until you confirm move-in."'}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )
                            }

                            {/* ── SECURITY TAB ──────────────────────────────── */}
                            {
                                activeTab === 'security' && (
                                    <div className="space-y-10 animate-in slide-in-from-bottom-8 duration-700 max-w-5xl">
                                        <div className="mb-8">
                                            <h2 className="text-3xl font-black text-white tracking-tighter mb-2 uppercase">Security Operations</h2>
                                            <p className="text-white/40 text-base font-medium">Protecting your digital assets and identity on the FUTA Housing Registry.</p>
                                        </div>

                                        {/* Agent KYC Banner */}
                                        {isAgent && user.verificationStatus !== 'APPROVED' && (
                                            <div className="relative overflow-hidden bg-gradient-to-br from-violet-600 to-indigo-700 rounded-2xl p-8 text-white shadow-2xl">
                                                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-[80px] -mr-20 -mt-20" />
                                                <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                                                    <div>
                                                        <span className="inline-block text-[8px] font-black bg-white/20 border border-white/20 px-2 py-1 rounded-lg uppercase tracking-widest mb-2">
                                                            {user.verificationStatus === 'PENDING' ? '⏳ Under Review' : '⚠️ Action Required'}
                                                        </span>
                                                        <h3 className="text-xl font-black mb-1.5 tracking-tight">
                                                            {user.verificationStatus === 'PENDING' ? 'KYC Documents Under Review' : 'Complete Your Identity Verification'}
                                                        </h3>
                                                        <p className="text-white/70 text-xs max-w-md leading-relaxed">
                                                            {user.verificationStatus === 'PENDING'
                                                                ? 'Your NIN and selfie have been submitted. Our team is reviewing them — expect a response within 24 hours.'
                                                                : 'Upload your NIN document and take a live selfie to get your agent account verified.'}
                                                        </p>
                                                    </div>
                                                    {user.verificationStatus !== 'PENDING' && (
                                                        <button
                                                            onClick={() => setShowKycModal(true)}
                                                            className="shrink-0 bg-white text-indigo-700 font-black h-11 px-5 rounded-xl hover:bg-indigo-50 transition shadow-xl text-[10px] uppercase tracking-widest flex items-center gap-2"
                                                        >
                                                            🛡️ Start Verification
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        )}

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                            <div className="group p-10 rounded-[2.5rem] bg-white border border-slate-100 shadow-sm transition-all hover:border-indigo-100">
                                                <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 mb-8 border border-indigo-100 transition-transform group-hover:rotate-6">
                                                    <FiShield size={24} />
                                                </div>
                                                <h4 className="text-xl font-black text-slate-900 mb-6 tracking-tight uppercase">Registry Identity</h4>
                                                <div className="flex items-center gap-5 p-5 rounded-2xl bg-slate-50 border border-slate-100 mb-8">
                                                    <div className="w-14 h-14 rounded-2xl bg-emerald-500 flex items-center justify-center text-white shadow-xl shadow-emerald-500/10">
                                                        <FiCheckCircle size={28} />
                                                    </div>
                                                    <div>
                                                        <p className="text-lg font-black text-slate-950 leading-none">Status: Active</p>
                                                        <p className="text-emerald-600 text-[9px] font-black mt-1.5 uppercase tracking-[0.2em] bg-white px-2 py-0.5 rounded border border-emerald-100 w-fit">Registry Verified</p>
                                                    </div>
                                                </div>
                                                <p className="text-slate-400 text-[11px] leading-relaxed font-bold uppercase tracking-widest">Global cross-reference sync completed on 256-bit protocol.</p>
                                            </div>

                                            <div className="group p-10 rounded-[2.5rem] bg-slate-950 text-white flex flex-col justify-between shadow-2xl relative overflow-hidden border border-white/5">
                                                <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-500/10 rounded-full blur-[60px] -mr-24 -mt-24" />
                                                <div>
                                                    <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-indigo-400 mb-8 transition-transform group-hover:scale-110">
                                                        <FiLock size={24} />
                                                    </div>
                                                    <h4 className="text-xl font-black mb-4 tracking-tight uppercase">Encryption Protocol</h4>
                                                    <p className="text-slate-500 text-[11px] leading-relaxed font-bold uppercase tracking-widest mb-10">MFA layer-7 active protection enabled for all node requests.</p>
                                                </div>
                                                <button className="h-14 w-full bg-white text-slate-950 font-black rounded-2xl transition-all hover:bg-slate-50 text-[10px] uppercase tracking-widest shadow-2xl active:scale-95 flex items-center justify-center gap-2">
                                                    <FiShield size={16} /> Manage Access Keys
                                                </button>
                                            </div>
                                        </div>

                                        <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm relative overflow-hidden group">
                                            <h4 className="text-lg font-black text-slate-900 mb-6 tracking-tight flex items-center gap-2.5 uppercase"><FiUsers className="text-indigo-600" /> Account Registry</h4>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                                <div className="space-y-1">
                                                    <div className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Full Name</div>
                                                    <p className="text-sm font-black text-slate-900">{user.name}</p>
                                                </div>
                                                <div className="space-y-1">
                                                    <div className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Email Hash</div>
                                                    <p className="text-sm font-black text-slate-900">{user.email}</p>
                                                </div>
                                                <div className="space-y-1">
                                                    <div className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Phone Link</div>
                                                    <p className="text-sm font-black text-slate-900">{user.phone}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )
                            }

                            {
                                activeTab === 'settings' && (
                                    <div className="animate-in slide-in-from-bottom-8 duration-700">
                                        <Settings
                                            user={user}
                                            onUpdate={(updatedUser) => {
                                                dispatch({ type: 'auth/updateUser', payload: updatedUser });
                                                dispatch(getProfile());
                                            }}
                                        />
                                    </div>
                                )
                            }
                        </div>
                    </main>
                </div>
            </div>

            {/* 💳 FUND WALLET MODAL */}
            {
                showFundModal && (
                    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 sm:p-6 animate-in fade-in zoom-in duration-300">
                        <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-xl" onClick={() => !isProcessing && setShowFundModal(false)} />
                        <div className="relative w-full max-w-sm bg-white rounded-[1.5rem] shadow-2xl border border-slate-200 flex flex-col max-h-[95vh] overflow-hidden">
                            {/* Header Accents */}
                            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-emerald-500 via-indigo-500 to-purple-500 z-20" />

                            <div className="relative z-10 p-5 sm:p-6 overflow-y-auto">
                                <div className="flex justify-between items-start mb-5">
                                    <div className="flex flex-col">
                                        <div className="inline-flex items-center gap-2 px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded-full border border-emerald-100 mb-1">
                                            <FiArrowDownLeft size={8} />
                                            <span className="text-[8px] font-black uppercase tracking-widest">{isAgent ? 'Injection' : 'Top-up'}</span>
                                        </div>
                                        <h3 className="text-xl font-black text-slate-950 tracking-tighter uppercase leading-none">
                                            {isAgent ? 'Inject Capital' : 'Fund Wallet'}
                                        </h3>
                                    </div>
                                    <button
                                        onClick={() => setShowFundModal(false)}
                                        className="w-8 h-8 rounded-lg bg-slate-50 hover:bg-slate-100 flex items-center justify-center text-slate-400 transition-all active:scale-90"
                                    >
                                        <FiX size={16} />
                                    </button>
                                </div>

                                <form onSubmit={handleFundWallet} className="space-y-4">
                                    <div className="p-5 rounded-xl bg-slate-50 border border-slate-100 relative group transition-all focus-within:bg-white focus-within:border-emerald-600">
                                        <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-2 block">
                                            Amount (NGN)
                                        </label>
                                        <div className="flex items-center gap-2">
                                            <span className="text-xl font-black text-slate-300 tracking-tighter">₦</span>
                                            <input
                                                required
                                                autoFocus
                                                type="number"
                                                min="500"
                                                value={fundAmount}
                                                onChange={e => setFundAmount(e.target.value)}
                                                placeholder="5,000"
                                                className="flex-1 bg-transparent text-xl font-black text-slate-950 outline-none w-full placeholder:text-slate-200 tracking-tighter"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl flex items-center gap-2">
                                            <FiActivity size={12} className="text-indigo-500" />
                                            <p className="text-[7px] font-black text-indigo-900 uppercase tracking-widest leading-tight">Instant</p>
                                        </div>
                                        <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl flex items-center gap-2">
                                            <FiLock size={12} className="text-emerald-500" />
                                            <p className="text-[7px] font-black text-emerald-900 uppercase tracking-widest leading-tight">Secure</p>
                                        </div>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={isProcessing}
                                        className="w-full h-12 bg-slate-950 hover:bg-black active:scale-95 text-white rounded-xl font-black text-[9px] uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 shadow-lg disabled:opacity-50"
                                    >
                                        {isProcessing ? (
                                            <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                                        ) : (
                                            <>
                                                {isAgent ? 'Initialize' : 'Proceed'}
                                                <FiArrowRight size={14} />
                                            </>
                                        )}
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>
                )
            }

            {/* 💸 SETTLEMENT / BANK MODAL */}
            {
                showWithdrawModal && (
                    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 sm:p-6 animate-in fade-in zoom-in duration-300">
                        <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-xl" onClick={() => !isProcessing && setShowWithdrawModal(false)} />
                        <div className="relative w-full max-w-md bg-white rounded-[1.5rem] shadow-2xl overflow-hidden border border-slate-200 flex flex-col max-h-[95vh]">
                            {/* Header Accents */}
                            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-rose-500 z-20" />

                            <div className="relative z-10 p-5 sm:p-6 overflow-y-auto">
                                <div className="flex justify-between items-start mb-6">
                                    <div className="flex flex-col">
                                        <div className="inline-flex items-center gap-2 px-2 py-0.5 bg-rose-50 text-rose-600 rounded-full border border-rose-100 mb-1">
                                            <FiArrowUpRight size={8} className="rotate-45" />
                                            <span className="text-[8px] font-black uppercase tracking-widest text-indigo-400">
                                                {(!withdrawForm.amount || parseFloat(withdrawForm.amount) === 0) ? 'Registry' : 'Liquidity'}
                                            </span>
                                        </div>
                                        <h3 className="text-xl font-black text-slate-950 tracking-tighter uppercase leading-none">
                                            {(!withdrawForm.amount || parseFloat(withdrawForm.amount) === 0)
                                                ? 'Link Bank'
                                                : 'Withdraw Funds'}
                                        </h3>
                                    </div>
                                    <button
                                        onClick={() => setShowWithdrawModal(false)}
                                        className="w-8 h-8 rounded-lg bg-slate-50 hover:bg-slate-100 flex items-center justify-center text-slate-400 transition-all active:scale-90"
                                    >
                                        <FiX size={16} />
                                    </button>
                                </div>

                                <form onSubmit={handleWithdraw} className="space-y-4">
                                    <div className="p-5 rounded-xl bg-slate-50 border border-slate-100 relative group transition-all focus-within:bg-white focus-within:border-indigo-600">
                                        <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-2 block">
                                            {isAgent ? 'Amount' : 'Withdrawal'}
                                            <span className="ml-1 text-indigo-400 normal-case font-bold">(Optional for link)</span>
                                        </label>
                                        <div className="flex items-center gap-2">
                                            <span className="text-xl font-black text-slate-300 tracking-tighter">₦</span>
                                            <input
                                                type="number"
                                                max={balance}
                                                value={withdrawForm.amount}
                                                onChange={e => setWithdrawForm({ ...withdrawForm, amount: e.target.value })}
                                                placeholder="0.00"
                                                className="flex-1 bg-transparent text-xl font-black text-slate-950 outline-none w-full placeholder:text-slate-200 tracking-tighter"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <div className="space-y-1">
                                            <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest ml-1">Bank Name</label>
                                            <select
                                                required
                                                value={withdrawForm.bankName}
                                                onChange={e => {
                                                    const bank = banks.find(b => b.name === e.target.value);
                                                    setWithdrawForm({ ...withdrawForm, bankName: e.target.value, bankCode: bank?.code || '' });
                                                }}
                                                className="w-full h-11 bg-slate-50 border-2 border-slate-100 rounded-xl px-4 font-bold text-slate-950 focus:bg-white focus:border-indigo-600 outline-none transition-all text-xs appearance-none"
                                            >
                                                <option value="">{loadingBanks ? 'Loading banks...' : 'Select your bank'}</option>
                                                {banks.map(b => (
                                                    <option key={b.code} value={b.name}>{b.name}</option>
                                                ))}
                                            </select>
                                        </div>

                                        <div className="space-y-1">
                                            <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest ml-1">Account Number</label>
                                            <input
                                                required
                                                value={withdrawForm.accountNumber}
                                                onChange={e => setWithdrawForm({ ...withdrawForm, accountNumber: e.target.value })}
                                                placeholder="0123456789"
                                                className="w-full h-11 bg-slate-50 border-2 border-slate-100 rounded-xl px-4 font-bold text-slate-950 focus:bg-white focus:border-indigo-600 outline-none transition-all text-xs"
                                            />
                                        </div>

                                        <div className="space-y-1">
                                            <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest ml-1">Account Name</label>
                                            <input
                                                required
                                                value={withdrawForm.accountName}
                                                onChange={e => setWithdrawForm({ ...withdrawForm, accountName: e.target.value })}
                                                placeholder="JOHN DOE"
                                                className="w-full h-11 bg-slate-50 border-2 border-slate-100 rounded-xl px-4 font-bold text-slate-950 focus:bg-white focus:border-indigo-600 outline-none transition-all text-xs uppercase"
                                            />
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-3 pt-2">
                                        <div
                                            className="flex items-center gap-3 p-3 bg-indigo-50 border border-indigo-100 rounded-xl cursor-pointer"
                                            onClick={() => setSaveToProfile(!saveToProfile)}
                                        >
                                            <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${saveToProfile ? 'bg-indigo-600 border-indigo-600' : 'bg-white border-slate-200'}`}>
                                                {saveToProfile && <FiCheckCircle className="text-white" size={10} />}
                                            </div>
                                            <p className="text-[8px] font-black text-indigo-900 uppercase tracking-widest">Save to Profile</p>
                                        </div>

                                        <button
                                            type="submit"
                                            disabled={isProcessing}
                                            className="w-full h-12 bg-slate-950 hover:bg-black active:scale-95 text-white rounded-xl font-black text-[9px] uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 shadow-lg disabled:opacity-50"
                                        >
                                            {isProcessing ? (
                                                <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                                            ) : (
                                                <>
                                                    {(!withdrawForm.amount || parseFloat(withdrawForm.amount) === 0) ? (
                                                        <>Link Bank <FiPlus /></>
                                                    ) : (
                                                        <>Withdraw <FiArrowRight className="rotate-45" /></>
                                                    )}
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                )
            }

            {/* MAP PICKER MODAL */}
            <MapPickerModal
                isOpen={showMapPicker}
                onClose={() => setShowMapPicker(false)}
                onSelect={handleMapSelect}
                mapboxToken={MAPBOX_TOKEN}
                initialCoords={propertyForm.longitude ? [propertyForm.longitude, propertyForm.latitude!] : undefined}
            />

            {/* AGENT KYC MODAL */}
            {
                showKycModal && (
                    <AgentKycModal
                        onComplete={() => { setShowKycModal(false); fetchAgentData(); }}
                        onClose={() => setShowKycModal(false)}
                    />
                )
            }
            {/* 🧾 RECEIPT MODAL */}
            {showReceiptModal && selectedTransaction && (
                <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-300">
                    <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-xl" onClick={() => !printLoading && setShowReceiptModal(false)} />
                    <div className="relative w-full max-w-[480px] flex flex-col items-center max-h-[95vh]">
                        <div className="w-full flex justify-end mb-4 gap-2 px-4 sm:px-0">
                            <button
                                onClick={handleDownloadReceipt}
                                disabled={printLoading}
                                className="h-10 px-5 bg-white text-slate-950 rounded-xl font-black text-[9px] uppercase tracking-widest flex items-center gap-2 shadow-xl hover:scale-105 transition-all disabled:opacity-50"
                            >
                                {printLoading ? <div className="w-3 h-3 border-2 border-slate-950/20 border-t-slate-950 rounded-full animate-spin" /> : <><FiFileText size={14} /> Download PDF</>}
                            </button>
                            <button
                                onClick={() => setShowReceiptModal(false)}
                                className="w-10 h-10 bg-white/10 text-white rounded-xl flex items-center justify-center hover:bg-white/20 transition-all shadow-xl"
                            >
                                <FiX size={18} />
                            </button>
                        </div>
                        <div className="w-full overflow-y-auto px-4 pb-12 scrollbar-hide">
                            <div className="animate-in slide-in-from-bottom-12 duration-500">
                                <Receipt transaction={selectedTransaction} user={user} />
                            </div>
                            <p className="mt-8 text-center text-[8px] font-black text-white/20 uppercase tracking-[0.4em]">Official FUTA Housing Registry Sync</p>
                        </div>
                    </div>
                </div>
            )}

            <style jsx global>{`
                .scrollbar-hide::-webkit-scrollbar { display: none; }
                .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
                @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
            `}</style>
        </>
    );
}

