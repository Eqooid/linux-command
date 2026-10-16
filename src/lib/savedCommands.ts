import type { SavedCommand } from "./storage";

export function toggleFavorite(
  favorites: string[],
  commandId: string,
): string[] {
  return favorites.includes(commandId)
    ? favorites.filter((id) => id !== commandId)
    : [...favorites, commandId];
}

export function togglePin(
  pins: SavedCommand[],
  newPin: SavedCommand,
): SavedCommand[] {
  const matching = (pin: SavedCommand) =>
    pin.commandId === newPin.commandId && pin.text === newPin.text;
  return pins.some(matching)
    ? pins.filter((pin) => !matching(pin))
    : [...pins, newPin];
}
