import { pwd } from "./definitions/pwd";
import { ls } from "./definitions/ls";
import { ps } from "./definitions/ps";
import { cat } from "./definitions/cat";
import { grep } from "./definitions/grep";
import { less } from "./definitions/less";

// Only simple, read-oriented catalog forms can be nested; never another composer.
export const shellStageCommands = [pwd, ls, ps, cat, grep, less];
export const getStageCommand = (id: string) =>
  shellStageCommands.find((command) => command.id === id);
