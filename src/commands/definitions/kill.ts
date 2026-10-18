import type { CommandDefinition } from "../types";
import { processConcepts, processPidArgument } from "../processLearning";
import { signalChoice, signalOptions } from "../processes";

export const kill: CommandDefinition = {
  id: "kill",
  name: "kill",
  category: "processes",
  form: { kind: "basic" },
  description: {
    en: "Generate a signal request for one or more positive PIDs.",
    id: "Buat permintaan sinyal untuk satu atau beberapa PID positif.",
  },
  explanation: {
    en: "kill sends a signal; it does not always terminate a process. SIGTERM requests graceful termination, allowing cleanup if the program handles it. SIGKILL cannot be caught, blocked, or ignored, prevents application cleanup, and may still wait for kernel state to allow exit. Prefer a graceful request when appropriate. SIGINT interrupts; SIGHUP may terminate or trigger a reload according to the program. SIGSTOP pauses execution without cleanup/termination, and SIGCONT resumes a stopped process. PIDs can be reused; recheck the intended target before manually sending a signal. kill may be a shell builtin or external utility, so supported behavior can differ. This builder emits named Linux signals and excludes zero/negative process-group operands.",
    id: "kill mengirim sinyal; tidak selalu mengakhiri proses. SIGTERM meminta penghentian tertib, memungkinkan pembersihan jika program menanganinya. SIGKILL tidak dapat ditangkap, diblokir, atau diabaikan, mencegah pembersihan aplikasi, dan mungkin tetap menunggu keadaan kernel mengizinkan proses berakhir. Utamakan permintaan tertib jika sesuai. SIGINT menginterupsi; SIGHUP dapat mengakhiri atau memicu pemuatan ulang sesuai program. SIGSTOP menjeda eksekusi tanpa pembersihan/pengakhiran, dan SIGCONT melanjutkan proses yang dihentikan sementara. PID dapat digunakan kembali; periksa ulang tujuan sebelum mengirim sinyal secara manual. kill dapat berupa builtin shell atau utilitas eksternal, sehingga perilaku yang didukung dapat berbeda. Builder ini menghasilkan nama sinyal Linux dan mengecualikan operan nol/negatif untuk grup proses.",
  },
  syntax: "kill -SIGNAL -- positive-pid...",
  choices: [signalChoice],
  options: signalOptions,
  arguments: [processPidArgument(true)],
  concepts: processConcepts,
  warnings: [
    {
      en: "Signals can stop services, discard unsaved work, or destabilize the system. PID reuse can affect a different process later. This app neither checks targets/permissions nor sends signals. No automatic sudo or SIGKILL is added.",
      id: "Sinyal dapat menghentikan layanan, membuang pekerjaan yang belum disimpan, atau mengganggu kestabilan sistem. Penggunaan ulang PID dapat memengaruhi proses lain kemudian. Aplikasi ini tidak memeriksa tujuan/izin atau mengirim sinyal. sudo atau SIGKILL tidak ditambahkan secara otomatis.",
    },
  ],
  examples: [
    {
      command: "kill 1234",
      description: {
        en: "Implicit SIGTERM; the builder makes the signal explicit.",
        id: "SIGTERM implisit; builder menuliskan sinyal secara eksplisit.",
      },
    },
    {
      command: "kill -TERM 1234",
      description: {
        en: "Request graceful termination.",
        id: "Minta penghentian tertib.",
      },
    },
    {
      command: "kill -KILL 1234",
      description: {
        en: "Force termination without application cleanup; review the risk.",
        id: "Paksa penghentian tanpa pembersihan aplikasi; periksa risikonya.",
      },
    },
    {
      command: "kill -INT 1234",
      description: { en: "Send an interrupt.", id: "Kirim interupsi." },
    },
    {
      command: "kill -STOP 1234",
      description: {
        en: "Stop execution without terminating.",
        id: "Hentikan sementara eksekusi tanpa mengakhiri.",
      },
    },
    {
      command: "kill -CONT 1234",
      description: {
        en: "Resume a stopped process.",
        id: "Lanjutkan proses yang dihentikan sementara.",
      },
    },
    {
      command: "kill -TERM 1234 5678",
      description: {
        en: "Send a request to two explicit PIDs.",
        id: "Kirim permintaan ke dua PID eksplisit.",
      },
    },
  ],
};
