import { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Image from 'next/image';
import Head from 'next/head';
import { toast } from 'react-toastify';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { verifyEmailOtp, verifyLoginOtp, resendOtp, clearError } from '../../store/slices/authSlice';
import { FiShield, FiArrowLeft, FiRefreshCw, FiCheck, FiLock } from 'react-icons/fi';

const OTP_LENGTH = 6;
const RESEND_COOLDOWN = 60;

export default function VerifyOtp() {
    const dispatch = useAppDispatch();
    const router = useRouter();
    const { loading, error, otp } = useAppSelector((state) => state.auth);

    const [codes, setCodes] = useState<string[]>(Array(OTP_LENGTH).fill(''));
    const [timer, setTimer] = useState(RESEND_COOLDOWN);
    const [canResend, setCanResend] = useState(false);
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    useEffect(() => {
        if (!otp.required || !otp.userId) {
            router.replace('/auth/login');
        }
    }, [otp.required, otp.userId, router]);

    useEffect(() => {
        if (timer <= 0) {
            setCanResend(true);
            return;
        }
        const interval = setInterval(() => setTimer((t) => t - 1), 1000);
        return () => clearInterval(interval);
    }, [timer]);

    useEffect(() => {
        inputRefs.current[0]?.focus();
        dispatch(clearError());
    }, [dispatch]);

    const handleChange = (index: number, value: string) => {
        if (!/^\d*$/.test(value)) return;
        const newCodes = [...codes];
        newCodes[index] = value.slice(-1);
        setCodes(newCodes);

        if (value && index < OTP_LENGTH - 1) {
            inputRefs.current[index + 1]?.focus();
        }

        if (newCodes.every((c) => c !== '') && newCodes.join('').length === OTP_LENGTH) {
            handleSubmit(newCodes.join(''));
        }
    };

    const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
        if (e.key === 'Backspace' && !codes[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handlePaste = (e: React.ClipboardEvent) => {
        e.preventDefault();
        const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, OTP_LENGTH);
        if (pasted.length === OTP_LENGTH) {
            const newCodes = pasted.split('');
            setCodes(newCodes);
            inputRefs.current[OTP_LENGTH - 1]?.focus();
            handleSubmit(pasted);
        }
    };

    const handleSubmit = useCallback(async (code?: string) => {
        const otpCode = code || codes.join('');
        if (otpCode.length !== OTP_LENGTH) return;
        if (!otp.userId) return;

        const payload = { userId: otp.userId, code: otpCode };

        let result;
        if (otp.purpose === 'EMAIL_VERIFY') {
            result = await dispatch(verifyEmailOtp(payload));
            if (verifyEmailOtp.fulfilled.match(result)) {
                const data = result.payload;
                if (data.requiresApproval) {
                    toast.success('Contact info verified! ✅');
                    router.push('/auth/pending-approval');
                    return;
                }
                toast.success('Access granted to Registry.');
                const role = data?.user?.role;
                router.push(role === 'ADMIN' ? '/admin' : '/dashboard');
            }
        } else if (otp.purpose === 'LOGIN_2FA') {
            result = await dispatch(verifyLoginOtp(payload));
            if (verifyLoginOtp.fulfilled.match(result)) {
                toast.success('Session verified.');
                const role = result.payload?.user?.role;
                router.push(role === 'ADMIN' ? '/admin' : '/dashboard');
            }
        } else if (otp.purpose === 'PASSWORD_RESET') {
            const { verifyResetOtp } = await import('../../store/slices/authSlice');
            result = await dispatch(verifyResetOtp(payload));
            if (verifyResetOtp.fulfilled.match(result)) {
                toast.success('Identity verified! Set your new password.');
                router.push(`/auth/reset-password?token=${result.payload.resetToken}`);
            }
        }
    }, [codes, otp, dispatch, router]);


    const handleResend = async () => {
        if (!otp.userId || !otp.purpose) return;
        const result = await dispatch(resendOtp({ userId: otp.userId, purpose: otp.purpose }));
        if (resendOtp.fulfilled.match(result)) {
            toast.success('Fresh code dispatched.');
            setCodes(Array(OTP_LENGTH).fill(''));
            setTimer(RESEND_COOLDOWN);
            setCanResend(false);
            inputRefs.current[0]?.focus();
        }
    };

    const maskedEmail = otp.email
        ? otp.email.replace(/(.{2})(.*)(@.*)/, (_, a, b, c) => a + '*'.repeat(Math.min(b.length, 6)) + c)
        : '';
    const maskedPhone = otp.phone
        ? otp.phone.replace(/(.{4})(.*)(.{2})/, (_, a, b, c) => a + '*'.repeat(Math.min(b.length, 5)) + c)
        : '';

    if (!otp.required) return null;

    return (
        <>
            <Head>
                <title>Registry Verification | FUTA Housing</title>
                <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
            </Head>

            <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-6" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>

                {/* Branding Top */}
                <div className="mb-12 text-center animate-in fade-in slide-in-from-top-4 duration-1000">
                    <div className="flex items-center gap-3 justify-center mb-4">
                        <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center shadow-xl shadow-slate-200">
                            <Image src="/logo.png" alt="Logo" width={24} height={24} />
                        </div>
                        <span className="text-xl font-black text-slate-900 tracking-tight">FUTA Housing</span>
                    </div>
                </div>

                <div className="w-full max-w-xl bg-white rounded-[2.5rem] border border-slate-100 shadow-[0_40px_100px_-20px_rgba(0,0,0,0.08)] p-12 relative overflow-hidden animate-in zoom-in-95 duration-500">
                    {/* Background Accent */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 rounded-full blur-[80px] -mr-32 -mt-32 opacity-60" />

                    <div className="relative z-10 flex flex-col items-center text-center">
                        <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center mb-8 border border-indigo-100">
                            <FiLock className="text-2xl text-indigo-600" />
                        </div>

                        <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-3">Two-Step Verification</h1>
                        <p className="text-slate-500 font-medium text-base mb-8 max-w-sm">
                            We&apos;ve sent a secure 6-digit code to your registered contact endpoints.
                        </p>

                        {/* Masked Info Cards */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full mb-10">
                            <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center border border-slate-100">
                                    <FiShield className="text-slate-400 text-xs" />
                                </div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest truncate">{maskedEmail}</p>
                            </div>
                            <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center border border-slate-100">
                                    <FiCheck className="text-slate-400 text-xs" />
                                </div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{maskedPhone || 'VOICE VERIFIED'}</p>
                            </div>
                        </div>

                        {/* Error Notification */}
                        {error && (
                            <div className="w-full mb-8 p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-sm font-bold flex items-center gap-3 animate-in fade-in">
                                <div className="w-6 h-6 bg-white rounded-lg flex items-center justify-center border border-red-100">×</div>
                                {error}
                            </div>
                        )}

                        {/* OTP Input Grid */}
                        <div className="flex gap-3 mb-10" onPaste={handlePaste}>
                            {codes.map((code, i) => (
                                <input
                                    key={i}
                                    ref={(el) => { inputRefs.current[i] = el; }}
                                    type="text"
                                    inputMode="numeric"
                                    maxLength={1}
                                    value={code}
                                    onChange={(e) => handleChange(i, e.target.value)}
                                    onKeyDown={(e) => handleKeyDown(i, e)}
                                    className={`
                                        w-12 h-16 sm:w-16 sm:h-20 text-center text-2xl font-black rounded-2xl border-2 transition-all duration-300
                                        focus:outline-none focus:ring-4
                                        ${code
                                            ? 'border-indigo-600 bg-indigo-50/30 text-indigo-900 focus:ring-indigo-100'
                                            : 'border-slate-100 bg-slate-50 text-slate-900 focus:border-indigo-600 focus:ring-indigo-50'}
                                    `}
                                />
                            ))}
                        </div>

                        {/* Verify Button */}
                        <button
                            onClick={() => handleSubmit()}
                            disabled={loading || codes.some(c => !c)}
                            className="w-full h-18 bg-slate-900 hover:bg-black disabled:opacity-30 disabled:grayscale text-white font-bold rounded-2xl transition-all shadow-xl shadow-slate-200 py-5 text-sm uppercase tracking-widest active:scale-[0.98]"
                        >
                            {loading ? (
                                <div className="flex items-center justify-center gap-3">
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Verifying...
                                </div>
                            ) : 'Authorize Access'}
                        </button>

                        {/* Resend Logic */}
                        <div className="mt-8">
                            {canResend ? (
                                <button
                                    onClick={handleResend}
                                    className="flex items-center gap-2 text-indigo-600 hover:text-indigo-800 font-black text-xs uppercase tracking-widest transition"
                                >
                                    <FiRefreshCw className="mr-1" /> Request Fresh Code
                                </button>
                            ) : (
                                <div className="text-slate-400 text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-slate-300 animate-pulse" />
                                    Wait 00:{timer.toString().padStart(2, '0')} before resending
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Bottom Back Button */}
                <button
                    onClick={() => router.push('/auth/login')}
                    className="mt-12 flex items-center gap-2 text-slate-400 hover:text-slate-900 font-black text-xs uppercase tracking-widest transition"
                >
                    <FiArrowLeft size={16} /> Use different account
                </button>
            </div>

            <style jsx global>{`
                @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
                @keyframes zoom-in-95 { from { transform: scale(0.95); opacity: 0; } to { transform: scale(1); opacity: 1; } }
            `}</style>
        </>
    );
}
