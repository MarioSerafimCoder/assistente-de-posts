import Link from "next/link";
import { BrainCircuit, History, Palette, Plus } from "lucide-react";

export function AppHeader() {
  return <header className="h-16 shrink-0 border-b border-white/10 bg-[#111311] px-6 flex items-center justify-between">
    <Link href="/create" className="flex items-center gap-3 text-white">
      <span className="h-8 w-8 rounded-lg bg-[#d7c7a7] text-[#171a18] grid place-items-center font-black">A</span>
      <span><b className="block text-sm tracking-tight">Assistente de Posts</b><span className="block text-[10px] uppercase tracking-[.2em] text-white/45">multimarca · local</span></span>
    </Link>
    <nav aria-label="Navegação principal" className="flex items-center gap-1 text-sm">
      <Link className="app-nav-link" href="/create"><Plus size={15}/>Criar</Link>
      <Link className="app-nav-link" href="/history"><History size={15}/>Histórico</Link>
      <Link className="app-nav-link" href="/settings/brands"><Palette size={15}/>Marcas</Link>
      <Link className="app-nav-link" href="/settings/intelligence"><BrainCircuit size={15}/>Inteligência</Link>
    </nav>
  </header>;
}
