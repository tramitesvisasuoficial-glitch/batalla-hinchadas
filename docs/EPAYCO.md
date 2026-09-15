# Integración con ePayco (Sandbox)

Esta plataforma utiliza ePayco como pasarela de pagos. La arquitectura está diseñada para no depender de la seguridad del frontend, sino exclusivamente de las notificaciones de servidor a servidor (Webhooks).

## 1. Funcionamiento del Checkout (Frontend)
El botón "ADQUIRIR PARTICIPACIÓN" envía los datos al backend para crear el registro de `Support` en estado `pending` y fija un límite de expiración (ej: 30 minutos).
El backend retorna los datos necesarios para montar ePayco Checkout Estándar (URL de pago).
El frontend utiliza esos datos para abrir la pasarela.

## 2. Webhook y Confirmación (Backend)
ePayco notifica asíncronamente a `/api/webhook/epayco` cuando el pago es resuelto (aprobado o rechazado).

**El webhook realiza las siguientes validaciones estrictas:**
* **Firma Criptográfica**: Calcula un hash SHA-256 usando `P_CUST_ID_CLIENTE` y `P_KEY` combinados con los datos de la transacción (`x_ref_payco`, `x_amount`, etc.) para verificar que la petición sea auténtica de ePayco.
* **Idempotencia**: Si el pago ya está en estado `paid`, responde 200 pero no procesa de nuevo.
* **Monto y Moneda**: Verifica que coincidan exactamente con la intención de pago registrada.
* **Expiración de la Orden (Late Payments)**: Se compara `x_transaction_date` (fecha real de la transacción en el banco) contra `expiresAt` del Support. Si el usuario pagó dentro de su ventana de vigencia, se aprueba el pago, *incluso si la batalla ya finalizó*.

El retorno (URL) desde ePayco de vuelta a la página web NO cambia el estado del pago; es puramente informativo.

## 3. Configuración y Variables de Entorno
La configuración requiere las siguientes variables de entorno que nunca deben ser subidas a un repositorio público (están ignoradas en `.gitignore`):

```env
EPAYCO_P_CUST_ID_CLIENTE="xxx"
EPAYCO_P_KEY="xxx"
EPAYCO_PUBLIC_KEY="xxx"
```

## 4. Transición de Sandbox a Producción
Cuando se desee activar pagos reales:
1. Reemplazar las credenciales en Vercel (Variables de entorno) con las llaves de Producción de ePayco.
2. Modificar el parámetro `test: "true"` a `test: "false"` en la configuración del Checkout frontend.
3. Asegurarse de que ePayco haya aprobado la cuenta de producción.
