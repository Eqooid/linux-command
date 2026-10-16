import type { CommandDefinition } from "../types";

export const rm: CommandDefinition = {
  id: "rm",
  name: "rm",
  category: "files",
  form: { kind: "basic" },
  description: {
    en: "Generate removal commands with explicit safety notes.",
    id: "Buat perintah penghapusan dengan catatan keamanan yang jelas.",
  },
  explanation: {
    en: "rm removes file directory entries and generally does not use a recycle bin. Recursive mode removes directory trees. GNU -I prompts once if there are more than three targets or recursion is requested; it is not a prompt for every target. -i prompts for each removal. -f ignores nonexistent files and never prompts, but other errors can still occur. The browser only builds text: it does not remove or check files.",
    id: "rm menghapus entri file dalam direktori dan umumnya tidak menggunakan recycle bin. Mode rekursif menghapus pohon direktori. GNU -I bertanya sekali jika ada lebih dari tiga tujuan atau rekursi diminta; bukan pertanyaan untuk setiap tujuan. -i bertanya untuk setiap penghapusan. -f mengabaikan file yang tidak ada dan tidak pernah bertanya, tetapi kesalahan lain masih dapat terjadi. Browser hanya membuat teks: tidak menghapus atau memeriksa file.",
  },
  syntax: "rm [-r] [-i | -I | -f] [-v] -- path...",
  choices: [
    {
      id: "confirmation",
      label: { en: "Removal confirmation", id: "Konfirmasi penghapusan" },
      description: {
        en: "Force is a separate explicit choice, never combined with interactive flags. Default GNU behavior may prompt for unwritable files in a terminal.",
        id: "Paksa adalah pilihan eksplisit terpisah, tidak pernah digabungkan dengan flag interaktif. Perilaku bawaan GNU dapat bertanya untuk file yang tidak dapat ditulis dalam terminal.",
      },
      defaultValue: "default",
      items: [
        {
          value: "default",
          label: { en: "Default behavior", id: "Perilaku bawaan" },
        },
        {
          value: "each",
          label: {
            en: "Prompt for each removal (-i)",
            id: "Tanya setiap penghapusan (-i)",
          },
        },
        {
          value: "once",
          label: {
            en: "Prompt once for bulk/recursive removal (-I)",
            id: "Tanya sekali untuk penghapusan banyak/rekursif (-I)",
          },
        },
        {
          value: "force",
          label: {
            en: "Never prompt (-f): destructive",
            id: "Jangan bertanya (-f): destruktif",
          },
        },
      ],
    },
  ],
  options: [
    {
      id: "recursive",
      flag: "-r",
      label: {
        en: "Remove directories recursively",
        id: "Hapus direktori secara rekursif",
      },
      description: {
        en: "Remove the entire target tree. GNU -R is equivalent; this builder emits -r. Disabled by default.",
        id: "Hapus seluruh pohon tujuan. GNU -R setara; pembuat ini menghasilkan -r. Nonaktif secara bawaan.",
      },
    },
    {
      id: "each",
      flag: "-i",
      choice: { field: "confirmation", value: "each" },
      label: { en: "Prompt each time", id: "Tanya setiap kali" },
      description: {
        en: "Ask before each removal when run manually.",
        id: "Tanya sebelum setiap penghapusan saat dijalankan secara manual.",
      },
    },
    {
      id: "once",
      flag: "-I",
      choice: { field: "confirmation", value: "once" },
      label: { en: "Prompt once", id: "Tanya sekali" },
      description: {
        en: "Ask once for more than three targets or for recursive removal.",
        id: "Tanya sekali untuk lebih dari tiga tujuan atau penghapusan rekursif.",
      },
    },
    {
      id: "force",
      flag: "-f",
      choice: { field: "confirmation", value: "force" },
      label: { en: "Force removal", id: "Paksa penghapusan" },
      description: {
        en: "Ignore nonexistent files and never prompt. This is not a safety feature.",
        id: "Abaikan file yang tidak ada dan jangan bertanya. Ini bukan fitur keamanan.",
      },
    },
    {
      id: "verbose",
      flag: "-v",
      label: { en: "Verbose output", id: "Keluaran terperinci" },
      description: {
        en: "Display files removed when the command is run manually.",
        id: "Tampilkan file yang dihapus saat perintah dijalankan secara manual.",
      },
    },
  ],
  arguments: [
    {
      id: "paths",
      label: { en: "Target paths", id: "Jalur tujuan" },
      description: {
        en: "One literal target per row. Wildcards and ~ are not expanded. Root/current/parent targets are blocked; recursive mode also blocks obvious system and home roots.",
        id: "Satu tujuan literal per baris. Wildcard dan ~ tidak diperluas. Tujuan akar/saat ini/induk diblokir; mode rekursif juga memblokir akar sistem dan home yang jelas.",
      },
      required: true,
      multiple: true,
      placeholder: "temporary.txt",
    },
  ],
  warnings: [
    {
      en: "Destructive command: rm generally bypasses the recycle bin. Review every target before running text manually. Static checks cannot guarantee safety or resolve symlinks, mounts, or your current directory.",
      id: "Perintah destruktif: rm umumnya melewati recycle bin. Periksa setiap tujuan sebelum menjalankan teks secara manual. Pemeriksaan statis tidak menjamin keamanan atau menyelesaikan tautan simbolis, mount, atau direktori Anda saat ini.",
    },
  ],
  examples: [
    {
      command: "rm notes.txt",
      description: {
        en: "Remove one file when run manually.",
        id: "Hapus satu file saat dijalankan secara manual.",
      },
    },
    {
      command: "rm file1.txt file2.txt",
      description: {
        en: "Remove two explicitly named files.",
        id: "Hapus dua file yang disebutkan secara eksplisit.",
      },
    },
    {
      command: "rm -i important.txt",
      description: {
        en: "Ask before removing a file.",
        id: "Tanya sebelum menghapus file.",
      },
    },
    {
      command: "rm -I -r old-project/",
      description: {
        en: "Ask once before recursively removing a tree.",
        id: "Tanya sekali sebelum menghapus pohon secara rekursif.",
      },
    },
    {
      command: "rm -r temp-folder/",
      description: {
        en: "Recursive deletion without an explicit interactive flag.",
        id: "Penghapusan rekursif tanpa flag interaktif eksplisit.",
      },
    },
    {
      command: "rm -rv build/",
      description: {
        en: "Remove a tree and display removed entries.",
        id: "Hapus pohon dan tampilkan entri yang dihapus.",
      },
    },
    {
      command: "rm -f temporary.txt",
      description: {
        en: "Never prompt and ignore missing files; still destructive.",
        id: "Jangan bertanya dan abaikan file yang tidak ada; tetap destruktif.",
      },
    },
  ],
};
