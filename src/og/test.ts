import { signal, effect } from "@preact/signals-core"

const settingsMenu = document.querySelector(".ytp-settings-menu")

const step = 0.25
const minSpeed = 0.25
const maxSpeed = 5

const speed = signal(1)
let lastCustomValue: number

/**
 * TODO:
 * - features
 *   - locale for speed value formatting
 *   - options panel / settings / storage
 * - style
 *   - buttons
 *   - custom slider & label
 * - create classes which manage youtube things
 *     * i imagine classes which can be instantiated whenever their respective menu opens and takes the parent settings-menu to find children from
 *     * could also provide static methods which take the parent settings-menu element as an arg instead of the instance's field
 *   - SettingsMenuManager
 *     - isSettingsMenu()
 *     - setValue()
 *   - PlaybackSpeedMenuManager
 *   - CustomSpeedMenuManager
 */

const customPanelSlider = document.createElement("input")
const customPanelLabel = document.createElement("span")
const customPanelContent = document.createElement("div")
customPanelSlider.type = "range"
customPanelSlider.min = minSpeed.toString()
customPanelSlider.max = maxSpeed.toString()
customPanelSlider.step = ".05"
customPanelSlider.value = speed.value.toString()
customPanelContent.style.border = "1px solid orange"
customPanelContent.appendChild(customPanelSlider)
customPanelContent.appendChild(customPanelLabel)
customPanelSlider.addEventListener("input", handleSliderChange)
customPanelSlider.addEventListener("change", handleSliderChange)

const customSpeedMenuItem = document.createElement("div")
customSpeedMenuItem.className = "ytp-menuitem"
customSpeedMenuItem.tabIndex = 0
customSpeedMenuItem.role = "menuitemradio"
customSpeedMenuItem.addEventListener("click", handleCustomMenuItemClick)
const customSpeedMenuItemLabel = document.createElement("div")
customSpeedMenuItemLabel.className = "ytp-menuitem-label"
customSpeedMenuItem.appendChild(customSpeedMenuItemLabel)

function initialize(meta: Element, video: HTMLVideoElement) {
  const labelBtn = document.createElement("button")
  labelBtn.id = "label-btn"
  labelBtn.textContent = ""
  labelBtn.ariaLabel = "Reset the video playback speed"

  const negBtn = document.createElement("button")
  negBtn.id = "neg-btn"
  negBtn.textContent = "-"
  negBtn.ariaLabel = "Decrease video playback speed"

  const posBtn = document.createElement("button")
  posBtn.id = "pos-btn"
  posBtn.textContent = "+"
  posBtn.ariaLabel = "Increase video playback speed"

  const control = document.createElement("div")
  control.id = "bypsb"
  control.appendChild(negBtn)
  control.appendChild(labelBtn)
  control.appendChild(posBtn)

  meta.insertAdjacentElement("afterbegin", control)

  labelBtn.addEventListener("click", resetSpeed, true)
  negBtn.addEventListener("click", decreaseSpeed, true)
  posBtn.addEventListener("click", increaseSpeed, true)
  video.addEventListener("ratechange", handleVideoRatechange)

  effect(render)
  speed.value = video.playbackRate
}

function handleVideoRatechange(this: HTMLVideoElement, e: Event) {
  e.preventDefault()
  e.stopPropagation()
  speed.value = this.playbackRate
}

function handleSliderChange(this: HTMLInputElement) {
  const newSpeed = Number(this.value)

  if (isNaN(newSpeed)) return

  lastCustomValue = newSpeed
  speed.value = newSpeed

  customPanelLabel.textContent = newSpeed.toString()
}

function handleCustomMenuItemClick(this: HTMLElement) {
  if (!lastCustomValue) return

  speed.value = lastCustomValue

  if (!settingsMenu) return
  const panel = getPlaybackSpeedMenuPanel(settingsMenu)
  if (!panel) return

  const backButton = panel.querySelector<HTMLButtonElement>(".ytp-panel-back-button")
  if (!backButton) return

  backButton.click()
}

function handleMenuMutations(mutations: MutationRecord[]) {
  // whenever the ytp-settings-menu changes content, render either
  // the settings menu or playback speed menu based on which is active
  // so that the speed is synced

  mutations.forEach((mutation) => {
    if (isCustomSpeedMenuAddedMutation(mutation)) {
      renderCustomSpeedMenu()
    } else if (isPlaybackSpeedMenuAddedMutation(mutation)) {
      renderPlaybackSpeedMenu()
    } else if (isSettingsMenuAddedMutation(mutation)) {
      renderSettingsMenu()
    }
  })
}

// --- actions

function decreaseSpeed() {
  const newSpeed = speed.value - step
  const rounded = Math.round((newSpeed + Number.EPSILON) * 100) / 100
  speed.value = rounded < minSpeed ? minSpeed : rounded
}

function increaseSpeed() {
  const newSpeed = speed.value + step
  const rounded = Math.round((newSpeed + Number.EPSILON) * 100) / 100
  speed.value = rounded > maxSpeed ? maxSpeed : rounded
}

function resetSpeed() {
  speed.value = 1
}

// --- render

function render() {
  renderButtons()
  renderVideo()
  renderSettingsMenu()
  renderPlaybackSpeedMenu()
}

function renderButtons() {
  const control = document.querySelector("#bypsb")
  const label = control?.querySelector("#label-btn")

  if (!control || !label) return

  label.textContent = `${speed.value}x`

  const negBtn = control.querySelector<HTMLButtonElement>("#neg-btn")
  if (negBtn) {
    const canDecrease = speed.value > minSpeed
    negBtn.ariaDisabled = canDecrease ? "false" : "true"
    negBtn.disabled = !canDecrease
  }

  const posBtn = control.querySelector<HTMLButtonElement>("#pos-btn")
  if (posBtn) {
    const canIncrease = speed.value < maxSpeed
    posBtn.ariaDisabled = canIncrease ? "false" : "true"
    posBtn.disabled = !canIncrease
  }
}

function renderVideo() {
  const videos = document.getElementsByTagName("video")
  for (const video of videos) {
    video.playbackRate = speed.value
  }
}

function renderSettingsMenu() {
  if (!settingsMenu) return

  const element = getSettingsMenuValue(settingsMenu)
  if (!element) return

  const formatted = speed.value === 1 ? "Normal" : `${speed.value}x`
  element.textContent = formatted
}

function renderPlaybackSpeedMenu() {
  if (!settingsMenu) return
  if (!hasPlaybackSpeedMenu(settingsMenu)) return

  const panel = getPlaybackSpeedMenuPanel(settingsMenu)
  if (!panel) return

  const menu = panel.querySelector(".ytp-panel-menu")
  if (!menu) return

  const menuItems = menu.querySelectorAll(".ytp-menuitem")

  const customItem = Array.from(menuItems).find((el) =>
    el.querySelector(".ytp-menuitem-label")?.textContent?.toLowerCase().startsWith("custom")
  )
  if (customItem) {
    customItem.remove()
  }

  const isDefaultSpeed = isYoutubeSpeedMenuItemOptions(speed.value)
  const selectedLabel = speed.value === 1 ? "normal" : speed.value.toString()

  for (const menuItem of menuItems) {
    const labelValue = menuItem.querySelector(".ytp-menuitem-label")?.textContent?.toLowerCase()
    menuItem.ariaChecked = labelValue === selectedLabel ? "true" : "false"
  }

  if (lastCustomValue) {
    customSpeedMenuItem.ariaChecked = isDefaultSpeed ? "false" : "true"
    customSpeedMenuItemLabel.textContent = `Custom (${lastCustomValue})`
    menu.insertAdjacentElement("afterbegin", customSpeedMenuItem)
  }
}

// ---

function renderCustomSpeedMenu() {
  if (!settingsMenu) return
  if (!hasCustomSpeedMenu(settingsMenu)) return

  const panel = getCustomMenuPanel(settingsMenu)
  if (!panel) return

  // remove yt's slider & label but perserve the panel's height
  const panelHeight = panel.style.height
  panel.querySelector(".ytp-speedslider-component")?.remove()
  panel.style.minHeight = panelHeight

  customPanelSlider.value = speed.value.toString()
  customPanelLabel.textContent = `${speed.value}x`

  panel.appendChild(customPanelContent)
}

// --- utils

function isSettingsMenuAddedMutation(mutation: MutationRecord) {
  for (const node of mutation.addedNodes) {
    if (node.nodeType !== 1) continue

    const hasPlaybackSpeedLabel = hasSettingsMenu(node as Element)

    if (hasPlaybackSpeedLabel) {
      return true
    }
  }

  return false
}

function isPlaybackSpeedMenuAddedMutation(mutation: MutationRecord) {
  for (const node of mutation.addedNodes) {
    if (node.nodeType !== 1) continue

    const hasPlaybackSpeedTitle = hasPlaybackSpeedMenu(node as Element)

    if (hasPlaybackSpeedTitle) {
      return true
    }
  }

  return false
}

function isCustomSpeedMenuAddedMutation(mutation: MutationRecord) {
  for (const node of mutation.addedNodes) {
    if (node.nodeType !== 1) continue

    const isCustomSpeedMenu = hasCustomSpeedMenu(node as Element)

    if (isCustomSpeedMenu) {
      return true
    }
  }

  return false
}

function getSettingsMenuLabel(element: Element) {
  return Array.from(element.querySelectorAll(".ytp-menuitem-label")).find(
    (el) => el.textContent?.toLowerCase() === "playback speed"
  )
}

function getSettingsMenuValue(element: Element) {
  const associatedLabel = getSettingsMenuLabel(element)
  return associatedLabel?.nextElementSibling ?? undefined
}

function getPlaybackSpeedMenuPanel(element: Element) {
  return Array.from(element.querySelectorAll(".ytp-panel")).find(
    (el) => el.querySelector(".ytp-panel-title")?.textContent?.toLowerCase() === "playback speed"
  )
}

function getCustomMenuPanel(element: Element) {
  return Array.from(element.querySelectorAll<HTMLElement>(".ytp-panel")).find(
    (el) => el.querySelector(".ytp-panel-title")?.textContent?.toLowerCase() === "custom"
  )
}

function getPanelTitles(element: Element) {
  return Array.from(element.querySelectorAll(".ytp-panel-title"))
}

function hasSettingsMenu(element: Element) {
  const settingsMenuPlaybackSpeedLabel = getSettingsMenuLabel(element)
  const hasPlaybackSpeedLabel = !!settingsMenuPlaybackSpeedLabel

  return hasPlaybackSpeedLabel
}

function hasPlaybackSpeedMenu(element: Element) {
  const panelTitles = getPanelTitles(element)
  const hasPlaybackSpeedTitle = panelTitles.some(
    (el) => el.textContent?.toLowerCase() === "playback speed"
  )

  return hasPlaybackSpeedTitle
}

function hasCustomSpeedMenu(element: Element) {
  const panelTitles = getPanelTitles(element)
  const hasCustomTitle = panelTitles.some((el) => el.textContent?.toLowerCase() === "custom")

  return hasCustomTitle
}

function isYoutubeSpeedMenuItemOptions(value: number) {
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

// --- startup

if (settingsMenu) {
  // TODO: revist this truthy check for settingsMenu
  // - it might be better to start a mutation observer to wait for the settingsMenu
  //   in case it doesn't exist yet

  const settingsMenuObserver = new MutationObserver(handleMenuMutations)
  settingsMenuObserver.observe(settingsMenu, {
    childList: true,
    subtree: true,
  })

  const videoObserver = new MutationObserver(function (_, instance) {
    const meta = document.getElementById("above-the-fold")
    const videoEls = document.getElementsByTagName("video")

    if (!!meta && !!videoEls.length) {
      initialize(meta, videoEls[0])
      instance.disconnect()
    }
  })
  videoObserver.observe(document.getElementById("content") ?? document.body, {
    childList: true,
    subtree: true,
  })
}
