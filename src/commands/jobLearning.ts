import type { CommandDefinition } from "./types";

export const jobConcepts: NonNullable<CommandDefinition["concepts"]> = [
  {
    term: {
      en: "Foreground and background",
      id: "Latar depan dan latar belakang",
    },
    description: {
      en: "A foreground job normally owns the terminal while the shell waits. An asynchronous background job lets the shell accept another command, but can still write to the terminal. Programs needing terminal input may stop or behave unexpectedly.",
      id: "Job latar depan biasanya menguasai terminal sementara shell menunggu. Job asinkron di latar belakang memungkinkan shell menerima perintah lain, tetapi masih bisa menulis ke terminal. Program yang memerlukan masukan terminal dapat berhenti sementara atau berperilaku tidak terduga.",
    },
  },
  {
    term: { en: "Shell job versus PID", id: "Job shell dibandingkan PID" },
    description: {
      en: "A job is tracked in one shell's job table and may contain several processes. %1 is job number 1 in that shell, not PID 1. Use jobs to inspect that shell's table; the browser never reads it. A new job is not guaranteed to receive number 1.",
      id: "Job dilacak dalam tabel job satu shell dan dapat berisi beberapa proses. %1 adalah job nomor 1 dalam shell itu, bukan PID 1. Gunakan jobs untuk memeriksa tabel shell tersebut; browser tidak pernah membacanya. Job baru tidak selalu mendapat nomor 1.",
    },
  },
  {
    term: { en: "Job specifications", id: "Spesifikasi job" },
    description: {
      en: "%1 and %2 select numbered jobs; %+ selects the current job and %- the previous job. fg and bg without an argument use the current job. These selections are session-specific and do not prove a job exists.",
      id: "%1 dan %2 memilih job bernomor; %+ memilih job saat ini dan %- job sebelumnya. fg dan bg tanpa argumen memakai job saat ini. Pilihan ini khusus sesi dan tidak membuktikan keberadaan job.",
    },
  },
  {
    term: {
      en: "Stopped versus running",
      id: "Berhenti sementara dibandingkan berjalan",
    },
    description: {
      en: "A stopped job is suspended, not finished. bg resumes an existing stopped job asynchronously without creating a new process itself. fg brings an existing job forward and resumes it if stopped. Both normally require Bash job control to be enabled.",
      id: "Job yang dihentikan sementara ditangguhkan, bukan selesai. bg melanjutkan job yang sudah berhenti sementara secara asinkron tanpa membuat proses baru sendiri. fg membawa job yang sudah ada ke latar depan dan melanjutkannya bila berhenti sementara. Keduanya biasanya memerlukan kontrol job Bash yang aktif.",
    },
  },
  {
    term: { en: "The & operator", id: "Operator &" },
    description: {
      en: "& is a shell control operator, not an executable. It starts a command asynchronously, unlike bg which resumes an existing job. The shell can return a prompt immediately. This is not daemonization, a persistent service, or a guarantee of survival after terminal logout; behavior depends on the shell and environment.",
      id: "& adalah operator kontrol shell, bukan program. Operator ini memulai perintah secara asinkron, berbeda dengan bg yang melanjutkan job yang sudah ada. Shell dapat segera menampilkan prompt. Ini bukan daemonisasi, layanan persisten, atau jaminan tetap hidup setelah keluar dari terminal; perilaku bergantung pada shell dan lingkungan.",
    },
  },
];

export const jobShortcuts: NonNullable<CommandDefinition["shortcuts"]> = {
  description: {
    en: "Terminal key presses, not commands generated or performed by this application. Behavior depends on terminal settings and the program.",
    id: "Penekanan tombol terminal, bukan perintah yang dibuat atau dilakukan aplikasi ini. Perilaku bergantung pada pengaturan terminal dan program.",
  },
  items: [
    {
      keys: "Ctrl + Z",
      description: {
        en: "Typically suspend the foreground job (SIGTSTP), then inspect jobs and resume with fg or bg.",
        id: "Biasanya menangguhkan job latar depan (SIGTSTP), lalu periksa jobs dan lanjutkan dengan fg atau bg.",
      },
    },
    {
      keys: "Ctrl + C",
      description: {
        en: "Typically send SIGINT to the foreground process group; programs may handle or ignore it.",
        id: "Biasanya mengirim SIGINT ke grup proses latar depan; program dapat menangani atau mengabaikannya.",
      },
    },
  ],
};

export const jobWorkflows: CommandDefinition["examples"] = [
  {
    command: "sleep 120 &\njobs\nfg %1",
    description: {
      en: "Manual steps: launch in the background, inspect jobs, then bring the selected job forward. Replace %1 with the actual job shown by jobs; number 1 is only an example.",
      id: "Langkah manual: mulai di latar belakang, periksa jobs, lalu bawa job terpilih ke latar depan. Ganti %1 dengan job sebenarnya yang ditampilkan jobs; nomor 1 hanya contoh.",
    },
  },
  {
    command: "sleep 120\n# Ctrl + Z\njobs\nbg %1\nfg %1",
    description: {
      en: "Run the first line, press Ctrl + Z in the terminal, then enter the remaining commands separately in that same Bash session. The # line describes a key press, not an automatically executed command. Use the actual job number. Nothing is executed here.",
      id: "Jalankan baris pertama, tekan Ctrl + Z di terminal, lalu masukkan perintah berikutnya secara terpisah dalam sesi Bash yang sama. Baris # menjelaskan penekanan tombol, bukan perintah yang dijalankan otomatis. Gunakan nomor job sebenarnya. Tidak ada yang dieksekusi di sini.",
    },
  },
];

export const jobNotes: CommandDefinition["warnings"] = [
  {
    en: "Generate text only. Run manually in the same Bash session with job control enabled. No job existence, running state, permissions, or terminal behavior is checked; this application never starts or resumes a process.",
    id: "Hanya membuat teks. Jalankan secara manual dalam sesi Bash yang sama dengan kontrol job aktif. Keberadaan job, keadaan berjalan, izin, dan perilaku terminal tidak diperiksa; aplikasi ini tidak pernah memulai atau melanjutkan proses.",
  },
];
