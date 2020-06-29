export const Bar = () => ({
  visible: false,
  hideTimer: null,
  txt: '',
  width: 0,
  middleBarLength: 0,
  middleBarBar: '',
  middleBarSpace: '',
  progressBar: '',
  playState: false,
  playLabel: '   &#9658; PLAY   ',
  mediaDuration: 0,
  mediaProgress: 0,
  displaytTime: '',
  render() {
    this.txt = `
+------------+${this.middleBarBar  }+---------------+
|            |${this.middleBarSpace}|               |
|${this.playLabel}|${this.progressBar}|${this.displaytTime}|
|            |${this.middleBarSpace}|               |
+------------+${this.middleBarBar  }+---------------+
`
  },
  setWidth(w) {
    this.width = w
    this.middleBarLength = w - 14 - 15 - 2
    this.middleBarBar = '-'.repeat(this.middleBarLength)
    this.middleBarSpace = ' '.repeat(this.middleBarLength)
    this.setProgress(0);
  },
  setDuration(d) {
    this.mediaDuration = d
    this.mediaProgress = 0
    this.displaytTime = String(this.mediaProgress).padStart(7, ' ') + '/' + String(d).padEnd(7, ' ')
    this.progressBar = ' ' + '&blk34;' + '&blk14;'.repeat(this.middleBarLength - 2 - 1) + ' '
  },
  setProgress(p) {
    this.mediaProgress = p
    this.displaytTime = String(p).padStart(7, ' ') + '/' + String(this.mediaDuration).padEnd(7, ' ')
    const barBlocks = Math.floor((this.middleBarLength - 2) * (p / this.mediaDuration))
    this.progressBar = ' ' + '&blk34;'.repeat(barBlocks) + '&blk14;'.repeat(this.middleBarLength - 2 - barBlocks) + ' '
  },
  setPlayState(s) {
    this.playState = s
    this.playLabel = s ? ' | | PAUSE  ' : '   &#9658; PLAY   '
  },
  hide() {
    this.visible = false
  },
  show() {
    this.visible = true
  },
  hideTimeout(t) {
    if (this.hideTimer) window.clearTimeout(this.hideTimer)
    this.hideTimer = window.setTimeout(this.hide.bind(this), t)
  }
})
