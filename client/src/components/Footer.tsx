export function Footer() {
  return (
    <footer className="py-4 bg-secondary text-foreground mt-auto w-full">
      <div className="container mx-auto text-center">
        <p className="text-sm">© {new Date().getFullYear()} Sparkgen - AI-Powered Learning Platform</p>
      </div>
    </footer>
  );
}