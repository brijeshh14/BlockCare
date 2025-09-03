"use client";
import React from "react";
import { Play, ArrowRight, Shield, Lock, Database } from "lucide-react";
import Link from "next/link";

const HeroContent = () => {
  return (
    <div className="space-y-6 sm:space-y-8 text-center lg:text-left">
      <div className="inline-flex items-center gap-2 bg-foreground/5 text-foreground/80 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full border border-border">
        <Database className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
        <span className="text-[10px] sm:text-xs tracking-widest">
          Blockchain Health Records
        </span>
      </div>

      <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-extrabold leading-tight bg-gradient-to-b from-foreground to-foreground/70 bg-clip-text text-transparent">
        Own and Share Your Medical Records, Securely
      </h1>

      <p className="text-foreground/70 text-base sm:text-lg max-w-xl mx-auto lg:mx-0">
        BlockCare gives patients full control over their health data with
        encrypted storage, consent‑driven sharing, and tamper‑proof audit trails
        — all powered by blockchain.
      </p>

      <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
        <Link
          href="/login"
          className="group bg-gradient-to-r from-primary via-accent to-primary text-primary-foreground px-5 sm:px-7 py-3 sm:py-4 rounded-xl sm:rounded-2xl font-semibold text-sm tracking-wide hover:shadow-[0_0_40px_rgb(var(--primary)/0.4)] transition-all duration-200 flex items-center justify-center gap-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          aria-label="Get started with BlockCare"
        >
          <span>Get Started</span>
          <Play className="h-4 w-4 sm:h-5 sm:w-5 group-hover:translate-x-1 transition-transform" />
        </Link>
        <Link
          href="https://github.com/AdarsHH30/BlockCare/blob/main/HowItWorks.md"
          target="_blank"
          rel="noopener noreferrer"
          className="group bg-foreground/5 text-foreground border border-border px-5 sm:px-7 py-3 sm:py-4 rounded-xl sm:rounded-2xl font-semibold text-sm tracking-wide hover:bg-foreground/10 transition-all duration-200 flex items-center justify-center gap-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          aria-label="Learn how BlockCare works"
        >
          <span>How it works</span>
          <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>
      <p className="text-foreground/50 text-xs">SignUp required</p>

      <div className="flex flex-wrap justify-center lg:justify-start items-center gap-3 sm:gap-6 text-foreground/60 text-xs sm:text-sm">
        {/* <div className="flex items-center gap-2">
          <Shield className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          <span>HIPAA‑ready encryption</span>
        </div> */}
        <div className="flex items-center gap-2">
          <Lock className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          <span>Patient‑controlled consent</span>
        </div>
      </div>
    </div>
  );
};

export default HeroContent;
