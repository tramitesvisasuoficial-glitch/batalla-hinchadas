import Link from "next/link";

export default function Footer() {
  return (
    <footer className="global-footer">
      <div className="footer-container">
        <div className="footer-brand">
          <h2>BATALLAS</h2>
          <p>Participa. Elige tu lado. Vive la batalla.</p>
        </div>
        <div className="footer-links">
          <Link href="/">Inicio</Link>
          <Link href="/#batallas">Batallas</Link>
          <Link href="/actividad">Actividad</Link>
          <Link href="/#como-funciona">Cómo funciona</Link>
          <Link href="/reglas-y-politicas">Reglas y políticas</Link>
          <Link href="/privacy">Privacidad</Link>
          <Link href="/terms">Términos y condiciones</Link>
          <Link href="/contact">Contacto</Link>
        </div>
        <div className="footer-copyright">
          <p>© {new Date().getFullYear()} Batalla de Hinchadas. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  );
}
