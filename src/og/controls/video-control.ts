type RateChangeCallback = (value: number) => void

export class VideoControl {
  public onRateChange: RateChangeCallback | undefined

  constructor(readonly element: HTMLVideoElement) {
    element.addEventListener(
      "ratechange",
      () => this.onRateChange && this.onRateChange(element.playbackRate)
    )
  }

  setValue(value: number) {
    this.element.playbackRate = value
  }
}
