import { isDefaultYoutubeSpeed } from "../utils/youtube"

type OnClickAction = (value: number) => void

export class SpeedPanel {
  private customMenuItem = document.createElement("div")
  private customMenuItemLabel = document.createElement("div")

  // the .ytp-panel-menu element, whenever it's present
  private menuElement: Element | null = null

  public speed: number | undefined
  public lastCustomSpeed: number | undefined
  public onCustomItemClick: OnClickAction | undefined

  get active() {
    return !!this.menuElement
  }

  constructor(
    speed: number,
    lastCustomSpeed: number | undefined,
    readonly ytpSettingsMenu: Element
  ) {
    this.speed = speed
    this.lastCustomSpeed = lastCustomSpeed

    this.customMenuItem.className = "ytp-menuitem"
    this.customMenuItem.tabIndex = 0
    this.customMenuItem.role = "menuitemradio"
    this.customMenuItem.addEventListener("click", () => {
      const label = this.customMenuItemLabel?.textContent
      if (!label) return

      const substring = label.substring(label.indexOf("(") + 1, label.indexOf(")"))
      const value = Number(substring)

      this.onCustomItemClick && this.onCustomItemClick(value)

      const backButton = ytpSettingsMenu.querySelector<HTMLButtonElement>(".ytp-panel-back-button")
      backButton && backButton.click()
    })

    this.customMenuItemLabel.className = "ytp-menuitem-label my-custom-label"
    this.customMenuItem.appendChild(this.customMenuItemLabel)

    new MutationObserver(this.handleMutations).observe(ytpSettingsMenu, {
      childList: true,
      subtree: true,
    })
  }

  render = () => {
    if (!this.menuElement || !this.speed) return
    console.log("opening speed-panel", this.speed)

    const menuItems = this.menuElement.querySelectorAll(".ytp-menuitem") ?? []

    const selectedLabel = this.speed === 1 ? "Normal" : this.speed.toString()

    for (const menuItem of menuItems) {
      const labelValue = menuItem.querySelector(".ytp-menuitem-label")?.textContent
      menuItem.ariaChecked = labelValue === selectedLabel ? "true" : "false"

      if (labelValue?.startsWith("Custom")) {
        menuItem.remove()
      }
    }

    if (this.lastCustomSpeed) {
      const isDefaultSpeed = isDefaultYoutubeSpeed(this.speed)
      this.customMenuItem.ariaChecked = isDefaultSpeed ? "false" : "true"
      this.customMenuItemLabel.textContent = `Custom (${this.lastCustomSpeed})`

      if (!document.body.contains(this.customMenuItem)) {
        this.menuElement.insertAdjacentElement("afterbegin", this.customMenuItem)
      }
    }
  }

  private handleMutations = (mutations: MutationRecord[]) => {
    for (const mutation of mutations) {
      for (const node of mutation.addedNodes) {
        if (node.nodeType !== 1) continue

        const element = node as Element

        const hasExpectedPanelTitle =
          element.querySelector(".ytp-panel-title")?.textContent === "Playback speed"

        if (hasExpectedPanelTitle) {
          const menuElement = element.querySelector(".ytp-panel-menu")
          this.menuElement = menuElement
          this.render()
        } else {
          this.menuElement = null
        }
      }
    }
  }
}
