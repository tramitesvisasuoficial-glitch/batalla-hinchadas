const runTest = async () => {
  console.log("1. Probando /admin sin credenciales...");
  let res = await fetch("http://localhost:3000/admin");
  console.log("Status:", res.status, res.status === 401 ? "✅ OK" : "❌ FAIL");

  console.log("2. Probando POST /api/battles sin credenciales...");
  res = await fetch("http://localhost:3000/api/battles", { method: "POST" });
  console.log("Status:", res.status, res.status === 401 ? "✅ OK" : "❌ FAIL");

  console.log("3. Probando POST /api/teams sin credenciales...");
  res = await fetch("http://localhost:3000/api/teams", { method: "POST" });
  console.log("Status:", res.status, res.status === 401 ? "✅ OK" : "❌ FAIL");

  console.log("4. Probando PUT /api/battles/123 sin credenciales...");
  res = await fetch("http://localhost:3000/api/battles/123", { method: "PUT" });
  console.log("Status:", res.status, res.status === 401 ? "✅ OK" : "❌ FAIL");

  console.log("5. Probando /admin con credenciales...");
  res = await fetch("http://localhost:3000/admin", {
    headers: { "Authorization": "Basic " + Buffer.from("admin:90f6c4a4f3fd255294219abadf533662").toString("base64") }
  });
  console.log("Status:", res.status, res.status === 200 ? "✅ OK" : "❌ FAIL");

  console.log("6. Probando GET /api/battles (debe ser público)...");
  res = await fetch("http://localhost:3000/api/battles");
  console.log("Status:", res.status, res.status === 200 ? "✅ OK" : "❌ FAIL");

  console.log("7. Probando POST /api/webhook/epayco (debe ser público/ignorado por middleware)...");
  res = await fetch("http://localhost:3000/api/webhook/epayco", { method: "POST" });
  // El webhook devuelve 400 si le faltan parámetros, pero NO 401 del middleware.
  console.log("Status:", res.status, res.status !== 401 ? "✅ OK (Not 401)" : "❌ FAIL");
};

runTest().catch(console.error);
