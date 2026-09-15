export default function PrivacyPage() {
  return (
    <main className="container">
      <div className="action-area" style={{ textAlign: "left" }}>
        <h1 className="title" style={{ fontSize: "2rem", marginBottom: "24px" }}>Política de Privacidad</h1>
        
        <div style={{ lineHeight: "1.6", color: "#e2e8f0" }}>
          <p style={{ marginBottom: "16px" }}>
            En <strong>Batalla de Hinchadas</strong>, valoramos tu privacidad y la transparencia en el manejo de tu información.
          </p>

          <h2 style={{ fontSize: "1.2rem", marginTop: "24px", marginBottom: "12px", color: "#fff" }}>1. Información que Recopilamos</h2>
          <p style={{ marginBottom: "16px" }}>
            Cuando interactúas con nuestra plataforma, únicamente almacenamos la información estrictamente necesaria para que la experiencia funcione:
            <ul>
              <li>El nombre o apodo que decides ingresar voluntariamente (que será público).</li>
              <li>El mensaje de apoyo que decides escribir (que será público).</li>
              <li>El valor de tu participación y la hora en que se realizó.</li>
            </ul>
          </p>

          <h2 style={{ fontSize: "1.2rem", marginTop: "24px", marginBottom: "12px", color: "#fff" }}>2. Datos de Pago</h2>
          <p style={{ marginBottom: "16px" }}>
            <strong>Nuestra plataforma NO recopila, procesa ni almacena directamente los datos de tus tarjetas de crédito, débito u otros medios de pago.</strong> 
            Toda la transacción financiera es procesada de forma segura por nuestro Merchant of Record (Proveedor de Pagos). Nosotros solo recibimos una notificación de estado (éxito o fallo) y un ID de referencia para actualizar tu aporte en la pantalla.
          </p>

          <h2 style={{ fontSize: "1.2rem", marginTop: "24px", marginBottom: "12px", color: "#fff" }}>3. Uso de la Información</h2>
          <p style={{ marginBottom: "16px" }}>
            La información recopilada se utiliza exclusivamente para:
            <ul>
              <li>Mostrar el marcador y el registro público de participaciones en tiempo real.</li>
              <li>Atender posibles consultas de soporte al cliente.</li>
            </ul>
          </p>
        </div>
      </div>
    </main>
  );
}
