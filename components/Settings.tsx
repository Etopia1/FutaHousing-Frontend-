import React, { useState } from 'react';
import { FiUser, FiShield, FiBell, FiMapPin, FiMail, FiPhone, FiCheck, FiSave, FiAlertCircle } from 'react-icons/fi';
import { toast } from 'react-toastify';
import api from '../lib/apiClient';

interface SettingsProps {
    user: any;
    onUpdate: (updatedUser: any) => void;
}

const Settings: React.FC<SettingsProps> = ({ user, onUpdate }) => {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: user?.name || '',
        phone: user?.phone || '',
        address: user?.address || '',
        businessName: user?.businessName || '',
    });

    const [twoFactor, setTwoFactor] = useState(user?.twoFactorEnabled || false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSaveProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const { data } = await api.put('/auth/profile', formData);
            onUpdate(data.user);
            toast.success('Profile updated successfully!');
        } catch (error: any) {
            toast.error(error.response?.data?.error || 'Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    const handleToggle2FA = async () => {
        try {
            const { data } = await api.put('/auth/toggle-2fa');
            setTwoFactor(data.twoFactorEnabled);
            toast.success(data.message);
        } catch (error: any) {
            toast.error('Failed to toggle security settings');
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-12">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-black text-slate-900 tracking-tight">Account Protocols</h1>
                <p className="text-slate-500 font-medium">Manage your identity records and security parameters.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Profile Card */}
                <div className="lg:col-span-2 space-y-6">
                    <form onSubmit={handleSaveProfile} className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
                        <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex items-center gap-3">
                            <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center text-indigo-600">
                                <FiUser size={20} />
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wider">Identity Records</h3>
                                <p className="text-[11px] text-slate-500 font-bold uppercase tracking-widest">Public profile information</p>
                            </div>
                        </div>

                        <div className="p-8 space-y-6">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Full Registry Name</label>
                                    <div className="relative">
                                        <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                        <input
                                            type="text"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleChange}
                                            className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border-0 rounded-2xl focus:ring-2 focus:ring-indigo-500 font-bold text-slate-900 transition-all"
                                            placeholder="Enter full name"
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Comms Protocol (Phone)</label>
                                    <div className="relative">
                                        <FiPhone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                        <input
                                            type="text"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleChange}
                                            className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border-0 rounded-2xl focus:ring-2 focus:ring-indigo-500 font-bold text-slate-900 transition-all"
                                            placeholder="Registry phone"
                                            required
                                        />
                                    </div>
                                </div>
                            </div>

                            {user?.role === 'AGENT' && (
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Business Identity</label>
                                    <input
                                        type="text"
                                        name="businessName"
                                        value={formData.businessName}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3.5 bg-slate-50 border-0 rounded-2xl focus:ring-2 focus:ring-indigo-500 font-bold text-slate-900 transition-all"
                                        placeholder="Company registry name"
                                    />
                                </div>
                            )}

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Geospatial Address</label>
                                <div className="relative">
                                    <FiMapPin className="absolute left-4 top-4 text-slate-400" />
                                    <textarea
                                        name="address"
                                        value={formData.address}
                                        onChange={handleChange}
                                        rows={3}
                                        className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border-0 rounded-2xl focus:ring-2 focus:ring-indigo-500 font-bold text-slate-900 transition-all"
                                        placeholder="Resident address"
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-4 bg-slate-950 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-600 transition-all flex items-center justify-center gap-2 shadow-xl shadow-slate-200 disabled:opacity-50"
                            >
                                {loading ? 'Syncing...' : <><FiSave /> Commit Records</>}
                            </button>
                        </div>
                    </form>
                </div>

                {/* Sidebar Cards */}
                <div className="space-y-6">
                    {/* Security Protocol */}
                    <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
                        <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex items-center gap-3">
                            <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-600">
                                <FiShield size={20} />
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wider">Security</h3>
                                <p className="text-[11px] text-slate-500 font-bold uppercase tracking-widest">Access control</p>
                            </div>
                        </div>

                        <div className="p-6 space-y-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-black text-slate-900 uppercase tracking-tight">Login 2FA</p>
                                    <p className="text-[10px] text-slate-500 font-medium">Secure login via email OTP</p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input type="checkbox" checked={twoFactor} onChange={handleToggle2FA} className="sr-only peer" />
                                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                                </label>
                            </div>

                            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                <div className="flex gap-3">
                                    <FiAlertCircle className="text-indigo-500 shrink-0 mt-0.5" />
                                    <p className="text-[10px] text-slate-600 leading-relaxed font-bold">
                                        Active security protocols prevent non-authorized access to your financial records.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Notification Registry */}
                    <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
                        <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex items-center gap-3">
                            <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center text-purple-600">
                                <FiBell size={20} />
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wider">Updates</h3>
                                <p className="text-[11px] text-slate-500 font-bold uppercase tracking-widest">Subscription</p>
                            </div>
                        </div>

                        <div className="p-6 space-y-4">
                            <div className="flex items-center gap-3 p-3 bg-emerald-50 text-emerald-700 rounded-2xl">
                                <FiCheck size={16} />
                                <span className="text-[11px] font-black uppercase tracking-wider">Email Receipts: Active</span>
                            </div>
                            <div className="flex items-center gap-3 p-3 bg-emerald-50 text-emerald-700 rounded-2xl">
                                <FiCheck size={16} />
                                <span className="text-[11px] font-black uppercase tracking-wider">System Alerts: Active</span>
                            </div>
                            <p className="text-[9px] text-slate-400 font-medium text-center italic mt-2 px-2">
                                Transaction records are automatically transmitted to your primary registry email.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Settings;
