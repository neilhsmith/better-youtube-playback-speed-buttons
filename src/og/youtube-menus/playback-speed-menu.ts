type OnClickAction = (value: number) => void

export class PlaybackSpeedMenu {
  private customMenuItem = document.createElement("div")
  private customMenuItemLabel = document.createElement("div")

  private value: number | undefined
  private lastCustomValue: number | undefined
  private element: Element | undefined

  public onCustomItemClick: OnClickAction | undefined

  constructor(value: number, readonly container: Element) {
    this.customMenuItem.className = "ytp-menuitem"
    this.customMenuItem.tabIndex = 0
    this.customMenuItem.role = "menuitemradio"
    this.customMenuItem.addEventListener("click", (e) => {
      const label = this.customMenuItemLabel?.textContent
      if (!label) return

      const substring = label.substring(label.indexOf("(") + 1, label.indexOf(")"))
      const value = Number(substring)

      this.onCustomItemClick && this.onCustomItemClick(value)

      const backButton = container.querySelector<HTMLButtonElement>(".ytp-panel-back-button")
      backButton && backButton.click()
    })

    this.customMenuItemLabel.className = "ytp-menuitem-label my-custom-label"
    this.customMenuItem.appendChild(this.customMenuItemLabel)

    this.element = getMenu(container)
    this.setValue(value)

    const observer = new MutationObserver((mutations) => {
      this.element = getMenu(container)
      console.log("mmmhhhmmmm", mutations)
      this.renderValue()
    })
    observer.observe(container, {
      subtree: true,
      childList: true,
    })
  }

  setValue(value: number) {
    this.value = value
    this.renderValue()
  }

  setLastCustomValue(value: number) {
    this.lastCustomValue = value
  }

  private renderValue() {
    if (!this.element || this.value === undefined) return

    const menuItems = this.element.querySelectorAll(".ytp-menuitem") ?? []

    Array.from(menuItems)
      .find((el) =>
        el
          .querySelector(".ytp-menuitem-label:not(.my-custom-label")
          ?.textContent?.toLowerCase()
          .startsWith("custom")
      )
      ?.remove()

    const selectedLabel = this.value === 1 ? "normal" : this.value.toString()
    console.log("tt", selectedLabel)

    for (const menuItem of menuItems) {
      const labelValue = menuItem.querySelector(".ytp-menuitem-label")?.textContent?.toLowerCase()
      menuItem.ariaChecked = labelValue === selectedLabel ? "true" : "false"
    }

    if (this.lastCustomValue !== undefined) {
      const isDefaultSpeed = isDefaultYoutubeSpeed(this.value)
      this.customMenuItem.ariaChecked = isDefaultSpeed ? "false" : "true"
      this.customMenuItemLabel.textContent = `Custom (${this.lastCustomValue})`

      if (!document.body.contains(this.customMenuItem)) {
        this.element.insertAdjacentElement("afterbegin", this.customMenuItem)
      }
    }
  }
}

function getMenu(container: Element) {
  const panel = Array.from(container.querySelectorAll(".ytp-panel")).find(
    (el) => el.querySelector(".ytp-panel-title")?.textContent?.toLowerCase() === "playback speed"
  )

  if (!!panel) {
    const menu = panel.querySelector(".ytp-panel-menu") ?? undefined
    return menu
  }
}

function isDefaultYoutubeSpeed(value: number) {
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
