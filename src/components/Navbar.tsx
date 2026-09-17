"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const showBackButton = pathname && pathname !== "/";

  const handleLinkClick = () => {
    setIsOpen(false);
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* LOGO AND BACK */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          {showBackButton && (
            <Link href="/" onClick={handleLinkClick} style={{ color: "#fff", textDecoration: "none", fontSize: "1.2rem", fontWeight: "bold" }}>
              ←
            </Link>
          )}
          <Link href="/" className="navbar-logo" onClick={handleLinkClick}>
            BATALLAS
          </Link>
        </div>

        {/* MOBILE TOGGLE */}
        <button 
          className="navbar-toggle" 
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle menu"
        >
          {isOpen ? "✕" : "☰"}
        </button>

        {/* LINKS */}
        <div className={`navbar-links ${isOpen ? "open" : ""}`}>
          <>
              <Link href="/" className="navbar-link" onClick={handleLinkClick}>Inicio</Link>
              <Link href="/#batallas" className="navbar-link" onClick={handleLinkClick}>Batallas</Link>
              <Link href="/actividad" className="navbar-link" onClick={handleLinkClick}>Actividad</Link>
              <Link href="/#como-funciona" className="navbar-link" onClick={handleLinkClick}>Cómo funciona</Link>
              <Link href="/reglas-y-politicas" className="navbar-link" onClick={handleLinkClick}>Reglas y políticas</Link>
              <Link href="/contact" className="navbar-link" onClick={handleLinkClick}>Contacto</Link>
          </>
        </div>
      </div>
    </nav>
  );
}
