"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, CircleOff, Cloud, Cpu, ShieldCheck } from "lucide-react";
import type { ContentProviderId } from "@/types/content";

const STORAGE_KEY = "posts-engine.content-provider";

interface Config {
  openaiConfigured: boolean;
  model: string;
  localAI: { enabled: boolean; connected: boolean; baseURL: string; model: string };
}

const options: Array<{ id: ContentProviderId; title: string; description: string; icon: typeof ShieldCheck }> = [
  { id: "rules", title: "Sem IA", description: "Processamento local, gratuito e sempre disponível.", icon: ShieldCheck },
  { id: "local", title: "IA local", description: "Usa um servidor OpenAI-compatible no seu computador.", icon: Cpu },
  { id: "openai", title: "OpenAI", description: "Envia a copy ao serviço externo configurado.", icon: Cloud },
];

export function IntelligenceSettings() {
  const [selected, setSelected] = useState<ContentProviderId>("rules");
  const [config, setConfig] = useState<Config | null>(null);

  useEffect(() => {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    Promise.resolve(saved).then((value) => {
      if (value === "rules" || value === "local" || value === "openai") setSelected(value);
    });
    fetch("/api/config").then((response) => response.json()).then(setConfig).catch(() => setConfig(null));
  }, []);

  function choose(id: ContentProviderId) {
    setSelected(id);
    window.localStorage.setItem(STORAGE_KEY, id);
  }

  function status(id: ContentProviderId) {
    if (id === "rules") return { ok: true, text: "Sempre disponível" };
    if (id === "local") return { ok: Boolean(config?.localAI.enabled && config.localAI.connected && config.localAI.model), text: config?.localAI.connected ? (config.localAI.model ? "Conectada" : "Modelo não informado") : "Indisponível" };
    return { ok: Boolean(config?.openaiConfigured), text: config?.openaiConfigured ? "Configurada" : "Não configurada" };
  }

  return <div className="grid gap-4 lg:grid-cols-3">
    {options.map((option) => {
      const state = status(option.id);
      const Icon = option.icon;
      return <button type="button" key={option.id} onClick={() => choose(option.id)} className={`rounded-2xl border p-5 text-left ${selected === option.id ? "border-[#d7c7a7]/60 bg-[#d7c7a7]/10" : "border-white/10 bg-white/[.035] hover:border-white/20"}`}>
        <div className="flex items-start justify-between gap-4"><Icon size={22} className="text-[#d7c7a7]"/><span className={`flex items-center gap-1.5 text-xs ${state.ok ? "text-emerald-300" : "text-white/40"}`}>{state.ok ? <CheckCircle2 size={13}/> : <CircleOff size={13}/>} {state.text}</span></div>
        <h2 className="mt-6 text-lg font-semibold">{option.title}</h2><p className="mt-2 text-sm leading-6 text-white/45">{option.description}</p>
        {option.id === "local" && config && <dl className="mt-5 space-y-2 border-t border-white/10 pt-4 text-xs"><div><dt className="text-white/35">Servidor</dt><dd className="mt-1 break-all text-white/65">{config.localAI.baseURL}</dd></div><div><dt className="text-white/35">Modelo</dt><dd className="mt-1 text-white/65">{config.localAI.model || "Não informado"}</dd></div></dl>}
        {option.id === "openai" && config && <p className="mt-5 border-t border-white/10 pt-4 text-xs text-white/45">Modelo: {config.model}</p>}
      </button>;
    })}
    <p className="lg:col-span-3 text-sm leading-6 text-white/45">A preferência fica salva somente neste navegador. Para IA local ou OpenAI, configure as variáveis opcionais em <code>.env.local</code>. Se o provider escolhido falhar, a aplicação mantém a copy e permite continuar sem IA.</p>
  </div>;
}
