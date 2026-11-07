import type { CommandDefinition } from "../types";
import { shellConcepts, shellExamples } from "../shellLearning";

function operatorDefinition(
  id: string,
  name: string,
  description: CommandDefinition["description"],
  syntax: string,
): CommandDefinition {
  return {
    id,
    name,
    kind: "shell-operator",
    category: "pipes",
    description,
    syntax,
    form: { kind: "custom", componentKey: "shell-composition" },
    options: [],
    choices: [],
    arguments: [],
    explanation: {
      en: "Build a small structured Bash composition: each stage is either an existing read-oriented catalog builder or one executable with separate literal argument tokens. Pipes accept 2–4 stages and no redirections; each redirection builder accepts one stage. Selected operators are constant syntax tokens, never parsed from arbitrary user text. Catalog forms retain their own validation: grep and less require file operands there; use a literal stage for stdin-only use. The preview never runs, reads files, or accesses the operating system. All input tokens are quoted once; do not type shell quotes around your values.",
      id: "Susun komposisi Bash kecil yang terstruktur: setiap tahap adalah builder katalog berorientasi baca yang sudah ada atau satu program dengan token argumen literal terpisah. Pipe menerima 2–4 tahap tanpa redirection; setiap builder redirection menerima satu tahap. Operator terpilih adalah token sintaks tetap, tidak pernah diurai dari teks pengguna bebas. Formulir katalog mempertahankan validasinya sendiri: grep dan less memerlukan operand berkas di sana; gunakan tahap literal untuk hanya stdin. Pratinjau tidak pernah menjalankan perintah, membaca berkas, atau mengakses sistem operasi. Semua token masukan dikutip sekali; jangan ketik kutip shell mengelilingi nilainya.",
    },
    warnings: [
      {
        en: "Generated text only. Manually running a copied command can overwrite files or have other side effects. Quoting does not verify paths, permissions, program behavior, or safety for your environment. No sudo is inserted. Pipelines, program options and shell settings can affect results.",
        id: "Hanya teks yang dihasilkan. Menjalankan perintah tersalin secara manual dapat menimpa berkas atau menimbulkan efek lain. Kutip tidak memverifikasi jalur, izin, perilaku program, atau keamanan lingkungan Anda. Sudo tidak ditambahkan. Pipeline, opsi program, dan pengaturan shell dapat memengaruhi hasil.",
      },
    ],
    concepts: shellConcepts,
    examples: shellExamples,
  };
}
export const pipeline = operatorDefinition(
  "pipeline",
  "command | command",
  {
    en: "Pipe Builder: connect 2–4 commands from stdout to stdin.",
    id: "Builder Pipe: hubungkan 2–4 perintah dari stdout ke stdin.",
  },
  "command1 | command2 [| command3 [| command4]]",
);
export const stdoutRedirection = operatorDefinition(
  "stdout-redirection",
  "command > file",
  {
    en: "Output Redirection Builder: overwrite or append standard output.",
    id: "Builder Redirection Keluaran: timpa atau tambahkan keluaran standar.",
  },
  "command > file | command >> file",
);
export const stdinRedirection = operatorDefinition(
  "stdin-redirection",
  "command < file",
  {
    en: "Input Redirection Builder: supply a literal file as standard input.",
    id: "Builder Redirection Masukan: pasok berkas literal sebagai masukan standar.",
  },
  "command < file",
);
export const stderrRedirection = operatorDefinition(
  "stderr-redirection",
  "command 2> file",
  {
    en: "Standard Error Builder: redirect, append, or duplicate stderr with explicit ordering.",
    id: "Builder Standard Error: alihkan, tambahkan, atau duplikasi stderr dengan urutan eksplisit.",
  },
  "command 2> file | command 2>> file | command 2>&1 | command > file 2>&1 | command 2>&1 > file",
);
