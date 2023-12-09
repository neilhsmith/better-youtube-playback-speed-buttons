const KEY = "bypsb" as const

async function handleVideoLoaded(metaElement: HTMLElement, videoElement: HTMLVideoElement) {
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

  /**
   * settings menu
   * .ytp-settings-menu
   *   .ytp-panel
   *     .ytp-panel-menu
   *       .ytp-menuitem
   *         .ytp-menuitem-label textContent === Playback speed
   *
   * playback speed menu
   * .ytp-settings-menu
   *   .ytp-panel
   *     .ytp-panel-header
   *       .ytp-panel-title textContent === Playback speed
   *     .ytp-panel-menu
   *       .ytp-menuitem tabindex="0" role="menuitemradio" aria-checked="true"
   *         .ytp-menuitem-label textContent === Custom (x.x)
   *
   * custom menu
   * .ytp-settings-menu
   *   .ytp-panel    height: 153
   *     .ytp-speedslider-component
   *       .ytp-slider-section
   *         .ytp-slider-handle style (left: 84.4015px)
   *           :before & :after
   *         .ytp.speedslider-text (1.35x)
   *
   * - update the settings menu's label anytime it's mutation obs fires OR when the speed changes (only if the label exists yet)
   *
   */

  const menuElement = document.getElementsByClassName("ytp-settings-menu")[0]

  const testObserver = new MutationObserver(function (mutations, instance) {
    if (isPlaybackSpeedMenu(menuElement)) {
      console.log("playback menu bro")
    } else if (isSettingsMenu(menuElement)) {
    }
  })

  !!menuElement &&
    testObserver.observe(menuElement, {
      // attributeFilter: ["style"],
      // attributeOldValue: true,
      subtree: true,
      childList: true,
    })

  // const observer = new MutationObserver(function () {
  //   let _idk = false

  //   const labels = document.getElementsByClassName("ytp-menuitem-label")
  //   for (const label of labels) {
  //     if (label.textContent === "Playback speed" && !!label.nextSibling) {
  //       label.nextSibling.textContent = `${state.speed}x`
  //     }
  //   }

  //   const titles = document.getElementsByClassName("ytp-panel-title")
  //   for (const title of titles) {
  //     if (title.textContent === "Playback speed") {
  //       if (isYoutubeMenuSpeedOption(state.speed)) {
  //         // TODO: prob a better way to calc the label
  //         let label = "Normal"
  //         if (state.speed === 2) {
  //           label = "2"
  //         } else if (state.speed !== 1) {
  //           label = state.speed.toFixed(2)
  //           label = label.endsWith("0") ? label.slice(0, -1) : label
  //         }

  //         for (const option of document.getElementsByClassName(
  //           "ytp-menuitem"
  //         )) {
  //           if (option.firstElementChild?.textContent === label) {
  //             option.ariaChecked = "true"
  //           } else {
  //             option.ariaChecked = "false"
  //           }
  //         }
  //       } else {
  //         let hasCustom = false
  //         for (const option of document.getElementsByClassName(
  //           "ytp-menuitem"
  //         )) {
  //           if (option.firstElementChild?.textContent?.startsWith("Custom")) {
  //             debugger
  //             hasCustom = true
  //             option.ariaChecked = "true"
  //           }
  //         }

  //         if (!hasCustom && !_idk) {
  //           debugger
  //           _idk = true
  //           const menu = document.getElementsByClassName("ytp-panel-menu")[0]
  //           const menuItem = document.createElement("div")
  //           menuItem.className = "ytp-menuitem"
  //           menuItem.ariaRoleDescription = "menuitemradio"
  //           menuItem.ariaChecked = "true"
  //           menuItem.textContent = "Custom"
  //           menu.insertAdjacentElement("afterbegin", menuItem)
  //         }
  //       }
  //     }
  //   }
  // })

  // observer.observe(document.body, {
  //   childList: true,
  //   subtree: true,
  // })

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

function isSettingsMenu(menu: Element) {
  return Array.from(menu.querySelectorAll(".ytp-menuitem-label")).some(
    (el) => el.textContent === "Playback speed"
  )
}

function isPlaybackSpeedMenu(menu: Element) {
  return Array.from(menu.querySelectorAll(".ytp-panel-title")).some(
    (el) => el.textContent === "Playback speed"
  )
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
