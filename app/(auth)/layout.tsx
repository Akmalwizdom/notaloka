import { ReactNode } from "react";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center relative overflow-hidden bg-background-dark p-4 group">
      {/* Dynamic Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-brand/5 rounded-full blur-[120px] animate-pulse pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-brand/5 rounded-full blur-[120px] animate-pulse pointer-events-none" />

      {/* Brand Header */}
      <div className="mb-12 flex flex-col items-center animate-in fade-in slide-in-from-top-4 duration-700">
        <div className="w-16 h-16 bg-brand/10 border border-brand/20 rounded-2xl flex items-center justify-center mb-4 transition-transform hover:scale-105 duration-300">
          <span className="text-brand text-3xl font-bold italic">N</span>
        </div>
        <h1 className="text-3xl font-bold tracking-tighter text-white">
          Notaloka<span className="text-brand">.</span>
        </h1>
        <p className="text-slate-400 text-sm mt-2 font-medium">
          Premium Business Intelligence Suite
        </p>
      </div>

      {/* Main Content Area */}
      <div className="w-full max-w-112.5 relative z-10">{children}</div>

      {/* Footer Decoration */}
      <footer className="mt-12 text-slate-500 text-xs font-medium animate-in fade-in duration-1000">
        &copy; {new Date().getFullYear()} Notaloka Intelligence. All rights
        reserved.
      </footer>
    </div>
  );
}
