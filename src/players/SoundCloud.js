import React, { Component } from 'react'

import { callPlayer, getSDK } from '../utils'

const SDK_URL = 'https://w.soundcloud.com/player/api.js'
const SDK_GLOBAL = 'SC'
const MATCH_URL = /^https?:\/\/(soundcloud.com|snd.sc)\/([a-z0-9-_]+\/[a-z0-9-_]+)$/

export default class SoundCloud extends Component {
  static displayName = 'SoundCloud'
  static canPlay = url => MATCH_URL.test(url)
  static loopOnEnded = true

  callPlayer = callPlayer
  duration = null
  currentTime = null
  fractionLoaded = null
  load (url, isReady) {
    getSDK(SDK_URL, SDK_GLOBAL).then(SC => {
      if (!this.iframe) return
      const { PLAY, PLAY_PROGRESS, PAUSE, FINISH, ERROR } = SC.Widget.Events
      if (!isReady) {
        this.player = SC.Widget(this.iframe)
        this.player.bind(PLAY, this.props.onPlay)
        this.player.bind(PAUSE, this.props.onPause)
        this.player.bind(PLAY_PROGRESS, e => {
          this.currentTime = e.currentPosition / 1000
          this.fractionLoaded = e.loadedProgress
        })
        this.player.bind(FINISH, () => this.props.onEnded())
        this.player.bind(ERROR, e => this.props.onError(e))
      }
      this.player.load(url, {
        ...this.props.config.soundcloud.options,
        callback: () => {
          this.player.getDuration(duration => {
            this.duration = duration / 1000
            this.props.onReady()
          })
        }
      })
    })
  }
  play () {
    this.callPlayer('play')
  }
  pause () {
    this.callPlayer('pause')
  }
  stop () {
    // Nothing to do
  }
  seekTo (seconds) {
    this.callPlayer('seekTo', seconds * 1000)
  }
  setVolume (fraction) {
    this.callPlayer('setVolume', fraction * 100)
  }
  getDuration () {
    return this.duration
  }
  getCurrentTime () {
    return this.currentTime
  }
  getSecondsLoaded () {
    return this.fractionLoaded * this.duration
  }
  ref = iframe => {
    this.iframe = iframe
  }
  render () {
    const style = {
      width: '100%',
      height: '100%',
      ...this.props.style
    }
    return (
      <iframe
        ref={this.ref}
        src={`https://w.soundcloud.com/player/?url=${encodeURIComponent(this.props.url)}`}
        style={style}
        frameBorder={0}
      />
    )
  }
}
