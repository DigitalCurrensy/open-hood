export function dollars(value: number): number {
  return Math.round(value);
}

export function formatMoney(value: number): string {
  return `$${dollars(value).toLocaleString("en-US")}`;
}

export function formatRange(low: number, high: number): string {
  return `${formatMoney(low)}–${formatMoney(high)}`;
}

export function formatHours(value: number): string {
  const rounded = Math.round(value * 10) / 10;
  return `${rounded.toFixed(1).replace(/\.0$/, "")} hr`;
}

export function formatRate(value: number): string {
  return `${formatMoney(value)}/hr`;
}
