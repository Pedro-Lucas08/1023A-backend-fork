import fastify, { FastifyReply } from "fastify";
import cors from "@fastify/cors";
import mysql from "mysql2/promise";

// ===== CONFIG. BANCO ===================================================== //
const pool = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "",
  database: "banco1023a",
  port: 3306,
  waitForConnections: true,
  connectionLimit: 10,
});

// Função utilitária para querys
const query = async (sql: string, params?: any[]) => {
  const [rows] = await pool.query(sql, params);
  return rows;
};

// ===== FASTIFY ============================================================== //
const app = fastify();
app.register(cors);

// Tratamento genérico de erro do MySQL
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

// ===== ROTA RAIZ ========================================================== //
app.get("/", (_, reply) => reply.send("Fastify rodando 🚀"));

// ========================================================================== //
// ================  C A T E G O R I A S  =================================== //
// ========================================================================== //

app.get("/categorias", async (_, reply) => {
  try {
    const dados = await query("SELECT * FROM categorias");
    reply.send(dados);
  } catch (e) {
    tratarErro(e, reply);
  }
});

app.post("/categorias", async (req, reply) => {
  const { nome } = req.body as { nome?: string };
  if (!nome) return reply.status(400).send({ mensagem: "Nome é obrigatório." });

  try {
    const resultado = await query("INSERT INTO categorias (nome) VALUES (?)", [
      nome,
    ]);
    reply.send(resultado);
  } catch (e) {
    tratarErro(e, reply);
  }
});

// ========================================================================== //
// ==================  P R O D U T O S  ===================================== //
// ========================================================================== //

app.get("/produtos", async (_, reply) => {
  try {
    /* inclui nome da categoria apenas para exibição */
    const dados = await query(`
      SELECT p.id, p.nome, p.preco,
             p.categoria_id AS categoriaId,
             c.nome AS categoria
      FROM produtos p
      LEFT JOIN categorias c ON c.id = p.categoria_id
    `);
    reply.send(dados);
  } catch (e) {
    tratarErro(e, reply);
  }
});

app.post("/produtos", async (req, reply) => {
  const { nome, preco, categoriaId } = req.body as {
    nome?: string;
    preco?: number;
    categoriaId?: number;
  };

  if (!nome || preco == null)
    return reply
      .status(400)
      .send({ mensagem: "Nome e preço são obrigatórios." });

  try {
    const resultado = await query(
      "INSERT INTO produtos (nome, preco, categoria_id) VALUES (?, ?, ?)",
      [nome, preco, categoriaId ?? null]
    );
    reply.send(resultado);
  } catch (e) {
    tratarErro(e, reply);
  }
});

// ========================================================================== //
// ==================  C L I E N T E S  ===================================== //
// ========================================================================== //

app.get("/clientes", async (_, reply) => {
  try {
    const dados = await query("SELECT * FROM clientes");
    reply.send(dados);
  } catch (e) {
    tratarErro(e, reply);
  }
});

app.post("/clientes", async (req, reply) => {
  const { nome, email } = req.body as { nome?: string; email?: string };
  if (!nome || !email)
    return reply
      .status(400)
      .send({ mensagem: "Nome e e‑mail são obrigatórios." });

  try {
    const resultado = await query(
      "INSERT INTO clientes (nome, email) VALUES (?, ?)",
      [nome, email]
    );
    reply.send(resultado);
  } catch (e) {
    tratarErro(e, reply);
  }
});

// ========================================================================== //
// ==================  S E R V I D O R  ===================================== //
// ========================================================================== //

app.listen({ port: 8000 }, (err, address) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  console.log("🔌  API ligada em", address);
});





/*

-- Criar o banco de dados
CREATE DATABASE banco1023a;

-- Usar o banco de dados
USE banco1023a;

-- Criar tabela Categorias
CREATE TABLE categorias (
    id INT AUTO_INCREMENT PRIMARY KEY,      -- Chave primária
    nome VARCHAR(255) NOT NULL              -- Nome da categoria
);

-- Criar tabela Produtos
CREATE TABLE produtos (
    id INT AUTO_INCREMENT PRIMARY KEY,      -- Chave primária
    nome VARCHAR(255) NOT NULL,             -- Nome do produto
    preco DECIMAL(10,2) NOT NULL,           -- Preço do produto (com 2 casas decimais)
    categoria_id INT,                       -- ID da categoria (chave estrangeira)
    FOREIGN KEY (categoria_id) REFERENCES categorias(id) ON DELETE SET NULL  -- Relacionamento com a tabela 'categorias'
);

-- Criar tabela Clientes
CREATE TABLE clientes (
    id INT AUTO_INCREMENT PRIMARY KEY,      -- Chave primária
    nome VARCHAR(255) NOT NULL,             -- Nome do cliente
    email VARCHAR(255) NOT NULL UNIQUE      -- E-mail do cliente (único)
);

-- Inserir algumas categorias (dados iniciais)
INSERT INTO categorias (nome) VALUES
('Eletrônicos'),
('Vestuário'),
('Alimentos');

-- Inserir alguns produtos (dados iniciais)
INSERT INTO produtos (nome, preco, categoria_id) VALUES
('Smartphone', 1999.99, 1),  -- Categoria 1: Eletrônicos
('Camiseta', 59.90, 2),      -- Categoria 2: Vestuário
('Arroz', 3.50, 3);          -- Categoria 3: Alimentos

-- Inserir alguns clientes (dados iniciais)
INSERT INTO clientes (nome, email) VALUES
('Carlos Silva', 'carlos.silva@example.com'),
('Maria Oliveira', 'maria.oliveira@example.com');
*/