import type { Settings } from "./types"
import { CustomSpeedPanel } from "./panels/custom-speed-panel"
import { SettingsPanel } from "./panels/settings-panel"
import { SpeedPanel } from "./panels/speed-panel"
import { ButtonsControl } from "./controls/buttons-control"
import { VideoControl } from "./controls/video-control"
import { isDefaultYoutubeSpeed } from "./utils/youtube"

/**
 * TODO:
 * - can't select normal when a custom item is selected for the first time
 * - doesnt render until 1st reload
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
  buttonsControl = new ButtonsControl(speed, settings, (control) => {
    const title = metaSection.querySelector("#title h1")
    title?.insertAdjacentElement("beforeend", control)
  })

  speedPanel.onChange = update
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
  const stylesheet = document.createElement("style")
  stylesheet.innerText = `
  .bypsb {
    display: flex;
    flex-direction: row;
    height: 36px;
    color: #0f0f0f;

    .neg-btn,
    .pos-btn,
    .label-btn {
      background: rgba(0, 0, 0, 0.05);
      cursor: pointer;
      border: 0;
      margin: 0;
      font-size: 14px;
      font-weight: 500;
      font-family: "Roboto", "Arial", sans-serif;

      &:hover {
        background: rgba(0, 0, 0, 0.1);
      }
      &:active {
        background: rgba(0, 0, 0, 0.25);
      }
      &:focus-visible {
        background: rgb(255, 255, 255);
      }
    }

    .neg-btn,
    .pos-btn {
      position: relative;
      padding: 10px 16px;

      &::before {
        content: "";
        position: absolute;
        top: 6px;
        height: 24px;
        width: 1px;
        background: rgba(0, 0, 0, 0.1);
      }
    }
    .neg-btn {
      border-radius: 18px 0 0 18px;

      &::before {
        right: 0;
      }
    }
    .pos-btn {
      border-radius: 0 18px 18px 0;

      &::before {
        left: 0;
      }
    }

    .label-btn {
      padding: 10px 12px;
      min-width: 60px;
    }
  }

  #above-the-fold #title h1 {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
  }

  `
  document.head.appendChild(stylesheet)

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
