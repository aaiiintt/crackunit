// Remotion CLI config for the on-this-day dry run.
// Docs: https://www.remotion.dev/docs/config
import {Config} from '@remotion/cli/config';

// Chromium is preinstalled for Playwright at this path (Node 22 sandbox,
// no outbound access for Remotion's own browser download). Never let
// Remotion try to download its own browser.
const CHROME_PATH =
	'/opt/pw-browsers/chromium-1194/chrome-linux/chrome';

Config.setBrowserExecutable(CHROME_PATH);

// Remotion defaults to 'headless-shell' mode (the standalone
// chrome-headless-shell binary, which speaks the old `--headless` flag).
// The preinstalled binary here is a full Chrome build, and old headless
// mode has been removed from it — Chrome only understands `--headless=new`
// now. 'chrome-for-testing' mode is what makes Remotion pass that flag.
Config.setChromeMode('chrome-for-testing');

// H.264 output, matches the "Deliver" row of the art-direction frame spec
// (1080x1920 H.264 High, 60fps) — codec/quality tuning is out of scope for
// this dry run, format only.
Config.setCodec('h264');
Config.setVideoImageFormat('jpeg');
Config.setStillImageFormat('png');

Config.setChromiumHeadlessMode(true);
