"use client";

import { ImageEditor } from "@/components/image-editor";
import { Image as ImageIcon } from "lucide-react";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex flex-col items-center justify-center py-8">
        <div className="flex items-center gap-2">
          <ImageIcon className="w-9 h-9 text-primary" />
          <span className="text-4xl font-bold tracking-tight">Bildfix</span>
        </div>
        <p className="text-muted-foreground text-center mt-2 max-w-2xl">
          Ändra storlek och beskär dina bilder för Falnet och webben
        </p>
      </header>
      <main className="container mx-auto px-4 py-4">
        <ImageEditor />
      </main>
    </div>
  );
}
