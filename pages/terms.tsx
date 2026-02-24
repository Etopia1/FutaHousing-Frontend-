import Head from 'next/head';
import Link from 'next/link';
import Image from 'next/image';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { FiArrowLeft } from 'react-icons/fi';

export default function TermsOfService() {
    return (
        <div className="min-h-screen bg-white flex flex-col" style={{ fontFamily: "'Inter', sans-serif" }}>
            <Head>
                <title>Terms of Service | FUTA Housing</title>
                <meta name="description" content="Read the Terms of Service for FUTA Housing — secure accommodation platform for everyone around FUTA." />
                <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />
            </Head>

            <Header />

            {/* Hero */}
            <section className="bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-700 py-20">
                <div className="max-w-4xl mx-auto px-6 text-center">
                    <Link href="/" className="inline-flex items-center gap-2 text-white/70 hover:text-white text-sm mb-6 transition">
                        <FiArrowLeft /> Back to Home
                    </Link>
                    <h1 className="text-4xl md:text-5xl font-black text-white mb-4">Terms of Service</h1>
                    <p className="text-white/70 text-lg">Last updated: February 20, 2026</p>
                </div>
            </section>

            {/* Content */}
            <main className="flex-grow py-16">
                <div className="max-w-4xl mx-auto px-6">
                    <div className="prose prose-lg prose-gray max-w-none">

                        {/* Intro */}
                        <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-6 mb-10">
                            <p className="text-indigo-800 text-sm leading-relaxed m-0">
                                Welcome to FUTA Housing. By accessing or using our platform, you agree to be bound by these Terms of Service. Please read them carefully before registering or making any transactions.
                            </p>
                        </div>

                        <Section num="1" title="Acceptance of Terms">
                            <p>
                                By creating an account, browsing listings, or making any transaction on FUTA Housing (&quot;the Platform&quot;), you acknowledge that you have read, understood, and agree to be bound by these Terms of Service (&quot;Terms&quot;). If you do not agree to these Terms, you must not use the Platform.
                            </p>
                            <p>
                                These Terms constitute a legally binding agreement between you (&quot;User&quot;, &quot;you&quot;, or &quot;your&quot;) and FUTA Housing (&quot;we&quot;, &quot;us&quot;, or &quot;our&quot;). We reserve the right to modify these Terms at any time, and your continued use of the Platform constitutes acceptance of any modifications.
                            </p>
                        </Section>

                        <Section num="2" title="Eligibility &amp; Account Registration">
                            <p>To use FUTA Housing, you must:</p>
                            <ul>
                                <li>Be at least 16 years of age</li>
                                <li>Be a student, staff member, or resident seeking accommodation in the Federal University of Technology, Akure (FUTA) vicinity, or a legitimate property agent operating in the area</li>
                                <li>Provide accurate, current, and complete information during registration</li>
                                <li>Maintain the security and confidentiality of your login credentials</li>
                                <li>Verify your email address through our OTP (One-Time Password) verification system</li>
                            </ul>
                            <p>
                                You are responsible for all activities that occur under your account. If you suspect any unauthorized use, you must notify us immediately at <strong>futahousing@gmail.com</strong>.
                            </p>
                        </Section>

                        <Section num="3" title="User Roles &amp; Responsibilities">
                            <h4 className="font-bold text-gray-900">3.1 Users (Students & Non-Students)</h4>
                            <p>Registered users may browse hostel listings, fund their digital wallet, make bookings, and confirm move-in status. Users must not:</p>
                            <ul>
                                <li>Provide false identity information or impersonate another person</li>
                                <li>Abuse the escrow refund system by making false claims</li>
                                <li>Use the Platform for any unlawful purpose</li>
                            </ul>

                            <h4 className="font-bold text-gray-900 mt-6">3.2 Agents</h4>
                            <p>Agent users may list hostel properties for rent. Agents must:</p>
                            <ul>
                                <li>Complete identity verification (NIN and selfie submission) before listing properties</li>
                                <li>Provide accurate and truthful property descriptions, images, and pricing</li>
                                <li>Honour all confirmed bookings and maintain the property in the condition advertised</li>
                                <li>Not engage in fraudulent, deceptive, or misleading practices</li>
                            </ul>
                            <p>
                                Agents found in violation of these requirements may be permanently banned and reported to relevant authorities.
                            </p>
                        </Section>

                        <Section num="4" title="Escrow Payment System">
                            <p>
                                FUTA Housing operates an escrow-based payment system to protect both tenants and agents:
                            </p>
                            <ol>
                                <li><strong>Booking Payment:</strong> When a user books a hostel, the payment amount is deducted from their wallet and held in escrow. The agent does not receive funds at this stage.</li>
                                <li><strong>Physical Inspection:</strong> The user has the right and responsibility to physically inspect the hostel before confirming satisfaction.</li>
                                <li><strong>Confirmation:</strong> Upon confirming move-in, the escrowed funds are released to the agent, minus the Platform commission (5%).</li>
                                <li><strong>Cancellation/Refund:</strong> If the user cancels before confirming move-in, the full payment is refunded from escrow to their wallet. No partial releases are made to the agent.</li>
                            </ol>
                            <p>
                                <strong>Important:</strong> By using the escrow system, both parties agree that FUTA Housing acts solely as a payment intermediary and is not responsible for the condition or suitability of any listed property.
                            </p>
                        </Section>

                        <Section num="5" title="Digital Wallet">
                            <p>Each registered user receives a digital wallet. The wallet:</p>
                            <ul>
                                <li>Can be funded via approved payment methods</li>
                                <li>Balances are held securely and can only be used for transactions on the Platform</li>
                                <li>Does not accrue interest</li>
                                <li>Is non-transferable between users</li>
                                <li>Funds can be withdrawn subject to our withdrawal policy</li>
                            </ul>
                            <p>
                                FUTA Housing reserves the right to freeze wallet funds if suspicious activity is detected, pending investigation.
                            </p>
                        </Section>

                        <Section num="6" title="Commission &amp; Fees">
                            <p>
                                FUTA Housing charges a <strong>5% commission</strong> on each successful booking (deducted from the agent&apos;s payout upon move-in confirmation). Registration, browsing, and booking are free of charge for all users.
                            </p>
                            <p>
                                We reserve the right to modify commission rates with 30 days&apos; prior notice to registered agents.
                            </p>
                        </Section>

                        <Section num="7" title="Two-Factor Authentication &amp; Security">
                            <p>
                                To protect your account, FUTA Housing implements mandatory two-factor authentication (2FA) via email OTP. By using the Platform, you agree to:
                            </p>
                            <ul>
                                <li>Complete email verification upon registration</li>
                                <li>Verify your identity via OTP each time you log in (if 2FA is enabled)</li>
                                <li>Never share your OTP codes with anyone, including Platform staff</li>
                                <li>Keep your registered email account secure</li>
                            </ul>
                            <p>
                                FUTA Housing will never ask you for your password or OTP via phone, email, or any other channel outside the Platform interface.
                            </p>
                        </Section>

                        <Section num="8" title="Prohibited Activities">
                            <p>You agree not to:</p>
                            <ul>
                                <li>Use the Platform for any illegal, fraudulent, or unauthorized purpose</li>
                                <li>Post false, misleading, or deceptive listings</li>
                                <li>Attempt to bypass security measures, including OTP verification</li>
                                <li>Harass, threaten, or abuse other users</li>
                                <li>Scrape, crawl, or use automated tools to access the Platform</li>
                                <li>Impersonate FUTA Housing staff or other users</li>
                                <li>Attempt to manipulate wallet balances or transaction records</li>
                            </ul>
                        </Section>

                        <Section num="9" title="Intellectual Property">
                            <p>
                                All content, branding, logos, and technology on the Platform are owned by FUTA Housing and are protected by intellectual property laws. Users retain ownership of content they upload (e.g., property photos) but grant FUTA Housing a non-exclusive, royalty-free license to display such content on the Platform.
                            </p>
                        </Section>

                        <Section num="10" title="Limitation of Liability">
                            <p>
                                FUTA Housing provides the Platform on an &quot;as is&quot; and &quot;as available&quot; basis. We do not guarantee the accuracy, completeness, or reliability of any listing. To the maximum extent permitted by law:
                            </p>
                            <ul>
                                <li>We are not liable for any direct, indirect, incidental, or consequential damages arising from your use of the Platform</li>
                                <li>We are not responsible for the actions, omissions, or conduct of any user</li>
                                <li>We do not guarantee uninterrupted or error-free service</li>
                                <li>Our total liability is limited to the amount held in your wallet at the time of the claim</li>
                            </ul>
                        </Section>

                        <Section num="11" title="Dispute Resolution">
                            <p>
                                In the event of a dispute between a user and an agent, FUTA Housing may act as a mediator but is not obligated to resolve disputes. If mediation fails, disputes shall be resolved through the appropriate legal channels in Ondo State, Nigeria.
                            </p>
                        </Section>

                        <Section num="12" title="Termination">
                            <p>
                                We reserve the right to suspend or terminate your account at any time, with or without notice, for violation of these Terms or for any conduct that we deem harmful to the Platform or other users. Upon termination, any wallet balance (excluding amounts in dispute) will be made available for withdrawal.
                            </p>
                        </Section>

                        <Section num="13" title="Governing Law">
                            <p>
                                These Terms shall be governed by and construed in accordance with the laws of the Federal Republic of Nigeria. Any legal proceedings shall be conducted in courts of competent jurisdiction in Ondo State, Nigeria.
                            </p>
                        </Section>

                        <Section num="14" title="Contact Us">
                            <p>If you have questions about these Terms, please contact us:</p>
                            <ul>
                                <li><strong>Email:</strong> futahousing@gmail.com</li>
                                <li><strong>Phone:</strong> 0907 460 6483 / 0805 911 3619</li>
                                <li><strong>Location:</strong> FUTA South Gate, Akure, Ondo State, Nigeria</li>
                            </ul>
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
                <span className="w-8 h-8 bg-indigo-100 text-indigo-600 rounded-lg flex items-center justify-center text-sm font-bold shrink-0">
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
