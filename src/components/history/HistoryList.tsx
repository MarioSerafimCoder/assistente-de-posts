"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Layers, Trash2 } from "lucide-react";
import type { Generation } from "@/types/generation";

function providerLabel(item: Generation): string {
  if (item.providerUsed === "openai") return "OpenAI";
  if (item.providerUsed === "local") return "IA local";
  return "processado localmente";
}

export function HistoryList({ initial }: { initial: Generation[] }) {
  const [items, setItems] = useState(initial);
  if (!items.length) return <div className="rounded-2xl border border-dashed border-white/10 px-6 py-20 text-center text-white/40"><Layers className="mx-auto mb-4"/><p>Nenhuma criação ainda.</p><Link href="/create" className="mt-4 inline-block text-[#d7c7a7]">Criar o primeiro post</Link></div>;
  return <div className="divide-y divide-white/10 overflow-hidden rounded-2xl border border-white/10 bg-white/[.03]">{items.map((item) => <div key={item.id} className="flex items-center gap-5 p-5 hover:bg-white/[.025]"><div className="grid h-14 w-12 shrink-0 place-items-center rounded-lg border border-white/10 bg-[#27342f] text-xs font-bold">{item.slides.length}</div><div className="min-w-0 flex-1"><h2 className="truncate text-sm font-semibold">{item.name}</h2><p className="mt-1 text-xs text-white/40">{item.brandId} · {item.outputs.join(" + ")} · {providerLabel(item)} · atualizado em {new Date(item.updatedAt).toLocaleString("pt-BR")}</p></div><button className="editor-icon text-red-300/70" title="Excluir" onClick={async () => { if (!confirm("Excluir esta criação?")) return; const response = await fetch(`/api/generations/${item.id}`, { method: "DELETE" }); if (response.ok) setItems((current) => current.filter((entry) => entry.id !== item.id)); }}><Trash2 size={15}/></button><Link className="editor-action" href={`/generation/${item.id}`}>Abrir<ArrowRight size={14}/></Link></div>)}</div>;
}
