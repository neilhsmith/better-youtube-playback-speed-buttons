type RateChangeCallback = (value: number) => void

export class VideoControl {
  public onRateChange: RateChangeCallback | undefined

  constructor(readonly element: HTMLVideoElement) {
    element.addEventListener(
      "ratechange",
      () => this.onRateChange && this.onRateChange(element.playbackRate)
    )
  }

  setSpeed(speed: number) {
    this.element.playbackRate = speed
  }
}
