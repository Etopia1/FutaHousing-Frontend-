import Link from 'next/link';
import Image from 'next/image';
import { FiMail, FiPhone, FiMapPin } from 'react-icons/fi';

const Footer = () => {
    return (
        <footer className="bg-gray-900 text-white">

            {/* Main Footer */}
            <div className="max-w-7xl mx-auto px-6 py-16">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">

                    {/* Brand */}
                    <div className="lg:col-span-1">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center shadow-sm border border-white/10">
                                <Image src="/logo.png" alt="FUTA Housing" width={28} height={28} />
                            </div>
                            <span className="text-xl font-black uppercase italic tracking-tight">FUTA Housing</span>
                        </div>
                        <p className="text-gray-400 text-sm leading-relaxed mb-6">
                            The safest way for tenants to find verified and affordable accommodation. Protected by our Escrow payment system.
                        </p>
                        <div className="space-y-2">
                            <p className="text-gray-400 text-sm flex items-center gap-2">
                                <FiMapPin className="text-indigo-400 shrink-0" /> FUTA South Gate, Akure, Ondo State
                            </p>
                            <p className="text-gray-400 text-sm flex items-center gap-2">
                                <FiMail className="text-indigo-400 shrink-0" /> futahousing@gmail.com
                            </p>
                            <p className="text-gray-400 text-sm flex items-center gap-2">
                                <FiPhone className="text-indigo-400 shrink-0" /> +234 907 460 6483
                            </p>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="font-bold text-sm uppercase tracking-wider text-gray-300 mb-4">Quick Links</h3>
                        <ul className="space-y-3">
                            {[
                                { label: 'Browse Hostels', href: '/hostels' },
                                { label: 'Tenant Dashboard', href: '/dashboard' },
                                { label: 'Register as Tenant', href: '/auth/register' },
                                { label: 'Register as Agent', href: '/auth/agent-register' },
                                { label: 'Login', href: '/auth/login' },
                            ].map((link) => (
                                <li key={link.label}>
                                    <Link href={link.href} className="text-gray-400 hover:text-white text-sm transition">
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* For Agents */}
                    <div>
                        <h3 className="font-bold text-sm uppercase tracking-wider text-gray-300 mb-4">For Agents</h3>
                        <ul className="space-y-3">
                            {[
                                { label: 'Why List With Us', href: '/auth/agent-register' },
                                { label: 'Agent Dashboard', href: '/dashboard' },
                                { label: 'Pricing & Commission', href: '/' },
                                { label: 'Agent Verification', href: '/auth/agent-register' },
                            ].map((link) => (
                                <li key={link.label}>
                                    <Link href={link.href} className="text-gray-400 hover:text-white text-sm transition">
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Trust & Safety */}
                    <div>
                        <h3 className="font-bold text-sm uppercase tracking-wider text-gray-300 mb-4">Trust &amp; Safety</h3>
                        <ul className="space-y-3">
                            {[
                                'Escrow Payment Protection',
                                'Identity Verification',
                                'NIN/ID Document Review',
                                'Scam-free Guarantee',
                                'Admin-verified Agents',
                            ].map((item) => (
                                <li key={item} className="text-gray-400 text-sm flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full shrink-0" />
                                    {item}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>

            {/* Bottom Bar */}
            <div className="border-t border-gray-800">
                <div className="max-w-7xl mx-auto px-6 py-6 flex flex-col md:flex-row items-center justify-between gap-4">
                    <p className="text-gray-500 text-sm">
                        &copy; {new Date().getFullYear()} FUTA Housing. All rights reserved.
                    </p>
                    <div className="flex items-center gap-6 text-gray-500 text-sm">
                        <Link href="/privacy" className="hover:text-white transition">Privacy Policy</Link>
                        <Link href="/terms" className="hover:text-white transition">Terms of Service</Link>
                        <Link href="/terms#14" className="hover:text-white transition">Contact</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
