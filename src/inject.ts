import { signal, computed, effect } from "@preact/signals-core"

const KEY = "bypsb" as const
const LABEL_BTN_ID = `${KEY}-LABEL-BTN`

const step = 0.25
const maxSpeed = 10
const allowMouseWheel = true
const allowHotKeys = true

const speed = signal<number | null>(null)
const labels = computed(() => {
  if (speed.value === null)
    return {
      value: "-",
      fixedValue: "-",
      prettyValue: "-",
      label: "-",
    }

  const fixedValue = speed.value.toFixed(2)
  const value = `${fixedValue.replace(/[.0]*$/g, "")}`
  const prettyValue = `${value}x`
  const label = speed.value === 1 ? "Normal" : fixedValue

  return {
    value, // 1, 1.25, 0.5
    fixedValue, // 1.00, 0.50, 1.75
    prettyValue, // 1x, 1.25x, 0.5x
    label, // Normal, 0.50, 1.75
  }
})

effect(render)

/**
 * TODO
 * - mouse wheel
 * - save/load settings to storage
 * - handle the playback menu
 *
 * BUGS
 * - hotkeys get weird when hitting the min/max values
 */

async function initialize(metaEl: HTMLElement, videoEl: HTMLVideoElement) {
  const labelBtnEl = document.createElement("button")
  labelBtnEl.id = LABEL_BTN_ID

  const negBtnEl = document.createElement("button")
  negBtnEl.textContent = "-"

  const posBtnEl = document.createElement("button")
  posBtnEl.textContent = "+"

  const controlEl = document.createElement("div")
  controlEl.className = KEY
  controlEl.appendChild(negBtnEl)
  controlEl.appendChild(labelBtnEl)
  controlEl.appendChild(posBtnEl)

  metaEl.insertAdjacentElement("afterbegin", controlEl)

  labelBtnEl.addEventListener("click", resetSpeed, true)
  negBtnEl.addEventListener("click", decreaseSpeed, true)
  posBtnEl.addEventListener("click", increaseSpeed, true)
  videoEl.addEventListener("ratechange", function (e) {
    e.preventDefault()
    e.stopPropagation()
    speed.value = this.playbackRate
  })

  if (allowHotKeys) {
    document.addEventListener("keydown", function (e) {
      if (e.key === "-") decreaseSpeed()
      else if (e.key === "+") increaseSpeed()
      else if (e.key === "=") resetSpeed()
    })
  }

  const storage = await chrome.storage.local.get("speed")
  speed.value = storage.speed ?? videoEl.playbackRate
}

async function render() {
  if (speed.value === null) return
  console.log("rendering", speed.value)

  await chrome.storage.local.set({ speed: speed.value })

  for (const videoEl of document.getElementsByTagName("video")) {
    videoEl.playbackRate = speed.value
  }

  renderLabelBtn()
  renderSettingsMenu()
  //renderPlaybackSpeedMenu()
}

function renderLabelBtn() {
  const labelBtnEl = document.getElementById(LABEL_BTN_ID)
  if (labelBtnEl) {
    labelBtnEl.textContent = labels.value.prettyValue
  }
}

function renderSettingsMenu() {
  if (speed.value === null) return

  const menuEl = document.querySelector(".ytp-settings-menu")
  const speedLabelEl = Array.from(
    menuEl?.querySelectorAll(".ytp-menuitem-label") ?? []
  ).find((el) => el.textContent === "Playback speed")
  const speedContentEl = speedLabelEl?.nextElementSibling
  if (speedContentEl) {
    speedContentEl.textContent = labels.value.prettyValue
  }
}

// --- helpers

function isYoutubePlaybackSpeedOption(speed: number) {
  return (
    speed === 0.25 ||
    speed === 0.5 ||
    speed === 0.75 ||
    speed === 1 ||
    speed === 1.25 ||
    speed === 1.5 ||
    speed === 1.75 ||
    speed === 2
  )
}

function resetSpeed() {
  speed.value = 1
}

function decreaseSpeed() {
  if (speed.value === null) return

  let fixed = step
  while (fixed < speed.value) fixed += step

  const newSpeed = fixed - step
  if (newSpeed >= 0) speed.value = newSpeed
}

function increaseSpeed() {
  if (speed.value === null) return

  let fixed = maxSpeed
  while (fixed > speed.value) fixed -= step

  const newSpeed = fixed + step
  if (newSpeed <= maxSpeed) speed.value = newSpeed
}

// --- startup

// initialize when the video is ready
new MutationObserver(function (_, instance) {
  // TODO: is it safe to assume there's only 1 video?

  const meta = document.getElementById("above-the-fold")
  const videoEls = document.getElementsByTagName("video")

  if (!!meta && !!videoEls.length) {
    initialize(meta, videoEls[0])
    instance.disconnect()
  }
}).observe(document.getElementById("content") ?? document.body, {
  childList: true,
  subtree: true,
})

// set the settings menu value the first time the settings popover is opened
new MutationObserver(function () {
  renderSettingsMenu()
  //renderPlaybackSpeedMenu()
}).observe(document.querySelector(".ytp-settings-menu") ?? document.body, {
  attributes: true,
  attributeFilter: ["style"],
})
