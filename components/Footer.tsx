import { Logo } from "./Logo";
import { Container } from "./ui";

export function Footer() {
  return (
    <footer className="py-12">
      <Container className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <Logo size={24} />
        <p className="font-mono text-xs text-slate">
          GIX · Membresías por consumo para comercios · {"©"} 2026
        </p>
        <a
          href="#waitlist"
          className="font-mono text-xs text-ink underline underline-offset-4"
        >
          Probar 30 días
        </a>
      </Container>
    </footer>
  );
}
