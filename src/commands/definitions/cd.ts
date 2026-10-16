import type { CommandDefinition } from "../types";

export const cd: CommandDefinition = {
  id: "cd",
  name: "cd",
  category: "navigation",
  form: { kind: "basic" },
  description: {
    en: "Build a command to change the shell working directory.",
    id: "Buat perintah untuk mengubah direktori kerja shell.",
  },
  explanation: {
    en: "cd is normally a shell builtin. With no argument it uses HOME; ~ is shell syntax for the home directory. .. is the parent and cd - uses OLDPWD to return to the previous directory in Bash and common shells. Absolute paths start with /; relative paths are interpreted from the current directory and may be affected by CDPATH. Only running the text in your own shell changes that shell; this app does not navigate a filesystem.",
    id: "cd biasanya merupakan builtin shell. Tanpa argumen, cd menggunakan HOME; ~ merupakan sintaks shell untuk direktori home. .. adalah direktori induk dan cd - menggunakan OLDPWD untuk kembali ke direktori sebelumnya di Bash dan shell umum. Jalur absolut dimulai dengan /; jalur relatif ditafsirkan dari direktori saat ini dan dapat dipengaruhi CDPATH. Hanya menjalankan teks di shell Anda yang mengubah shell tersebut; aplikasi ini tidak menavigasi sistem file.",
  },
  syntax: "cd [-- literal-path] | cd ~ | cd .. | cd -",
  choices: [
    {
      id: "destination",
      label: { en: "Navigation preset", id: "Preset navigasi" },
      description: {
        en: "Presets preserve trusted shell syntax. Custom paths remain literal; choose the home-relative preset for ~/Documents.",
        id: "Preset mempertahankan sintaks shell tepercaya. Jalur khusus tetap literal; pilih preset relatif terhadap home untuk ~/Documents.",
      },
      defaultValue: "default",
      items: [
        {
          value: "default",
          label: { en: "Home (no argument)", id: "Home (tanpa argumen)" },
        },
        {
          value: "home",
          label: { en: "Home directory (~)", id: "Direktori home (~)" },
        },
        {
          value: "parent",
          label: { en: "Parent directory (..)", id: "Direktori induk (..)" },
        },
        {
          value: "previous",
          label: {
            en: "Previous directory (-)",
            id: "Direktori sebelumnya (-)",
          },
        },
        {
          value: "root",
          label: { en: "Root directory (/)", id: "Direktori akar (/)" },
        },
        {
          value: "custom",
          label: { en: "Custom literal path", id: "Jalur literal khusus" },
        },
        {
          value: "homePath",
          label: {
            en: "Path inside home (~/...)",
            id: "Jalur di dalam home (~/...)",
          },
        },
      ],
    },
  ],
  options: [],
  arguments: [
    {
      id: "path",
      label: { en: "Directory path", id: "Jalur direktori" },
      description: {
        en: "Enter an absolute or relative literal path. Quotes, $, and ~ are treated as filename characters.",
        id: "Masukkan jalur literal absolut atau relatif. Kutip, $, dan ~ diperlakukan sebagai karakter nama file.",
      },
      required: true,
      placeholder: "../projects",
      when: { field: "destination", value: "custom" },
    },
    {
      id: "homePath",
      label: { en: "Path relative to home", id: "Jalur relatif terhadap home" },
      description: {
        en: "Enter only the suffix, such as Documents or My Notes. The builder adds a trusted ~/ prefix and quotes the suffix.",
        id: "Masukkan hanya bagian akhir, seperti Documents atau My Notes. Pembuat menambahkan awalan ~/ tepercaya dan mengutip bagian akhirnya.",
      },
      required: true,
      placeholder: "Documents",
      when: { field: "destination", value: "homePath" },
    },
  ],
  warnings: [
    {
      en: "Paths, HOME, OLDPWD, and permissions are not checked. Preset behavior assumes Bash or a compatible shell. A literal directory named - is serialized as ./- to avoid previous-directory behavior.",
      id: "Jalur, HOME, OLDPWD, dan izin tidak diperiksa. Perilaku preset mengasumsikan Bash atau shell kompatibel. Direktori literal bernama - ditulis sebagai ./- agar tidak berarti direktori sebelumnya.",
    },
  ],
  examples: [
    {
      command: "cd",
      description: {
        en: "Go home using HOME.",
        id: "Ke home menggunakan HOME.",
      },
    },
    {
      command: "cd ~",
      description: {
        en: "Use shell tilde expansion for home.",
        id: "Gunakan perluasan tilde shell untuk home.",
      },
    },
    {
      command: "cd ..",
      description: {
        en: "Go to the parent directory.",
        id: "Ke direktori induk.",
      },
    },
    {
      command: "cd -",
      description: {
        en: "Return to the previous directory; Bash also prints its path.",
        id: "Kembali ke direktori sebelumnya; Bash juga menampilkan jalurnya.",
      },
    },
    {
      command: "cd /var/log",
      description: {
        en: "Use an absolute path.",
        id: "Gunakan jalur absolut.",
      },
    },
    {
      command: "cd ~/Documents",
      description: {
        en: "Use the home-relative preset with Documents.",
        id: "Gunakan preset relatif terhadap home dengan Documents.",
      },
    },
    {
      command: "cd ../projects",
      description: {
        en: "Use a path relative to the current directory.",
        id: "Gunakan jalur relatif terhadap direktori saat ini.",
      },
    },
  ],
};
