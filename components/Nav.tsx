import { Logo } from "./Logo";
import { Container } from "./ui";

export function Nav() {
  return (
    <header className="sticky top-0 z-50 border-b border-chrome bg-tile/85 backdrop-blur-sm">
      <Container className="flex h-16 items-center justify-between">
        <a href="#top" className="flex items-center" aria-label="GIX, inicio">
          <Logo size={28} />
        </a>
        <div className="flex items-center gap-5">
          <span className="readout font-mono hidden sm:inline">
            Membresías por consumo
          </span>
          <a
            href="#waitlist"
            className="btn-stamp inline-flex items-center rounded-[3px] px-4 py-2 text-sm"
          >
            Probar 30 días
          </a>
        </div>
      </Container>
    </header>
  );
}
