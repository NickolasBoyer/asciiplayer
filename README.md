# ASCII player

Check out the [demo here](https://nickolasboyer.github.io/asciiplayer/), drag a video file on the page and it should play.

## Example

```js
// all options are optional
const player = Player({
  pixels: [],         // array with pixels to use,
  fps: 60,            // fps to render video with
  width: 100,         // width in chars
  height: 60,         // height in chars
  noBar: false,       // permanently hide controll bar
  preserveRatio: 'fit'// can be null, 'fit' or 'cover'
})

// set element to render ASCII text to (required)
player.init(pixelRenderer)

// URL to get video from, accepts everything <video> does (required)
player.setSourceMedia()
```