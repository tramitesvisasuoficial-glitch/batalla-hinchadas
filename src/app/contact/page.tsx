export default function ContactPage() {
  return (
    <main className="container">
      <div className="action-area" style={{ textAlign: "left" }}>
        <h1 className="title" style={{ fontSize: "2rem", marginBottom: "24px" }}>Contacto y Soporte</h1>
        
        <div style={{ lineHeight: "1.6", color: "#e2e8f0" }}>
          <p style={{ marginBottom: "16px" }}>
            En <strong>Batalla de Hinchadas</strong> estamos disponibles para ayudarte con cualquier consulta o incidencia relacionada con tu participación.
          </p>

          <h2 style={{ fontSize: "1.2rem", marginTop: "24px", marginBottom: "12px", color: "#fff" }}>Comunícate con nosotros</h2>
          <p style={{ marginBottom: "16px" }}>
            Si tuviste algún inconveniente técnico durante la adquisición de tu participación o tienes preguntas generales, por favor escríbenos a:
          </p>
          
          {/* Temporary configuration for email before official launch */}
          <div style={{ background: "#0f1115", padding: "16px", borderRadius: "8px", border: "1px solid #2d3340", margin: "24px 0", fontSize: "1.1rem", textAlign: "center" }}>
            <strong>{process.env.NEXT_PUBLIC_CONTACT_EMAIL || "hola@batalladehinchadas.com"}</strong>
          </div>

          <p style={{ marginBottom: "16px" }}>
            Para agilizar la atención sobre una participación en específico, recuerda incluir en tu mensaje:
            <ul>
              <li>El ID de referencia (si lo tienes).</li>
              <li>La fecha y hora aproximada de la transacción.</li>
              <li>La Batalla y el nombre con el que participaste.</li>
            </ul>
          </p>
        </div>
      </div>
    </main>
  );
}
