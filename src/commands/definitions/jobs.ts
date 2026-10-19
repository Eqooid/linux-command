import type { CommandDefinition } from "../types";
import { processConcepts } from "../processLearning";

export const jobs: CommandDefinition = {
  id: "jobs",
  name: "jobs",
  kind: "builtin",
  category: "processes",
  form: { kind: "basic" },
  description: {
    en: "List jobs tracked by the current Bash shell.",
    id: "Tampilkan job yang dilacak shell Bash saat ini.",
  },
  explanation: {
    en: "jobs is a Bash builtin: its job table belongs to the shell session where it runs, not to the browser or every process on the machine. Foreground jobs normally use the terminal while the shell waits; background jobs let the shell continue accepting work. A job can contain several pipeline processes. Job identifiers such as %1 differ from PIDs and can refer to different jobs in another shell. -l includes PIDs; -p prints process-group leader IDs, not every process ID. -r selects running jobs and -s selects stopped jobs. fg brings a job to the foreground; bg continues it in the background. Non-interactive shells and disabled job control can behave differently. The fg and bg builders complement this reference; no builder executes shell commands or inspects jobs.",
    id: "jobs adalah builtin Bash: tabel job milik sesi shell tempat perintah berjalan, bukan browser atau setiap proses di mesin. Job latar depan biasanya memakai terminal sementara shell menunggu; job latar belakang membiarkan shell terus menerima pekerjaan. Satu job dapat berisi beberapa proses pipeline. ID job seperti %1 berbeda dari PID dan dapat menunjuk job berbeda di shell lain. -l menyertakan PID; -p mencetak ID pemimpin grup proses, bukan setiap ID proses. -r memilih job berjalan dan -s memilih job yang dihentikan sementara. fg membawa job ke latar depan; bg melanjutkannya di latar belakang. Shell non-interaktif dan kontrol job yang dinonaktifkan dapat berperilaku berbeda. Builder fg dan bg melengkapi referensi ini; tidak ada builder yang mengeksekusi perintah shell atau memeriksa job.",
  },
  syntax: "jobs [-l | -p] [-r | -s] [-- %job-number]",
  choices: [
    {
      id: "display",
      label: { en: "Job display", id: "Tampilan job" },
      description: {
        en: "Choose default text, long output with PIDs, or process-group leader IDs only.",
        id: "Pilih teks bawaan, keluaran panjang dengan PID, atau hanya ID pemimpin grup proses.",
      },
      defaultValue: "default",
      items: [
        {
          value: "default",
          label: { en: "Default listing", id: "Daftar bawaan" },
        },
        {
          value: "long",
          label: { en: "Include PIDs (-l)", id: "Sertakan PID (-l)" },
        },
        {
          value: "pids",
          label: {
            en: "Process-group leader IDs (-p)",
            id: "ID pemimpin grup proses (-p)",
          },
        },
      ],
    },
    {
      id: "state",
      label: { en: "Job state filter", id: "Filter keadaan job" },
      description: {
        en: "Running and stopped filters are alternatives in this beginner builder.",
        id: "Filter berjalan dan dihentikan sementara adalah alternatif dalam builder pemula ini.",
      },
      defaultValue: "all",
      items: [
        {
          value: "all",
          label: { en: "All tracked jobs", id: "Semua job yang dilacak" },
        },
        {
          value: "running",
          label: { en: "Running only (-r)", id: "Hanya berjalan (-r)" },
        },
        {
          value: "stopped",
          label: {
            en: "Stopped only (-s)",
            id: "Hanya dihentikan sementara (-s)",
          },
        },
      ],
    },
  ],
  options: [
    {
      id: "longDisplay",
      flag: "-l",
      choice: { field: "display", value: "long" },
      label: { en: "Long listing", id: "Daftar panjang" },
      description: {
        en: "Include process IDs with job status.",
        id: "Sertakan ID proses bersama status job.",
      },
    },
    {
      id: "pidDisplay",
      flag: "-p",
      choice: { field: "display", value: "pids" },
      label: { en: "Leader IDs", id: "ID pemimpin" },
      description: {
        en: "Print only each job's process-group leader ID.",
        id: "Cetak hanya ID pemimpin grup proses setiap job.",
      },
    },
    {
      id: "runningState",
      flag: "-r",
      choice: { field: "state", value: "running" },
      label: { en: "Running", id: "Berjalan" },
      description: {
        en: "Restrict output to running jobs.",
        id: "Batasi keluaran pada job berjalan.",
      },
    },
    {
      id: "stoppedState",
      flag: "-s",
      choice: { field: "state", value: "stopped" },
      label: { en: "Stopped", id: "Dihentikan sementara" },
      description: {
        en: "Restrict output to stopped jobs.",
        id: "Batasi keluaran pada job yang dihentikan sementara.",
      },
    },
  ],
  arguments: [
    {
      id: "jobspec",
      required: false,
      placeholder: "%1",
      label: { en: "Bash job specification", id: "Spesifikasi job Bash" },
      description: {
        en: "Optional positive numeric form such as %1 only; no names, current/previous shortcuts, or PIDs. Job existence is not verified.",
        id: "Hanya bentuk numerik positif opsional seperti %1; tanpa nama, pintasan saat ini/sebelumnya, atau PID. Keberadaan job tidak diverifikasi.",
      },
    },
  ],
  warnings: [
    {
      en: "Run manually in the same Bash session whose jobs you want to inspect. A new terminal or shell has a different job table. No shell state is accessed here.",
      id: "Jalankan secara manual dalam sesi Bash yang sama dengan job yang ingin diperiksa. Terminal atau shell baru memiliki tabel job berbeda. Keadaan shell tidak diakses di sini.",
    },
  ],
  concepts: processConcepts,
  examples: [
    {
      command: "jobs",
      description: {
        en: "List this shell's tracked jobs.",
        id: "Tampilkan job yang dilacak shell ini.",
      },
    },
    {
      command: "jobs -l",
      description: { en: "Include PIDs.", id: "Sertakan PID." },
    },
    {
      command: "jobs -p",
      description: {
        en: "Show process-group leader IDs only.",
        id: "Tampilkan hanya ID pemimpin grup proses.",
      },
    },
    {
      command: "jobs -r",
      description: { en: "Show running jobs.", id: "Tampilkan job berjalan." },
    },
    {
      command: "jobs -s",
      description: {
        en: "Show stopped jobs.",
        id: "Tampilkan job yang dihentikan sementara.",
      },
    },
    {
      command: "jobs %1",
      description: {
        en: "Select job 1 in this shell, without claiming it exists.",
        id: "Pilih job 1 dalam shell ini, tanpa mengklaim job tersebut ada.",
      },
    },
  ],
};
