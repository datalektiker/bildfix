export function SiteFooter() {
  return (
    <footer className="border-t py-6 md:py-0">
      <div className="container flex flex-col md:flex-row items-center justify-between gap-4 md:h-16">
        <p className="text-sm text-muted-foreground">
          © {new Date().getFullYear()} ImageCraft. Alla rättigheter förbehållna.
        </p>
        <p className="text-xs text-muted-foreground">
          Byggd med Next.js, React och Tailwind CSS
        </p>
      </div>
    </footer>
  );
}