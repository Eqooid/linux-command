import type {
  CommandArgument,
  CommandChoice,
  CommandDefinition,
  CommandOption,
} from "../types";
import { priorities } from "../systemd";
import {
  systemdComparison,
  systemdConcepts,
  troubleshootingExample,
} from "../systemdLearning";

function timeChoice(edge: "since" | "until"): CommandChoice {
  return {
    id: `${edge}Mode`,
    label:
      edge === "since"
        ? { en: "Since filter", id: "Filter sejak" }
        : { en: "Until filter", id: "Filter hingga" },
    description: {
      en: "Choose a structured local timestamp or a supported relative expression. Relative values are interpreted by the target Linux machine, never resolved against this browser's clock.",
      id: "Pilih waktu lokal terstruktur atau ekspresi relatif yang didukung. Nilai relatif ditafsirkan oleh mesin Linux tujuan, tidak pernah dihitung terhadap jam browser ini.",
    },
    defaultValue: "none",
    items: [
      {
        value: "none",
        label: { en: "No time boundary", id: "Tanpa batas waktu" },
      },
      {
        value: "absolute",
        label: {
          en: "Structured local date/time",
          id: "Tanggal/waktu lokal terstruktur",
        },
      },
      {
        value: "relative",
        label: {
          en: "Simple relative expression",
          id: "Ekspresi relatif sederhana",
        },
      },
    ],
  };
}
function timeArgument(edge: "since" | "until"): CommandArgument {
  return {
    id: edge,
    required: true,
    when: { field: `${edge}Mode`, value: "none", not: true },
    placeholder: "2026-10-20 08:00:00",
    label:
      edge === "since"
        ? { en: "Since value", id: "Nilai sejak" }
        : { en: "Until value", id: "Nilai hingga" },
    description: {
      en: "Structured: YYYY-MM-DD HH:mm:ss, without quotes or a timezone suffix. Relative: today, yesterday, tomorrow, now, or N seconds/minutes/hours/days/weeks ago (1–999999). Keywords remain English systemd syntax. This builder does not parse all systemd time expressions or resolve server time zones.",
      id: "Terstruktur: YYYY-MM-DD HH:mm:ss, tanpa kutip atau akhiran zona waktu. Relatif: today, yesterday, tomorrow, now, atau N seconds/minutes/hours/days/weeks ago (1–999999). Kata kunci tetap sintaks systemd berbahasa Inggris. Builder ini tidak mengurai semua ekspresi waktu systemd atau menentukan zona waktu server.",
    },
  };
}
const timeOptions: CommandOption[] = (["since", "until"] as const).map(
  (edge) => ({
    id: `${edge}Option`,
    flag: `--${edge}`,
    when: { field: `${edge}Mode`, value: "none", not: true },
    argument: edge,
    label:
      edge === "since"
        ? { en: "Inclusive start time", id: "Waktu awal inklusif" }
        : { en: "Inclusive end time", id: "Waktu akhir inklusif" },
    description: {
      en: "Pass the selected time expression as one quoted argument. Relative mode uses the same option; comparable structured bounds are checked in the browser without resolving Linux server time.",
      id: "Kirim ekspresi waktu terpilih sebagai satu argumen berkutip. Mode relatif memakai opsi yang sama; batas terstruktur yang dapat dibandingkan diperiksa di browser tanpa menentukan waktu server Linux.",
    },
  }),
);

export const journalctl: CommandDefinition = {
  id: "journalctl",
  name: "journalctl",
  category: "services",
  description: {
    en: "Build systemd journal filters for units, time ranges, priorities and boots.",
    id: "Susun filter jurnal systemd untuk unit, rentang waktu, prioritas, dan boot.",
  },
  explanation: {
    en: "journalctl reads structured systemd journal records. The default command shows accessible records from oldest to newest, usually through a pager. -u filters unit metadata, -n selects recent entries, and -f follows newly arriving records until interrupted. Different filters narrow the selected records together. A priority includes that severity and more severe levels. -b selects boot records; old boots require retained logs. System/user scope changes which journals and unit metadata are selected. Time expressions are quoted literal arguments to journalctl, not shell expressions; structured ranges are checked as local civil times without consulting a server. This app does not read, simulate, or stream logs.",
    id: "journalctl membaca catatan jurnal systemd terstruktur. Perintah bawaan menampilkan catatan yang dapat diakses dari terlama ke terbaru, biasanya melalui pager. -u memfilter metadata unit, -n memilih entri terbaru, dan -f mengikuti catatan baru hingga diinterupsi. Filter berbeda mempersempit catatan terpilih bersama-sama. Satu prioritas mencakup tingkat tersebut dan tingkat yang lebih parah. -b memilih catatan boot; boot lama memerlukan log yang masih tersimpan. Cakupan sistem/pengguna mengubah jurnal dan metadata unit yang dipilih. Ekspresi waktu adalah argumen literal berkutip untuk journalctl, bukan ekspresi shell; rentang terstruktur diperiksa sebagai waktu lokal tanpa menghubungi server. Aplikasi ini tidak membaca, menyimulasikan, atau melakukan streaming log.",
  },
  syntax:
    "journalctl [--system | --user] [-u unit] [-n N] [-f | -r] [-b [offset]] [-p priority] [--since time] [--until time] [-o format] [--no-pager]",
  form: {
    kind: "grouped",
    groups: [
      {
        id: "source",
        title: { en: "Journal and unit", id: "Jurnal dan unit" },
        fields: ["scope", "unit"],
      },
      {
        id: "range",
        title: {
          en: "Log range and priority",
          id: "Rentang log dan prioritas",
        },
        fields: ["count", "follow", "boot", "bootOffset", "priority"],
      },
      {
        id: "time",
        title: { en: "Advanced time filters", id: "Filter waktu lanjutan" },
        fields: ["sinceMode", "since", "untilMode", "until"],
        advanced: true,
      },
      {
        id: "format",
        title: { en: "Output options", id: "Opsi keluaran" },
        fields: ["output", "reverse", "noPager"],
      },
    ],
  },
  choices: [
    {
      id: "scope",
      label: { en: "Journal scope", id: "Cakupan jurnal" },
      description: {
        en: "Default means all accessible journals, not system-only. --system limits system/kernel records; --user selects the current user's service journals and interprets -u as a user unit. Access depends on policy and persistent logging configuration.",
        id: "Bawaan berarti semua jurnal yang dapat diakses, bukan hanya sistem. --system membatasi catatan sistem/kernel; --user memilih jurnal layanan pengguna saat ini dan menafsirkan -u sebagai unit pengguna. Akses bergantung pada kebijakan dan konfigurasi penyimpanan log persisten.",
      },
      defaultValue: "default",
      items: [
        {
          value: "default",
          label: {
            en: "Default: all accessible journals",
            id: "Bawaan: semua jurnal yang dapat diakses",
          },
        },
        {
          value: "system",
          label: {
            en: "System journal (--system)",
            id: "Jurnal sistem (--system)",
          },
        },
        {
          value: "user",
          label: {
            en: "User journal (--user)",
            id: "Jurnal pengguna (--user)",
          },
        },
      ],
    },
    {
      id: "boot",
      label: { en: "Boot filter", id: "Filter boot" },
      description: {
        en: "Default leaves journalctl's boot behavior unchanged: follow mode implies the current boot. All boots explicitly uses --boot=all. Current uses -b; previous uses -b -1. For custom offsets, zero/negative count from newest stored boot, positive from oldest (1 = oldest). Old records may be unavailable.",
        id: "Bawaan mempertahankan perilaku boot journalctl: mode ikuti menyiratkan boot saat ini. Semua boot memakai --boot=all secara eksplisit. Saat ini memakai -b; sebelumnya memakai -b -1. Untuk offset kustom, nol/negatif dihitung dari boot tersimpan terbaru, positif dari terlama (1 = terlama). Catatan lama mungkin tidak tersedia.",
      },
      defaultValue: "default",
      items: [
        {
          value: "default",
          label: { en: "Default boot behavior", id: "Perilaku boot bawaan" },
        },
        {
          value: "all",
          label: { en: "All available boots", id: "Semua boot tersedia" },
        },
        {
          value: "current",
          label: { en: "Current boot (-b)", id: "Boot saat ini (-b)" },
        },
        {
          value: "previous",
          label: { en: "Previous boot (-b -1)", id: "Boot sebelumnya (-b -1)" },
        },
        {
          value: "custom",
          label: { en: "Custom boot offset", id: "Offset boot kustom" },
        },
      ],
    },
    {
      id: "priority",
      label: { en: "Maximum priority level", id: "Batas tingkat prioritas" },
      description: {
        en: "Include the selected severity and all more severe levels. err means emerg, alert, crit and err.",
        id: "Sertakan tingkat terpilih dan semua tingkat yang lebih parah. err berarti emerg, alert, crit, dan err.",
      },
      defaultValue: "all",
      items: [
        {
          value: "all",
          label: { en: "All priorities", id: "Semua prioritas" },
        },
        ...priorities.map((value) => ({
          value,
          label: { en: value, id: value },
        })),
      ],
    },
    timeChoice("since"),
    timeChoice("until"),
    {
      id: "output",
      label: { en: "Output format", id: "Format keluaran" },
      description: {
        en: "short: readable default; short-iso: ISO-style timestamps; cat: message only; json: structured records. Formats affect output, not which records match.",
        id: "short: bawaan terbaca; short-iso: waktu bergaya ISO; cat: hanya pesan; json: catatan terstruktur. Format memengaruhi keluaran, bukan catatan yang cocok.",
      },
      defaultValue: "short",
      items: ["short", "short-iso", "cat", "json"].map((value) => ({
        value,
        label: { en: value, id: value },
      })),
    },
  ],
  options: [
    {
      id: "follow",
      flag: "-f",
      label: { en: "Follow new records", id: "Ikuti catatan baru" },
      description: {
        en: "Wait for new entries until interrupted in the terminal (usually Ctrl + C). Incompatible with reverse ordering. No logs stream in this app.",
        id: "Tunggu entri baru hingga diinterupsi di terminal (biasanya Ctrl + C). Tidak kompatibel dengan urutan terbalik. Tidak ada streaming log dalam aplikasi ini.",
      },
    },
    {
      id: "reverse",
      flag: "-r",
      label: { en: "Newest entries first", id: "Entri terbaru lebih dahulu" },
      description: {
        en: "Reverse chronological output; cannot be combined with follow mode.",
        id: "Keluaran kronologis terbalik; tidak dapat digabung dengan mode ikuti.",
      },
    },
    {
      id: "noPager",
      flag: "--no-pager",
      label: { en: "Disable pager", id: "Nonaktifkan pager" },
      description: {
        en: "Print directly instead of opening a pager. Large output may fill the terminal.",
        id: "Cetak langsung tanpa membuka pager. Keluaran besar dapat memenuhi terminal.",
      },
    },
    ...timeOptions,
    {
      id: "unitOption",
      flag: "-u",
      label: { en: "Unit metadata filter", id: "Filter metadata unit" },
      description: {
        en: "Limit records to one literal system or user unit according to scope.",
        id: "Batasi catatan ke satu unit sistem atau pengguna literal sesuai cakupan.",
      },
      argument: "unit",
    },
    {
      id: "countOption",
      flag: "-n",
      label: { en: "Recent entry limit", id: "Batas entri terbaru" },
      description: {
        en: "Show the latest requested number of matching records.",
        id: "Tampilkan jumlah catatan cocok terbaru yang diminta.",
      },
      argument: "count",
    },
    {
      id: "bootOption",
      flag: "-b",
      label: { en: "Boot selection", id: "Pilihan boot" },
      description: {
        en: "Filter records by the selected boot, when enabled.",
        id: "Filter catatan menurut boot terpilih, bila diaktifkan.",
      },
      choice: { field: "boot", value: "current" },
    },
    {
      id: "priorityOption",
      flag: "-p",
      label: { en: "Priority threshold", id: "Ambang prioritas" },
      description: {
        en: "Include the selected level and more severe messages.",
        id: "Sertakan tingkat terpilih dan pesan yang lebih parah.",
      },
      choice: { field: "priority", value: "err" },
    },
    {
      id: "outputOption",
      flag: "-o",
      label: { en: "Output serialization", id: "Serialisasi keluaran" },
      description: {
        en: "Select a display format without evaluating log data here.",
        id: "Pilih format tampilan tanpa mengevaluasi data log di sini.",
      },
      choice: { field: "output", value: "json" },
    },
    {
      id: "userOption",
      flag: "--user",
      label: { en: "User journal", id: "Jurnal pengguna" },
      description: {
        en: "Select current-user service records; availability depends on logging configuration.",
        id: "Pilih catatan layanan pengguna saat ini; ketersediaan bergantung pada konfigurasi log.",
      },
      choice: { field: "scope", value: "user" },
    },
    {
      id: "systemOption",
      flag: "--system",
      label: { en: "System journal", id: "Jurnal sistem" },
      description: {
        en: "Limit the source to system/kernel records.",
        id: "Batasi sumber ke catatan sistem/kernel.",
      },
      choice: { field: "scope", value: "system" },
    },
  ],
  arguments: [
    {
      id: "unit",
      required: false,
      placeholder: "nginx.service",
      label: { en: "Unit filter", id: "Filter unit" },
      description: {
        en: "Optional literal unit identifier; @instances are supported. No globs, paths or shell expressions. Uses journal unit metadata; records and access are not verified.",
        id: "ID unit literal opsional; @instance didukung. Tanpa glob, jalur, atau ekspresi shell. Memakai metadata unit jurnal; catatan dan akses tidak diverifikasi.",
      },
    },
    {
      id: "count",
      required: false,
      placeholder: "50",
      label: { en: "Recent entries", id: "Entri terbaru" },
      description: {
        en: "Optional positive integer from 1 to 2147483647. Leave blank for the utility's default behavior.",
        id: "Bilangan bulat positif opsional dari 1 hingga 2147483647. Kosongkan untuk perilaku bawaan utilitas.",
      },
    },
    {
      id: "bootOffset",
      required: true,
      when: { field: "boot", value: "custom" },
      placeholder: "-2",
      label: { en: "Signed boot offset", id: "Offset boot bertanda" },
      description: {
        en: "Signed decimal integer, bounded to ±2147483647. Negative counts back from newest retained boot; positive counts from oldest. It is not a boot ID or future offset.",
        id: "Bilangan bulat desimal bertanda, dibatasi ±2147483647. Negatif dihitung mundur dari boot tersimpan terbaru; positif dari terlama. Ini bukan ID boot atau offset masa depan.",
      },
    },
    timeArgument("since"),
    timeArgument("until"),
  ],
  warnings: [
    {
      en: "Text generation only: no logs are accessed or streamed. Access depends on system policy; older boots may be rotated away. Logs can contain sensitive data. Relative expressions and local timestamps are interpreted on the target machine; its clock, timezone and daylight-saving ambiguity are not resolved here.",
      id: "Hanya pembuatan teks: tidak ada log yang diakses atau dialirkan. Akses bergantung pada kebijakan sistem; boot lama mungkin sudah dirotasi. Log dapat memuat data sensitif. Ekspresi relatif dan waktu lokal ditafsirkan di mesin tujuan; jam, zona waktu, dan ambiguitas pergantian waktu musim tidak ditentukan di sini.",
    },
  ],
  concepts: systemdConcepts,
  comparison: systemdComparison,
  examples: [
    {
      command: "journalctl",
      description: {
        en: "Read all accessible records with the default output and pager.",
        id: "Baca semua catatan yang dapat diakses dengan keluaran dan pager bawaan.",
      },
    },
    {
      command: "journalctl -u nginx.service -n 100",
      description: {
        en: "Read up to 100 recent records for this unit.",
        id: "Baca hingga 100 catatan terbaru untuk unit ini.",
      },
    },
    {
      command: "journalctl -u nginx.service -f",
      description: {
        en: "Follow new records manually in a terminal.",
        id: "Ikuti catatan baru secara manual di terminal.",
      },
    },
    {
      command: "journalctl -b",
      description: {
        en: "Inspect current-boot records.",
        id: "Periksa catatan boot saat ini.",
      },
    },
    {
      command: "journalctl -b -1",
      description: {
        en: "Inspect previous-boot records if retained.",
        id: "Periksa catatan boot sebelumnya bila tersimpan.",
      },
    },
    {
      command: "journalctl -p err",
      description: {
        en: "Errors and more severe messages.",
        id: "Pesan kesalahan dan yang lebih parah.",
      },
    },
    {
      command:
        "journalctl --since '2026-10-20 08:00:00' --until '2026-10-20 10:00:00'",
      description: {
        en: "Use an inclusive local-time window on the target machine.",
        id: "Gunakan rentang waktu lokal inklusif di mesin tujuan.",
      },
    },
    {
      command: "journalctl --since '1 hour ago'",
      description: {
        en: "Relative to the target Linux clock when manually run.",
        id: "Relatif terhadap jam Linux tujuan saat dijalankan manual.",
      },
    },
    {
      command: "journalctl --since today",
      description: {
        en: "Read from midnight today on the target machine.",
        id: "Baca sejak tengah malam hari ini di mesin tujuan.",
      },
    },
    {
      command: "journalctl -u docker.service --no-pager",
      description: {
        en: "Print unit records directly, without a pager.",
        id: "Cetak catatan unit langsung, tanpa pager.",
      },
    },
    {
      command: "journalctl -r -n 50",
      description: {
        en: "Show up to 50 recent records, newest first.",
        id: "Tampilkan hingga 50 catatan terbaru, yang terbaru dahulu.",
      },
    },
    {
      command: "journalctl -o short-iso",
      description: {
        en: "Display ISO-style timestamps.",
        id: "Tampilkan waktu bergaya ISO.",
      },
    },
    {
      command: "journalctl -o cat",
      description: {
        en: "Print message text without normal metadata.",
        id: "Cetak teks pesan tanpa metadata biasa.",
      },
    },
    {
      command: "journalctl -o json -n 10",
      description: {
        en: "Print up to ten recent records as JSON.",
        id: "Cetak hingga sepuluh catatan terbaru sebagai JSON.",
      },
    },
    {
      command: "journalctl --user -u my-app.service",
      description: {
        en: "Inspect records for a service in the current user's journal.",
        id: "Periksa catatan layanan dalam jurnal pengguna saat ini.",
      },
    },
    troubleshootingExample,
  ],
};
