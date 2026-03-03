import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const navLinks = ["Home", "About", "Services", "Contact"];

const NewNavbar = () => {
  const [open, setOpen] = useState(false);

  // Prevent body scroll when menu is open
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  return (
    <>
      {/* ── NAVBAR BAR ── */}
      <nav className="fixed top-0 left-0 w-full z-50 px-4 sm:px-8 py-4 sm:py-6 font-arimo">
        <div className="relative flex items-center justify-between max-w-7xl mx-auto">

          {/* Left spacer (desktop only) */}
          <div className="hidden lg:block w-32" />

          {/* ── CENTER: Logo ── */}
          <div className="lg:absolute lg:top-5 lg:left-1/2 lg:-translate-x-1/2 lg:-translate-y-1/2">
            <img
              src="/Images/Navbar/logo.png"
              alt="Logo"
              className="object-contain w-[60px] h-auto sm:w-[70px] lg:w-[80px]"
            />
          </div>

          {/* ── RIGHT: Custom Menu Trigger ── */}
          <button
            onClick={() => setOpen(true)}
            className="flex items-center gap-3 sm:gap-4 group cursor-pointer outline-none ml-auto lg:ml-0"
            aria-label="Open menu"
          >
            <span className="text-xs sm:text-sm font-bold uppercase tracking-[0.3em] text-[#0f4e9e] group-hover:text-[#61a951] transition-colors duration-300">
              MENU
            </span>

            {/* Diamond Dot Pattern */}
            <div className="relative w-4 h-4 flex items-center justify-center">
              <span className="absolute top-0 w-1 h-1 rounded-full bg-[#0f4e9e] group-hover:bg-[#61a951] transition-all duration-300 group-hover:-translate-y-0.5" />
              <span className="absolute bottom-0 w-1 h-1 rounded-full bg-[#0f4e9e] group-hover:bg-[#61a951] transition-all duration-300 group-hover:translate-y-0.5" />
              <span className="absolute left-0 w-1 h-1 rounded-full bg-[#0f4e9e] group-hover:bg-[#61a951] transition-all duration-300 group-hover:-translate-x-0.5" />
              <span className="absolute right-0 w-1 h-1 rounded-full bg-[#0f4e9e] group-hover:bg-[#61a951] transition-all duration-300 group-hover:translate-x-0.5" />
            </div>
          </button>
        </div>
      </nav>

      {/* ── BACKDROP ── */}
      <div
        onClick={() => setOpen(false)}
        className={`fixed inset-0 z-[60] bg-[#0f4e9e]/10 backdrop-blur-md transition-opacity duration-700 ${
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      />

      {/* ── SLIDE-IN PANEL (Glassmorphism) ── */}
      <aside
        className={`fixed top-0 right-0 h-full w-full sm:w-[400px] z-[70] bg-white/10 backdrop-blur-3xl border-l border-white/20 shadow-[-20px_0_60px_rgba(15,78,158,0.08)] flex flex-col transition-all duration-700 ease-[cubic-bezier(0.85,0,0.15,1)] ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Close button */}
        <button
          onClick={() => setOpen(false)}
          className="self-end mt-6 mr-6 sm:mt-10 sm:mr-10 group"
          aria-label="Close menu"
        >
          <div className="relative w-10 h-10 flex items-center justify-center">
            <div className="absolute inset-0 bg-[#0f4e9e]/5 rounded-full group-hover:scale-125 transition-transform duration-300" />
            <span className="text-[#0f4e9e] font-light text-2xl group-hover:rotate-90 transition-transform duration-500">✕</span>
          </div>
        </button>

        {/* Links */}
        <nav className="flex flex-col justify-center flex-1 px-8 sm:px-14 gap-6 sm:gap-10">
          {navLinks.map((link) => (
            <Link
              key={link}
              to="/"
              onClick={() => setOpen(false)}
              className="group relative flex items-center text-3xl sm:text-4xl font-black text-[#0f4e9e] overflow-hidden"
            >
              <span className="absolute left-0 w-0 h-[2px] bg-[#61a951] bottom-0 group-hover:w-full transition-all duration-500" />
              <span className="group-hover:translate-x-4 transition-transform duration-500">{link}</span>
              <span className="ml-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-4 transition-all duration-500 text-[#61a951] text-lg">→</span>
            </Link>
          ))}
        </nav>

        {/* Branding Footer */}
        <div className="px-8 sm:px-14 pb-10 sm:pb-14">
          <div className="flex items-center gap-3 mb-3 sm:mb-4">
            <div className="w-10 h-[2px] bg-[#61a951]" />
            <p className="text-xs font-bold text-[#0f4e9e] uppercase tracking-[0.3em]">
              Care Excellence
            </p>
          </div>
          <p className="text-[10px] text-slate-400 font-medium">
            Dr. Maitrey Patel — Multi-Location Gastroenterology
          </p>
        </div>
      </aside>
    </>
  );
};

export default NewNavbar;
