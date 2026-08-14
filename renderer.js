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

function syncInputAreaHeight() {
    const target = document.querySelector(".chat-input-area");
    if (!target) {
        return false;
    }
    if (!target._heightObserver) {
        const observer = new ResizeObserver((entries) => {
            for (const entry of entries) {
                document.documentElement.style.setProperty(
                    "--chat-input-area-height",
                    `${entry.contentRect.height + 10}px`
                );
            }
        });
        observer.observe(target);
        target._heightObserver = observer;
        document.documentElement.style.setProperty(
            "--chat-input-area-height",
            `${target.getBoundingClientRect().height + 10}px`
        );
    }
    return true;
}

const observer = new MutationObserver(() => {
    overrideInline();
    syncInputAreaHeight();
});
observer.observe(document.documentElement, { childList: true, subtree: true });
overrideInline();
syncInputAreaHeight();
onLoad();