export type Language = "id" | "en";
export type BilingualText = { id: string; en: string };
export type CategoryId =
  | "navigation"
  | "files"
  | "reading"
  | "searching"
  | "help"
  | "permissions"
  | "processes"
  | "services"
  | "system"
  | "pipes"
  | "networking"
  | "remote";
export type CommandValues = Record<string, string | boolean | string[]>;
export type CommandStage =
  | { kind: "literal"; executable: string; args: string[] }
  | { kind: "registry"; commandId: string; inputs: CommandValues };
export type ShellRedirection =
  | { operator: ">" | ">>" | "<" | "2>" | "2>>"; path: string }
  | { operator: "2>&1" };
export interface ShellComposition {
  stages: CommandStage[];
  redirections: ShellRedirection[];
}
export type CommandInputs = Record<
  string,
  string | boolean | string[] | ShellComposition
>;

export interface InputCondition {
  field: string;
  value: string | boolean | string[];
  not?: boolean;
}
export type InputVisibility = InputCondition | InputCondition[];
export interface CommandChoice {
  id: string;
  label: BilingualText;
  description: BilingualText;
  defaultValue: string;
  items: { value: string; label: BilingualText }[];
  when?: InputVisibility;
}

export interface CommandOption {
  id: string;
  flag: string;
  label: BilingualText;
  description: BilingualText;
  choice?: { field: string; value: string };
  // A value-taking option documented alongside an existing argument input.
  argument?: string;
  when?: InputVisibility;
}

export interface CommandArgument {
  id: string;
  label: BilingualText;
  description: BilingualText;
  required: boolean;
  placeholder: string;
  defaultValue?: string;
  allowWhitespace?: boolean;
  multiple?: boolean;
  addLabel?: BilingualText;
  removeLabel?: BilingualText;
  when?: InputVisibility;
  format?: "permissions" | "timestamp";
  editor?: "numeric-permissions" | "symbolic-permissions" | "http-headers";
}

export interface CommandDefinition {
  id: string;
  name: string;
  kind?: "executable" | "builtin" | "shell-operator";
  category: CategoryId;
  description: BilingualText;
  explanation: BilingualText;
  syntax: string;
  options: CommandOption[];
  choices?: CommandChoice[];
  arguments: CommandArgument[];
  examples: { command: string; description: BilingualText }[];
  warnings: BilingualText[];
  concepts?: { term: BilingualText; description: BilingualText }[];
  comparison?: { command: string; description: BilingualText }[];
  shortcuts?: {
    title?: BilingualText;
    keyLabel?: BilingualText;
    actionLabel?: BilingualText;
    description: BilingualText;
    items: { keys: string; description: BilingualText }[];
  };
  // Specialized forms use a stable component key.
  form:
    | { kind: "basic" }
    | { kind: "custom"; componentKey: string }
    | {
        kind: "grouped";
        groups: {
          id: string;
          title: BilingualText;
          fields: string[];
          advanced?: boolean;
        }[];
      };
}

export interface GenerationResult {
  command: string | null;
  errors: BilingualText[];
}
