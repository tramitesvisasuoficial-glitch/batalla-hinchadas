export default function TermsPage() {
  return (
    <main className="container">
      <div className="action-area" style={{ textAlign: "left" }}>
        <h1 className="title" style={{ fontSize: "2rem", marginBottom: "24px" }}>Términos y Condiciones</h1>
        
        <div style={{ lineHeight: "1.6", color: "#e2e8f0" }}>
          <p style={{ marginBottom: "16px" }}>
            Bienvenido a <strong>Batalla de Hinchadas</strong>. Al utilizar nuestra plataforma, aceptas estar sujeto a estos términos y condiciones.
          </p>

          <h2 style={{ fontSize: "1.2rem", marginTop: "24px", marginBottom: "12px", color: "#fff" }}>1. Naturaleza del Servicio</h2>
          <p style={{ marginBottom: "16px" }}>
            Batalla de Hinchadas es una plataforma de entretenimiento digital interactivo. Permite a los usuarios adquirir una participación digital para incrementar el nivel de visibilidad de una comunidad o "Hinchada" en un marcador digital y obtener una posición en el ranking público.
          </p>

          <h2 style={{ fontSize: "1.2rem", marginTop: "24px", marginBottom: "12px", color: "#fff" }}>2. No es Apuesta ni Inversión</h2>
          <p style={{ marginBottom: "16px" }}>
            El uso de esta plataforma <strong>NO constituye un juego de azar, apuesta deportiva, ni inversión financiera</strong>.
            <ul>
              <li>Los pagos realizados son para adquirir una participación digital inmediata en nuestro ranking y no constituyen una donación o mecanismo de crowdfunding.</li>
              <li>No existen premios monetarios, retornos financieros, ni mecanismos para retirar fondos.</li>
              <li>El resultado del marcador es exclusivamente digital y no tiene dependencia, influencia, ni conexión oficial con los resultados de los eventos deportivos del mundo real.</li>
            </ul>
          </p>

          <h2 style={{ fontSize: "1.2rem", marginTop: "24px", marginBottom: "12px", color: "#fff" }}>3. Independencia Oficial</h2>
          <p style={{ marginBottom: "16px" }}>
            Batalla de Hinchadas es una plataforma 100% independiente. No representamos, ni estamos afiliados, patrocinados, o avalados por ningún club deportivo, liga, o asociación oficial. Los nombres y colores son utilizados únicamente con fines descriptivos por la comunidad.
          </p>

          <h2 style={{ fontSize: "1.2rem", marginTop: "24px", marginBottom: "12px", color: "#fff" }}>4. Procesamiento de Pagos</h2>
          <p style={{ marginBottom: "16px" }}>
            Los pagos son procesados a través de nuestro Merchant of Record (Proveedor de Pagos). Al realizar un pago, estás sujeto a los términos de servicio de nuestro procesador externo.
          </p>
        </div>
      </div>
    </main>
  );
}
