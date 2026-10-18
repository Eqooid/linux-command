import type { BilingualText, CommandArgument } from "./types";

export const processConcepts: {
  term: BilingualText;
  description: BilingualText;
}[] = [
  {
    term: { en: "Process", id: "Proses" },
    description: {
      en: "A running instance of a program, with its own execution context and resources.",
      id: "Instans program yang berjalan, dengan konteks eksekusi dan sumber dayanya sendiri.",
    },
  },
  {
    term: { en: "PID and PPID", id: "PID dan PPID" },
    description: {
      en: "PID identifies a process; PPID identifies its parent. PIDs can be reused after a process exits, so an old PID may refer to something different later.",
      id: "PID mengidentifikasi proses; PPID mengidentifikasi induknya. PID dapat digunakan kembali setelah proses berakhir, sehingga PID lama dapat menunjuk proses berbeda kemudian.",
    },
  },
  {
    term: { en: "Process owner", id: "Pemilik proses" },
    description: {
      en: "Processes have real and effective user identities. These builders' -u filters select the effective user, not necessarily the original login account.",
      id: "Proses memiliki identitas pengguna nyata dan efektif. Filter -u builder ini memilih pengguna efektif, bukan selalu akun login awal.",
    },
  },
  {
    term: { en: "Common process states", id: "Keadaan proses umum" },
    description: {
      en: "R: running/runnable; S: interruptible sleep; D: uninterruptible sleep, often waiting for I/O; T: stopped; Z: zombie, already exited but awaiting collection by its parent. A zombie is not a running program to terminate again.",
      id: "R: berjalan/siap berjalan; S: tidur yang dapat diinterupsi; D: tidur yang tidak dapat diinterupsi, sering menunggu I/O; T: dihentikan sementara; Z: zombie, sudah berakhir tetapi menunggu induknya mengambil status. Zombie bukan program berjalan yang perlu diakhiri lagi.",
    },
  },
  {
    term: { en: "Signal", id: "Sinyal" },
    description: {
      en: "A notification to a process. Signals can request termination, interrupt, stop, continue, or trigger program-specific handling. Permission and current state affect delivery and response.",
      id: "Pemberitahuan ke proses. Sinyal dapat meminta penghentian, interupsi, berhenti sementara, melanjutkan, atau penanganan khusus program. Izin dan keadaan saat ini memengaruhi pengiriman dan respons.",
    },
  },
  {
    term: {
      en: "Foreground and background",
      id: "Latar depan dan latar belakang",
    },
    description: {
      en: "The terminal's foreground process group normally receives keyboard input/signals. Background jobs let the shell accept more work, but may be stopped when attempting terminal input.",
      id: "Grup proses latar depan terminal biasanya menerima input/sinyal keyboard. Job latar belakang membiarkan shell menerima pekerjaan lain, tetapi dapat dihentikan sementara saat mencoba membaca terminal.",
    },
  },
  {
    term: { en: "Shell job", id: "Job shell" },
    description: {
      en: "A shell tracks its own jobs, which can contain multiple processes. A job ID such as %1 is local to that shell and is different from a PID. fg brings a job forward; bg resumes it in the background. Those builders are not included here.",
      id: "Shell melacak job miliknya, yang dapat berisi beberapa proses. ID job seperti %1 bersifat lokal pada shell itu dan berbeda dari PID. fg membawa job ke depan; bg melanjutkannya di latar belakang. Builder tersebut tidak disertakan di sini.",
    },
  },
  {
    term: {
      en: "Graceful versus forced termination",
      id: "Penghentian tertib versus paksa",
    },
    description: {
      en: "SIGTERM allows a program to handle the request and clean up. SIGKILL cannot be caught, blocked, or ignored and prevents application cleanup, though kernel state may delay exit. Neither static validation nor a signal command guarantees a particular outcome.",
      id: "SIGTERM memungkinkan program menangani permintaan dan membersihkan sumber daya. SIGKILL tidak dapat ditangkap, diblokir, atau diabaikan dan mencegah pembersihan aplikasi, meskipun keadaan kernel dapat menunda proses berakhir. Validasi statis maupun perintah sinyal tidak menjamin hasil tertentu.",
    },
  },
];

export function processPidArgument(required: boolean): CommandArgument {
  return {
    id: "pids",
    required,
    multiple: true,
    placeholder: "1234",
    label: { en: "Process IDs", id: "ID proses" },
    addLabel: { en: "Add PID", id: "Tambah PID" },
    removeLabel: { en: "Remove PID", id: "Hapus PID" },
    description: {
      en: required
        ? "One positive PID per row. Zero and negative values are rejected to exclude process-group targets. No process is checked."
        : "Optional: leave the single row empty for no PID filter. Add one positive PID per row; added rows cannot be blank. Do not combine with a user filter.",
      id: required
        ? "Satu PID positif per baris. Nol dan nilai negatif ditolak untuk mengecualikan tujuan grup proses. Proses tidak diperiksa."
        : "Opsional: kosongkan satu baris untuk tanpa filter PID. Tambahkan satu PID positif per baris; baris tambahan tidak boleh kosong. Jangan gabungkan dengan filter pengguna.",
    },
  };
}
export const processUserArgument: CommandArgument = {
  id: "username",
  required: false,
  placeholder: "alice",
  label: { en: "Effective username (-u)", id: "Nama pengguna efektif (-u)" },
  description: {
    en: "Optional common account name. No numeric ID, user list, or special filter syntax; account existence and process ownership are not verified.",
    id: "Nama akun umum opsional. Tanpa ID angka, daftar pengguna, atau sintaks filter khusus; keberadaan akun dan kepemilikan proses tidak diverifikasi.",
  },
};
