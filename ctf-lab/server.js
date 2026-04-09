const path = require("path");
const express = require("express");
const { db, initializeDatabase } = require("./database");

const app = express();
const PORT = 3000;

initializeDatabase();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

const banner = "⚠️ Entorno de laboratorio CTF — Solo uso educativo";

function layout(title, content) {
  return `
  <!DOCTYPE html>
  <html lang="es">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${title}</title>
    <link rel="stylesheet" href="/styles.css" />
  </head>
  <body>
    <div class="warning-banner">${banner}</div>
    ${content}
  </body>
  </html>
  `;
}

app.get("/", (req, res) => {
  res.redirect("/login");
});

app.get("/login", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.post("/login", (req, res) => {
  const user = req.body.username || "";
  const pass = req.body.password || "";

  // VULNERABLE intencionalmente: concatenación directa para demostrar SQL Injection.
  const query = "SELECT * FROM users WHERE username='" + user + "' AND password='" + pass + "'";
  const result = db.prepare(query).get();

  if (result) {
    // Sesión deliberadamente insegura para laboratorio.
    res.cookie("is_admin", "true");
    return res.redirect("/admin");
  }

  res.status(401).send(
    layout(
      "Login fallido",
      `
      <main class="container">
        <h1>Acceso denegado</h1>
        <p>Credenciales incorrectas.</p>
        <a href="/login">Volver al login</a>
      </main>
      `
    )
  );
});

app.get("/admin", (req, res) => {
  const cookies = req.headers.cookie || "";
  const isAdmin = cookies.includes("is_admin=true");

  if (!isAdmin) {
    return res.status(403).send(
      layout(
        "No autorizado",
        `
        <main class="container">
          <h1>403 - Acceso no autorizado</h1>
          <p>Inicia sesión para entrar al panel admin.</p>
          <a href="/login">Ir a /login</a>
        </main>
        `
      )
    );
  }

  const sqlFlag = db.prepare("SELECT flag FROM flags WHERE challenge = ?").get("sql_injection");

  res.sendFile(path.join(__dirname, "public", "admin.html"));
});

app.get("/admin-data", (req, res) => {
  const cookies = req.headers.cookie || "";
  const isAdmin = cookies.includes("is_admin=true");

  if (!isAdmin) {
    return res.status(403).json({ error: "No autorizado" });
  }

  const sqlFlag = db.prepare("SELECT flag FROM flags WHERE challenge = ?").get("sql_injection");
  return res.json({ flag: sqlFlag ? sqlFlag.flag : "Flag no encontrada" });
});

app.get("/buscar", (req, res) => {
  const q = req.query.q || "";
  const products = [
    { name: "Router ZX-100", stock: 14, area: "Networking" },
    { name: "Switch Core 48p", stock: 7, area: "Datacenter" },
    { name: "Firewall Lite", stock: 4, area: "Perimetral" },
    { name: "Servidor NAS", stock: 10, area: "Storage" }
  ];

  const productRows = products
    .map((p) => `<tr><td>${p.name}</td><td>${p.stock}</td><td>${p.area}</td></tr>`)
    .join("");

  // Cookie accesible por JS a propósito (sin HttpOnly) para demostrar robo por XSS.
  res.cookie("session_flag", Buffer.from("CTF{xss_c00k13_st0l3n_gg}").toString("base64"));

  // VULNERABLE intencionalmente: reflejo directo de req.query.q sin sanitización.
  const reflectedResult = q ? `<p class="result">Resultados para: ${q}</p>` : "";

  return res.send(
    layout(
      "Búsqueda de inventario",
      `
      <main class="container">
        <h1>Buscador de inventario interno</h1>
        <form action="/buscar" method="GET" class="card">
          <label for="q">Término de búsqueda</label>
          <input id="q" name="q" type="text" placeholder="Ej: router, firewall, admin..." />
          <button type="submit">Buscar</button>
        </form>
        ${reflectedResult}
        <section class="card">
          <h2>Productos disponibles</h2>
          <table>
            <thead>
              <tr>
                <th>Producto</th>
                <th>Stock</th>
                <th>Área</th>
              </tr>
            </thead>
            <tbody>
              ${productRows}
            </tbody>
          </table>
        </section>
        <p><a href="/login">Volver a login</a></p>
      </main>
      `
    )
  );
});

app.listen(PORT, () => {
  console.log(`CTF Lab activo en http://localhost:${PORT}`);
});
