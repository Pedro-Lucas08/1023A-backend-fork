// server.ts
import fastify, { FastifyReply } from "fastify";
import cors from "@fastify/cors";
import mysql from "mysql2/promise";



/* ===============================================================
   CONFIG BANCO
   ============================================================== */
const pool = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "",
  database: "banco1023a",
  port: 3306,
  waitForConnections: true,
  connectionLimit: 10,
});

const query = async (sql: string, params?: any[]) => {
  const [rows] = await pool.query(sql, params);
  return rows;
};

/* ===============================================================
   APP + CORS
   ============================================================== */


const app = fastify();

// Libera qualquer origem e garante OPTIONS
app.register(cors, {
  origin: true,                      // reflexivo (devolve a mesma origem)
  methods: ["GET","POST","PUT","DELETE","OPTIONS"],
  allowedHeaders: ["Content-Type"],
});
/* ===============================================================
   TRATAR ERRO
   ============================================================== */
function tratarErro(erro: any, reply: FastifyReply) {
  const map: Record<string, string> = {
    ECONNREFUSED: "ERRO: Conexão recusada. Ligue o servidor MySQL.",
    ER_BAD_DB_ERROR: "ERRO: Banco de dados não existe.",
    ER_NO_SUCH_TABLE: "ERRO: Tabela não encontrada.",
    ER_DUP_ENTRY: "ERRO: Registro duplicado.",
  };
  console.error(erro);
  reply.status(400).send({ mensagem: map[erro.code] ?? "Erro desconhecido." });
}

/* ===============================================================
   ROOT
   ============================================================== */
app.get("/", (_, reply) => reply.send("Fastify API 🚀"));

/* ===============================================================
   CATEGORIAS
   ============================================================== */
// GET
app.get("/categorias", async (_, reply) => {
  try {
    reply.send(await query("SELECT * FROM categorias"));
  } catch (e) {
    tratarErro(e, reply);
  }
});
// POST
app.post("/categorias", async (req, reply) => {
  const { nome } = req.body as { nome?: string };
  if (!nome) return reply.status(400).send({ mensagem: "Nome obrigatório." });
  try {
    const r: any = await query("INSERT INTO categorias (nome) VALUES (?)", [nome]);
    reply.send({ id: r.insertId, nome });
  } catch (e) {
    tratarErro(e, reply);
  }
});
// PUT
app.put("/categorias/:id", async (req, reply) => {
  const { id } = req.params as any;
  const { nome } = req.body as { nome?: string };
  if (!nome) return reply.status(400).send({ mensagem: "Nome obrigatório." });
  try {
    await query("UPDATE categorias SET nome = ? WHERE id = ?", [nome, id]);
    reply.send({ id: Number(id), nome });
  } catch (e) {
    tratarErro(e, reply);
  }
});
// DELETE
app.delete("/categorias/:id", async (req, reply) => {
  const { id } = req.params as any;
console.log("Delete request for categoria ID:", id);
  try {
    await query("DELETE FROM categorias WHERE id = ?", [id]);
    reply.send({ id: Number(id) });
  } catch (e) {
    tratarErro(e, reply);
  }
});

/* ===============================================================
   PRODUTOS
   ============================================================== */
// GET
app.get("/produtos", async (_, reply) => {
  try {
    const sql = `
      SELECT p.id, p.nome, p.preco,
             p.categoria_id AS categoriaId,
             c.nome AS categoria
        FROM produtos p
   LEFT JOIN categorias c ON c.id = p.categoria_id
    `;
    reply.send(await query(sql));
  } catch (e) {
    tratarErro(e, reply);
  }
});
// POST
app.post("/produtos", async (req, reply) => {
  const { nome, preco, categoriaId } = req.body as {
    nome?: string;
    preco?: number;
    categoriaId?: number | null;
  };
  if (!nome || preco == null)
    return reply.status(400).send({ mensagem: "Nome e preço são obrigatórios." });

  try {
    const r: any = await query(
      "INSERT INTO produtos (nome, preco, categoria_id) VALUES (?, ?, ?)",
      [nome, preco, categoriaId ?? null]
    );
    reply.send({ id: r.insertId, nome, preco, categoriaId });
  } catch (e) {
    tratarErro(e, reply);
  }
});
// PUT
app.put("/produtos/:id", async (req, reply) => {
  const { id } = req.params as any;
  const { nome, preco, categoriaId } = req.body as {
    nome?: string;
    preco?: number;
    categoriaId?: number | null;
  };
  if (!nome || preco == null)
    return reply
      .status(400)
      .send({ mensagem: "Nome e preço são obrigatórios." });

  try {
    await query(
      "UPDATE produtos SET nome = ?, preco = ?, categoria_id = ? WHERE id = ?",
      [nome, preco, categoriaId ?? null, id]
    );
    reply.send({ id: Number(id), nome, preco, categoriaId });
  } catch (e) {
    tratarErro(e, reply);
  }
});

// DELETE
app.delete("/produtos/:id", async (req, reply) => {
  const { id } = req.params as any;
  console.log(`[DELETE] Produto ID: ${id}`);

  try {
    const result = await query("DELETE FROM produtos WHERE id = ?", [id]);
    console.log(`[DELETE] Result:`, result);
    reply.send({ id: Number(id) });
  } catch (e) {
    console.error("[DELETE] Erro:", e);
    tratarErro(e, reply);
  }
});


/* ===============================================================
   CLIENTES
   ============================================================== */
// GET
app.get("/clientes", async (_, reply) => {
  try {
    reply.send(await query("SELECT * FROM clientes"));
  } catch (e) {
    tratarErro(e, reply);
  }
});
// POST
app.post("/clientes", async (req, reply) => {
  const { nome, email } = req.body as { nome?: string; email?: string };
  if (!nome || !email)
    return reply.status(400).send({ mensagem: "Nome e e‑mail são obrigatórios." });

  try {
    const r: any = await query("INSERT INTO clientes (nome, email) VALUES (?, ?)", [
      nome,
      email,
    ]);
    reply.send({ id: r.insertId, nome, email });
  } catch (e) {
    tratarErro(e, reply);
  }
});
// PUT
app.put("/clientes/:id", async (req, reply) => {
  const { id } = req.params as any;
  const { nome, email } = req.body as { nome?: string; email?: string };
  if (!nome || !email)
    return reply.status(400).send({ mensagem: "Nome e e‑mail obrigatórios." });

  try {
    await query("UPDATE clientes SET nome = ?, email = ? WHERE id = ?", [
      nome,
      email,
      id,
    ]);
    reply.send({ id: Number(id), nome, email });
  } catch (e) {
    tratarErro(e, reply);
  }
});
// DELETE
app.delete("/clientes/:id", async (req, reply) => {
  const { id } = req.params as any;
  console.log("Delete request for clientes ID:", id);
  try {
    await query("DELETE FROM clientes WHERE id = ?", [id]);
    reply.send({ id: Number(id) });
  } catch (e) {
    tratarErro(e, reply);
  }
});

/* ===============================================================
   SERVIDOR
   ============================================================== */
app.listen({ port: 8000 }, (err, address) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  console.log("🔌  API ligada em", address);
});
