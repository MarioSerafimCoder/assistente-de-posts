import { AppHeader } from "@/components/layout/AppHeader";
import { HistoryList } from "@/components/history/HistoryList";
import { listGenerations } from "@/lib/generations";

export const dynamic = "force-dynamic";
export default async function HistoryPage() {
  const generations = await listGenerations();
  return <div className="flex h-full flex-col bg-[#151815] text-white"><AppHeader/><main className="mx-auto w-full max-w-5xl flex-1 overflow-y-auto px-6 py-10"><p className="app-kicker">Biblioteca local</p><h1 className="mt-2 mb-8 text-4xl font-semibold tracking-[-.04em]">Histórico</h1><HistoryList initial={generations}/></main></div>;
}
