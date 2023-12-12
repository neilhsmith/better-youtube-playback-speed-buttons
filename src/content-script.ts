import type { Settings } from "./types"
import { CustomSpeedPanel } from "./panels/custom-speed-panel"
import { SettingsPanel } from "./panels/settings-panel"
import { SpeedPanel } from "./panels/speed-panel"
import { ButtonsControl } from "./controls/buttons-control"
import { VideoControl } from "./controls/video-control"
import { isDefaultYoutubeSpeed } from "./utils/youtube"

/**
 * TODO:
 * - bugs
 *   - when a custom value is selected (only for the 1st time), the speed-panel won't select select Normal
 */

const settings: Settings = {
  maxSpeed: 3,
  minSpeed: 0.25,
  step: 0.25,
  sliderStep: 0.05,
}

let videoControl: VideoControl
let buttonsControl: ButtonsControl

let settingsPanel: SettingsPanel
let speedPanel: SpeedPanel
let customSpeedPanel: CustomSpeedPanel

let speed = 1
let lastCustomSpeed: number | undefined

function initialize(ytpSettingsMenu: Element, metaSection: Element, video: HTMLVideoElement) {
  speed = video.playbackRate
  lastCustomSpeed = isDefaultYoutubeSpeed(speed) ? undefined : speed

  settingsPanel = new SettingsPanel(speed, ytpSettingsMenu)
  speedPanel = new SpeedPanel(speed, lastCustomSpeed, ytpSettingsMenu)
  customSpeedPanel = new CustomSpeedPanel(speed, ytpSettingsMenu, settings)
  videoControl = new VideoControl(video)
  buttonsControl = new ButtonsControl(speed, settings, (control) =>
    metaSection.insertAdjacentElement("afterbegin", control)
  )

  speedPanel.onCustomItemClick = update
  customSpeedPanel.onChange = update
  videoControl.onRateChange = update
  buttonsControl.onNeutralClick = () => update(1)
  buttonsControl.onNegativeClick = () => update(speed - settings.step)
  buttonsControl.onPositiveClick = () => update(speed + settings.step)
}

function update(value: number) {
  if (speed === value) return

  speed = value
  lastCustomSpeed = isDefaultYoutubeSpeed(speed) ? lastCustomSpeed : speed

  // TODO: create setters in these instead of setSpeed
  videoControl.setSpeed(speed) // videoControl.speed = value
  buttonsControl.setSpeed(speed) // buttonsControl.speed = value

  settingsPanel.speed = speed
  if (settingsPanel.active) {
    settingsPanel.render()
  }

  speedPanel.speed = speed
  speedPanel.lastCustomSpeed = lastCustomSpeed
  if (speedPanel.active) {
    speedPanel.render()
  }

  customSpeedPanel.speed = speed
  if (customSpeedPanel.active) {
    customSpeedPanel.render()
  }
}

// ---

// the parent of all the video menu's we'll interact with
const ytpSettingsMenu = document.querySelector(".ytp-settings-menu")
if (ytpSettingsMenu) {
  // initializes the content script once the video and meta sections are loaded
  const startupObserver = new MutationObserver(function (mutations, instance) {
    const metaSection = document.getElementById("above-the-fold")
    const video = document.getElementsByTagName("video")

    if (!!metaSection && !!video.length) {
      initialize(ytpSettingsMenu, metaSection, video[0])
      instance.disconnect()
    }
  })
  startupObserver.observe(document.getElementById("content") ?? document.body, {
    childList: true,
    subtree: true,
  })
}
