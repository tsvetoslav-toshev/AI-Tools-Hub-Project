import Link from "next/link";

export default function Home() {
  return (
    <div 
      className="min-h-screen flex items-center justify-center"
      style={{
        background: 'linear-gradient(to top left, #3A3A3A, #1A1A1A)'
      }}
    >
      <main className="max-w-2xl mx-auto px-8 py-24 text-center">
        {/* Typography Hero */}
        <h1 className="text-6xl font-light tracking-tight text-[#1A1A1A] dark:text-white mb-8 leading-tight">
          AI Tools Hub
        </h1>
        
        <p className="text-lg text-[#A3A3A3] mb-16 tracking-wide font-light leading-relaxed">
          Share the tools that shape our future.
        </p>

        {/* Minimal Call to Action */}
        <div className="space-y-6">
          <Link
            href="/login"
            className="inline-block px-12 py-4 border border-[#1A1A1A] dark:border-white text-[#1A1A1A] dark:text-white hover:bg-[#F4F4F4] dark:hover:bg-[#2A2A2A] transition-all duration-300 text-sm tracking-widest uppercase font-light"
          >
            Enter Platform
          </Link>
        </div>
      </main>
    </div>
  );
}
