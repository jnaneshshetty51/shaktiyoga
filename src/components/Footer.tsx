import Link from 'next/link';
import { FaInstagram, FaYoutube, FaFacebook, FaWhatsapp, FaCreditCard, FaLock, FaMapMarkerAlt, FaPhone, FaEnvelope } from 'react-icons/fa';
import { SiRazorpay } from 'react-icons/si';

export default function Footer() {
    return (
        <footer className="bg-primary text-white pt-16 pb-8 px-6 md:px-12 lg:px-16 mt-auto border-t border-white/10">
            <div className="max-w-7xl mx-auto">
                {/* Main Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-12 mb-16">
                    {/* 1. Brand & Description */}
                    <div className="space-y-6">
                        <div>
                            <h2 className="font-serif text-2xl font-bold tracking-wider mb-1">Shakti Yoga</h2>
                            <p className="text-xs uppercase tracking-widest opacity-70">Kendra</p>
                        </div>
                        <p className="font-sans text-sm leading-relaxed opacity-90 text-white/80">
                            Yoga is not just a practice. It's a way of life. Whether you seek stress relief, physical well-being, or a deeper connection to yourself, Shakti Yoga Kendra welcomes you to embark on this journey with us.
                        </p>
                        <div className="flex gap-3">
                            <a href="https://instagram.com/shaktiyogakendra" target="_blank" rel="noopener noreferrer" className="p-2.5 bg-white/10 rounded-full hover:bg-white/20 hover:scale-110 transition-all" aria-label="Instagram"><FaInstagram className="w-5 h-5" /></a>
                            <a href="https://youtube.com/@shaktiyogakendra" target="_blank" rel="noopener noreferrer" className="p-2.5 bg-white/10 rounded-full hover:bg-white/20 hover:scale-110 transition-all" aria-label="YouTube"><FaYoutube className="w-5 h-5" /></a>
                            <a href="https://facebook.com/shaktiyogakendra" target="_blank" rel="noopener noreferrer" className="p-2.5 bg-white/10 rounded-full hover:bg-white/20 hover:scale-110 transition-all" aria-label="Facebook"><FaFacebook className="w-5 h-5" /></a>
                            <a href="https://wa.me/917204050478" target="_blank" rel="noopener noreferrer" className="p-2.5 bg-white/10 rounded-full hover:bg-white/20 hover:scale-110 transition-all" aria-label="WhatsApp"><FaWhatsapp className="w-5 h-5" /></a>
                        </div>
                    </div>

                    {/* 2. Quick Navigation */}
                    <div className="grid grid-cols-2 gap-8 lg:col-span-2">
                        <div>
                            <h3 className="font-serif text-lg mb-5 text-secondary font-semibold">Programs</h3>
                            <ul className="space-y-3 text-sm opacity-80 font-sans">
                                <li><Link href="/programs" className="hover:text-secondary hover:translate-x-1 transition-all inline-block">All Programs</Link></li>
                                <li><Link href="/everyday-yoga" className="hover:text-secondary hover:translate-x-1 transition-all inline-block">Everyday Yoga</Link></li>
                                <li><Link href="/yoga-therapy" className="hover:text-secondary hover:translate-x-1 transition-all inline-block">Yoga Therapy (1:1)</Link></li>
                                <li><Link href="/trial" className="hover:text-secondary hover:translate-x-1 transition-all inline-block font-bold">Free Trial Class</Link></li>
                                <li><Link href="/yoga-therapy/start" className="hover:text-secondary hover:translate-x-1 transition-all inline-block">Book Consultation</Link></li>
                            </ul>
                        </div>
                        <div>
                            <h3 className="font-serif text-lg mb-5 text-secondary font-semibold">Explore</h3>
                            <ul className="space-y-3 text-sm opacity-80 font-sans">
                                <li><Link href="/" className="hover:text-secondary hover:translate-x-1 transition-all inline-block">Home</Link></li>
                                <li><Link href="/about" className="hover:text-secondary hover:translate-x-1 transition-all inline-block">About Us</Link></li>
                                <li><Link href="/stories" className="hover:text-secondary hover:translate-x-1 transition-all inline-block">Success Stories</Link></li>
                                <li><Link href="/blog" className="hover:text-secondary hover:translate-x-1 transition-all inline-block">Blog & Resources</Link></li>
                                <li><Link href="/contact" className="hover:text-secondary hover:translate-x-1 transition-all inline-block">Contact & Support</Link></li>
                            </ul>
                        </div>
                    </div>

                    {/* 3. Contact Info */}
                    <div className="space-y-6">
                        <div>
                            <h3 className="font-serif text-lg mb-5 text-secondary font-semibold">Get in Touch</h3>
                            <div className="space-y-4 text-sm opacity-80 font-sans">
                                <a href="mailto:contactus@shaktiyoga.in" className="flex items-start gap-3 hover:text-secondary transition-colors">
                                    <FaEnvelope className="mt-1 flex-shrink-0" />
                                    <span>contactus@shaktiyoga.in</span>
                                </a>
                                <a href="tel:+917204050478" className="flex items-center gap-3 hover:text-secondary transition-colors">
                                    <FaPhone className="flex-shrink-0" />
                                    <span>+91 7204050478</span>
                                </a>
                                <div className="flex items-start gap-3">
                                    <FaMapMarkerAlt className="mt-1 flex-shrink-0" />
                                    <span className="text-xs leading-relaxed">LIG 77, Hudco 4th Main Rd, near Netaji Nandanavana Park, Doddangudde, Udupi, Karnataka 576102</span>
                                </div>
                            </div>
                        </div>

                        <div className="text-xs opacity-60">
                            <p>Response time: 9 AM – 9 PM IST</p>
                        </div>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="border-t border-white/10 pt-8">
                    <div className="flex flex-col lg:flex-row justify-between items-center gap-6">
                        {/* Copyright */}
                        <div className="text-center lg:text-left space-y-1">
                            <p className="text-xs opacity-60 font-sans">
                                &copy; {new Date().getFullYear()} Shakti Yoga Kendra. All rights reserved.
                            </p>
                            <p className="text-[10px] opacity-40">
                                Made with dedication in Udupi, India
                            </p>
                        </div>

                        {/* Legal Links */}
                        <div className="flex flex-wrap justify-center gap-6 text-xs uppercase tracking-wider font-sans">
                            <Link href="/terms" className="hover:text-secondary transition-colors underline-offset-4 hover:underline">Terms</Link>
                            <Link href="/privacy" className="hover:text-secondary transition-colors underline-offset-4 hover:underline">Privacy Policy</Link>
                            <Link href="/programs" className="hover:text-secondary transition-colors underline-offset-4 hover:underline">Programs</Link>
                            <Link href="/disclaimer" className="hover:text-secondary transition-colors underline-offset-4 hover:underline">Disclaimer</Link>
                        </div>

                        {/* Payment Security */}
                        <div className="flex items-center gap-4 opacity-80">
                            <span className="flex items-center gap-2 text-xs">
                                <FaLock /> SSL Secured
                            </span>
                            <div className="flex items-center gap-2">
                                <FaCreditCard title="Card Payment" className="text-lg" />
                                <SiRazorpay title="Razorpay" className="text-lg" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Medical Disclaimer */}
                <div className="text-center mt-8 pt-6 border-t border-white/5">
                    <p className="text-[10px] opacity-30 max-w-2xl mx-auto leading-relaxed">
                        <strong>Medical Disclaimer:</strong> Yoga is not a replacement for medical treatment. Please consult your doctor before starting any new exercise regime. Results may vary based on individual dedication and health conditions.
                    </p>
                </div>
            </div>
        </footer>
    );
}
