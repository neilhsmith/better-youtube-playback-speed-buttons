import { Settings } from "../types"

type OnChangeAction = (value: number) => void

export class CustomSpeedPanel {
  private readonly control = document.createElement("div")
  private readonly slider = document.createElement("input")
  private readonly label = document.createElement("span")

  // the .ytp-speedslider-component element, whenever it's present
  private wrapperElement: Element | null = null

  public speed: number | undefined
  public onChange: OnChangeAction | undefined

  get active() {
    return !!this.wrapperElement
  }

  constructor(speed: number, readonly ytpSettingsMenu: Element, readonly settings: Settings) {
    this.speed = speed

    this.slider.type = "range"
    this.slider.min = settings.minSpeed.toString()
    this.slider.max = settings.maxSpeed.toString()
    this.slider.step = settings.sliderStep.toString()
    this.slider.addEventListener("input", this.handleChange)
    this.slider.addEventListener("change", this.handleChange)

    this.control.style.border = "1px solid orange"

    this.control.appendChild(this.slider)
    this.control.appendChild(this.label)

    new MutationObserver(this.handleMutations).observe(ytpSettingsMenu, {
      childList: true,
      subtree: true,
    })
  }

  render = () => {
    if (!this.wrapperElement || !this.speed) return
    console.log("render custom-speed-panel", this.speed)

    this.wrapperElement.querySelector(".ytp-slider-section")?.remove()
    this.slider.value = this.speed.toString()
    this.label.textContent = this.speed.toString()

    if (this.wrapperElement.children.length === 0) {
      this.wrapperElement.appendChild(this.control)
    }
  }

  private handleChange = () => {
    const newValue = Number(this.slider.value)
    this.onChange && this.onChange(newValue)
  }

  private handleMutations = (mutations: MutationRecord[]) => {
    for (const mutation of mutations) {
      for (const node of mutation.addedNodes) {
        if (node.nodeType !== 1) continue

        const element = node as Element

        const hasExpectedPanelTitle =
          element.querySelector(".ytp-panel-title")?.textContent === "Custom"

        if (hasExpectedPanelTitle) {
          const wrapperElement = element.querySelector(".ytp-speedslider-component")
          this.wrapperElement = wrapperElement
          this.render()
        }
      }
    }
  }
}
