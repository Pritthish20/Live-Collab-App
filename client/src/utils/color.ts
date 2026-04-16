const palette = ["#0f766e", "#b42318", "#6d28d9", "#2563eb", "#15803d"];

export function pickUserColor(seed: string) {
  const sum = Array.from(seed).reduce((total, char) => total + char.charCodeAt(0), 0);
  return palette[sum % palette.length];
}

