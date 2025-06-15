(function () {
  if (!window.chatbase || window.chatbase("getState") !== "initialized") {
    window.chatbase = (...arguments) => {
      if (!window.chatbase.q) { window.chatbase.q = [] }
      window.chatbase.q.push(arguments)
    };
    window.chatbase = new Proxy(window.chatbase, {
      get(target, prop) {
        if (prop === "q") { return target.q }
        return (...args) => target(prop, ...args)
      }
    })
  }
  // Add preconnect for faster DNS/TLS
  if (!document.querySelector('link[rel="preconnect"][href="https://www.chatbase.co"]')) {
    const preconnect = document.createElement('link');
    preconnect.rel = 'preconnect';
    preconnect.href = 'https://www.chatbase.co';
    document.head.appendChild(preconnect);
  }

  // Show a loading indicator until Chatbase loads
  if (!document.getElementById('chatbase-loader-indicator')) {
    const loader = document.createElement('div');
    loader.id = 'chatbase-loader-indicator';
    loader.style = 'position:fixed;bottom:24px;right:24px;z-index:9999;background:#fff;padding:8px 16px;border-radius:8px;box-shadow:0 2px 8px rgba(0,0,0,0.15);font-size:14px;color:#333;transition:opacity 0.2s;';
    // loader.innerText = 'Loading chat...';
    // document.body.appendChild(loader);
  }

  const removeLoader = () => {
    const l = document.getElementById('chatbase-loader-indicator');
    if (l) {
      l.style.opacity = '0';
      setTimeout(() => l.remove(), 200);
    }
  };

  const onLoad = function () {
    const script = document.createElement("script");
    script.src = "https://www.chatbase.co/embed.min.js";
    script.id = "on1BO6ELf1bD-yzHsttJn";
    script.domain = "www.chatbase.co";
    script.async = true;
    script.defer = true; // Hint browser to load ASAP
    script.onload = function() {
      // Try to wait for chatbase widget to be ready, fallback to shorter timeout
      let attempts = 0;
      const checkReady = () => {
        attempts++;
        if (window.ChatbaseWidget && window.ChatbaseWidget.isReady) {
          removeLoader();
        } else if (attempts < 8) { // 2 seconds max
          setTimeout(checkReady, 250);
        } else {
          removeLoader();
        }
      };
      checkReady();
    };
    script.onerror = function() {
      const l = document.getElementById('chatbase-loader-indicator');
      if (l) l.innerText = 'Failed to load chat.';
    };
    document.body.appendChild(script);
  };

  if (document.readyState === "complete" || document.readyState === "interactive") {
    onLoad();
  } else {
    window.addEventListener("DOMContentLoaded", onLoad);
  }
})();