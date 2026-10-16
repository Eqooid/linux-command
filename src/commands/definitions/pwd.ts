import type { CommandDefinition } from "../types";

export const pwd: CommandDefinition = {
  id: "pwd",
  name: "pwd",
  category: "navigation",
  form: { kind: "basic" },
  description: {
    en: "Print your current working directory.",
    id: "Tampilkan direktori kerja saat ini.",
  },
  explanation: {
    en: "pwd prints an absolute path. Logical paths preserve symbolic-link names used to reach a directory; physical paths resolve those links. pwd may be a shell builtin or an external utility, so defaults and behavior depend on the shell or implementation.",
    id: "pwd menampilkan jalur absolut. Jalur logis mempertahankan nama tautan simbolis yang digunakan untuk mencapai direktori; jalur fisik menyelesaikan tautan tersebut. pwd dapat berupa builtin shell atau utilitas eksternal, sehingga perilaku dan mode bawaan bergantung pada shell atau implementasinya.",
  },
  syntax: "pwd [-L | -P]",
  choices: [
    {
      id: "mode",
      label: { en: "Path mode", id: "Mode jalur" },
      description: {
        en: "Select one mode, or keep the implementation default.",
        id: "Pilih satu mode, atau gunakan mode bawaan implementasi.",
      },
      defaultValue: "default",
      items: [
        { value: "default", label: { en: "Default", id: "Bawaan" } },
        { value: "logical", label: { en: "Logical (-L)", id: "Logis (-L)" } },
        { value: "physical", label: { en: "Physical (-P)", id: "Fisik (-P)" } },
      ],
    },
  ],
  options: [
    {
      id: "logical",
      flag: "-L",
      choice: { field: "mode", value: "logical" },
      label: { en: "Logical path", id: "Jalur logis" },
      description: {
        en: "Preserve symbolic links in the logical working directory.",
        id: "Pertahankan tautan simbolis dalam direktori kerja logis.",
      },
    },
    {
      id: "physical",
      flag: "-P",
      choice: { field: "mode", value: "physical" },
      label: { en: "Physical path", id: "Jalur fisik" },
      description: {
        en: "Resolve symbolic links to show the physical directory.",
        id: "Selesaikan tautan simbolis untuk menampilkan direktori fisik.",
      },
    },
  ],
  arguments: [],
  warnings: [],
  examples: [
    {
      command: "pwd",
      description: {
        en: "Print the current path using default behavior.",
        id: "Tampilkan jalur saat ini dengan perilaku bawaan.",
      },
    },
    {
      command: "pwd -L",
      description: {
        en: "For a symlink named /home/user/work, keep that logical name.",
        id: "Untuk tautan bernama /home/user/work, pertahankan nama logis tersebut.",
      },
    },
    {
      command: "pwd -P",
      description: {
        en: "Show the resolved target, for example /srv/projects.",
        id: "Tampilkan tujuan yang diselesaikan, misalnya /srv/projects.",
      },
    },
  ],
};
