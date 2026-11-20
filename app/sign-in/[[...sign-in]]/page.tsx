import { SignIn } from "@clerk/nextjs";
import { Package, TrendingUp, Truck, BarChart3 } from "lucide-react";

export default function SignInPage() {
  return (
    <div className="min-h-screen bg-[#0c0f1a] flex">
      {/* Left branding panel — hidden on mobile */}
      <div className="hidden lg:flex flex-col justify-between w-[480px] flex-shrink-0 relative overflow-hidden bg-gradient-to-br from-[#0f1629] to-[#0c0f1a] border-r border-white/[0.06] p-12">
        {/* Subtle radial glow */}
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
          <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] bg-blue-600/10 rounded-full blur-[100px]" />
          <div className="absolute bottom-[10%] right-[-10%] w-[40%] h-[40%] bg-indigo-600/8 rounded-full blur-[80px]" />
        </div>

        {/* Logo */}
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-16">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/25">
              <Package className="w-5 h-5 text-white" />
            </div>
            <span className="text-white font-semibold text-lg tracking-tight">Inven Track</span>
          </div>

          <div className="space-y-3 mb-12">
            <h2 className="text-3xl font-bold text-white leading-tight tracking-tight">
              Inventory management<br />
              <span className="text-white/40">built for your team.</span>
            </h2>
            <p className="text-sm text-white/40 leading-relaxed max-w-xs">
              Track products, coordinate deliveries, and manage branches — all in one place.
            </p>
          </div>

          <div className="space-y-4">
            {[
              { icon: BarChart3, label: "Real-time stock visibility", desc: "Know exactly what's in stock across every branch" },
              { icon: Truck, label: "Delivery partner management", desc: "Assign orders and track them to the door" },
              { icon: TrendingUp, label: "Profit margin tracking", desc: "Buy price vs. sell price on every SKU" },
            ].map(({ icon: Icon, label, desc }) => (
              <div key={label} className="flex items-start gap-3.5">
                <div className="w-8 h-8 rounded-lg bg-white/[0.05] border border-white/[0.08] flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Icon className="w-4 h-4 text-blue-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-white/80">{label}</p>
                  <p className="text-xs text-white/30 mt-0.5 leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom */}
        <div className="relative z-10">
          <p className="text-xs text-white/20">© 2025 Inven Track. All rights reserved.</p>
        </div>
      </div>

      {/* Right: auth form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-[400px]">
          {/* Mobile logo */}
          <div className="flex items-center gap-2.5 mb-8 lg:hidden">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
              <Package className="w-4 h-4 text-white" />
            </div>
            <span className="text-white font-semibold">Inven Track</span>
          </div>

          <div className="mb-8">
            <h1 className="text-2xl font-bold text-white tracking-tight mb-1.5">Welcome back</h1>
            <p className="text-sm text-white/40">Sign in to your workspace to continue.</p>
          </div>

          <SignIn
            appearance={{
              variables: {
                colorPrimary: '#3b82f6',
                colorBackground: '#0c0f1a',
                colorText: '#ffffff',
                colorInputBackground: 'rgba(255,255,255,0.04)',
                colorInputText: '#ffffff',
                colorTextSecondary: 'rgba(255,255,255,0.4)',
              },
              elements: {
                rootBox: "w-full",
                card: "w-full shadow-none bg-transparent p-0 border-none",
                main: "p-0",
                header: "hidden",
                formButtonPrimary: "bg-blue-600 hover:bg-blue-500 text-sm font-semibold h-11 rounded-xl shadow-lg shadow-blue-600/20 transition-all active:scale-[0.99] border-none",
                socialButtonsBlockButton: "bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.08] hover:border-white/[0.14] transition-all h-11 rounded-xl font-medium text-white/80 text-sm",
                socialButtonsBlockButtonText: "text-white/80 font-medium text-sm",
                footer: "bg-transparent p-0 mt-6",
                footerAction: "bg-transparent",
                footerActionLink: "text-blue-400 hover:text-blue-300 font-semibold transition-colors",
                footerActionText: "text-white/35 text-sm",
                formFieldLabel: "text-xs font-semibold text-white/40 uppercase tracking-wider mb-1.5",
                formFieldInput: "bg-white/[0.04] border border-white/[0.08] focus:bg-white/[0.07] focus:border-blue-500/50 focus:ring-0 h-11 rounded-xl text-white text-sm px-4 transition-all outline-none placeholder-white/20",
                dividerLine: "bg-white/[0.08]",
                dividerText: "text-xs text-white/25 uppercase tracking-widest",
                identityPreviewText: "font-medium text-white/80",
                identityPreviewEditButtonIcon: "text-blue-400",
                formFieldAction: "text-xs font-semibold text-blue-400 hover:text-blue-300",
                alert: "bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-sm",
                formResendCodeLink: "text-blue-400 hover:text-blue-300",
              },
              layout: {
                shimmer: false,
                logoPlacement: "none",
              }
            }}
          />
        </div>
      </div>
    </div>
  );
}
