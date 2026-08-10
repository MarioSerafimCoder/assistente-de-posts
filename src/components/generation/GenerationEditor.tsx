"use client";
/* eslint-disable @next/next/no-img-element -- previews may use local or user-selected external image URLs */

import { use, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Copy, Download, ImagePlus, LoaderCircle, RefreshCw, Save, Trash2, Upload } from "lucide-react";
import { SlideRenderer } from "@/components/editor/SlideRenderer";
import { SlideFilmstrip } from "@/components/editor/SlideFilmstrip";
import { renderGenerationSlide } from "@/lib/visual-engine";
import type { BrandDefinition, LogoVariant } from "@/types/brand";
import type { Generation, GenerationSlide } from "@/types/generation";
import type { ResolvedImage } from "@/types/image";
import type { TemplateDefinition, TemplateVariantName, SocialOutput } from "@/types/template";
import type { Slide } from "@/types/carousel";

interface BrandPayload { brand: BrandDefinition; templates: TemplateDefinition[] }

export function GenerationEditor({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [generation, setGeneration] = useState<Generation | null>(null);
  const [brandPayload, setBrandPayload] = useState<BrandPayload | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [output, setOutput] = useState<SocialOutput>("feed");
  const [status, setStatus] = useState("Carregando criação...");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [imageQuery, setImageQuery] = useState("");
  const [images, setImages] = useState<ResolvedImage[]>([]);
  const [imageAiConfigured, setImageAiConfigured] = useState(false);

  useEffect(() => {
    fetch(`/api/generations/${id}`).then(async (response) => {
      if (!response.ok) throw new Error("Criação não encontrada.");
      const loaded: Generation = await response.json();
      setGeneration(loaded); setOutput(loaded.outputs[0] ?? "feed");
      const payload = await fetch(`/api/brands/${loaded.brandId}`).then((item) => item.json());
      setBrandPayload(payload); setStatus("");
    }).catch((cause) => { setError(cause instanceof Error ? cause.message : "Falha ao carregar."); setStatus(""); });
  }, [id]);

  useEffect(() => {
    fetch("/api/config").then((response) => response.json()).then((data) => setImageAiConfigured(Boolean(data.imageAiConfigured))).catch(() => setImageAiConfigured(false));
  }, []);

  const previewSlides = useMemo<Slide[]>(() => {
    if (!generation || !brandPayload) return [];
    return generation.slides.map((slide) => ({ id: slide.id, order: slide.order, notes: "", previousVersions: [], html: renderGenerationSlide({ brand: brandPayload.brand, slide, output }) }));
  }, [generation, brandPayload, output]);
  const active = generation?.slides[activeIndex];
  const activeTemplate = brandPayload?.templates.find((template) => template.id === active?.templateId);
  const ratio = output === "feed" ? "4:5" : "9:16";

  async function persist(slides: GenerationSlide[], message = "Alterações salvas") {
    if (!generation) return;
    setStatus("Salvando...");
    const response = await fetch(`/api/generations/${generation.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ slides }) });
    if (response.ok) { const updated = await response.json(); setGeneration(updated); setStatus(message); window.setTimeout(() => setStatus(""), 1600); }
    else { setError("Não foi possível salvar as alterações."); setStatus(""); }
  }

  function changeActive(mutator: (slide: GenerationSlide) => GenerationSlide, save = false) {
    if (!generation) return;
    const slides = generation.slides.map((slide, index) => index === activeIndex ? mutator(slide) : slide);
    setGeneration({ ...generation, slides });
    if (save) void persist(slides);
  }

  async function uploadImage(file: File | undefined) {
    if (!file) return;
    setBusy(true); setError("");
    const form = new FormData(); form.append("file", file);
    const response = await fetch("/api/upload", { method: "POST", body: form });
    const result = await response.json(); setBusy(false);
    if (!response.ok) return setError(result.error || "A imagem não pôde ser carregada.");
    changeActive((slide) => ({ ...slide, imageUrl: result.url, variant: "image" }), true);
  }

  async function searchImages() {
    if (!generation) return;
    setBusy(true);
    const result = await fetch(`/api/images/search?brandId=${generation.brandId}&q=${encodeURIComponent(imageQuery)}`).then((response) => response.json());
    setImages(result.images ?? []); setBusy(false);
  }

  async function generateImage() {
    if (!generation || !active) return;
    setBusy(true); setError("");
    const response = await fetch("/api/images/generate", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ brandId: generation.brandId, subject: active.content.imageQuery || active.content.headline || generation.name, visualIntent: active.content.visualIntent }) });
    const result = await response.json(); setBusy(false);
    if (!response.ok) return setError(result.error || "Não foi possível gerar a imagem.");
    changeActive((slide) => ({ ...slide, imageUrl: result.url, variant: "image" }), true);
  }

  async function exportOutput(kind: "feed" | "story" | "all") {
    if (!generation) return;
    setBusy(true); setError("");
    const response = await fetch(`/api/export/${generation.id}?output=${kind}`, { method: "POST" });
    if (!response.ok) { const result = await response.json(); setBusy(false); return setError(result.error || "Falha ao exportar."); }
    const blob = await response.blob();
    const disposition = response.headers.get("content-disposition") || "";
    const filename = disposition.match(/filename="([^"]+)"/)?.[1] || `assistente-posts.${blob.type === "image/png" ? "png" : "zip"}`;
    const url = URL.createObjectURL(blob); const anchor = document.createElement("a"); anchor.href = url; anchor.download = filename; anchor.click(); URL.revokeObjectURL(url); setBusy(false);
  }

  async function restructure(requestedFormat: "auto" | "single" | "carousel") {
    if (!generation) return;
    setBusy(true); setError("");
    try {
      const response = await fetch("/api/content/structure", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ brandId: generation.brandId, copy: generation.originalCopy, requestedFormat, outputs: generation.outputs, maxSlides: 8, preserveCopy: true, provider: "rules" }) });
      const data = await response.json(); if (!response.ok) throw new Error(data.error);
      const createdResponse = await fetch("/api/generations", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ brandId: generation.brandId, outputs: generation.outputs, post: data.post, providerUsed: data.providerUsed }) });
      const created = await createdResponse.json(); if (!createdResponse.ok) throw new Error(created.error);
      router.push(`/generation/${created.id}`);
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Não foi possível reorganizar."); setBusy(false); }
  }

  if (status === "Carregando criação...") return <div className="grid flex-1 place-items-center bg-[#151815] text-white/60"><LoaderCircle className="animate-spin"/></div>;
  if (!generation || !brandPayload) return <div className="grid flex-1 place-items-center bg-[#151815] text-red-200">{error || "Criação não encontrada."}</div>;

  return <div className="min-h-0 flex-1 bg-[#151815] text-white lg:grid lg:grid-cols-[340px_minmax(0,1fr)]">
    <aside className="min-h-0 overflow-y-auto border-r border-white/10 bg-[#111311] p-5">
      <div className="mb-5 flex items-start justify-between gap-3"><div><p className="app-kicker">{brandPayload.brand.name}</p><h1 className="mt-1 line-clamp-2 text-lg font-semibold">{generation.name}</h1></div><button title="Duplicar slide" className="editor-icon" onClick={() => { if (!active) return; const duplicate = { ...active, id: crypto.randomUUID(), content: { ...active.content, id: crypto.randomUUID() } }; const slides = [...generation.slides.slice(0, activeIndex + 1), duplicate, ...generation.slides.slice(activeIndex + 1)]; setActiveIndex(activeIndex + 1); void persist(slides); }}><Copy size={15}/></button></div>
      {active && <div className="space-y-5">
        <section><p className="editor-section-title">Conteúdo · slide {activeIndex + 1}</p><label className="editor-label">Headline<textarea className="editor-field min-h-20" value={active.content.headline ?? ""} onChange={(event) => changeActive((slide) => ({ ...slide, content: { ...slide.content, headline: event.target.value } }))} onBlur={() => void persist(generation.slides)}/></label><label className="editor-label">Subheadline<input className="editor-field" value={active.content.subheadline ?? ""} onChange={(event) => changeActive((slide) => ({ ...slide, content: { ...slide.content, subheadline: event.target.value } }))} onBlur={() => void persist(generation.slides)}/></label><label className="editor-label">Texto<textarea className="editor-field min-h-28" value={active.content.body ?? ""} onChange={(event) => changeActive((slide) => ({ ...slide, content: { ...slide.content, body: event.target.value } }))} onBlur={() => void persist(generation.slides)}/></label><label className="editor-label">CTA<input className="editor-field" value={active.content.cta ?? ""} onChange={(event) => changeActive((slide) => ({ ...slide, content: { ...slide.content, cta: event.target.value } }))} onBlur={() => void persist(generation.slides)}/></label></section>
        <section><p className="editor-section-title">Template</p><label className="editor-label">Modelo<select className="editor-field" value={active.templateId} onChange={(event) => changeActive((slide) => ({ ...slide, templateId: event.target.value }), true)}>{[active.templateId, ...active.alternatives].filter((value, index, values) => values.indexOf(value) === index).map((id) => <option key={id} value={id}>{brandPayload.templates.find((template) => template.id === id)?.name ?? id}</option>)}</select></label><div className="grid grid-cols-2 gap-3"><label className="editor-label">Variante<select className="editor-field" value={active.variant} onChange={(event) => changeActive((slide) => ({ ...slide, variant: event.target.value as TemplateVariantName }), true)}>{activeTemplate?.variants[output].map((variant) => <option key={variant.id} value={variant.name} disabled={variant.requiresImage && !active.imageUrl}>{variant.name}{variant.requiresImage && !active.imageUrl ? " · requer imagem" : ""}</option>)}</select></label><label className="editor-label">Logo<select className="editor-field" value={active.logoVariant} onChange={(event) => changeActive((slide) => ({ ...slide, logoVariant: event.target.value as LogoVariant }), true)}><option value="auto">Automático</option><option value="primary">Principal</option><option value="white">Branca</option><option value="black">Preta</option></select></label></div></section>
        <section><p className="editor-section-title">Imagem</p><div className="flex gap-2"><label className="editor-action flex-1 cursor-pointer"><Upload size={14}/>{busy ? "Processando..." : "Upload"}<input className="sr-only" type="file" accept="image/png,image/jpeg,image/webp" onChange={(event) => void uploadImage(event.target.files?.[0])}/></label><button className="editor-action flex-1" title={imageAiConfigured ? "Gerar imagem com OpenAI" : "Configure OPENAI_API_KEY e OPENAI_IMAGE_MODEL para ativar"} disabled={busy || !imageAiConfigured} onClick={() => void generateImage()}><ImagePlus size={14}/>Gerar com IA</button></div><div className="mt-2 flex gap-2"><input className="editor-field" placeholder="Buscar biblioteca / Pexels" value={imageQuery} onChange={(event) => setImageQuery(event.target.value)}/><button className="editor-icon" onClick={() => void searchImages()}><RefreshCw size={14}/></button></div>{images.length > 0 && <div className="mt-3 grid max-h-40 grid-cols-3 gap-2 overflow-y-auto">{images.map((image) => <button key={image.id} title={image.title} onClick={() => changeActive((slide) => ({ ...slide, imageUrl: image.url, variant: "image" }), true)}><img className="aspect-square w-full rounded object-cover" src={image.thumbnailUrl ?? image.url} alt={image.title}/></button>)}</div>}{active.imageUrl && <><div className="mt-3 grid grid-cols-2 gap-3"><label className="editor-label">Posição X<input type="range" min="0" max="100" value={active.imagePosition.x} onChange={(event) => changeActive((slide) => ({ ...slide, imagePosition: { ...slide.imagePosition, x: Number(event.target.value) } }))} onMouseUp={() => void persist(generation.slides)}/></label><label className="editor-label">Posição Y<input type="range" min="0" max="100" value={active.imagePosition.y} onChange={(event) => changeActive((slide) => ({ ...slide, imagePosition: { ...slide.imagePosition, y: Number(event.target.value) } }))} onMouseUp={() => void persist(generation.slides)}/></label></div><button className="mt-2 text-xs text-red-300" onClick={() => changeActive((slide) => ({ ...slide, imageUrl: undefined, variant: "light" }), true)}>Remover imagem</button></>}</section>
        <section className="border-t border-white/10 pt-4"><p className="editor-section-title">Reprocessar conteúdo</p><div className="grid grid-cols-1 gap-2"><button className="editor-action" disabled={busy} onClick={() => void restructure("auto")}><RefreshCw size={14}/>Reorganizar conteúdo</button><div className="grid grid-cols-2 gap-2"><button className="editor-action" disabled={busy} onClick={() => void restructure("carousel")}>Virar carrossel</button><button className="editor-action" disabled={busy} onClick={() => void restructure("single")}>Virar post único</button></div></div></section>
      </div>}
    </aside>
    <main className="flex min-h-0 flex-col">
      <div className="flex min-h-16 flex-wrap items-center justify-between gap-3 border-b border-white/10 px-5 py-3"><div className="app-segment compact">{generation.outputs.map((item) => <button key={item} className={output === item ? "active" : ""} onClick={() => setOutput(item)}>{item === "feed" ? "Feed · 1080×1350" : "Stories · 1080×1920"}</button>)}</div><div className="flex flex-wrap items-center gap-2"><span className="mr-2 text-xs text-emerald-300/70">{status}</span>{generation.outputs.includes("feed") && <button className="editor-action" disabled={busy} onClick={() => void exportOutput("feed")}><Download size={14}/>Baixar Feed</button>}{generation.outputs.includes("story") && <button className="editor-action" disabled={busy} onClick={() => void exportOutput("story")}><Download size={14}/>Baixar Stories</button>}<button className="app-primary-button compact" disabled={busy} onClick={() => void exportOutput("all")}>{busy ? <LoaderCircle className="animate-spin" size={15}/> : <Save size={15}/>}Baixar tudo</button></div></div>
      {generation.structuredPost.contentOverflow && <div className="mx-5 mt-4 rounded-lg border border-amber-400/20 bg-amber-400/10 px-4 py-2 text-sm text-amber-100">{generation.structuredPost.overflowReason || "O conteúdo ultrapassa o limite recomendado do template. Revise o tamanho do texto antes de exportar."}</div>}
      {error && <div className="mx-5 mt-4 rounded-lg border border-red-400/20 bg-red-400/10 px-4 py-2 text-sm text-red-200">{error}</div>}
      <div className="min-h-96 flex-1 p-5 md:p-8"><SlideRenderer key={`${active?.id}-${output}`} html={previewSlides[activeIndex]?.html ?? ""} aspectRatio={ratio} className="h-full w-full"/></div>
      <SlideFilmstrip slides={previewSlides} aspectRatio={ratio} activeIndex={activeIndex} onActiveChange={setActiveIndex} onDeleteSlide={generation.slides.length > 1 ? (slideId) => { const slides = generation.slides.filter((slide) => slide.id !== slideId); setActiveIndex(Math.max(0, activeIndex - 1)); void persist(slides); } : undefined} onReorderSlides={(ids) => { const map = new Map(generation.slides.map((slide) => [slide.id, slide])); const slides = ids.map((slideId) => map.get(slideId)).filter((slide): slide is GenerationSlide => Boolean(slide)); void persist(slides); }}/>
      <div className="flex items-center justify-between border-t border-white/10 px-5 py-2 text-[11px] text-white/35"><span>Arraste as miniaturas para reordenar.</span><button className="flex items-center gap-1 text-red-300/70 hover:text-red-200" onClick={() => { if (confirm("Excluir esta criação?")) fetch(`/api/generations/${generation.id}`, { method: "DELETE" }).then(() => router.push("/history")); }}><Trash2 size={12}/>Excluir criação</button></div>
    </main>
  </div>;
}
