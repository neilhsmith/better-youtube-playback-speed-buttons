import { Settings } from "../types"

type OnChangeAction = (value: number) => void

export class CustomSpeedMenu {
  private readonly control = document.createElement("div")
  private readonly slider = document.createElement("input")
  private readonly label = document.createElement("span")

  private value: number | undefined
  private element: Element | undefined

  public onChange: OnChangeAction | undefined

  constructor(value: number, readonly settings: Settings, readonly container: Element) {
    this.slider.type = "range"
    this.slider.min = settings.minSpeed.toString()
    this.slider.max = settings.maxSpeed.toString()
    this.slider.step = settings.sliderStep.toString()
    this.slider.addEventListener("input", this.handleChange)
    this.slider.addEventListener("change", this.handleChange)

    this.control.style.border = "1px solid orange"

    this.control.appendChild(this.slider)
    this.control.appendChild(this.label)

    this.element = getCustomSpeedContainer(container)
    this.setValue(value)

    const observer = new MutationObserver(() => {
      this.element = getCustomSpeedContainer(container)
      this.renderValue()
    })
    observer.observe(container, {
      subtree: true,
      childList: true,
    })
  }

  setValue(value: number) {
    this.value = value
    this.slider.value = value.toString()
    this.label.textContent = value.toString()

    this.renderValue()
  }

  private renderValue() {
    if (!this.element || this.value === undefined) return

    this.element.querySelector(".ytp-slider-section")?.remove()

    if (this.element.children.length === 0) {
      this.element.appendChild(this.control)
    }
  }

  private handleChange = () => {
    const newValue = Number(this.slider.value)
    this.onChange && this.onChange(newValue)
  }
}

function getCustomSpeedContainer(container: Element) {
  const panel = container.querySelector(".ytp-panel-animate-forward")
  if (!panel) return

  const hasCustomTitle =
    panel.querySelector(".ytp-panel-title")?.textContent?.toLowerCase() === "custom"

  if (hasCustomTitle) {
    const menu = panel.querySelector(".ytp-speedslider-component") ?? undefined
    return menu
  }
}
