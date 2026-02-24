import Link from 'next/link';
import Head from 'next/head';
import Image from 'next/image';
import { FiClock, FiCheckCircle, FiShield, FiMail, FiArrowRight } from 'react-icons/fi';

export default function PendingApproval() {
    return (
        <>
            <Head>
                <title>Account Under Review | FUTA Housing</title>
                <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
            </Head>

            <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-6" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>

                <div className="w-full max-w-2xl bg-white rounded-[3rem] border border-slate-100 shadow-[0_40px_100px_-20px_rgba(0,0,0,0.06)] p-8 sm:p-16 relative overflow-hidden text-center">
                    {/* Background Elements */}
                    <div className="absolute top-0 right-0 w-80 h-80 bg-blue-50 rounded-full blur-[100px] -mr-40 -mt-40 opacity-50" />
                    <div className="absolute bottom-0 left-0 w-80 h-80 bg-indigo-50 rounded-full blur-[100px] -ml-40 -mb-40 opacity-50" />

                    <div className="relative z-10 flex flex-col items-center">
                        <div className="relative mb-12">
                            <div className="w-24 h-24 bg-blue-50 rounded-[2rem] flex items-center justify-center text-blue-600 border border-blue-100 animate-pulse">
                                <FiClock size={48} />
                            </div>
                            <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-green-500 rounded-full border-4 border-white flex items-center justify-center text-white">
                                <FiCheckCircle size={20} />
                            </div>
                        </div>

                        <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-4">Verification Successful! 🎊</h1>
                        <p className="text-slate-500 font-medium text-lg mb-10 max-w-md mx-auto">
                            Thank you for verifying your contact information. Your agent account is now in the final stage of review.
                        </p>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full mb-12">
                            <div className="bg-slate-50/80 backdrop-blur-sm border border-slate-100 p-6 rounded-3xl text-left">
                                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center border border-slate-100 mb-4">
                                    <FiShield className="text-blue-500" />
                                </div>
                                <h3 className="font-bold text-slate-900 mb-1">Document Vetting</h3>
                                <p className="text-xs text-slate-500 leading-relaxed">Our administration is reviewing your NIN and social identity to ensure platform integrity.</p>
                            </div>
                            <div className="bg-slate-50/80 backdrop-blur-sm border border-slate-100 p-6 rounded-3xl text-left">
                                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center border border-slate-100 mb-4">
                                    <FiMail className="text-green-500" />
                                </div>
                                <h3 className="font-bold text-slate-900 mb-1">Email Confirmation</h3>
                                <p className="text-xs text-slate-500 leading-relaxed">You will receive an automated email notification the second your account is approved.</p>
                            </div>
                        </div>

                        <div className="w-full bg-slate-900 rounded-[2rem] p-8 text-white relative overflow-hidden mb-10 group">
                            <div className="relative z-10">
                                <h4 className="text-lg font-bold mb-2">What happens next?</h4>
                                <p className="text-slate-400 text-sm mb-6 max-w-sm mx-auto">Average review time is usually under 24 hours. Once approved, you can start listing your hostels immediately.</p>
                                <Link href="/auth/login" className="inline-flex items-center justify-center gap-2 bg-white text-slate-900 font-black px-8 py-4 rounded-2xl text-sm uppercase tracking-widest hover:scale-105 transition-transform active:scale-95">
                                    Return to Login
                                    <FiArrowRight />
                                </Link>
                            </div>
                        </div>

                        <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">
                            Need help? <a href="mailto:support@futahousing.com" className="text-blue-500 hover:underline">Contact Support</a>
                        </p>
                    </div>
                </div>

                {/* Footer Branding */}
                <div className="mt-12 flex items-center gap-3">
                    <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm border border-slate-200">
                        <Image src="/logo.png" alt="Logo" width={20} height={20} />
                    </div>
                    <span className="text-xs font-black text-slate-400 uppercase italic tracking-widest">FUTA Housing Official Registry</span>
                </div>
            </div>
        </>
    );
}
