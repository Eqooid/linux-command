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
  | "system"
  | "pipes";
export type CommandInputs = Record<string, string | boolean | string[]>;

export interface InputCondition {
  field: string;
  value: string | boolean;
  not?: boolean;
}
export interface CommandChoice {
  id: string;
  label: BilingualText;
  description: BilingualText;
  defaultValue: string;
  items: { value: string; label: BilingualText }[];
  when?: InputCondition;
}

export interface CommandOption {
  id: string;
  flag: string;
  label: BilingualText;
  description: BilingualText;
  choice?: { field: string; value: string };
  when?: InputCondition;
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
  when?: InputCondition;
  format?: "permissions" | "timestamp";
  editor?: "numeric-permissions" | "symbolic-permissions";
}

export interface CommandDefinition {
  id: string;
  name: string;
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
  shortcuts?: {
    description: BilingualText;
    items: { keys: string; description: BilingualText }[];
  };
  // A future specialized form can use a separate component registered by this key.
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
