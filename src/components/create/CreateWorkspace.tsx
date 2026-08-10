"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Check, LoaderCircle, PanelsTopLeft } from "lucide-react";
import type { BrandDefinition } from "@/types/brand";
import type { ContentProviderId, RequestedFormat } from "@/types/content";
import type { Generation } from "@/types/generation";

const SIMPLE_COPY = "O extraordinário nasce da matéria.\n\nSuperfícies criadas para projetos que buscam personalidade, sofisticação e permanência.";
const CAROUSEL_COPY = "Projetos autorais começam pela escolha dos materiais.\n\nA textura influencia a percepção do ambiente.\n\nA cor interfere na sensação de amplitude.\n\nO acabamento muda a relação entre luz e superfície.\n\nConheça possibilidades para seu próximo projeto.";
const PROVIDER_STORAGE_KEY = "posts-engine.content-provider";

interface AppConfig {
  openaiConfigured: boolean;
  localAI: { connected: boolean; model: string };
}

export function CreateWorkspace() {
  const router = useRouter();
  const [brands, setBrands] = useState<BrandDefinition[]>([]);
  const [recent, setRecent] = useState<Generation[]>([]);
  const [brandId, setBrandId] = useState("granistone");
  const [copy, setCopy] = useState("");
  const [format, setFormat] = useState<RequestedFormat>("auto");
  const [outputs, setOutputs] = useState<("feed" | "story")[]>(["feed", "story"]);
  const [preserveCopy, setPreserveCopy] = useState(true);
  const [maxSlides, setMaxSlides] = useState(8);
  const [provider, setProvider] = useState<ContentProviderId>("rules");
  const [config, setConfig] = useState<AppConfig | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fallbackAvailable, setFallbackAvailable] = useState(false);

  useEffect(() => {
    const saved = window.localStorage.getItem(PROVIDER_STORAGE_KEY);
    Promise.resolve(saved).then((value) => {
      if (value === "rules" || value === "local" || value === "openai") setProvider(value);
    });
    Promise.all([
      fetch("/api/brands").then((response) => response.json()),
      fetch("/api/generations").then((response) => response.json()),
      fetch("/api/config").then((response) => response.json()),
    ]).then(([brandData, generationData, configData]) => {
      setBrands(brandData.brands ?? []);
      setRecent((generationData.generations ?? []).slice(0, 5));
      setConfig(configData);
    }).catch(() => setError("Não foi possível carregar a configuração local."));
  }, []);

  const canGenerate = copy.trim().length > 0 && outputs.length > 0 && !loading;
  const selectedBrand = useMemo(() => brands.find((brand) => brand.id === brandId), [brands, brandId]);
  const providerStatus = provider === "rules" ? "Processamento local"
    : provider === "local" ? (config?.localAI.connected && config.localAI.model ? "IA local" : "IA local indisponível")
    : config?.openaiConfigured ? "OpenAI" : "OpenAI não configurada";
  const providerReady = provider === "rules"
    || (provider === "local" && Boolean(config?.localAI.connected && config.localAI.model))
    || (provider === "openai" && Boolean(config?.openaiConfigured));

  function toggleOutput(output: "feed" | "story") {
    setOutputs((current) => current.includes(output) ? current.filter((item) => item !== output) : [...current, output]);
  }

  async function generate(providerOverride?: ContentProviderId) {
    if (!canGenerate) return;
    const requestedProvider = providerOverride ?? provider;
    setLoading(true); setError(""); setFallbackAvailable(false);
    try {
      const structuredResponse = await fetch("/api/content/structure", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ brandId, copy, requestedFormat: format, outputs, maxSlides, preserveCopy, provider: requestedProvider }),
      });
      const structured = await structuredResponse.json();
      if (!structuredResponse.ok) {
        setFallbackAvailable(Boolean(structured.fallbackAvailable));
        throw new Error([structured.error, structured.fallbackMessage].filter(Boolean).join(" ") || "Não foi possível interpretar a copy.");
      }
      const generationResponse = await fetch("/api/generations", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ brandId, outputs, post: structured.post, providerUsed: structured.providerUsed }),
      });
      const generation = await generationResponse.json();
      if (!generationResponse.ok) throw new Error(generation.error || "Não foi possível criar a arte.");
      router.push(`/generation/${generation.id}`);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Ocorreu um erro inesperado.");
      setLoading(false);
    }
  }

  return <div className="min-h-0 flex-1 overflow-y-auto bg-[#151815] text-white">
    <main className="mx-auto grid max-w-[1440px] grid-cols-1 gap-10 px-6 py-10 lg:grid-cols-[minmax(0,1fr)_360px] lg:px-10">
      <section>
        <div className="mb-8 flex items-end justify-between gap-6"><div><p className="app-kicker">Nova criação</p><h1 className="mt-2 max-w-2xl text-4xl font-semibold tracking-[-.04em] md:text-5xl">Da copy à arte, sem rediagramar.</h1></div>{config && <span className={`hidden rounded-full border px-3 py-1.5 text-xs md:block ${providerReady ? "border-emerald-400/25 bg-emerald-400/10 text-emerald-300" : "border-amber-400/25 bg-amber-400/10 text-amber-200"}`}>{providerStatus}</span>}</div>
        <div className="app-panel space-y-7">
          <label className="block"><span className="app-label">Marca</span><select className="app-field mt-2" value={brandId} onChange={(event) => setBrandId(event.target.value)}>{brands.map((brand) => <option key={brand.id} value={brand.id}>{brand.name}{brand.logos.primary.placeholder ? " · demonstrativa" : ""}</option>)}</select>{selectedBrand && <span className="mt-2 block text-xs text-white/40">{selectedBrand.description}</span>}</label>
          <label className="block"><span className="app-label">Copy</span><textarea className="app-field mt-2 min-h-64 resize-y text-base leading-7" value={copy} onChange={(event) => setCopy(event.target.value)} placeholder="Cole aqui o texto que deseja transformar em post..."/><span className="mt-2 flex flex-wrap items-center justify-between gap-2 text-xs text-white/35"><span>{copy.length.toLocaleString("pt-BR")} caracteres</span><span className="flex gap-3"><button className="text-[#d7c7a7] hover:underline" onClick={() => setCopy(SIMPLE_COPY)} type="button">Exemplo simples</button><button className="text-[#d7c7a7] hover:underline" onClick={() => setCopy(CAROUSEL_COPY)} type="button">Exemplo carrossel</button></span></span></label>
          <div className="grid gap-6 md:grid-cols-2"><fieldset><legend className="app-label">Formato</legend><div className="app-segment mt-2">{(["auto", "single", "carousel"] as const).map((value) => <button type="button" key={value} onClick={() => setFormat(value)} className={format === value ? "active" : ""}>{value === "auto" ? "Automático" : value === "single" ? "Post único" : "Carrossel"}</button>)}</div></fieldset><fieldset><legend className="app-label">Saídas</legend><div className="mt-2 flex gap-2">{(["feed", "story"] as const).map((output) => <button type="button" key={output} onClick={() => toggleOutput(output)} className={`app-check ${outputs.includes(output) ? "active" : ""}`}><span>{outputs.includes(output) && <Check size={13}/>}</span>{output === "feed" ? "Feed 4:5" : "Stories 9:16"}</button>)}</div></fieldset></div>
          <div className="flex flex-wrap items-center justify-between gap-5 border-t border-white/10 pt-6"><label className="flex cursor-pointer items-center gap-3 text-sm"><input type="checkbox" className="sr-only" checked={preserveCopy} onChange={(event) => setPreserveCopy(event.target.checked)}/><span className={`app-switch ${preserveCopy ? "on" : ""}`}><span/></span><span><b className="block font-medium">Preservar minha copy</b><small className="text-white/40">{preserveCopy ? "Somente hierarquia e organização" : provider === "rules" ? "O motor local não reescreve o texto" : "O provider de IA pode otimizar a concisão"}</small></span></label>{format !== "single" && <label className="text-xs text-white/55">Máximo de slides <select className="ml-2 rounded-md border border-white/10 bg-white/5 px-2 py-1.5 text-white" value={maxSlides} onChange={(event) => setMaxSlides(Number(event.target.value))}>{[4,5,6,7,8,9,10].map((value) => <option key={value}>{value}</option>)}</select></label>}</div>
          <p className="text-xs text-white/40">Motor: <b className="font-medium text-white/65">{providerStatus}</b> · <a className="text-[#d7c7a7] hover:underline" href="/settings/intelligence">alterar</a></p>
          {error && <div role="alert" className="rounded-lg border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm text-red-200">{error}</div>}
          {fallbackAvailable && <button className="editor-action w-full" type="button" disabled={loading} onClick={() => void generate("rules")}>Continuar sem IA</button>}
          <button className="app-primary-button w-full" type="button" disabled={!canGenerate} onClick={() => void generate()}>{loading ? <><LoaderCircle className="animate-spin" size={18}/>Organizando e aplicando templates...</> : <><PanelsTopLeft size={18}/>Gerar Feed e Stories<ArrowRight size={18}/></>}</button>
        </div>
      </section>
      <aside className="lg:pt-28"><div className="mb-4 flex items-center justify-between"><h2 className="text-sm font-semibold">Recentes</h2><a className="text-xs text-[#d7c7a7]" href="/history">Ver histórico</a></div><div className="space-y-2">{recent.length ? recent.map((item) => <button key={item.id} onClick={() => router.push(`/generation/${item.id}`)} className="group w-full rounded-xl border border-white/10 bg-white/[.035] p-4 text-left hover:border-[#d7c7a7]/35 hover:bg-white/[.06]"><span className="line-clamp-2 text-sm font-medium">{item.name}</span><span className="mt-3 flex items-center justify-between text-[11px] text-white/35"><span>{item.slides.length} {item.slides.length === 1 ? "slide" : "slides"}</span><span>{new Date(item.updatedAt).toLocaleDateString("pt-BR")}</span></span></button>) : <div className="rounded-xl border border-dashed border-white/10 p-6 text-center text-sm text-white/35">Suas criações aparecerão aqui.</div>}</div></aside>
    </main>
  </div>;
}
