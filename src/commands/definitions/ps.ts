import type { CommandDefinition } from "../types";
import {
  processConcepts,
  processPidArgument,
  processUserArgument,
} from "../processLearning";

export const ps: CommandDefinition = {
  id: "ps",
  name: "ps",
  category: "processes",
  form: { kind: "basic" },
  description: {
    en: "Build a snapshot listing of processes with presets or custom selection.",
    id: "Buat daftar cuplikan proses dengan preset atau seleksi khusus.",
  },
  explanation: {
    en: "ps prints a snapshot; top refreshes an interactive view. With no options, procps-ng ps normally selects processes with your effective UID on your controlling terminal, not every process on that terminal. -e selects all processes; -ef adds full-format fields; -ejH uses jobs format and hierarchy. BSD aux has no leading dash: a and x widen selection and u requests user-oriented output. It is not ps -aux, and mixing option styles can change defaults. Advanced mode keeps PID selection, effective-user selection, and allowlisted columns separate from display presets. PID/PPID identify a process/parent; USER identifies ownership, and STAT shows states such as R, S, D, T, or Z. No snapshot or process data is collected by this app.",
    id: "ps mencetak cuplikan; top menyegarkan tampilan interaktif. Tanpa opsi, ps procps-ng biasanya memilih proses dengan UID efektif Anda pada terminal pengendali, bukan setiap proses di terminal tersebut. -e memilih semua proses; -ef menambahkan kolom format lengkap; -ejH memakai format job dan hierarki. aux gaya BSD tidak memakai tanda hubung awal: a dan x memperluas seleksi dan u meminta keluaran berorientasi pengguna. Ini bukan ps -aux, dan mencampur gaya opsi dapat mengubah bawaan. Mode lanjutan memisahkan seleksi PID, pengguna efektif, dan kolom yang diizinkan dari preset tampilan. PID/PPID mengidentifikasi proses/induk; USER menunjukkan kepemilikan, dan STAT menunjukkan keadaan seperti R, S, D, T, atau Z. Aplikasi ini tidak mengumpulkan cuplikan atau data proses.",
  },
  syntax:
    "ps | ps -e | ps -ef | ps aux | ps -ejH | ps [-p pid,... | -u user] [-o columns]",
  choices: [
    {
      id: "mode",
      label: { en: "Process display preset", id: "Preset tampilan proses" },
      description: {
        en: "Choose one preset, or Advanced for PID/user selection and custom columns. Presets ignore stale advanced fields.",
        id: "Pilih satu preset, atau Lanjutan untuk seleksi PID/pengguna dan kolom khusus. Preset mengabaikan nilai lanjutan yang tidak aktif.",
      },
      defaultValue: "terminal",
      items: [
        {
          value: "terminal",
          label: { en: "Current terminal (ps)", id: "Terminal saat ini (ps)" },
        },
        {
          value: "all",
          label: { en: "All processes (-e)", id: "Semua proses (-e)" },
        },
        {
          value: "full",
          label: { en: "Detailed listing (-ef)", id: "Daftar rinci (-ef)" },
        },
        {
          value: "bsd",
          label: { en: "BSD-style listing (aux)", id: "Daftar gaya BSD (aux)" },
        },
        {
          value: "tree",
          label: {
            en: "Process hierarchy (-ejH)",
            id: "Hierarki proses (-ejH)",
          },
        },
        {
          value: "advanced",
          label: {
            en: "Advanced selection and columns",
            id: "Seleksi dan kolom lanjutan",
          },
        },
      ],
    },
  ],
  options: [],
  arguments: [
    {
      ...processPidArgument(false),
      when: { field: "mode", value: "advanced" },
    },
    { ...processUserArgument, when: { field: "mode", value: "advanced" } },
    {
      id: "columns",
      required: false,
      placeholder: "pid,ppid,user,stat,cmd",
      when: { field: "mode", value: "advanced" },
      label: { en: "Output columns (-o)", id: "Kolom keluaran (-o)" },
      description: {
        en: "Optional comma-separated allowlist: pid, ppid, user, stat, cmd, comm, pcpu, pmem, etime, tty. No spaces, duplicates, header overrides, or expressions. Without a PID/user filter, default process selection remains.",
        id: "Daftar opsional dipisahkan koma: pid, ppid, user, stat, cmd, comm, pcpu, pmem, etime, tty. Tanpa spasi, duplikasi, penggantian judul, atau ekspresi. Tanpa filter PID/pengguna, seleksi proses bawaan tetap berlaku.",
      },
    },
  ],
  warnings: [
    {
      en: "Output depends on procps-ng version, personality, permissions, namespaces, and the instant ps runs. PIDs and users are not verified; the browser never reads real processes.",
      id: "Keluaran bergantung pada versi procps-ng, personality, izin, namespace, dan saat ps berjalan. PID dan pengguna tidak diverifikasi; browser tidak membaca proses sebenarnya.",
    },
  ],
  concepts: processConcepts,
  examples: [
    {
      command: "ps",
      description: {
        en: "Default effective-user/terminal selection.",
        id: "Seleksi pengguna efektif/terminal bawaan.",
      },
    },
    {
      command: "ps -e",
      description: { en: "Select all processes.", id: "Pilih semua proses." },
    },
    {
      command: "ps -ef",
      description: {
        en: "All processes in full format.",
        id: "Semua proses dalam format lengkap.",
      },
    },
    {
      command: "ps aux",
      description: {
        en: "Use BSD selection and user-oriented formatting, without a leading dash.",
        id: "Gunakan seleksi BSD dan format berorientasi pengguna, tanpa tanda hubung awal.",
      },
    },
    {
      command: "ps -ejH",
      description: {
        en: "Jobs-format hierarchical display.",
        id: "Tampilan hierarki berformat job.",
      },
    },
    {
      command: "ps -p 1234,5678",
      description: {
        en: "Select two numeric PIDs; existence is not checked here.",
        id: "Pilih dua PID numerik; keberadaan tidak diperiksa di sini.",
      },
    },
    {
      command: "ps -u root",
      description: {
        en: "Select processes by effective user.",
        id: "Pilih proses menurut pengguna efektif.",
      },
    },
    {
      command: "ps -o pid,ppid,user,stat,cmd",
      description: {
        en: "Choose columns without widening the default selection.",
        id: "Pilih kolom tanpa memperluas seleksi bawaan.",
      },
    },
  ],
};
