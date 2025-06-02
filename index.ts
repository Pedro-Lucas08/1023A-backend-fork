// server.ts

import mysql from 'mysql2/promise';
import fastify, { FastifyRequest, FastifyReply } from 'fastify';
import cors from '@fastify/cors';

const app = fastify();
app.register(cors);

// Conexão com banco de dados
const conexaoDB = async () => {
  return await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'banco1023a',
    port: 3306
  });
};

// Rota raiz
app.get('/', async (_, reply) => {
  reply.send("Fastify Funcionando");
});

// Tratamento de erros de banco
const tratarErro = (erro: any, reply: FastifyReply) => {
  switch (erro.code) {
    case "ECONNREFUSED":
      reply.status(400).send({ mensagem: "ERRO: CONEXÃO RECUSADA. LIGUE O SERVIDOR MYSQL" });
      break;
    case "ER_BAD_DB_ERROR":
      reply.status(400).send({ mensagem: "ERRO: BANCO DE DADOS NÃO EXISTE" });
      break;
    case "ER_NO_SUCH_TABLE":
      reply.status(400).send({ mensagem: "ERRO: TABELA NÃO ENCONTRADA NO BANCO DE DADOS" });
      break;
    case "ER_DUP_ENTRY":
      reply.status(400).send({ mensagem: "ERRO: REGISTRO DUPLICADO" });
      break;
    default:
      console.error(erro);
      reply.status(400).send({ mensagem: "ERRO DESCONHECIDO" });
  }
};

// ===== ROTA: USUÁRIOS =====

// Listar usuários
app.get('/usuarios', async (_, reply) => {
  try {
    const conn = await conexaoDB();
    const [dados] = await conn.query("SELECT * FROM usuarios");
    reply.send(dados);
  } catch (erro: any) {
    tratarErro(erro, reply);
  }
});

// Cadastrar usuário
app.post('/usuarios', async (request, reply) => {
  const { id, nome, email } = request.body as any;

  if (!id || !nome || !email) {
    return reply.status(400).send({ mensagem: "Dados incompletos para cadastro de usuário" });
  }

  try {
    const conn = await conexaoDB();
    const resultado = await conn.query(
      "INSERT INTO usuarios (id, nome, email) VALUES (?, ?, ?)",
      [id, nome, email]
    );
    reply.send(resultado);
  } catch (erro: any) {
    tratarErro(erro, reply);
  }
});

// ===== ROTA: PRODUTOS =====

// Listar produtos
app.get('/produtos', async (_, reply) => {
  try {
    const conn = await conexaoDB();
    const [dados] = await conn.query("SELECT * FROM produtos");
    reply.send(dados);
  } catch (erro: any) {
    tratarErro(erro, reply);
  }
});

// Cadastrar produto
app.post('/produtos', async (request, reply) => {
  const { id, nome, preco } = request.body as any;

  if (!id || !nome || preco == null) {
    return reply.status(400).send({ mensagem: "Dados incompletos para cadastro de produto" });
  }

  try {
    const conn = await conexaoDB();
    const resultado = await conn.query(
      "INSERT INTO produtos (id, nome, preco) VALUES (?, ?, ?)",
      [id, nome, preco]
    );
    reply.send(resultado);
  } catch (erro: any) {
    tratarErro(erro, reply);
  }
});

// Iniciar servidor
app.listen({ port: 8000 }, (err, address) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  console.log(`Servidor rodando em: ${address}`);
});









/*



use banco1023a;
CREATE TABLE usuarios (
  id INT PRIMARY KEY,
  nome VARCHAR(100),
  email VARCHAR(100)
);

use banco1023a;
CREATE TABLE produtos (
  id INT PRIMARY KEY,
  nome VARCHAR(100),
  preco DECIMAL(10, 2)
);

*/