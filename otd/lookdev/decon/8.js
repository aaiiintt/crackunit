// 8 · End. The date once more, the nine addresses, the link-in-bio, and the
// Giphy credit the stickers require. White. Quiet.
function preload() { OTD.preload(); }
function setup() { createCanvas(1080, 1350); }
function draw() {
  OTD.begin(); background(OTD.WHITE);
  fill(0); OTD.times(150); text("9 November", 60, 260);
  OTD.times(96); text(OTD.years().join(" and "), 60, 380);
  OTD.courier(24); let y = 560;
  for (const p of OTD.posts()) { text(`crackunit.com${p.permalink}`, 60, y); y += 40; }
  OTD.times(56); text(`otd.crackunit.com/${OTD.day.day}/`, 60, y + 120);
  OTD.label("Powered by GIPHY", 60, 1350 - 60, 14);
  OTD.done();
}
