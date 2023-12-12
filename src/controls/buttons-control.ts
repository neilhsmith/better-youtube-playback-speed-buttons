import { Settings } from "../types"

type InitAction = (buttonsControl: Element) => void
type ClickAction = () => void

export class ButtonsControl {
  private readonly control = document.createElement("div")
  private readonly labelBtn = document.createElement("button")
  private readonly negBtn = document.createElement("button")
  private readonly posBtn = document.createElement("button")

  public onNeutralClick: ClickAction | undefined
  public onNegativeClick: ClickAction | undefined
  public onPositiveClick: ClickAction | undefined

  constructor(
    value: number,
    readonly settings: Settings,
    readonly appendControlAction: InitAction
  ) {
    this.labelBtn.ariaLabel = "Reset the video playback speed"
    this.labelBtn.className = "label-btn"
    this.labelBtn.addEventListener("click", () => this.onNeutralClick && this.onNeutralClick())

    this.negBtn.ariaLabel = "Decrease video playback speed"
    this.negBtn.className = "neg-btn"
    this.negBtn.textContent = "-"
    this.negBtn.addEventListener("click", () => this.onNegativeClick && this.onNegativeClick())

    this.posBtn.ariaLabel = "Increase video playback speed"
    this.posBtn.className = "pos-btn"
    this.posBtn.textContent = "+"
    this.posBtn.addEventListener("click", () => this.onPositiveClick && this.onPositiveClick())

    this.control.className = "bypsb"

    this.control.appendChild(this.negBtn)
    this.control.appendChild(this.labelBtn)
    this.control.appendChild(this.posBtn)

    this.setSpeed(value)
    this.appendControlAction(this.control)
  }

  setSpeed(speed: number) {
    this.labelBtn.textContent = `${speed}x`

    const canDecrease = speed > this.settings.minSpeed
    this.negBtn.disabled = canDecrease ? false : true
    this.negBtn.ariaDisabled = canDecrease ? "false" : "true"

    const canIncrease = speed < this.settings.maxSpeed
    this.posBtn.disabled = canIncrease ? false : true
    this.posBtn.ariaDisabled = canIncrease ? "false" : "true"
  }
}
