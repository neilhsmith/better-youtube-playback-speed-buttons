export function isDefaultYoutubeSpeed(value: number) {
  return (
    value === 0.25 ||
    value === 0.5 ||
    value === 0.75 ||
    value === 1 ||
    value === 1.25 ||
    value === 1.5 ||
    value === 1.75 ||
    value === 2
  )
}
