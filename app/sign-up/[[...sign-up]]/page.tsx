import { SignUp } from "@clerk/nextjs";
import { Package } from "lucide-react";

export default function SignUpPage() {
  return (
    <div className="flex h-screen items-center justify-center bg-[#020617] px-4 overflow-hidden relative font-sans">
      {/* Dynamic Background Blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/20 rounded-full blur-[120px] animate-blob"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-cyan-600/20 rounded-full blur-[120px] animate-blob animation-delay-2000"></div>
      <div className="absolute top-[20%] right-[10%] w-[30%] h-[30%] bg-indigo-600/10 rounded-full blur-[100px] animate-blob animation-delay-4000"></div>
      
      {/* Subtle grid pattern */}
      <div className="absolute inset-0 z-0 opacity-[0.05] pointer-events-none">
        <svg width="100%" height="100%" fill="none" xmlns="http://www.w3.org/2000/svg">
          <pattern id="grid-pattern-signup" width="60" height="60" patternUnits="userSpaceOnUse">
            <path d="M 60 0 L 0 0 0 60" fill="none" stroke="white" strokeWidth="0.5" />
          </pattern>
          <rect width="100%" height="100%" fill="url(#grid-pattern-signup)" />
        </svg>
      </div>

      <div className="w-full max-w-md relative z-10 scale-[0.80] sm:scale-90 lg:scale-100">
        <div className="flex flex-col items-center mb-4">
          <div className="p-4 bg-white/5 backdrop-blur-3xl rounded-3xl border border-white/10 mb-6 group transition-all duration-500 hover:scale-110 hover:shadow-2xl hover:shadow-blue-500/20">
            <Package className="w-12 h-12 text-[#00BFFF] drop-shadow-[0_0_15px_rgba(0,191,255,0.4)]" />
          </div>
          <h1 className="text-4xl font-black text-white tracking-tight mb-2">Join Inven Track</h1>
          <p className="text-xs font-bold text-blue-400/80 uppercase tracking-[0.4em]">Enterprise Enrollment</p>
        </div>

        <div className="glass-darker border border-white/20 shadow-2xl shadow-blue-500/5 rounded-[2.5rem] overflow-hidden transition-all duration-700 hover:border-white/30 w-full">
          <SignUp 
            appearance={{
              elements: {
                rootBox: "w-full",
                card: "w-full shadow-none bg-transparent p-6 sm:p-10 border-none",
                main: "p-0",
                header: "p-0 mb-8",
                headerTitle: "text-3xl font-black text-white tracking-tight mb-3 text-center",
                headerSubtitle: "text-sm font-medium text-gray-400 text-center",
                formButtonPrimary: "bg-gradient-to-r from-[#00BFFF] to-[#0080FF] hover:from-[#009FD4] hover:to-[#0066CC] text-sm font-bold uppercase tracking-widest h-14 rounded-2xl shadow-2xl shadow-blue-500/30 transition-all active:scale-[0.98] border-none",
                socialButtonsBlockButton: "bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20 transition-all h-14 rounded-2xl font-semibold text-white shadow-sm mb-4",
                socialButtonsBlockButtonText: "text-white font-medium",
                socialButtonsBlockButtonArrow: "text-white/40",
                footer: "bg-transparent p-0 mt-8",
                footerAction: "bg-transparent",
                footerActionLink: "text-[#00BFFF] hover:text-[#00BFFF]/80 font-bold transition-all underline decoration-2 underline-offset-4",
                footerActionText: "text-gray-400 font-medium",
                formFieldLabel: "text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2.5 ml-1",
                formFieldInput: "bg-white/5 border-white/10 focus:bg-white/10 focus:border-[#00BFFF] focus:ring-[#00BFFF]/20 h-14 rounded-2xl text-white text-base font-medium px-5 transition-all outline-none",
                dividerLine: "bg-white/10 h-[1px]",
                dividerText: "text-[11px] font-bold text-gray-500 uppercase tracking-[0.2em] bg-transparent",
                identityPreviewText: "font-semibold text-white",
                identityPreviewEditButtonIcon: "text-[#00BFFF]",
                formFieldAction: "text-[11px] font-bold text-[#00BFFF] hover:text-[#00BFFF]/80 uppercase tracking-wider",
                scrollBox: "bg-transparent shadow-none border-none p-0",
                form: "p-0",
                formHeaderTitle: "hidden",
                formHeaderSubtitle: "hidden",
                alert: "bg-red-500/10 border-red-500/20 text-red-400 rounded-2xl",
              },
              layout: {
                shimmer: true,
                logoPlacement: "none"
              }
            }}
          />
        </div>
        
        <div className="mt-6 text-center flex flex-col items-center gap-2">
          <div className="flex items-center gap-4 opacity-20">
            <span className="h-[1px] w-12 bg-gradient-to-r from-transparent to-white"></span>
            <p className="text-[10px] font-bold text-white uppercase tracking-[0.5em]">Deployment Node Alpha</p>
            <span className="h-[1px] w-12 bg-gradient-to-l from-transparent to-white"></span>
          </div>
          <p className="text-[10px] font-medium text-gray-600 max-w-[200px] leading-relaxed">
            Authorized personnel only. All access attempts are logged and monitored.
          </p>
        </div>
      </div>
    </div>
  );
}

function GlassFeatureCard({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) {
  return (
    <div className="glass-dark p-6 rounded-3xl group cursor-default hover:bg-white/15 transition-all duration-500 border border-white/5">
      <div className="flex gap-5 items-start">
        <div className="bg-white/10 p-2.5 rounded-xl text-white group-hover:scale-110 group-hover:rotate-6 transition-transform duration-500">
          {icon}
        </div>
        <div className="space-y-1">
          <h3 className="font-extrabold text-xl tracking-tight leading-none mb-1.5">{title}</h3>
          <p className="text-sm text-blue-100/60 leading-relaxed font-medium">{desc}</p>
        </div>
      </div>
    </div>
  );
}

