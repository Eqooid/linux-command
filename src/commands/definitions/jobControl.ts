import type { CommandDefinition } from "../types";
import {
  jobConcepts,
  jobNotes,
  jobShortcuts,
  jobWorkflows,
} from "../jobLearning";

function jobBuiltin(name: "fg" | "bg"): CommandDefinition {
  return {
    id: name,
    name,
    kind: "builtin",
    category: "processes",
    form: { kind: "basic" },
    description:
      name === "fg"
        ? {
            en: "Foreground Job: bring an existing Bash job to the foreground.",
            id: "Job Latar Depan: bawa job Bash yang sudah ada ke latar depan.",
          }
        : {
            en: "Background Job: resume a stopped Bash job in the background.",
            id: "Job Latar Belakang: lanjutkan job Bash yang berhenti sementara di latar belakang.",
          },
    explanation:
      name === "fg"
        ? {
            en: "fg is a Bash builtin, not a standalone executable. It brings an existing job to the foreground, gives it terminal access and resumes it if stopped. The shell normally waits for that foreground job. Use jobs to inspect the current shell's job table first. Unlike bg, fg keeps the job in the foreground.",
            id: "fg adalah builtin Bash, bukan program mandiri. Perintah ini membawa job yang sudah ada ke latar depan, memberinya akses terminal dan melanjutkannya bila berhenti sementara. Shell biasanya menunggu job latar depan itu. Gunakan jobs untuk memeriksa tabel job shell saat ini terlebih dahulu. Berbeda dengan bg, fg menempatkan job di latar depan.",
          }
        : {
            en: "bg is a Bash builtin that resumes an existing stopped job asynchronously. It does not create a new process by itself. Unlike launching a new command with &, the job must already exist in this shell's job table. Unlike fg, it does not give the job foreground terminal access. A program that needs terminal input can stop again.",
            id: "bg adalah builtin Bash yang melanjutkan job yang sudah berhenti sementara secara asinkron. Perintah ini tidak membuat proses baru sendiri. Berbeda dengan memulai perintah baru memakai &, job harus sudah ada dalam tabel job shell ini. Berbeda dengan fg, bg tidak memberi akses terminal latar depan. Program yang memerlukan masukan terminal bisa berhenti sementara lagi.",
          },
    syntax: `${name} [%job-number | %+ | %-]`,
    options: [],
    choices: [
      {
        id: "selection",
        label: { en: "Job selection", id: "Pilihan job" },
        description: {
          en: "Select a job in the current Bash session, not a process ID. The current job needs no explicit argument.",
          id: "Pilih job dalam sesi Bash saat ini, bukan ID proses. Job saat ini tidak memerlukan argumen eksplisit.",
        },
        defaultValue: "current",
        items: [
          {
            value: "current",
            label: { en: "Current job (default)", id: "Job saat ini (bawaan)" },
          },
          {
            value: "explicit-current",
            label: { en: "Current job (%+)", id: "Job saat ini (%+)" },
          },
          {
            value: "previous",
            label: { en: "Previous job (%-)", id: "Job sebelumnya (%-)" },
          },
          {
            value: "number",
            label: { en: "Specific job number", id: "Nomor job tertentu" },
          },
        ],
      },
    ],
    arguments: [
      {
        id: "jobNumber",
        label: { en: "Job number", id: "Nomor job" },
        required: true,
        placeholder: "1",
        when: { field: "selection", value: "number" },
        description: {
          en: "Positive number only, without %. Job existence is not verified. Leading zeroes are normalized.",
          id: "Hanya nomor positif, tanpa %. Keberadaan job tidak diverifikasi. Nol di awal dinormalisasi.",
        },
      },
    ],
    concepts: jobConcepts,
    shortcuts: jobShortcuts,
    warnings: jobNotes,
    examples: [
      {
        command: name,
        description: {
          en: "Select the current job.",
          id: "Pilih job saat ini.",
        },
      },
      {
        command: `${name} %1`,
        description: {
          en: "Select job 1 if it exists in this shell.",
          id: "Pilih job 1 bila ada dalam shell ini.",
        },
      },
      {
        command: `${name} %2`,
        description: {
          en: "Select job 2 if it exists in this shell.",
          id: "Pilih job 2 bila ada dalam shell ini.",
        },
      },
      {
        command: `${name} %+`,
        description: {
          en: "Explicitly select the current job.",
          id: "Pilih job saat ini secara eksplisit.",
        },
      },
      {
        command: `${name} %-`,
        description: {
          en: "Select the previous job.",
          id: "Pilih job sebelumnya.",
        },
      },
      ...jobWorkflows,
    ],
  };
}

export const fg = jobBuiltin("fg");
export const bg = jobBuiltin("bg");

export const background: CommandDefinition = {
  id: "background",
  name: "command &",
  kind: "shell-operator",
  category: "processes",
  form: { kind: "basic" },
  description: {
    en: "Background Execution: generate a literal command followed by the shell & operator.",
    id: "Eksekusi Latar Belakang: buat perintah literal diikuti operator shell &.",
  },
  explanation: {
    en: "This feature composes one executable and separate literal arguments, then appends the trusted & control operator. Background execution is always enabled here. & is shell syntax, not an executable named &. Arguments are quoted as data, so an argument containing & or $(...) does not become another command. The command is only generated as text and is never executed. Shell scripts, pipelines and redirection are outside this builder.",
    id: "Fitur ini menyusun satu program dan argumen literal terpisah, lalu menambahkan operator kontrol & yang tepercaya. Eksekusi latar belakang selalu aktif di sini. & adalah sintaks shell, bukan program bernama &. Argumen dikutip sebagai data, sehingga argumen berisi & atau $(...) tidak menjadi perintah lain. Perintah hanya dibuat sebagai teks dan tidak pernah dieksekusi. Skrip shell, pipeline, dan redirection di luar cakupan builder ini.",
  },
  syntax: "executable [literal-argument ...] &",
  options: [],
  arguments: [
    {
      id: "executable",
      required: true,
      placeholder: "sleep",
      label: { en: "Executable name or path", id: "Nama atau jalur program" },
      description: {
        en: "Enter one executable, not an entire command. Absolute or ./../ paths may include spaces; no shell operators, variables or substitutions. Existence is not checked.",
        id: "Masukkan satu program, bukan perintah lengkap. Jalur absolut atau ./../ boleh berisi spasi; tanpa operator shell, variabel, atau substitusi. Keberadaan tidak diperiksa.",
      },
    },
    {
      id: "arguments",
      required: false,
      multiple: true,
      allowWhitespace: true,
      placeholder: "120",
      label: { en: "Literal arguments", id: "Argumen literal" },
      addLabel: { en: "Add argument", id: "Tambah argumen" },
      removeLabel: { en: "Remove argument", id: "Hapus argumen" },
      description: {
        en: "One literal token per row, without shell quotes. One untouched empty row means no arguments; empty rows alongside other rows are empty arguments. Spaces and shell metacharacters remain literal.",
        id: "Satu token literal per baris, tanpa tanda kutip shell. Satu baris kosong bawaan berarti tanpa argumen; baris kosong bersama baris lain adalah argumen kosong. Spasi dan metakarakter shell tetap literal.",
      },
    },
  ],
  warnings: jobNotes,
  concepts: jobConcepts,
  shortcuts: jobShortcuts,
  examples: [
    {
      command: "sleep 120 &",
      description: {
        en: "Start a delay asynchronously.",
        id: "Mulai penundaan secara asinkron.",
      },
    },
    {
      command: "python3 server.py &",
      description: {
        en: "Launch a script in the background; this does not make it a persistent service.",
        id: "Mulai skrip di latar belakang; ini tidak menjadikannya layanan persisten.",
      },
    },
    {
      command: "npm run dev &",
      description: {
        en: "Launch a development command asynchronously; output may still appear in the terminal.",
        id: "Mulai perintah pengembangan secara asinkron; keluaran masih dapat muncul di terminal.",
      },
    },
    {
      command: "ping example.com &",
      description: {
        en: "Illustrate a background command that continues writing output.",
        id: "Contoh perintah latar belakang yang terus menulis keluaran.",
      },
    },
    ...jobWorkflows,
  ],
};
