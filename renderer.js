function onLoad() {
    const element = document.createElement("style");
    document.head.appendChild(element);

    custom_css.updateStyle((event, message) => {
        element.textContent = message;
    });

    custom_css.rendererReady();
}

function overrideInline() {
    let done = false;
    for (const selector of [".sidebar-nav", ".message-panel"]) {
        const el = document.querySelector(selector);
        if (el) {
            el.style.setProperty("background", "transparent", "important");
            done = true;
        }
    }
    return done;
}

const observer = new MutationObserver(() => overrideInline());
observer.observe(document.documentElement, { childList: true, subtree: true });
overrideInline();
onLoad();