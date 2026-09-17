const runTest = async () => {
  console.log("1. Probando DELETE /api/battles/123 sin credenciales...");
  let res = await fetch("http://localhost:3000/api/battles/123", { method: "DELETE" });
  console.log("Status:", res.status, res.status === 401 ? "✅ OK" : "❌ FAIL");

  console.log("2. Probando carga de paginas publicas (Home)...");
  res = await fetch("http://localhost:3000/");
  console.log("Home Status:", res.status, res.status === 200 ? "✅ OK" : "❌ FAIL");
};

runTest().catch(console.error);
