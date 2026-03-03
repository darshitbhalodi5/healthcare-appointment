import React from "react";
import { motion } from "framer-motion";
import { Phone, Mail, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const EASE = [0.22, 1, 0.36, 1];

const fadeUp = (delay = 0) => ({
    initial: { opacity: 0, y: 28 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.8, delay, ease: EASE },
});

const NewHeroPage = () => {
    return (
        <section
            className="min-h-screen flex flex-col overflow-hidden relative"
            style={{
                background:
                    "linear-gradient(135deg, #cde3ef 0%, #e4f2f9 45%, #cde3ef 100%)",
            }}
        >
            {/* ══════════════════════════════════════════════
          SKY GRADIENT BLOBS — atmospheric background
      ══════════════════════════════════════════════ */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                {/* large white glow center-right (behind doctor) */}
                <div className="absolute top-[15%] right-[15%] w-[650px] h-[650px] rounded-full bg-white/40 blur-[20px]" />
                {/* top-left soft blue */}
                <div className="absolute -top-20 -left-20 w-[420px] h-[420px] rounded-full bg-[#a8ccdf]/30 blur-[20px]" />
                {/* bottom-left accent */}
                <div className="absolute bottom-0 left-[10%] w-[380px] h-[380px] rounded-full bg-[#b2d6eb]/55 blur-[40px]" />
                {/* bottom-right accent */}
                <div className="absolute -bottom-10 right-[5%] w-[300px] h-[300px] rounded-full bg-[#93c5fd]/40 blur-[40px]" />
            </div>

            {/* ══════════════════════════════════════════════
          MAIN ROW
      ══════════════════════════════════════════════ */}
            <div className="flex-1 flex flex-col lg:flex-row items-center justify-between gap-10 lg:gap-8 px-6 sm:px-10 lg:px-20 pt-24 pb-12 lg:py-10 relative z-10">

                {/* ────────────────────────────
            LEFT — text content
        ──────────────────────────── */}
                <div className="w-full lg:w-[45%] flex flex-col gap-5 lg:gap-6 items-center lg:items-start text-center lg:text-left">

                    {/* Futuristic badge */}
                    <motion.div
                        {...fadeUp(0.15)}
                        className="inline-flex items-center gap-2.5 w-fit
                       bg-white/20 backdrop-blur-md
                       px-4 py-2 rounded-full
                       border border-[#0f4e9e]/25
                       shadow-sm shadow-[#0f4e9e]/10"
                    >
                        <span className="w-2 h-2 rounded-full bg-[#61a951] shadow-[0_0_8px_2px_rgba(97,169,81,0.6)] animate-pulse flex-shrink-0" />
                        <span
                            className="text-xs font-black uppercase tracking-widest"
                            style={{
                                background: "linear-gradient(90deg, #0f4e9e, #61a951)",
                                WebkitBackgroundClip: "text",
                                WebkitTextFillColor: "transparent",
                            }}
                        >
                            Advanced Medical Care
                        </span>
                    </motion.div>

                    {/* Stacked headline — two words, serif, blue + green */}
                    <div className="flex flex-col leading-[0.9]">
                        <motion.span
                            {...fadeUp(0.28)}
                            className="text-[2.6rem] sm:text-5xl md:text-6xl lg:text-7xl xl:text-[5.5rem] font-black tracking-tight"
                            style={{
                                fontFamily: "var(--font-playfair)",
                                background: "linear-gradient(120deg, #0f2d5e 0%, #0f4e9e 55%, #2177c7 100%)",
                                WebkitBackgroundClip: "text",
                                WebkitTextFillColor: "transparent",
                            }}
                        >
                            Smart
                        </motion.span>
                        <motion.span
                            {...fadeUp(0.42)}
                            className="text-[2.6rem] sm:text-5xl md:text-6xl lg:text-7xl xl:text-[5.5rem] font-black tracking-tight pb-2 sm:pb-4"
                            style={{
                                fontFamily: "var(--font-playfair)",
                                background: "linear-gradient(120deg, #61a951 0%, #4ade80 55%, #61a951 100%)",
                                WebkitBackgroundClip: "text",
                                WebkitTextFillColor: "transparent",
                            }}
                        >
                            Digestive
                        </motion.span>
                    </div>

                    {/* Gradient separator */}
                    <motion.div
                        {...fadeUp(0.7)}
                        className="w-16 sm:w-20 h-[2px] rounded-full"
                        style={{ background: "linear-gradient(90deg, #0f4e9e, #61a951)" }}
                    />

                    {/* Sub-heading */}
                    <motion.p
                        {...fadeUp(0.74)}
                        className="text-[#3a6080] text-sm md:text-[0.95rem] leading-relaxed max-w-[300px] sm:max-w-sm lg:max-w-xs font-medium"
                    >
                        Expert Gastroenterology and Hepatology care across multiple
                        locations. Unified digital records for a seamless patient journey.
                    </motion.p>

                    {/* Stat chips */}
                    <motion.div
                        {...fadeUp(0.82)}
                        className="flex items-center gap-2 sm:gap-3 flex-wrap justify-center lg:justify-start"
                    >
                        {[
                            { value: "22+", label: "Years Exp." },
                            { value: "10k+", label: "Patients" },
                            { value: "4.9★", label: "Rated" },
                        ].map(({ value, label }) => (
                            <div
                                key={label}
                                className="flex flex-col items-center px-3 sm:px-4 py-2 sm:py-2.5 rounded-2xl
                           bg-white/25 backdrop-blur-sm border border-white/40 shadow-sm"
                            >
                                <span
                                    className="font-black text-sm sm:text-base leading-none"
                                    style={{
                                        background: "linear-gradient(120deg, #0f4e9e, #61a951)",
                                        WebkitBackgroundClip: "text",
                                        WebkitTextFillColor: "transparent",
                                    }}
                                >
                                    {value}
                                </span>
                                <span className="text-[8px] sm:text-[9px] text-[#4a7090] font-bold uppercase tracking-wider mt-1">
                                    {label}
                                </span>
                            </div>
                        ))}
                    </motion.div>

                    {/* CTA */}
                    <Link to="/login" style={{ textDecoration: 'none' }}>
                        <motion.button
                            {...fadeUp(0.9)}
                            whileHover="hover"
                            whileTap={{ scale: 0.95 }}
                            className="relative overflow-hidden flex items-center gap-3 sm:gap-4
                         px-6 sm:px-8 py-3 sm:py-4 rounded-full font-bold text-sm
                         backdrop-blur-sm cursor-pointer"
                            style={{
                                background:
                                    "linear-gradient(rgba(255,255,255,0.88), rgba(255,255,255,0.88)) padding-box, linear-gradient(135deg, #0f4e9e, #61a951) border-box",
                                border: "2px solid transparent",
                                color: "#0f2d5e",
                            }}
                        >
                            <motion.span
                                className="absolute inset-0 pointer-events-none"
                                initial={{ x: "-130%" }}
                                variants={{
                                    hover: {
                                        x: "170%",
                                        transition: { duration: 0.52, ease: "easeInOut" },
                                    },
                                }}
                                style={{
                                    background:
                                        "linear-gradient(105deg, transparent 25%, rgba(255,255,255,0.75) 50%, transparent 75%)",
                                    borderRadius: "inherit",
                                }}
                            />
                            <span className="relative z-10 tracking-wide">Explore More</span>
                            <motion.span
                                className="relative z-10 w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center flex-shrink-0"
                                style={{ background: "linear-gradient(135deg, #0f4e9e, #61a951)" }}
                                variants={{
                                    hover: {
                                        x: 5,
                                        transition: { type: "spring", stiffness: 500, damping: 18 },
                                    },
                                }}
                            >
                                <ArrowRight size={13} className="text-white" strokeWidth={2.5} />
                            </motion.span>
                        </motion.button>
                    </Link>
                </div>

                {/* ────────────────────────────
            RIGHT — butterfly design
        ──────────────────────────── */}
                <div className="w-full lg:w-[55%] flex flex-col items-center">

                    {/* ── Wings + info cards wrapper ── */}
                    <div className="flex flex-col items-center w-full mt-10 sm:mt-12 lg:mt-16">

                        {/* ── Two wing cards ── */}
                        <div className="relative flex items-start gap-2">

                            {/* ── Round Book Appointment — centered on top of both wings ── */}
                            <Link to="/login" className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 z-40">
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.5 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ duration: 0.9, delay: 0.35 }}
                                    whileHover={{ scale: 1.2 }}
                                    whileTap={{ scale: 0.96 }}
                                    className="cursor-pointer
                             w-[88px] h-[88px] sm:w-[108px] sm:h-[108px] lg:w-[128px] lg:h-[128px]
                             rounded-full bg-white/40 backdrop-blur-xl
                             text-[#0f4e9e] font-black text-[8px] sm:text-sm lg:text-lg
                             uppercase tracking-wide text-center leading-snug
                             flex items-center justify-center
                             shadow-2xl shadow-[#0f4e9e]/50 transition-all duration-300"
                                >
                                    Login
                                </motion.div>
                            </Link>

                            {/* LEFT WING — Doctor girl */}
                            <motion.div
                                initial={{ opacity: 0, x: -30 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 1.15, delay: 0.5, ease: EASE }}
                                whileHover={{ scale: 1.02, transition: { duration: 0.4 } }}
                                className="relative w-[120px] sm:w-44 md:w-52 lg:w-60
                           h-[200px] sm:h-[320px] md:h-[380px] lg:h-[430px]
                           rounded-full bg-white shadow-2xl shadow-[#0f4e9e]/50
                           overflow-hidden cursor-pointer border border-white"
                            >
                                <div className="absolute inset-0 bg-white" />
                                <img
                                    src="/Images/doctor.png"
                                    alt="Doctor"
                                    className="absolute inset-0 w-full h-full scale-145 object-contain object-center"
                                />
                            </motion.div>

                            {/* RIGHT WING — Liver / organ */}
                            <motion.div
                                initial={{ opacity: 0, x: 30 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 1.15, delay: 0.65, ease: EASE }}
                                whileHover={{ scale: 1.02, transition: { duration: 0.4 } }}
                                className="relative w-[120px] sm:w-44 md:w-52 lg:w-60
                           h-[200px] sm:h-[320px] md:h-[380px] lg:h-[430px]
                           rounded-full bg-white overflow-hidden cursor-pointer
                           shadow-2xl shadow-[#0f4e9e]/50 border border-white"
                            >
                                <div className="absolute top-8 left-1/2 -translate-x-1/2 w-36 h-36 rounded-full bg-[#61a951]/10 blur-2xl" />
                                <div className="absolute bottom-8 right-4 w-24 h-24 rounded-full bg-[#0f4e9e]/08 blur-xl" />
                                <img
                                    src="/Images/organ.png"
                                    alt="Organ"
                                    className="absolute inset-0 w-full h-full object-contain scale-130 drop-shadow-2xl"
                                />
                            </motion.div>

                            {/* ── Doctor info card — desktop only, absolute outside left wing ── */}
                            <motion.div
                                initial={{ opacity: 0, x: -24, y: 16 }}
                                animate={{ opacity: 1, x: 0, y: 0 }}
                                transition={{ duration: 0.65, delay: 1.2, ease: EASE }}
                                className="hidden lg:block absolute bottom-2 -left-[7.5rem] z-30
                           bg-white/50 backdrop-blur-sm
                           rounded-3xl px-5 py-4
                           shadow-2xl shadow-blue-200/30
                           border border-white/40 w-[240px]"
                            >
                                <div className="flex items-center gap-3 mb-3">
                                    <div>
                                        <p className="text-[#0f2d5e] font-black text-sm leading-tight">
                                            Dr. Maitrey Patel
                                        </p>
                                        <p className="text-[#4a7090] text-[11px] font-semibold uppercase tracking-wide leading-tight mt-0.5">
                                            MD DrNB Gastroenterology
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <span className="text-[#f59e0b] text-xs">★★★★★</span>
                                    <span className="text-[#4a7090] text-xs font-bold">4.9</span>
                                    <span className="text-[#4a7090] text-[10px]">(320 reviews)</span>
                                </div>
                            </motion.div>

                            {/* ── Contact card — desktop only, absolute outside right wing ── */}
                            <motion.div
                                initial={{ opacity: 0, x: 24, y: -16 }}
                                animate={{ opacity: 1, x: 0, y: 0 }}
                                transition={{ duration: 0.65, delay: 1.35, ease: EASE }}
                                className="hidden lg:block absolute top-2 -right-[9.5rem] z-30
                           bg-white/20 backdrop-blur-xl
                           rounded-3xl px-5 py-4
                           shadow-2xl shadow-teal-200/30
                           border border-white/40 w-[230px]"
                            >
                                <p className="text-[#0f2d5e] font-black text-sm uppercase tracking-wide mb-3">
                                    Contact Us
                                </p>
                                <a href="tel:7760378269" className="flex items-center gap-3 group mb-2.5">
                                    <span className="w-9 h-9 rounded-full bg-white/30 flex items-center justify-center flex-shrink-0
                                   group-hover:bg-[#0f4e9e]/80 transition-colors duration-200">
                                        <Phone size={16} className="text-[#0f2d5e] group-hover:text-white transition-colors duration-200" />
                                    </span>
                                    <span className="text-[#0f2d5e] font-bold text-sm group-hover:text-[#0f4e9e] transition-colors duration-200">
                                        7760378269
                                    </span>
                                </a>
                                <a href="mailto:ptlmaitrey@gmail.com" className="flex items-center gap-3 group">
                                    <span className="w-9 h-9 rounded-full bg-white/30 flex items-center justify-center flex-shrink-0
                                   group-hover:bg-[#61a951]/80 transition-colors duration-200">
                                        <Mail size={16} className="text-[#4a7090] group-hover:text-white transition-colors duration-200" />
                                    </span>
                                    <span className="text-[#4a7090] font-semibold text-sm truncate max-w-[140px]
                                   group-hover:text-[#61a951] transition-colors duration-200">
                                        ptlmaitrey@gmail.com
                                    </span>
                                </a>
                            </motion.div>

                        </div>
                        {/* end wings row */}

                        {/* ── Mobile: info cards stacked below wings ── */}
                        <div className="flex lg:hidden gap-3 mt-6 w-full px-2">

                            {/* Doctor info card */}
                            <motion.div
                                initial={{ opacity: 0, y: 16 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.65, delay: 1.2, ease: EASE }}
                                className="flex-1 bg-white/50 backdrop-blur-sm
                           rounded-3xl px-4 py-3.5
                           shadow-xl shadow-blue-200/30
                           border border-white/40"
                            >
                                <p className="text-[#0f2d5e] font-black text-[13px] leading-tight">
                                    Dr. Maitrey Patel
                                </p>
                                <p className="text-[#4a7090] text-[10px] font-semibold uppercase tracking-wide leading-tight mt-0.5 mb-2.5">
                                    MD DrNB Gastroenterology
                                </p>
                                <div className="flex items-center gap-1">
                                    <span className="text-[#f59e0b] text-[11px]">★★★★★</span>
                                    <span className="text-[#4a7090] text-[11px] font-bold ml-0.5">4.9</span>
                                    <span className="text-[#4a7090] text-[9px]">(320)</span>
                                </div>
                            </motion.div>

                            {/* Contact card */}
                            <motion.div
                                initial={{ opacity: 0, y: 16 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.65, delay: 1.35, ease: EASE }}
                                className="flex-1 bg-white/20 backdrop-blur-xl
                           rounded-3xl px-4 py-3.5
                           shadow-xl shadow-teal-200/30
                           border border-white/40"
                            >
                                <p className="text-[#0f2d5e] font-black text-[11px] uppercase tracking-wide mb-2.5">
                                    Contact Us
                                </p>
                                <a href="tel:7760378269" className="flex items-center gap-2 group mb-2">
                                    <span className="w-7 h-7 rounded-full bg-white/30 flex items-center justify-center flex-shrink-0
                                   group-hover:bg-[#0f4e9e]/80 transition-colors duration-200">
                                        <Phone size={13} className="text-[#0f2d5e] group-hover:text-white transition-colors duration-200" />
                                    </span>
                                    <span className="text-[#0f2d5e] font-bold text-[12px]">7760378269</span>
                                </a>
                                <a href="mailto:ptlmaitrey@gmail.com" className="flex items-center gap-2 group">
                                    <span className="w-7 h-7 rounded-full bg-white/30 flex items-center justify-center flex-shrink-0
                                   group-hover:bg-[#61a951]/80 transition-colors duration-200">
                                        <Mail size={13} className="text-[#4a7090] group-hover:text-white transition-colors duration-200" />
                                    </span>
                                    <span className="text-[#4a7090] font-semibold text-[11px] truncate">
                                        ptlmaitrey@gmail.com
                                    </span>
                                </a>
                            </motion.div>

                        </div>
                        {/* end mobile cards */}

                    </div>
                    {/* end wings + cards wrapper */}

                </div>
                {/* end right */}

            </div>
            {/* end main row */}

        </section>
    );
};

export default NewHeroPage;
