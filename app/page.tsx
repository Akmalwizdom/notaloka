import Link from "next/link";
import {
  ArrowRight,
  CreditCard,
  LayoutDashboard,
  Package,
  ShieldCheck,
} from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-linear-to-br from-background-light to-white dark:from-background-dark dark:to-slate-900 overflow-x-hidden">
      <div className="max-w-4xl w-full text-center space-y-8">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand/10 border border-brand/20 text-brand">
          <ShieldCheck className="size-4" />
          <span className="text-xs font-bold uppercase tracking-widest">
            Enterprise Ready POS
          </span>
        </div>

        <h1 className="text-5xl md:text-7xl font-black tracking-tight text-slate-900 dark:text-white">
          Simplify Your Business <br />
          <span className="text-brand italic">with Notaloka.</span>
        </h1>

        <p className="text-lg text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">
          The most advanced intelligence system for modern retail. Integrated
          inventory, real-time analytics, and seamless checkout experience.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8">
          <Link
            href="/dashboard"
            className="px-8 py-4 bg-brand hover:bg-brand/90 text-white rounded-2xl font-bold flex items-center gap-2 group transition-all hover:scale-105 shadow-xl shadow-brand/20"
          >
            Go to Dashboard
            <ArrowRight className="size-5 group-hover:translate-x-1 transition-transform" />
          </Link>
          <button className="px-8 py-4 text-slate-600 dark:text-slate-300 hover:text-brand transition-colors font-bold">
            Documentation
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-20">
          <FeatureCard
            icon={LayoutDashboard}
            title="Real-time Analytics"
            description="Track every sale and inventory movement with millisecond precision."
          />
          <FeatureCard
            icon={Package}
            title="Inventory Ledger"
            description="Smart stock forecasting and automated replenishment alerts."
          />
          <FeatureCard
            icon={CreditCard}
            title="Secure Checkout"
            description="Enterprise-grade payment processing with multi-terminal support."
          />
        </div>
      </div>
    </div>
  );
}

function FeatureCard({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
}) {
  return (
    <div className="p-6 rounded-3xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-left hover:border-brand/30 transition-all duration-300 group hover:-translate-y-1">
      <div className="size-12 rounded-2xl bg-slate-100 dark:bg-white/10 flex items-center justify-center text-slate-900 dark:text-white mb-4 group-hover:bg-brand group-hover:text-white transition-colors">
        <Icon className="size-6" />
      </div>
      <h3 className="font-bold text-lg mb-2 text-slate-900 dark:text-white">
        {title}
      </h3>
      <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
        {description}
      </p>
    </div>
  );
}
