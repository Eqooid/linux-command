import type { CommandDefinition } from "./types";

export const shellConcepts: NonNullable<CommandDefinition["concepts"]> = [
  {
    term: {
      en: "Streams and file descriptors",
      id: "Aliran dan file descriptor",
    },
    description: {
      en: "stdin (descriptor 0) supplies input, stdout (1) carries ordinary output, and stderr (2) carries diagnostics. These are connections, not necessarily terminal windows or ordinary files.",
      id: "stdin (descriptor 0) memasok masukan, stdout (1) membawa keluaran biasa, dan stderr (2) membawa diagnostik. Ketiganya adalah koneksi, tidak selalu jendela terminal atau berkas biasa.",
    },
  },
  {
    term: { en: "Pipes and command order", id: "Pipe dan urutan perintah" },
    description: {
      en: "A | connects the left command's stdout to the next command's stdin. stderr keeps its existing destination unless explicitly redirected. Order determines data flow. Commands that ignore stdin will not consume piped input; ls and ps normally produce listings rather than filter that input.",
      id: "| menghubungkan stdout perintah kiri ke stdin perintah berikutnya. stderr mempertahankan tujuan sebelumnya kecuali dialihkan secara eksplisit. Urutan menentukan aliran data. Perintah yang mengabaikan stdin tidak akan membaca masukan pipe; ls dan ps biasanya menghasilkan daftar, bukan memfilter masukan tersebut.",
    },
  },
  {
    term: { en: "Overwrite versus append", id: "Timpa dibandingkan tambah" },
    description: {
      en: "> redirects stdout and 2> redirects stderr, opening a file for writing and normally truncating an existing file. >> and 2>> append instead. A file may be created when the command is run manually. Shell settings such as noclobber, file types and permissions affect behavior; quoting is not a guarantee of safety.",
      id: "> mengalihkan stdout dan 2> mengalihkan stderr, membuka berkas untuk ditulis dan biasanya mengosongkan berkas yang sudah ada. >> dan 2>> menambahkan di akhir. Berkas dapat dibuat saat perintah dijalankan manual. Pengaturan shell seperti noclobber, jenis berkas, dan izin memengaruhi perilaku; kutip bukan jaminan keamanan.",
    },
  },
  {
    term: { en: "Input redirection", id: "Pengalihan masukan" },
    description: {
      en: "< file supplies a file as stdin. Passing file as an argument instead leaves the program to interpret the filename and open it. Some programs support both, some ignore stdin, and others treat filenames specially. Redirection paths here are literal; ~, $HOME and globs do not expand.",
      id: "< file memasok berkas sebagai stdin. Memberikan file sebagai argumen membiarkan program menafsirkan nama berkas dan membukanya. Sebagian program mendukung keduanya, sebagian mengabaikan stdin, dan lainnya memperlakukan nama berkas secara khusus. Jalur redirection di sini literal; ~, $HOME, dan glob tidak diekspansi.",
    },
  },
  {
    term: {
      en: "Descriptor duplication and ordering",
      id: "Duplikasi descriptor dan urutan",
    },
    description: {
      en: "Redirections apply left to right. > output.log 2>&1 sends stdout to the file, then copies that destination to stderr. 2>&1 > output.log first copies stdout's original destination to stderr, then sends only stdout to the file. 2>&1 duplicates the current connection; it does not permanently link the two descriptors.",
      id: "Redirection diterapkan dari kiri ke kanan. > output.log 2>&1 mengirim stdout ke berkas, lalu menyalin tujuan itu ke stderr. 2>&1 > output.log terlebih dahulu menyalin tujuan awal stdout ke stderr, lalu hanya mengirim stdout ke berkas. 2>&1 menduplikasi koneksi saat itu; tidak menghubungkan kedua descriptor secara permanen.",
    },
  },
  {
    term: {
      en: "Useful and unnecessary pipelines",
      id: "Pipeline berguna dan tidak perlu",
    },
    description: {
      en: "ps aux | grep nginx filters a listing. cat app.log | grep error and grep error app.log can produce similar results; the second is usually simpler because grep reads files directly. A pipeline is not automatically necessary or more efficient. Piping into less can help inspect long output interactively in a terminal.",
      id: "ps aux | grep nginx memfilter daftar. cat app.log | grep error dan grep error app.log dapat menghasilkan keluaran serupa; yang kedua biasanya lebih sederhana karena grep membaca berkas langsung. Pipeline tidak otomatis diperlukan atau lebih efisien. Pipe ke less dapat membantu memeriksa keluaran panjang secara interaktif di terminal.",
    },
  },
  {
    term: {
      en: "Composition versus chaining",
      id: "Komposisi dibandingkan chaining",
    },
    description: {
      en: "A pipeline carries data between commands; && and || conditionally chain commands according to exit status and are outside this builder. Stages may run concurrently in a real shell. Only the selected | and redirection operators are syntax here; user arguments remain data, even when they contain operator characters. Programs such as shells can interpret their own arguments, so literal quoting does not make arbitrary programs safe.",
      id: "Pipeline membawa data antarperintah; && dan || merangkai perintah secara bersyarat menurut status keluar dan di luar cakupan builder ini. Tahap dapat berjalan bersamaan di shell nyata. Hanya | dan operator redirection terpilih yang menjadi sintaks di sini; argumen pengguna tetap data, meskipun memuat karakter operator. Program seperti shell dapat menafsirkan argumennya sendiri, sehingga kutip literal tidak menjadikan sembarang program aman.",
    },
  },
];

export const shellExamples: CommandDefinition["examples"] = [
  {
    command: "ps aux | grep nginx",
    description: {
      en: "Send a process listing to a text filter; this app does not inspect processes.",
      id: "Kirim daftar proses ke filter teks; aplikasi ini tidak memeriksa proses.",
    },
  },
  {
    command: "cat app.log | grep error",
    description: {
      en: "A working pipeline, but grep error app.log is often simpler.",
      id: "Pipeline yang berfungsi, tetapi grep error app.log sering lebih sederhana.",
    },
  },
  {
    command: "grep error app.log | less",
    description: {
      en: "Read filtered output with a terminal pager. Use a literal less stage to consume stdin; the standalone catalog less builder requires a file.",
      id: "Baca keluaran terfilter dengan pager terminal. Gunakan tahap less literal untuk membaca stdin; builder katalog less mandiri memerlukan berkas.",
    },
  },
  {
    command: "ls -la > files.txt",
    description: {
      en: "Overwrite the stdout target when manually run; review the path.",
      id: "Timpa tujuan stdout saat dijalankan manual; tinjau jalurnya.",
    },
  },
  {
    command: "echo 'Hello' > output.txt",
    description: {
      en: "Illustrate stdout overwrite. echo argument behavior can vary; printf is often more predictable.",
      id: "Contoh penimpaan stdout. Perilaku argumen echo dapat bervariasi; printf sering lebih dapat diprediksi.",
    },
  },
  {
    command: "echo 'Another line' >> output.txt",
    description: {
      en: "Append stdout rather than truncate the file.",
      id: "Tambahkan stdout tanpa mengosongkan berkas.",
    },
  },
  {
    command: "sort < names.txt",
    description: {
      en: "Supply a file as standard input instead of a filename operand.",
      id: "Pasok berkas sebagai masukan standar, bukan operand nama berkas.",
    },
  },
  {
    command: "wc -l < access.log",
    description: {
      en: "Count lines read from stdin.",
      id: "Hitung baris yang dibaca dari stdin.",
    },
  },
  {
    command: "ls /missing-directory 2> errors.log",
    description: {
      en: "Redirect only stderr, overwriting the target.",
      id: "Alihkan hanya stderr, dengan menimpa tujuan.",
    },
  },
  {
    command: "ls /missing-directory 2>> errors.log",
    description: {
      en: "Append stderr; stdout keeps its original destination.",
      id: "Tambahkan stderr; stdout mempertahankan tujuan awalnya.",
    },
  },
  {
    command: "ls > output.log 2>&1",
    description: {
      en: "Both stdout and stderr use the file destination.",
      id: "Stdout dan stderr memakai tujuan berkas.",
    },
  },
  {
    command: "ls 2>&1 > output.log",
    description: {
      en: "Only stdout is sent to the file; stderr retains stdout's earlier destination.",
      id: "Hanya stdout dikirim ke berkas; stderr mempertahankan tujuan stdout sebelumnya.",
    },
  },
];
