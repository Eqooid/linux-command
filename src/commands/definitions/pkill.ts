import type { CommandDefinition } from "../types";
import { processConcepts, processUserArgument } from "../processLearning";
import { signalChoice, signalOptions } from "../processes";

export const pkill: CommandDefinition = {
  id: "pkill",
  name: "pkill",
  category: "processes",
  form: { kind: "basic" },
  description: {
    en: "Generate a signal request using a process-matching regex.",
    id: "Buat permintaan sinyal memakai regex pencocokan proses.",
  },
  explanation: {
    en: "Unlike kill's explicit PID targets, procps-ng pkill selects processes using an extended regular expression and optional criteria. It can affect multiple processes. Default name matching uses a process name typically limited to 15 characters; -f matches the full command line instead. -x requires the whole selected name or command line to match, but the pattern is still a regex, not guaranteed literal text. -u restricts effective user, -i ignores case, and -e echoes names/PIDs while still sending the signal: it is not a dry run. pgrep with corresponding criteria can help inspect potential matches in a terminal before pkill, but processes can change between inspection and signaling. No pgrep builder, regex evaluation, target inspection, or signaling is implemented here.",
    id: "Berbeda dari tujuan PID eksplisit kill, pkill procps-ng memilih proses memakai ekspresi reguler extended dan kriteria opsional. Ini dapat memengaruhi beberapa proses. Pencocokan nama bawaan memakai nama proses yang biasanya terbatas 15 karakter; -f mencocokkan seluruh baris perintah. -x mewajibkan seluruh nama atau baris perintah terpilih cocok, tetapi pola tetap regex, bukan teks literal yang dijamin. -u membatasi pengguna efektif, -i mengabaikan huruf besar/kecil, dan -e menampilkan nama/PID sambil tetap mengirim sinyal: ini bukan uji coba tanpa tindakan. pgrep dengan kriteria terkait dapat membantu memeriksa calon kecocokan di terminal sebelum pkill, tetapi proses dapat berubah antara pemeriksaan dan pemberian sinyal. Builder pgrep, evaluasi regex, pemeriksaan tujuan, atau pengiriman sinyal tidak diimplementasikan di sini.",
  },
  syntax: "pkill -SIGNAL [-f] [-x] [-i] [-e] [-u user] -- pattern",
  choices: [signalChoice],
  options: [
    ...signalOptions,
    {
      id: "full",
      flag: "-f",
      label: {
        en: "Match full command line",
        id: "Cocokkan seluruh baris perintah",
      },
      description: {
        en: "Match full command-line text, which can affect more processes, including wrappers or unrelated programs with matching arguments.",
        id: "Cocokkan teks baris perintah lengkap, yang dapat memengaruhi lebih banyak proses, termasuk pembungkus atau program lain dengan argumen cocok.",
      },
    },
    {
      id: "exact",
      flag: "-x",
      label: {
        en: "Require a whole-string match",
        id: "Wajib cocok seluruh string",
      },
      description: {
        en: "Require the regex to match the complete process name, or complete command line with -f. Regex metacharacters remain active.",
        id: "Wajibkan regex cocok dengan seluruh nama proses, atau seluruh baris perintah bersama -f. Metakarakter regex tetap aktif.",
      },
    },
    {
      id: "ignoreCase",
      flag: "-i",
      label: { en: "Ignore case", id: "Abaikan huruf besar/kecil" },
      description: {
        en: "Use case-insensitive regex matching.",
        id: "Gunakan pencocokan regex tanpa membedakan huruf besar/kecil.",
      },
    },
    {
      id: "echo",
      flag: "-e",
      label: {
        en: "Echo signaled processes",
        id: "Tampilkan proses yang diberi sinyal",
      },
      description: {
        en: "Print process names and PIDs while signaling. This does not preview or prevent the action.",
        id: "Cetak nama proses dan PID sambil memberi sinyal. Ini tidak mempratinjau atau mencegah tindakan.",
      },
    },
  ],
  arguments: [
    {
      id: "pattern",
      required: true,
      placeholder: "nginx",
      label: {
        en: "Process pattern (extended regex)",
        id: "Pola proses (regex extended)",
      },
      description: {
        en: "Enter one nonblank, single-line pattern without shell quotes. It stays one shell argument, even with spaces or a leading hyphen. GNU/procps regex validity is not checked using JavaScript regex.",
        id: "Masukkan satu pola satu baris yang tidak kosong tanpa kutip shell. Pola tetap satu argumen shell, meski berisi spasi atau tanda hubung awal. Validitas regex GNU/procps tidak diperiksa memakai regex JavaScript.",
      },
    },
    processUserArgument,
  ],
  concepts: processConcepts,
  warnings: [
    {
      en: "Multiple processes may match; broad or unexpected regex matches can disrupt the system. Exact matching does not make a regex literal, and echo (-e) still sends signals. No targets or regex results are verified. The app never sends a signal or adds sudo.",
      id: "Beberapa proses dapat cocok; kecocokan regex yang luas atau tidak terduga dapat mengganggu sistem. Pencocokan penuh tidak membuat regex literal, dan echo (-e) tetap mengirim sinyal. Tujuan atau hasil regex tidak diverifikasi. Aplikasi tidak mengirim sinyal atau menambahkan sudo.",
    },
  ],
  examples: [
    {
      command: "pkill nginx",
      description: {
        en: "Default SIGTERM with a regex process-name pattern.",
        id: "SIGTERM bawaan dengan pola regex nama proses.",
      },
    },
    {
      command: "pkill -TERM nginx",
      description: {
        en: "Make the termination request explicit.",
        id: "Tuliskan permintaan penghentian secara eksplisit.",
      },
    },
    {
      command: "pkill -x nginx",
      description: {
        en: "Match the entire process name.",
        id: "Cocokkan seluruh nama proses.",
      },
    },
    {
      command: "pkill -f 'node server.js'",
      description: {
        en: "Match full command-line regex; the dot still has regex meaning.",
        id: "Cocokkan regex baris perintah lengkap; titik tetap memiliki makna regex.",
      },
    },
    {
      command: "pkill -u alice firefox",
      description: {
        en: "Restrict matching to effective user alice.",
        id: "Batasi pencocokan pada pengguna efektif alice.",
      },
    },
    {
      command: "pkill -KILL -x stuck-process",
      description: {
        en: "Forced signal with whole-name regex matching, requiring careful review.",
        id: "Sinyal paksa dengan pencocokan regex seluruh nama, memerlukan pemeriksaan teliti.",
      },
    },
  ],
};
