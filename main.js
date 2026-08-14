const fs = require("fs");
const path = require("path");
const { BrowserWindow, ipcMain } = require("electron");

// 防抖函数
function debounce(fn, time) {
    let timer = null;
    return function (...args) {
        timer && clearTimeout(timer);
        timer = setTimeout(() => {
            fn.apply(this, args);
        }, time);
    };
}

// 把 CSS 里 url("本地文件") 引用内联为 base64 data URI
const assetCache = {};

function loadAsset(filepath) {
    const stat = fs.statSync(filepath);
    const cached = assetCache[filepath];
    if (cached && cached.mtimeMs === stat.mtimeMs) {
        return cached.uri;
    }
    const data = fs.readFileSync(filepath);
    const ext = path.extname(filepath).slice(1).toLowerCase();
    const mime = {
        svg: "image/svg+xml",
        ttf: "font/ttf",
        otf: "font/otf",
        woff: "font/woff",
        woff2: "font/woff2"
    }[ext] || `image/${ext}`;
    const uri = `data:${mime};base64,${data.toString("base64")}`;
    assetCache[filepath] = { mtimeMs: stat.mtimeMs, uri };
    return uri;
}

function inlineAssets(css) {
    return css.replace(/url\("([^"]+)"\)/g, (match, file) => {
        const filepath = path.join(__dirname, file.replace(/^\.\//, ""));
        try {
            return `url("${loadAsset(filepath)}")`;
        } catch (e) {
            return match;
        }
    });
}

// 更新样式
function updateStyle(webContents) {
    const csspath = path.join(__dirname, "style.css");
    fs.readFile(csspath, "utf-8", (err, data) => {
        if (err) {
            return;
        }
        webContents.send("LiteLoader.custom_css.updateStyle", inlineAssets(data));
    });
}

// 监听样式/资源修改-开发时候用的
function watchCSSChange(webContents) {
    fs.watch(
        __dirname,
        { recursive: true },
        debounce(() => {
            updateStyle(webContents);
        }, 100)
    );
}

onLoad();

function onLoad() {
    ipcMain.on("LiteLoader.custom_css.rendererReady", (event, message) => {
        const window = BrowserWindow.fromWebContents(event.sender);
        updateStyle(window.webContents);
    });
}

function onBrowserWindowCreated(window) {
    watchCSSChange(window.webContents);
}

module.exports = {
    onBrowserWindowCreated
};
