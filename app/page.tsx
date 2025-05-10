import { ImageEditor } from '@/components/image-editor';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1 container mx-auto px-4 py-6 md:py-10 max-w-7xl">
        <div className="flex flex-col items-center">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-2 text-center">
            ImageCraft
          </h1>
          <p className="text-muted-foreground text-center mb-8 max-w-2xl">
            Ändra storlek och beskär dina bilder för sociala medier och webben – inget konto krävs
          </p>
          <ImageEditor />
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}