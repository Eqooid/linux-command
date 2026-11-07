import type { BilingualText } from "../commands/types";

export const shellText = {
  stage: { en: "Command stage", id: "Tahap perintah" },
  source: { en: "Stage source", id: "Sumber tahap" },
  literal: {
    en: "Literal executable + arguments",
    id: "Program + argumen literal",
  },
  executable: { en: "Executable name or path", id: "Nama atau jalur program" },
  executableHint: {
    en: "One executable only, not a shell command string. Use an absolute or ./../ path for names containing spaces. Operators, substitutions and variables are not accepted here.",
    id: "Hanya satu program, bukan string perintah shell. Gunakan jalur absolut atau ./../ untuk nama yang mengandung spasi. Operator, substitusi, dan variabel tidak diterima di sini.",
  },
  arguments: { en: "Literal arguments", id: "Argumen literal" },
  argumentsHint: {
    en: "One token per row, without shell quotes. No rows means no arguments; an added empty row is an intentional empty argument. Spaces, $, | and > remain literal data.",
    id: "Satu token per baris, tanpa kutip shell. Tanpa baris berarti tanpa argumen; baris kosong yang ditambahkan adalah argumen kosong yang disengaja. Spasi, $, |, dan > tetap data literal.",
  },
  addArgument: { en: "Add argument", id: "Tambah argumen" },
  removeArgument: { en: "Remove argument", id: "Hapus argumen" },
  addStage: { en: "Add stage", id: "Tambah tahap" },
  removeStage: { en: "Remove stage", id: "Hapus tahap" },
  up: { en: "Move stage up", id: "Pindahkan tahap ke atas" },
  down: { en: "Move stage down", id: "Pindahkan tahap ke bawah" },
  catalogHint: {
    en: "This catalog form keeps its original generator and required fields. For grep/less reading only stdin, choose Literal executable + arguments instead. Commands that ignore stdin do not become filters just because they are in a pipeline.",
    id: "Formulir katalog ini mempertahankan generator dan kolom wajib aslinya. Untuk grep/less yang hanya membaca stdin, pilih Program + argumen literal. Perintah yang mengabaikan stdin tidak menjadi filter hanya karena berada dalam pipeline.",
  },
  outputMode: { en: "Output mode", id: "Mode keluaran" },
  overwrite: { en: "Overwrite stdout (>)", id: "Timpa stdout (>)" },
  append: { en: "Append stdout (>>)", id: "Tambahkan stdout (>>)" },
  errorMode: { en: "Standard error mode", id: "Mode standard error" },
  errorOverwrite: {
    en: "Overwrite stderr file (2>)",
    id: "Timpa berkas stderr (2>)",
  },
  errorAppend: {
    en: "Append stderr file (2>>)",
    id: "Tambahkan berkas stderr (2>>)",
  },
  merge: {
    en: "Duplicate current stdout onto stderr (2>&1)",
    id: "Duplikasi stdout saat ini ke stderr (2>&1)",
  },
  combined: {
    en: "Stdout file + stderr duplication (order matters)",
    id: "Berkas stdout + duplikasi stderr (urutan penting)",
  },
  order: { en: "Redirection order", id: "Urutan redirection" },
  fileFirst: {
    en: "File first: > file 2>&1 (both streams to file)",
    id: "Berkas dahulu: > file 2>&1 (kedua aliran ke berkas)",
  },
  mergeFirst: {
    en: "Duplicate first: 2>&1 > file (stderr keeps earlier stdout destination)",
    id: "Duplikasi dahulu: 2>&1 > file (stderr mempertahankan tujuan stdout sebelumnya)",
  },
  target: { en: "Target file path", id: "Jalur berkas tujuan" },
  input: { en: "Input file path", id: "Jalur berkas masukan" },
  pathHint: {
    en: "Literal path, quoted once. Do not type shell quotes; ~, variables and globs do not expand. File existence, type, contents and permissions are never inspected.",
    id: "Jalur literal, dikutip sekali. Jangan ketik kutip shell; ~, variabel, dan glob tidak diekspansi. Keberadaan, jenis, isi, dan izin berkas tidak pernah diperiksa.",
  },
  flow: { en: "How a pipe carries data", id: "Cara pipe membawa data" },
  commandA: { en: "Command A", id: "Perintah A" },
  stdout: { en: "stdout (1)", id: "stdout (1)" },
  pipe: { en: "pipe |", id: "pipe |" },
  stdin: { en: "stdin (0)", id: "stdin (0)" },
  commandB: { en: "Command B", id: "Perintah B" },
  flowHint: {
    en: "stderr (2) is separate and is not piped by |. This diagram is a reference, not simulated program output.",
    id: "stderr (2) terpisah dan tidak dialirkan oleh |. Diagram ini adalah referensi, bukan keluaran program simulasi.",
  },
  limit: {
    en: "Pipes contain 2–4 stages. Reordering moves the entire configuration. No pipelines combined with redirections in T10.",
    id: "Pipe berisi 2–4 tahap. Mengubah urutan memindahkan seluruh konfigurasi. Tidak ada pipeline yang digabung dengan redirection dalam T10.",
  },
} satisfies Record<string, BilingualText>;
