'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';
import { FiCheckCircle, FiXCircle, FiLoader, FiArrowRight, FiHome, FiShield } from 'react-icons/fi';
import { useAppDispatch } from '../../../store/hooks';
import { verifyFunding } from '../../../store/slices/walletSlice';

export default function VerifyPayment() {
    const router = useRouter();
    const dispatch = useAppDispatch();
    const { reference } = router.query;

    const [status, setStatus] = useState<'loading' | 'success' | 'failed'>('loading');
    const [message, setMessage] = useState('Verifying your payment transaction with Paystack...');

    useEffect(() => {
        if (!reference) return;

        const performVerification = async () => {
            try {
                // Add a small delay for better UX and to ensure the backend has received the webhook if any
                await new Promise(r => setTimeout(r, 1500));

                const result = await dispatch(verifyFunding(reference as string)).unwrap();
                setStatus('success');
                setMessage(`Payment verification successful! Your wallet balance has been updated. ₦${(result.newBalance).toLocaleString()} added.`);

                // Redirect back to dashboard after 4 seconds
                setTimeout(() => {
                    router.push('/dashboard');
                }, 4000);
            } catch (err: any) {
                setStatus('failed');
                setMessage(err || 'Verification failed. This could be due to a network error or session timeout. If your money was deducted, please contact FUTA Housing support.');
            }
        };

        performVerification();
    }, [reference, dispatch, router]);

    return (
        <>
            <Head>
                <title>Verifying Transaction | FUTA Housing</title>
            </Head>

            <div className="min-h-screen bg-[#f8fafc] text-slate-900 flex items-center justify-center p-6 selection:bg-indigo-100">
                {/* Background decoration */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600/5 rounded-full blur-[100px]" />
                    <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-600/5 rounded-full blur-[100px]" />
                </div>

                <div className="w-full max-w-xl bg-white border border-slate-200 rounded-[3.5rem] p-12 text-center relative z-10 shadow-2xl shadow-indigo-100/50 animate-in zoom-in duration-500">
                    <div className="mb-10 flex flex-col items-center gap-6">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center shadow-sm">
                                <Image src="/logo.png" alt="Logo" width={28} height={28} priority />
                            </div>
                            <span className="text-2xl font-black text-slate-900 tracking-tight uppercase italic">FUTA Housing</span>
                        </div>
                        <div className="flex justify-center">
                            {status === 'loading' && (
                                <div className="w-24 h-24 bg-indigo-50 border border-indigo-100 rounded-[2rem] flex items-center justify-center shadow-inner">
                                    <FiLoader className="text-5xl text-indigo-600 animate-spin" />
                                </div>
                            )}
                            {status === 'success' && (
                                <div className="w-24 h-24 bg-emerald-50 border border-emerald-100 rounded-[2rem] flex items-center justify-center shadow-inner">
                                    <FiCheckCircle className="text-5xl text-emerald-500 animate-bounce" />
                                </div>
                            )}
                            {status === 'failed' && (
                                <div className="w-24 h-24 bg-red-50 border border-red-100 rounded-[2rem] flex items-center justify-center shadow-inner">
                                    <FiXCircle className="text-5xl text-red-500" />
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="mb-12">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 block">Registry Transaction Clearing</span>
                        <h1 className="text-4xl font-black text-slate-900 tracking-tighter mb-4">
                            {status === 'loading' ? 'Processing Transfer' : status === 'success' ? 'Payment Verified!' : 'Verification Error'}
                        </h1>
                        <p className="text-slate-500 text-lg font-medium leading-relaxed max-w-md mx-auto">
                            {message}
                        </p>
                    </div>

                    {status !== 'loading' && (
                        <div className="space-y-4 max-w-xs mx-auto">
                            <Link href="/dashboard" className="w-full h-16 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-3xl flex items-center justify-center gap-2 transition-all shadow-xl shadow-indigo-100 active:scale-95 text-lg">
                                Return to Dashboard <FiArrowRight />
                            </Link>
                            {status === 'failed' && (
                                <Link href="/" className="w-full h-16 bg-white border-2 border-slate-100 hover:border-slate-200 text-slate-500 font-bold rounded-3xl flex items-center justify-center gap-2 transition-all text-sm uppercase tracking-widest">
                                    <FiHome /> Back to home
                                </Link>
                            )}
                        </div>
                    )}

                    <div className="mt-12 pt-10 border-t border-slate-50 flex items-center justify-center gap-6 opacity-60 grayscale">
                        <div className="flex items-center gap-2">
                            <FiShield className="text-indigo-600" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Escrow Protected</span>
                        </div>
                        <div className="w-1 h-1 bg-slate-200 rounded-full" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Paystack Verified</span>
                    </div>

                    {status === 'success' && (
                        <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] mt-8 animate-pulse">
                            Redirecting to your account...
                        </p>
                    )}
                </div>
            </div>
        </>
    );
}
