import { SignIn } from "@clerk/nextjs";
import { Package } from "lucide-react";

export default function SignInPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F8FAFC] px-4 py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background decoration matching your dashboard accent */}
      <div className="absolute top-0 left-0 w-full h-1 bg-[#00BFFF]"></div>
      
      {/* Subtle grid pattern from your UI style */}
      <div className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none">
        <svg width="100%" height="100%" fill="none" xmlns="http://www.w3.org/2000/svg">
          <pattern id="grid-pattern" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="1" />
          </pattern>
          <rect width="100%" height="100%" fill="url(#grid-pattern)" />
        </svg>
      </div>

      <div className="w-full max-w-md relative z-10">
        <div className="flex flex-col items-center mb-8">
          <div className="p-3 bg-white shadow-sm rounded-2xl border border-gray-100/50 mb-4 transition-transform hover:scale-105 duration-300">
            <Package className="w-10 h-10 text-[#00BFFF]" />
          </div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Inven-Track</h1>
          <p className="mt-2 text-sm font-medium text-gray-500 uppercase tracking-widest">Global Access Portal</p>
        </div>

        <div className="glass border border-white/40 shadow-2xl shadow-blue-500/5 rounded-3xl overflow-hidden transition-all duration-500">
          <div className="p-1">
            <SignIn 
              appearance={{
                elements: {
                  rootBox: "w-full",
                  card: "w-full shadow-none bg-transparent p-6 sm:p-8 border-none",
                  headerTitle: "text-2xl font-black text-gray-900 tracking-tight mb-2",
                  headerSubtitle: "text-sm font-medium text-gray-500 mb-6",
                  formButtonPrimary: "bg-[#00BFFF] hover:bg-[#009FD4] text-sm font-bold uppercase tracking-widest h-12 rounded-2xl shadow-xl shadow-blue-500/10 transition-all active:scale-[0.98]",
                  socialButtonsBlockButton: "border-gray-100 hover:bg-white/50 hover:border-gray-200 transition-all h-12 rounded-2xl font-semibold text-gray-700 shadow-sm",
                  footerActionLink: "text-[#00BFFF] hover:text-[#009FD4] font-bold transition-all",
                  formFieldLabel: "text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2 ml-1",
                  formFieldInput: "bg-white/50 border-gray-100 focus:bg-white focus:border-[#00BFFF] focus:ring-[#00BFFF]/5 h-12 rounded-xl text-base font-medium px-4 transition-all",
                  dividerLine: "bg-gray-100",
                  dividerText: "text-[10px] font-bold text-gray-300 uppercase tracking-[0.2em] bg-transparent backdrop-blur-md px-4",
                  identityPreviewText: "font-semibold text-gray-900",
                  identityPreviewEditButtonIcon: "text-[#00BFFF]",
                  footer: "mt-4",
                  formFieldAction: "text-[11px] font-bold text-[#00BFFF] hover:text-[#009FD4] uppercase tracking-wider"
                },
                layout: {
                  shimmer: true,
                  logoPlacement: "none"
                }
              }}
            />
          </div>
        </div>
        
        <div className="mt-8 text-center flex items-center justify-center gap-4 opacity-30">
          <span className="h-[1px] w-8 bg-gray-300"></span>
          <p className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.3em]">Corporate Logistics Protocol</p>
          <span className="h-[1px] w-8 bg-gray-300"></span>
        </div>
      </div>
    </div>
  );
}

