import Head from 'next/head';
import Link from 'next/link';
import Image from 'next/image';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { FiArrowLeft } from 'react-icons/fi';

export default function PrivacyPolicy() {
    return (
        <div className="min-h-screen bg-white flex flex-col" style={{ fontFamily: "'Inter', sans-serif" }}>
            <Head>
                <title>Privacy Policy | FUTA Housing</title>
                <meta name="description" content="Read the Privacy Policy for FUTA Housing — how we collect, use, and protect your data." />
                <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />
            </Head>

            <Header />

            {/* Hero */}
            <section className="bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-700 py-20">
                <div className="max-w-4xl mx-auto px-6 text-center">
                    <Link href="/" className="inline-flex items-center gap-2 text-white/70 hover:text-white text-sm mb-6 transition">
                        <FiArrowLeft /> Back to Home
                    </Link>
                    <h1 className="text-4xl md:text-5xl font-black text-white mb-4">Privacy Policy</h1>
                    <p className="text-white/70 text-lg">Last updated: February 20, 2026</p>
                </div>
            </section>

            {/* Content */}
            <main className="flex-grow py-16">
                <div className="max-w-4xl mx-auto px-6">
                    <div className="prose prose-lg prose-gray max-w-none">

                        {/* Intro */}
                        <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-6 mb-10">
                            <p className="text-emerald-800 text-sm leading-relaxed m-0">
                                Your privacy is important to us. This Privacy Policy explains how FUTA Housing collects, uses, stores, and protects your personal information when you use our platform. We are committed to compliance with the Nigeria Data Protection Regulation (NDPR).
                            </p>
                        </div>

                        <Section num="1" title="Information We Collect">
                            <h4 className="font-bold text-gray-900">1.1 Information You Provide</h4>
                            <p>When you register, we collect:</p>
                            <ul>
                                <li><strong>Personal details:</strong> Full name, email address, phone number</li>
                                <li><strong>Student information:</strong> Matriculation number (optional, for student accounts)</li>
                                <li><strong>Identity documents:</strong> National Identification Number (NIN), selfie photos (for agent verification)</li>
                                <li><strong>Account credentials:</strong> Email and password (passwords are stored using bcrypt hashing and are never stored in plain text)</li>
                            </ul>

                            <h4 className="font-bold text-gray-900 mt-6">1.2 Information Collected Automatically</h4>
                            <ul>
                                <li><strong>Device information:</strong> Browser type, operating system, device type</li>
                                <li><strong>Usage data:</strong> Pages visited, features used, timestamps</li>
                                <li><strong>IP address:</strong> For security monitoring and fraud prevention</li>
                                <li><strong>Cookies:</strong> Essential cookies for authentication and session management</li>
                            </ul>

                            <h4 className="font-bold text-gray-900 mt-6">1.3 Transaction Data</h4>
                            <ul>
                                <li>Wallet funding amounts and dates</li>
                                <li>Booking details and payment records</li>
                                <li>Escrow transaction history</li>
                            </ul>
                        </Section>

                        <Section num="2" title="How We Use Your Information">
                            <p>We use your information to:</p>
                            <ul>
                                <li><strong>Provide our service:</strong> Process registrations, bookings, and payments</li>
                                <li><strong>Verify identity:</strong> Confirm user and agent identities to prevent fraud</li>
                                <li><strong>Send OTP codes:</strong> For email verification and two-factor authentication</li>
                                <li><strong>Communicate:</strong> Send booking confirmations, transaction receipts, and important service updates</li>
                                <li><strong>Improve the platform:</strong> Analyze usage patterns to enhance user experience</li>
                                <li><strong>Ensure security:</strong> Detect and prevent fraud, abuse, and unauthorized access</li>
                                <li><strong>Legal compliance:</strong> Meet regulatory and legal obligations</li>
                            </ul>
                        </Section>

                        <Section num="3" title="Data Storage &amp; Security">
                            <p>We implement industry-standard security measures to protect your data:</p>
                            <ul>
                                <li><strong>Encryption:</strong> All data transmitted between your browser and our servers is encrypted using TLS/SSL</li>
                                <li><strong>Password security:</strong> Passwords are hashed using bcrypt with a salt factor and are never stored in plain text</li>
                                <li><strong>OTP security:</strong> One-time passwords expire after 10 minutes and are limited to 5 verification attempts</li>
                                <li><strong>Database security:</strong> Our MongoDB Atlas database uses encryption at rest and in transit</li>
                                <li><strong>Access control:</strong> Only authorized personnel have access to user data, and all access is logged</li>
                                <li><strong>JWT tokens:</strong> Authentication tokens are signed with a secure secret key and have defined expiration periods</li>
                            </ul>
                            <p>
                                While we strive to protect your data, no method of electronic storage or transmission is 100% secure. We cannot guarantee absolute security.
                            </p>
                        </Section>

                        <Section num="4" title="Data Sharing &amp; Disclosure">
                            <p>We do <strong>not</strong> sell your personal data to third parties. We may share limited information in the following cases:</p>
                            <ul>
                                <li><strong>Between users:</strong> Agents can see tenant names and booking details for confirmed bookings. Tenants can see agent names, contact information, and property details for listings.</li>
                                <li><strong>Service providers:</strong> We use trusted third-party services (email delivery, payment processing) that may process data on our behalf, subject to strict confidentiality agreements.</li>
                                <li><strong>Legal requirements:</strong> We may disclose data if required by law, regulation, legal process, or government request.</li>
                                <li><strong>Safety:</strong> To protect the rights, property, or safety of our users and the public.</li>
                            </ul>
                        </Section>

                        <Section num="5" title="Cookies &amp; Local Storage">
                            <p>FUTA Housing uses:</p>
                            <ul>
                                <li><strong>Essential cookies:</strong> Required for authentication and session management. These cannot be disabled.</li>
                                <li><strong>Local storage:</strong> To store your authentication token and user preferences for a seamless experience.</li>
                            </ul>
                            <p>
                                We do not use advertising or tracking cookies. No third-party analytics trackers are embedded in the Platform.
                            </p>
                        </Section>

                        <Section num="6" title="Your Rights">
                            <p>Under the Nigeria Data Protection Regulation (NDPR), you have the right to:</p>
                            <ul>
                                <li><strong>Access:</strong> Request a copy of the personal data we hold about you</li>
                                <li><strong>Correction:</strong> Request correction of inaccurate or incomplete data</li>
                                <li><strong>Deletion:</strong> Request deletion of your account and associated data (subject to legal retention requirements)</li>
                                <li><strong>Portability:</strong> Request your data in a machine-readable format</li>
                                <li><strong>Objection:</strong> Object to certain types of data processing</li>
                                <li><strong>Withdraw consent:</strong> Withdraw previously given consent at any time</li>
                            </ul>
                            <p>
                                To exercise any of these rights, contact us at <strong>futahousing@gmail.com</strong>. We will respond within 30 days.
                            </p>
                        </Section>

                        <Section num="7" title="Data Retention">
                            <p>We retain your data for the following periods:</p>
                            <ul>
                                <li><strong>Account data:</strong> For as long as your account is active, plus 2 years after deletion</li>
                                <li><strong>Transaction records:</strong> 7 years (for legal and financial compliance)</li>
                                <li><strong>OTP codes:</strong> Automatically deleted after 10 minutes or upon successful verification</li>
                                <li><strong>Identity documents:</strong> For the duration of the agent&apos;s active status, plus 1 year after account deactivation</li>
                                <li><strong>Server logs:</strong> 90 days</li>
                            </ul>
                        </Section>

                        <Section num="8" title="Children&apos;s Privacy">
                            <p>
                                FUTA Housing is not intended for children under the age of 16. We do not knowingly collect personal information from children under 16. If you believe a child under 16 has provided us with personal data, please contact us immediately and we will delete such information.
                            </p>
                        </Section>

                        <Section num="9" title="Third-Party Links">
                            <p>
                                The Platform may contain links to third-party websites or services. We are not responsible for the privacy practices or content of these external sites. We encourage you to review the privacy policies of any third-party services before providing personal information.
                            </p>
                        </Section>

                        <Section num="10" title="Changes to This Policy">
                            <p>
                                We may update this Privacy Policy periodically. When we make significant changes, we will notify you via email or a prominent notice on the Platform. The &quot;Last updated&quot; date at the top of this policy indicates when the latest revision was made. Your continued use of the Platform after any changes constitutes acceptance of the updated policy.
                            </p>
                        </Section>

                        <Section num="11" title="Contact Us">
                            <p>For privacy-related inquiries, data requests, or complaints, contact us:</p>
                            <ul>
                                <li><strong>Email:</strong> futahousing@gmail.com</li>
                                <li><strong>Phone:</strong> 0907 460 6483 / 0805 911 3619</li>
                                <li><strong>Location:</strong> FUTA South Gate, Akure, Ondo State, Nigeria</li>
                            </ul>
                            <p>
                                If you are not satisfied with our response, you have the right to lodge a complaint with the National Information Technology Development Agency (NITDA).
                            </p>
                        </Section>

                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}

function Section({ num, title, children }: { num: string; title: string; children: React.ReactNode }) {
    return (
        <div className="mb-10">
            <div className="flex items-center gap-3 mb-4">
                <span className="w-8 h-8 bg-emerald-100 text-emerald-600 rounded-lg flex items-center justify-center text-sm font-bold shrink-0">
                    {num}
                </span>
                <h2 className="text-xl font-bold text-gray-900 m-0">{title}</h2>
            </div>
            <div className="text-gray-600 leading-relaxed pl-11 space-y-3 text-[15px]">
                {children}
            </div>
        </div>
    );
}
