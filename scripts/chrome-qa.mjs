import { chromium } from 'file:///C:/Users/colel/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs';

const chromePath='C:/Program Files/Google/Chrome/Application/chrome.exe';
const browser=await chromium.launch({headless:false,executablePath:chromePath,args:['--use-angle=default','--window-position=-32000,-32000','--disable-backgrounding-occluded-windows','--disable-renderer-backgrounding','--disable-background-timer-throttling']});
const page=await browser.newPage({viewport:{width:1600,height:900},deviceScaleFactor:1.5});
const errors=[];page.on('console',(message)=>{if(message.type()==='error')errors.push(message.text());});page.on('pageerror',(error)=>errors.push(error.message));page.on('response',(response)=>{if(response.status()>=400)errors.push(`${response.status()} ${response.url()}`);});

await page.goto('http://127.0.0.1:4174/?system=arsenal',{waitUntil:'networkidle'});
await page.getByRole('button',{name:/ENTER SPIRIT LANTERN VILLAGE/i}).click();await page.waitForTimeout(800);
await page.screenshot({path:'output/chrome-levelup-qa.png'});
const levelup={cards:await page.locator('.upgrade-card').count(),icons:await page.locator('.upgrade-card .upgrade-icon').count(),comparisons:await page.locator('.upgrade-comparison').allTextContents()};

await page.goto('http://127.0.0.1:4174/?system=room1&chapter=1',{waitUntil:'networkidle'});
await page.getByRole('button',{name:/ENTER SPIRIT LANTERN VILLAGE/i}).click();
await page.getByRole('button',{name:/BEGIN THE CHAPTER/i}).click();
await page.waitForTimeout(5500);
const perf=await page.evaluate(()=>window.__BRAWLPAWS_PERF__);
await page.screenshot({path:'output/chrome-combat-qa.png'});

await page.goto('http://127.0.0.1:4174/',{waitUntil:'networkidle'});
await page.keyboard.press('o');await page.waitForTimeout(300);
const sliders=await page.locator('[data-audio-setting]').count();
await page.locator('[data-audio-setting="musicVolume"]').fill('0.31');await page.waitForTimeout(100);
await page.reload({waitUntil:'networkidle'});await page.keyboard.press('o');
const persisted=await page.locator('[data-audio-setting="musicVolume"]').inputValue();
await page.screenshot({path:'output/chrome-settings-qa.png'});

console.log(JSON.stringify({levelup,perf,sliders,persisted,errors},null,2));
await browser.close();
