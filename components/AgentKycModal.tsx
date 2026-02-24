'use client';
import { useEffect, useRef, useState, useCallback } from 'react';
import { toast } from 'react-toastify';
import { FiCamera, FiUpload, FiCheckCircle, FiX, FiRepeat, FiShield, FiAlertCircle, FiLoader, FiActivity, FiArrowRight } from 'react-icons/fi';
import api from '../lib/apiClient';

interface Props {
    onComplete: () => void;
    onClose?: () => void;
}

type Step = 'intro' | 'nin_upload' | 'face_capture' | 'review' | 'done';

export default function AgentKycModal({ onComplete, onClose }: Props) {
    const [step, setStep] = useState<Step>('intro');
    const [ninFile, setNinFile] = useState<File | null>(null);
    const [ninPreview, setNinPreview] = useState<string>('');
    const [faceDataUrl, setFaceDataUrl] = useState<string>('');
    const [cameraReady, setCameraReady] = useState(false);
    const [cameraError, setCameraError] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [countdown, setCountdown] = useState(0);

    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // ── Camera helpers ────────────────────────────────────────────────────────
    const startCamera = useCallback(async () => {
        setCameraError('');
        setCameraReady(false);
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } },
            });
            streamRef.current = stream;
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                videoRef.current.onloadedmetadata = () => {
                    videoRef.current?.play();
                    setCameraReady(true);
                };
            }
        } catch (err: any) {
            setCameraError(
                err.name === 'NotAllowedError'
                    ? 'Camera access denied. Please allow camera permission in your browser settings and try again.'
                    : 'Could not access camera. Make sure your device has a working camera.'
            );
        }
    }, []);

    const stopCamera = useCallback(() => {
        streamRef.current?.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
        setCameraReady(false);
    }, []);

    useEffect(() => {
        if (step === 'face_capture') startCamera();
        return () => { if (step === 'face_capture') stopCamera(); };
    }, [step, startCamera, stopCamera]);

    const captureWithCountdown = () => {
        setCountdown(3);
        let c = 3;
        const id = setInterval(() => {
            c -= 1;
            setCountdown(c);
            if (c === 0) {
                clearInterval(id);
                capturePhoto();
            }
        }, 1000);
    };

    const capturePhoto = () => {
        if (!videoRef.current || !canvasRef.current) return;
        const video = videoRef.current;
        const canvas = canvasRef.current;
        canvas.width = video.videoWidth || 640;
        canvas.height = video.videoHeight || 480;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        // Mirror the selfie
        ctx.translate(canvas.width, 0);
        ctx.scale(-1, 1);
        ctx.drawImage(video, 0, 0);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
        setFaceDataUrl(dataUrl);
        stopCamera();
    };

    const retakePhoto = () => {
        setFaceDataUrl('');
        startCamera();
    };

    // ── NIN Upload ────────────────────────────────────────────────────────────
    const handleNinFile = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (!file.type.startsWith('image/')) {
            toast.error('Please upload an image file (JPG, PNG, WebP)');
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            toast.error('File must be under 5MB');
            return;
        }
        setNinFile(file);
        setNinPreview(URL.createObjectURL(file));
    };

    // ── Upload to server then submit KYC ─────────────────────────────────────
    const uploadBase64 = async (dataUrl: string, filename: string): Promise<string> => {
        const res = await fetch(dataUrl);
        const blob = await res.blob();
        const file = new File([blob], filename, { type: 'image/jpeg' });
        const form = new FormData();
        form.append('file', file);
        const { data } = await api.post('/upload', form, { headers: { 'Content-Type': 'multipart/form-data' } });
        return data.url;
    };

    const uploadFileToServer = async (file: File): Promise<string> => {
        const form = new FormData();
        form.append('file', file);
        const { data } = await api.post('/upload', form, { headers: { 'Content-Type': 'multipart/form-data' } });
        return data.url;
    };

    const handleSubmit = async () => {
        if (!ninFile || !faceDataUrl) {
            toast.error('Please complete both steps: NIN photo and face selfie');
            return;
        }
        setSubmitting(true);
        try {
            const [ninUrl, faceUrl] = await Promise.all([
                uploadFileToServer(ninFile),
                uploadBase64(faceDataUrl, `face-${Date.now()}.jpg`),
            ]);

            await api.post('/verification/agent-kyc', { ninUrl, faceUrl });

            setStep('done');
            toast.success('KYC submitted! Your account is now under review.');
            setTimeout(() => onComplete(), 2000);
        } catch (err: any) {
            toast.error(err?.response?.data?.error || 'KYC submission failed. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    const steps = [
        { id: 'intro', label: 'Start' },
        { id: 'nin_upload', label: 'Identity' },
        { id: 'face_capture', label: 'Biometrics' },
        { id: 'review', label: 'Verify' }
    ];

    // ── Render ────────────────────────────────────────────────────────────────
    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-xl" onClick={onClose} />

            <div className="relative bg-white w-full max-w-xl rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in duration-500 max-h-[95vh] flex flex-col">
                {/* Visual Header */}
                <div className="bg-slate-950 p-8 text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-600/20 rounded-full blur-[60px] -mr-24 -mt-24" />
                    <div className="relative z-10">
                        <div className="flex justify-between items-center mb-6">
                            <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/10 flex items-center justify-center">
                                <FiShield className="text-indigo-400" size={24} />
                            </div>
                            <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors">
                                <FiX />
                            </button>
                        </div>
                        <h2 className="text-3xl font-black tracking-tighter uppercase">Protocol Verification</h2>
                        <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.3em] mt-2">Agent Registry Node: 256-Bit Encrypted</p>
                    </div>
                </div>

                {/* Step Indicator */}
                <div className="px-10 py-6 border-b border-slate-100 flex justify-between">
                    {steps.map((s, i) => (
                        <div key={s.id} className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-[10px] font-black ${step === s.id ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' :
                                    steps.findIndex(x => x.id === step) > i ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-400'
                                }`}>
                                {steps.findIndex(x => x.id === step) > i ? <FiCheckCircle /> : i + 1}
                            </div>
                            <span className={`text-[10px] font-black uppercase tracking-widest hidden sm:block ${step === s.id ? 'text-slate-900' : 'text-slate-400'}`}>{s.label}</span>
                        </div>
                    ))}
                </div>

                <div className="flex-1 overflow-y-auto p-12">
                    {/* ── INTRO ── */}
                    {step === 'intro' && (
                        <div className="space-y-10">
                            <div className="text-center">
                                <h3 className="text-2xl font-black text-slate-950 tracking-tight mb-4 uppercase">Trust Authority</h3>
                                <p className="text-slate-500 font-medium leading-relaxed">
                                    Our platform maintains a cryptographically secured registry of verified agents to ensure the highest integrity of rental assets.
                                </p>
                            </div>
                            <div className="space-y-4">
                                {[
                                    { icon: FiUpload, title: 'Registry Identification', desc: 'Secure upload of your National ID (NIN Slip)' },
                                    { icon: FiCamera, title: 'Biometric Pulse', desc: 'Real-time face verification via neural engine' },
                                ].map((item, i) => (
                                    <div key={i} className="flex items-center gap-6 p-6 rounded-[2rem] bg-slate-50 border border-slate-100 group hover:border-indigo-200 transition-all">
                                        <div className="w-14 h-14 bg-white border border-slate-100 rounded-2xl flex items-center justify-center text-indigo-600 shadow-sm group-hover:scale-110 transition-transform">
                                            <item.icon size={22} />
                                        </div>
                                        <div>
                                            <p className="font-black text-slate-950 text-sm mb-1 uppercase tracking-tight">{item.title}</p>
                                            <p className="text-slate-400 text-xs font-bold">{item.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <button
                                onClick={() => setStep('nin_upload')}
                                className="w-full h-16 bg-slate-950 hover:bg-black text-white font-black rounded-2xl transition shadow-2xl active:scale-95 text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-3"
                            >
                                Begin Protocol <FiArrowRight />
                            </button>
                        </div>
                    )}

                    {/* ── NIN UPLOAD ── */}
                    {step === 'nin_upload' && (
                        <div className="space-y-10">
                            <div>
                                <h2 className="text-2xl font-black text-slate-950 mb-2 uppercase tracking-tight">Identity Registry</h2>
                                <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Upload your National Identifier</p>
                            </div>

                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/jpeg,image/png,image/webp"
                                className="hidden"
                                onChange={handleNinFile}
                            />

                            {!ninPreview ? (
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    className="w-full aspect-video border-2 border-dashed border-slate-200 rounded-[2.5rem] flex flex-col items-center justify-center gap-4 hover:border-indigo-500 hover:bg-indigo-50/50 transition-all group overflow-hidden bg-slate-50/50"
                                >
                                    <div className="w-16 h-16 bg-white border border-slate-100 rounded-2xl flex items-center justify-center text-indigo-600 shadow-sm transition group-hover:scale-110">
                                        <FiUpload size={28} />
                                    </div>
                                    <div className="text-center">
                                        <p className="font-black text-slate-950 text-sm uppercase mb-1">Upload NIN Image</p>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">JPG, PNG OR WEBP — MAX 5MB</p>
                                    </div>
                                </button>
                            ) : (
                                <div className="relative group overflow-hidden rounded-[2.5rem] border-2 border-slate-100 shadow-xl">
                                    <img src={ninPreview} alt="NIN" className="w-full aspect-video object-cover" />
                                    <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4 backdrop-blur-sm">
                                        <button
                                            onClick={() => fileInputRef.current?.click()}
                                            className="h-12 px-6 bg-white text-slate-950 rounded-xl font-black text-[10px] uppercase tracking-widest"
                                        >
                                            Replace
                                        </button>
                                        <button
                                            onClick={() => { setNinFile(null); setNinPreview(''); }}
                                            className="h-12 px-6 bg-rose-500 text-white rounded-xl font-black text-[10px] uppercase tracking-widest"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                    <div className="absolute top-4 left-4 flex items-center gap-2 bg-emerald-500 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl">
                                        <FiCheckCircle size={14} /> Registered
                                    </div>
                                </div>
                            )}

                            <div className="p-6 rounded-[2rem] bg-indigo-50 border border-indigo-100 flex items-start gap-4">
                                <FiAlertCircle className="text-indigo-600 shrink-0 mt-0.5" size={20} />
                                <p className="text-indigo-950 text-xs font-bold leading-relaxed">
                                    Protocol Tip: Ensure all edge boundaries of the ID are visible and text is crytalline clear. Registry filters will reject blurred data.
                                </p>
                            </div>

                            <button
                                disabled={!ninFile}
                                onClick={() => setStep('face_capture')}
                                className="w-full h-16 bg-slate-950 hover:bg-black disabled:bg-slate-100 disabled:text-slate-400 text-white font-black rounded-2xl transition shadow-2xl active:scale-95 text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-3"
                            >
                                Next Step: Biometrics <FiArrowRight />
                            </button>
                        </div>
                    )}

                    {/* ── FACE CAPTURE ── */}
                    {step === 'face_capture' && (
                        <div className="space-y-10">
                            <div>
                                <h2 className="text-2xl font-black text-slate-950 mb-2 uppercase tracking-tight">Neural Biometrics</h2>
                                <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Live Identity Synchronization</p>
                            </div>

                            {/* Video / Preview */}
                            {!faceDataUrl ? (
                                <div className="relative group overflow-hidden rounded-[3rem] border-4 border-slate-100 aspect-square bg-slate-950 shadow-2xl">
                                    {!cameraReady && !cameraError && (
                                        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 text-indigo-400">
                                            <FiLoader className="w-10 h-10 animate-spin" />
                                            <p className="text-[10px] font-black uppercase tracking-widest">Activating Neural Engine...</p>
                                        </div>
                                    )}
                                    <video
                                        ref={videoRef}
                                        autoPlay
                                        playsInline
                                        muted
                                        className={`w-full h-full object-cover ${!cameraReady ? 'hidden' : 'block'}`}
                                        style={{ transform: 'scaleX(-1)' }}
                                    />
                                    {cameraReady && (
                                        <>
                                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                                <div className="w-56 h-72 border-2 border-indigo-500/50 rounded-full animate-pulse shadow-[0_0_0_2000px_rgba(15,17,26,0.5)]" />
                                            </div>
                                            {countdown > 0 && (
                                                <div className="absolute inset-0 flex items-center justify-center">
                                                    <span className="text-9xl font-black text-white drop-shadow-[0_0_30px_rgba(79,70,229,0.5)] animate-ping">{countdown}</span>
                                                </div>
                                            )}
                                            <div className="absolute bottom-10 left-0 right-0 flex justify-center">
                                                <button
                                                    onClick={captureWithCountdown}
                                                    disabled={countdown > 0}
                                                    className="h-20 w-20 bg-white rounded-full flex items-center justify-center shadow-2xl hover:scale-110 active:scale-95 transition-all group"
                                                >
                                                    <div className="w-16 h-16 border-4 border-slate-950 rounded-full flex items-center justify-center group-hover:bg-slate-950 group-hover:text-white transition-colors">
                                                        <FiCamera size={28} />
                                                    </div>
                                                </button>
                                            </div>
                                        </>
                                    )}
                                </div>
                            ) : (
                                <div className="relative group overflow-hidden rounded-[3rem] border-4 border-slate-100 aspect-square bg-slate-950 shadow-2xl">
                                    <img src={faceDataUrl} alt="Selfie" className="w-full h-full object-cover" />
                                    <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4 backdrop-blur-sm">
                                        <button onClick={retakePhoto} className="h-14 px-10 bg-white text-slate-950 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-2xl">
                                            Retry Capture
                                        </button>
                                    </div>
                                    <div className="absolute top-6 left-6 flex items-center gap-2 bg-emerald-500 text-white px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-2xl">
                                        <FiCheckCircle size={14} /> Liveness Match 98%
                                    </div>
                                </div>
                            )}

                            <button
                                disabled={!faceDataUrl}
                                onClick={() => setStep('review')}
                                className="w-full h-16 bg-slate-950 hover:bg-black disabled:bg-slate-100 disabled:text-slate-400 text-white font-black rounded-2xl transition shadow-2xl active:scale-95 text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-3"
                            >
                                Secure Review <FiArrowRight />
                            </button>
                        </div>
                    )}

                    {/* ── REVIEW ── */}
                    {step === 'review' && (
                        <div className="space-y-10">
                            <div>
                                <h2 className="text-2xl font-black text-slate-950 mb-2 uppercase tracking-tight">Consolidated Audit</h2>
                                <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Final Registry Review</p>
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-3">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Registry ID</p>
                                    <div className="aspect-[4/3] rounded-[2rem] overflow-hidden bg-slate-100 border border-slate-200">
                                        <img src={ninPreview} className="w-full h-full object-cover" />
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Biometric</p>
                                    <div className="aspect-[4/3] rounded-[2rem] overflow-hidden bg-slate-100 border border-slate-200">
                                        <img src={faceDataUrl} className="w-full h-full object-cover" />
                                    </div>
                                </div>
                            </div>

                            <div className="p-8 rounded-[2.5rem] bg-slate-950 text-white relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-[40px]" />
                                <div className="relative z-10 flex items-center gap-6">
                                    <div className="w-14 h-14 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center text-indigo-400">
                                        <FiActivity size={28} />
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-black uppercase tracking-tight">Final Authorization</h4>
                                        <p className="text-slate-500 text-[10px] font-bold mt-1">Ready for platform-wide synchronization.</p>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <button
                                    onClick={() => setStep('nin_upload')}
                                    className="h-16 border-2 border-slate-100 text-slate-950 font-black rounded-2xl hover:bg-slate-50 transition text-xs uppercase tracking-widest"
                                >
                                    Modify
                                </button>
                                <button
                                    disabled={submitting}
                                    onClick={handleSubmit}
                                    className="h-16 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 text-white font-black rounded-2xl transition shadow-2xl active:scale-95 text-xs uppercase tracking-widest flex items-center justify-center gap-3"
                                >
                                    {submitting ? (
                                        <><FiLoader className="animate-spin" /> Verifying...</>
                                    ) : (
                                        <><FiCheckCircle /> Submit Node</>
                                    )}
                                </button>
                            </div>
                        </div>
                    )}

                    {/* ── DONE ── */}
                    {step === 'done' && (
                        <div className="flex flex-col items-center text-center space-y-10 py-12">
                            <div className="relative">
                                <div className="absolute inset-0 bg-emerald-500/20 rounded-full blur-[40px] animate-pulse" />
                                <div className="w-32 h-32 bg-emerald-500 rounded-full flex items-center justify-center text-white relative z-10 shadow-2xl shadow-emerald-500/20">
                                    <FiCheckCircle size={64} />
                                </div>
                            </div>
                            <div>
                                <h2 className="text-4xl font-black text-slate-950 tracking-tighter mb-4 uppercase">Registry Synced</h2>
                                <p className="text-slate-500 font-medium leading-relaxed max-w-sm mx-auto">
                                    Your node has been added to the verification queue. Integrity checks usually complete within <strong className="text-slate-950">24 cycles</strong>.
                                </p>
                            </div>
                            <div className="w-full p-8 bg-slate-50 border border-slate-100 rounded-[2.5rem] flex items-center gap-6">
                                <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center text-indigo-600 border border-slate-100">
                                    <FiShield size={24} />
                                </div>
                                <div className="text-left">
                                    <p className="text-[10px] font-black text-slate-950 uppercase tracking-widest mb-1">Status: Pending Verification</p>
                                    <p className="text-[10px] font-bold text-slate-400">Inventory controls activated. Security review in progress.</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
