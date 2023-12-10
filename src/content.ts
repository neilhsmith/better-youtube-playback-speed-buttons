import { signal, effect } from "@preact/signals-core"
import { Settings } from "./types"
import { clamp, round } from "./utils/math"
import { ButtonsControl } from "./controls/buttons-control"
import { VideoControl } from "./controls/video-control"
import { SettingsMenu } from "./youtube-menus/settings-menu"
import { PlaybackSpeedMenu } from "./youtube-menus/playback-speed-menu"
import { CustomSpeedMenu } from "./youtube-menus/custom-speed-menu"

const speed = signal(1)

const settings: Settings = {
  maxSpeed: 3,
  minSpeed: 0.25,
  step: 0.25,
  sliderStep: 0.05,
}

let buttonsControl: ButtonsControl
let videoControl: VideoControl

let settingsMenu: SettingsMenu
let playbackSpeedMenu: PlaybackSpeedMenu
let customSpeedMenu: CustomSpeedMenu

function initialize(menuContainer: Element, metaSection: Element, video: HTMLVideoElement) {
  // the meta section & video are loaded so we can create the buttons control,
  // setup event listeners, set the initial speed, and start the effect

  const initialSpeed = video.playbackRate

  buttonsControl = new ButtonsControl(initialSpeed, settings, (control) =>
    metaSection.insertAdjacentElement("afterbegin", control)
  )
  buttonsControl.onNeutralClick = () => updateSpeed(1)
  buttonsControl.onNegativeClick = () => updateSpeed(speed.value - settings.step)
  buttonsControl.onPositiveClick = () => updateSpeed(speed.value + settings.step)

  videoControl = new VideoControl(video)
  videoControl.onRateChange = (value) => updateSpeed(value)

  settingsMenu = new SettingsMenu(initialSpeed, menuContainer)
  playbackSpeedMenu = new PlaybackSpeedMenu(initialSpeed, menuContainer)
  customSpeedMenu = new CustomSpeedMenu(initialSpeed, settings, menuContainer)

  playbackSpeedMenu.onCustomItemClick = (value) => updateSpeed(value)

  customSpeedMenu.onChange = (value) => {
    playbackSpeedMenu.setLastCustomValue(value)
    updateSpeed(value)
  }

  effect(render)
  updateSpeed(initialSpeed)
}

function render() {
  buttonsControl.setValue(speed.value)
  videoControl.setValue(speed.value)

  settingsMenu.setValue(speed.value)
  playbackSpeedMenu.setValue(speed.value)
  customSpeedMenu.setValue(speed.value)
}

// ---

function updateSpeed(value: number) {
  const rounded = round(value)
  const newSpeed = clamp(rounded, settings.minSpeed, settings.maxSpeed)

  speed.value = newSpeed
}

// ---

// the parent of all the video menu's we'll interact with
const ytpSettingsMenu = document.querySelector(".ytp-settings-menu")
if (ytpSettingsMenu) {
  // initializes the content script once the video and meta sections are loaded
  const startupObserver = new MutationObserver(function (_, instance) {
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
