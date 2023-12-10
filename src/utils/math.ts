export const round = (value: number) => Math.round((value + Number.EPSILON) * 100) / 100

export const clamp = (value: number, min: number, max: number) =>
  Math.max(min, Math.min(max, value))
