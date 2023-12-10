export class SettingsMenu {
  private value: number | undefined
  private element: Element | undefined

  constructor(value: number, readonly container: Element) {
    this.element = getSettingsMenu(container)
    this.setValue(value)

    const observer = new MutationObserver((mutations) => {
      // FIXME: shouldn't render when transitioning from settings-menu to playback-speed-menu
      this.element = getSettingsMenu(container)
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

  private renderValue() {
    if (!this.element || this.value === undefined) return

    const label = getPlaybackSpeedLabel(this.element)
    const content = label?.nextElementSibling

    if (!content) return

    const prettyValue = this.value === 1 ? "Normal" : `${this.value}x`
    content.textContent = prettyValue
  }
}

function getSettingsMenu(container: Element) {
  const panel = container.querySelector(".ytp-panel:not(.ytp-panel-animate-forward)")
  if (!panel) return

  for (const menu of panel.querySelectorAll(".ytp-panel-menu")) {
    const label = getPlaybackSpeedLabel(menu)

    if (!!label) {
      return menu
    }
  }
}

function getPlaybackSpeedLabel(settingsMenu: Element) {
  return Array.from(settingsMenu.querySelectorAll(".ytp-menuitem-label") ?? []).find(
    (el) => el.textContent?.toLowerCase() === "playback speed"
  )
}
