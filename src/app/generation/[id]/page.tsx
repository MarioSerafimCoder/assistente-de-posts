import { AppHeader } from "@/components/layout/AppHeader";
import { GenerationEditor } from "@/components/generation/GenerationEditor";

export default function GenerationPage({ params }: { params: Promise<{ id: string }> }) {
  return <div className="flex h-full flex-col"><AppHeader/><GenerationEditor params={params}/></div>;
}
