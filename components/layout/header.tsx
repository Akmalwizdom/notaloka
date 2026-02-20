import { Search, Bell, User } from "lucide-react";

export function Header({ title }: { title: string }) {
  return (
    <header className="h-20 px-8 flex items-center justify-between border-b border-slate-200 dark:border-white/10 sticky top-0 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md z-30">
      <div className="flex items-center gap-6">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">
          {title}
        </h2>
        <div className="relative w-80 hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 size-4" />
          <input
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-100 dark:bg-white/5 border border-transparent focus:border-brand focus:ring-1 focus:ring-brand/20 transition-all text-sm outline-none text-slate-900 dark:text-white placeholder:text-slate-500"
            placeholder="Search data or reports..."
            type="text"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="text-[10px] font-bold uppercase tracking-wider">
            Online
          </span>
        </div>

        <button className="p-2 rounded-xl bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/10 transition-colors relative">
          <Bell className="size-5" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-brand rounded-full"></span>
        </button>

        <div className="h-8 w-px bg-slate-200 dark:bg-white/10 mx-2 hidden sm:block"></div>

        <button className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-white/5 transition-colors">
          <div className="size-8 rounded-full bg-brand/20 flex items-center justify-center overflow-hidden border border-brand/20">
            <User className="size-4 text-brand" />
          </div>
        </button>
      </div>
    </header>
  );
}
