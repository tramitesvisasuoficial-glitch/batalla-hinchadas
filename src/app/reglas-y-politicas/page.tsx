import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Reglas y Políticas — Batalla de Hinchadas",
  description: "Descubre cómo funciona Batallas y nuestras políticas.",
};

export default function RulesPage() {
  return (
    <main className="container page-content" style={{ maxWidth: "800px", margin: "0 auto", padding: "60px 24px", lineHeight: "1.6" }}>
      <h1 className="section-title" style={{ textAlign: "center", marginBottom: "8px" }}>REGLAS Y POLÍTICAS</h1>
      <p style={{ textAlign: "center", color: "#94a3b8", marginBottom: "40px" }}>Última actualización: {new Date().toLocaleDateString()}</p>

      <section style={{ marginBottom: "32px" }}>
        <h2 style={{ fontSize: "1.5rem", marginBottom: "16px", color: "#fff" }}>¿Qué es BATALLAS?</h2>
        <p style={{ color: "#cbd5e1", marginBottom: "16px" }}>BATALLAS es una plataforma digital de entretenimiento social y deportivo donde las hinchadas pueden medir su nivel de participación y apoyo en tiempo real frente a sus rivales.</p>
      </section>

      <section style={{ marginBottom: "32px" }}>
        <h2 style={{ fontSize: "1.5rem", marginBottom: "16px", color: "#fff" }}>¿Cómo funcionan las batallas?</h2>
        <p style={{ color: "#cbd5e1", marginBottom: "16px" }}>Cada batalla presenta un enfrentamiento entre dos equipos. Los usuarios pueden elegir un lado y realizar una participación digital. El porcentaje de cada equipo se calcula con base en la participación total confirmada.</p>
      </section>

      <section style={{ marginBottom: "32px" }}>
        <h2 style={{ fontSize: "1.5rem", marginBottom: "16px", color: "#fff" }}>Naturaleza de la participación digital</h2>
        <p style={{ color: "#cbd5e1", marginBottom: "16px" }}>La participación en BATALLAS es un acto de entretenimiento y apoyo simbólico. <strong>La participación NO representa ni otorga ningún tipo de propiedad, acciones, derechos de voto, ni vínculos legales o comerciales sobre los equipos reales mencionados.</strong> Los montos aportados son exclusivamente para participar en la dinámica interactiva de la plataforma.</p>
      </section>

      <section style={{ marginBottom: "32px" }}>
        <h2 style={{ fontSize: "1.5rem", marginBottom: "16px", color: "#fff" }}>Cómo se calcula la posición de cada lado</h2>
        <p style={{ color: "#cbd5e1", marginBottom: "16px" }}>El balón y los porcentajes en el "Campo de Batalla" se mueven matemáticamente en función de los aportes económicos confirmados de cada lado. Si el Equipo A acumula el 70% del valor total participado, el balón se desplazará a su favor de forma proporcional.</p>
      </section>

      <section style={{ marginBottom: "32px" }}>
        <h2 style={{ fontSize: "1.5rem", marginBottom: "16px", color: "#fff" }}>Reglas de participación</h2>
        <ul style={{ color: "#cbd5e1", marginBottom: "16px", paddingLeft: "24px" }}>
          <li style={{ marginBottom: "8px" }}>Debes ser mayor de edad en tu jurisdicción para participar.</li>
          <li style={{ marginBottom: "8px" }}>Una vez confirmada la participación, aparecerás en el ranking del equipo elegido.</li>
          <li style={{ marginBottom: "8px" }}>No se permiten participaciones automatizadas o mediante bots.</li>
        </ul>
      </section>

      <section style={{ marginBottom: "32px" }}>
        <h2 style={{ fontSize: "1.5rem", marginBottom: "16px", color: "#fff" }}>Pagos y Operaciones</h2>
        <p style={{ color: "#cbd5e1", marginBottom: "16px" }}>Todos los pagos son procesados de forma segura a través de nuestra pasarela de pagos aliada. La plataforma no almacena directamente datos sensibles de tarjetas de crédito. Tu participación solo se reflejará en la batalla cuando el banco confirme exitosamente la transacción.</p>
      </section>

      <section style={{ marginBottom: "32px" }}>
        <h2 style={{ fontSize: "1.5rem", marginBottom: "16px", color: "#fff" }}>Cancelaciones y Devoluciones</h2>
        <p style={{ color: "#cbd5e1", marginBottom: "16px" }}>Debido a la naturaleza inmediata y en tiempo real de la plataforma, las participaciones confirmadas no son reembolsables, salvo que exista un error técnico demostrable por parte de la plataforma en el procesamiento del pago.</p>
      </section>

      <section style={{ marginBottom: "32px" }}>
        <h2 style={{ fontSize: "1.5rem", marginBottom: "16px", color: "#fff" }}>Conductas prohibidas</h2>
        <p style={{ color: "#cbd5e1", marginBottom: "16px" }}>Nos reservamos el derecho de eliminar mensajes o apodos (y ocultar la participación del ranking público) si contienen:</p>
        <ul style={{ color: "#cbd5e1", marginBottom: "16px", paddingLeft: "24px" }}>
          <li style={{ marginBottom: "8px" }}>Discurso de odio, racismo o discriminación.</li>
          <li style={{ marginBottom: "8px" }}>Lenguaje explícitamente violento o amenazas.</li>
          <li style={{ marginBottom: "8px" }}>Spam o enlaces comerciales.</li>
        </ul>
      </section>

      <section style={{ marginBottom: "32px" }}>
        <h2 style={{ fontSize: "1.5rem", marginBottom: "16px", color: "#fff" }}>Privacidad</h2>
        <p style={{ color: "#cbd5e1", marginBottom: "16px" }}>Solo mostraremos públicamente el nombre/apodo que elijas y tu mensaje. Tu dirección de correo electrónico (si decides seguir la batalla) y otros datos transaccionales se mantendrán privados de acuerdo a nuestra Política de Privacidad.</p>
      </section>

      <section style={{ marginBottom: "32px" }}>
        <h2 style={{ fontSize: "1.5rem", marginBottom: "16px", color: "#fff" }}>Contacto</h2>
        <p style={{ color: "#cbd5e1", marginBottom: "16px" }}>Si tienes dudas sobre tu participación o experimentas problemas técnicos, por favor visita nuestra página de <a href="/contact" style={{ color: "#f59e0b" }}>Contacto</a>.</p>
      </section>
    </main>
  );
}
