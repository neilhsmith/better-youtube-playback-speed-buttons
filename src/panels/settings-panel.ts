export class SettingsPanel {
  // the .ytp-panel-menu element, whenever it's present
  private menuElement: Element | null = null

  public speed: number | undefined

  get active() {
    return !!this.menuElement
  }

  constructor(speed: number, readonly ytpSettingsMenu: Element) {
    this.speed = speed

    new MutationObserver(this.handleMutations).observe(ytpSettingsMenu, {
      childList: true,
      subtree: true,
    })
  }

  render = () => {
    if (!this.menuElement || !this.speed) return
    console.log("render settings-panel", this.speed)

    const playbackSpeedLabelElement = SettingsPanel.getPlaybackSpeedLabelElement(this.menuElement)
    const contentElement = playbackSpeedLabelElement?.nextElementSibling

    if (!contentElement) return

    const prettyValue = this.speed === 1 ? "Normal" : `${this.speed}x`
    contentElement.textContent = prettyValue
  }

  private handleMutations = (mutations: MutationRecord[]) => {
    for (const mutation of mutations) {
      for (const node of mutation.addedNodes) {
        if (node.nodeType !== 1) continue

        const element = node as Element

        const expectedLabel = SettingsPanel.getPlaybackSpeedLabelElement(element)
        const hasExpectedLabel = !!expectedLabel

        if (hasExpectedLabel) {
          // there's 2 different mutations that trigger opening the settings-panel
          // when opening from the page, the menuitems are the mutation's nodes and must find the menu from the mutation's target
          // but when opening from the speed-menu, the mutation's node is the panel so we can grab the menu from its children

          const target = mutation.target as Element
          const menuElement = target.classList.contains("ytp-panel-menu")
            ? target
            : element.querySelector(".ytp-panel-menu")
          this.menuElement = menuElement
          this.render()
        } else {
          this.menuElement = null
        }
      }
    }
  }

  static getPlaybackSpeedLabelElement(element: Element) {
    return Array.from(element.querySelectorAll(".ytp-menuitem-label") ?? []).find(
      (el) => el.textContent === "Playback speed"
    )
  }
}
