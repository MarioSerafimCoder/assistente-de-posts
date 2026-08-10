import { AppHeader } from "@/components/layout/AppHeader";
import { IntelligenceSettings } from "@/components/settings/IntelligenceSettings";

export default function IntelligencePage() {
  return <div className="flex h-full flex-col bg-[#151815] text-white"><AppHeader/><main className="mx-auto w-full max-w-6xl flex-1 overflow-y-auto px-6 py-10"><p className="app-kicker">Configurações</p><h1 className="mt-2 text-4xl font-semibold tracking-[-.04em]">Inteligência</h1><p className="mb-8 mt-3 max-w-2xl text-sm leading-6 text-white/45">Escolha o motor de conteúdo. O modo padrão não usa IA, não tem custo e não envia sua copy para serviços externos.</p><IntelligenceSettings/></main></div>;
}
