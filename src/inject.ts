const KEY = "bypsb" as const

async function handleVideoLoaded(
  metaElement: HTMLElement,
  videoElement: HTMLVideoElement
) {
  const storedSettings = await chrome.storage.sync.get("speed")
  const state = {
    speed: 1,
    step: 0.25,
    maxSpeed: 10,
    allowMouseWheel: true,
    ...storedSettings,
  }

  const control = document.createElement("div")
  control.className = KEY
  const decreaseBtn = document.createElement("button")
  decreaseBtn.className = "negative-btn"
  decreaseBtn.innerText = "-"
  const increaseBtn = document.createElement("button")
  increaseBtn.className = "positive-btn"
  increaseBtn.innerText = "+"
  const labelElement = document.createElement("button")
  labelElement.className = "label-btn"
  control.appendChild(decreaseBtn)
  control.appendChild(labelElement)
  control.appendChild(increaseBtn)

  metaElement.insertAdjacentElement("afterbegin", control)
  changePlaybackSpeed(state.speed)

  control.addEventListener(
    "click",
    function (e) {
      if (e.target === decreaseBtn) decreasePlaybackSpeed()
      else if (e.target === increaseBtn) increasePlaybackSpeed()
      else if (e.target === labelElement) resetPlaybackSpeed()
    },
    true
  )

  videoElement.addEventListener(
    "ratechange",
    function (e) {
      e.preventDefault()
      e.stopPropagation()
      const speed = videoElement.playbackRate
      changePlaybackSpeed(speed)
    },
    true
  )

  const observer = new MutationObserver(function () {
    const labels = document.getElementsByClassName("ytp-menuitem-label")
    for (const label of labels) {
      if (label.textContent === "Playback speed" && !!label.nextSibling) {
        label.nextSibling.textContent = `${state.speed}x`
      }
    }

    const idk = document.getElementsByClassName("ytp-panel-title")
    for (const title of idk) {
      if (title.textContent === "Playback speed") {
        if (isYoutubeMenuSpeedOption(state.speed)) {
          // TODO: prob a better way to calc the label
          let label = "Normal"
          if (state.speed === 2) {
            label = "2"
          } else if (state.speed !== 1) {
            label = state.speed.toFixed(2)
            label = label.endsWith("0") ? label.slice(0, -1) : label
          }

          const idk2 = document.getElementsByClassName("ytp-menuitem")
          for (const option of idk2) {
            if (option.firstElementChild?.textContent === label) {
              option.ariaChecked = "true"
            } else {
              option.ariaChecked = "false"
            }
          }
        } else {
          // TODO: this causes an infinite loop
          // const menu = document.getElementsByClassName("ytp-panel-menu")[0]
          // const menuItem = document.createElement("div")
          // menuItem.className = "ytp-menuitem"
          // menuItem.ariaRoleDescription = "menuitemradio"
          // menuItem.ariaChecked = "true"
          // menuItem.textContent = "Custom"
          // menu.insertAdjacentElement("afterbegin", menuItem)
        }
      }
    }
  })

  observer.observe(document.body, {
    childList: true,
    subtree: true,
  })

  // ---

  function decreasePlaybackSpeed() {
    changePlaybackSpeed(state.speed - state.step)
  }

  function increasePlaybackSpeed() {
    changePlaybackSpeed(state.speed + state.step)
  }

  function resetPlaybackSpeed() {
    changePlaybackSpeed(1)
  }

  async function changePlaybackSpeed(value: number) {
    if (value < 0 || value > state.maxSpeed) {
      return
    }

    state.speed = value
    labelElement.innerText = `${value}x`
    videoElement.playbackRate = value
    await chrome.storage.sync.set({
      speed: state.speed,
    })
  }
}

function isYoutubeMenuSpeedOption(value: number) {
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

// ---

const observer = new MutationObserver(function (mutations, instance) {
  var meta = document.getElementById("above-the-fold")
  const video = document.getElementsByTagName("video")[0]
  if (!!meta && !!video) {
    handleVideoLoaded(meta, video)
    instance.disconnect()
  }
})

observer.observe(document.body, {
  childList: true,
  subtree: true,
})

export {}
