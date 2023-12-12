import { isDefaultYoutubeSpeed } from "../utils/youtube"

type OnChangeAction = (value: number) => void

export class SpeedPanel {
  private customMenuItem = document.createElement("div")
  private customMenuItemLabel = document.createElement("div")

  // the .ytp-panel-menu element, whenever it's present
  private menuElement: Element | null = null

  public speed: number | undefined
  public lastCustomSpeed: number | undefined
  public onChange: OnChangeAction | undefined

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

      this.onChange && this.onChange(value)

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

  private handleMenuElementClick = (e: Event) => {
    // idk why it happens but there's a bug where the Normal menuitem will not be selected
    // whenever a custom speed is selected for the first time. this handler will listen
    // for normal clicks and manually send an onChange with a speed of 1

    const element = e.target as Element
    if (element?.textContent === "Normal") {
      this.onChange && this.onChange(1)
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
          this.menuElement?.addEventListener("click", this.handleMenuElementClick, true)
          this.render()
        } else {
          this.menuElement?.removeEventListener("click", this.handleMenuElementClick, true)
          this.menuElement = null
        }
      }
    }
  }
}
