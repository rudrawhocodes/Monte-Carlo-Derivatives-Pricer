"use client";

export default function Header() {
  return (
    <header className="border-b border-zinc-800 bg-zinc-950 sticky top-0 z-50">
      <div className="max-w-[1920px] mx-auto px-4 h-10 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold tracking-widest text-zinc-300 uppercase">
            MC Pricer
          </span>
          <span className="text-[10px] text-zinc-600 hidden sm:inline">
            GBM / Variance Reduction / Indian Indices
          </span>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
            <span className="text-[10px] text-zinc-500 font-mono tracking-wider">
              ONLINE
            </span>
          </div>
          <span className="hidden sm:inline text-[10px] text-zinc-600 font-mono">
            NUMBA JIT
          </span>
        </div>
      </div>
    </header>
  );
}
