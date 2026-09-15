export default function RefundsPage() {
  return (
    <main className="container">
      <div className="action-area" style={{ textAlign: "left" }}>
        <h1 className="title" style={{ fontSize: "2rem", marginBottom: "24px" }}>Política de Reembolsos</h1>
        
        <div style={{ lineHeight: "1.6", color: "#e2e8f0" }}>
          <p style={{ marginBottom: "16px" }}>
            El objetivo de <strong>Batalla de Hinchadas</strong> es ofrecer una experiencia transparente y justa para todos los aficionados.
          </p>

          <h2 style={{ fontSize: "1.2rem", marginTop: "24px", marginBottom: "12px", color: "#fff" }}>Naturaleza del Servicio Digital</h2>
          <p style={{ marginBottom: "16px" }}>
            Las participaciones adquiridas a través de la plataforma son bienes digitales que se consumen instantáneamente al reflejarse en el marcador público y en el registro visual de la batalla. Debido a esta naturaleza de consumo inmediato, los pagos son, de forma predeterminada, finales y no retornables.
          </p>

          <h2 style={{ fontSize: "1.2rem", marginTop: "24px", marginBottom: "12px", color: "#fff" }}>Evaluación de Reembolsos</h2>
          <p style={{ marginBottom: "16px" }}>
            A pesar de la política general, entendemos que pueden ocurrir errores excepcionales. Las solicitudes de reembolso no se emiten de forma automática ni se niegan absolutamente. Cada caso será evaluado individualmente y de buena fe conforme a las siguientes circunstancias:
            <ul>
              <li>Cobros duplicados por fallas demostrables en la pasarela de pago.</li>
              <li>Cargos fraudulentos o no autorizados comprobados (los cuales seguirán los procesos de resolución de disputas del proveedor de pagos).</li>
              <li>Errores técnicos críticos en la plataforma que impidan que el apoyo se registre correctamente.</li>
            </ul>
          </p>

          <h2 style={{ fontSize: "1.2rem", marginTop: "24px", marginBottom: "12px", color: "#fff" }}>Solicitudes</h2>
          <p style={{ marginBottom: "16px" }}>
            Cualquier consulta sobre un pago realizado debe dirigirse a nuestros canales de contacto oficiales proporcionando el ID de la transacción y los detalles del inconveniente, y será procesada en apego a los términos de nuestro proveedor de pagos y la normativa vigente aplicable.
          </p>
        </div>
      </div>
    </main>
  );
}
