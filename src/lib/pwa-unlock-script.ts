/** Shared with the inline head script. Do not import window-only modules here. */
export const PWA_UNLOCK_PARAM = "unlock";
export const PWA_RELOAD_ONCE_KEY = "openhood.reload-once";
export const PWA_CACHE_PREFIX = "openhood-shell-";
export const PWA_LIVE_ORIGIN = "http://localhost:3000";
export const PWA_DEAD_PORT = "3100";
export const PWA_BYPASS_HEADER = "x-openhood-bypass";

/**
 * Runs before React — first paint, no founder click.
 * 1) localhost:3100 / 127.0.0.1:3100 is a dead leftover `next start` — leave for :3000 now.
 * 2) `data-offline-desk` while `/` is the live bay — purge leftover SW and leave once.
 * 3) `/?unlock=1` still works when a leftover worker painted WI-FI DROPPED and the
 *    App Router never hydrates. Visible, not required.
 */
export const PWA_UNLOCK_INLINE = `(function(){
  try {
    var u = new URL(location.href);
    var key = ${JSON.stringify(PWA_RELOAD_ONCE_KEY)};
    var unlock = ${JSON.stringify(PWA_UNLOCK_PARAM)};
    var liveDefault = ${JSON.stringify(PWA_LIVE_ORIGIN)};
    var deadPort = ${JSON.stringify(PWA_DEAD_PORT)};
    var left = false;

    function liveOrigin() {
      var host = u.hostname;
      if (host === "localhost" || host === "127.0.0.1" || host === "[::1]") {
        return u.protocol + "//" + host + ":3000";
      }
      return liveDefault;
    }

    function guarded() {
      try { if (sessionStorage.getItem(key) === "1") return true; } catch (e) {}
      try { if (localStorage.getItem(key) === "1") return true; } catch (e) {}
      return false;
    }

    function mark() {
      try { sessionStorage.setItem(key, "1"); } catch (e) {}
      try { localStorage.setItem(key, "1"); } catch (e) {}
    }

    function go(href) {
      if (left) return;
      left = true;
      mark();
      location.replace(href);
    }

    function purge(done) {
      var jobs = [];
      if ("serviceWorker" in navigator) {
        jobs.push(navigator.serviceWorker.getRegistrations().then(function(regs){
          return Promise.all(regs.map(function(reg){ return reg.unregister(); }));
        }));
      }
      if ("caches" in window) {
        jobs.push(caches.keys().then(function(keys){
          return Promise.all(keys.map(function(k){ return caches.delete(k); }));
        }));
      }
      Promise.all(jobs).then(done, done);
    }

    function keepPath() {
      var path = u.pathname + u.search + u.hash;
      if (u.pathname === "/offline" || u.pathname.indexOf("/offline/") === 0) path = "/";
      return path;
    }

    function deadDevPort() {
      var host = u.hostname;
      return u.port === deadPort && (host === "localhost" || host === "127.0.0.1" || host === "[::1]");
    }

    if (deadDevPort()) {
      var dest = liveOrigin() + keepPath();
      purge(function(){ go(dest); });
      go(dest);
      return;
    }

    if (u.searchParams.get(unlock) === "1") {
      purge(function(){ go("/"); });
      return;
    }

    function painted() {
      return Boolean(document.querySelector("[data-offline-desk]"));
    }

    function onOffline() {
      return u.pathname === "/offline" || u.pathname.indexOf("/offline/") === 0;
    }

    function homeIsLive(res, text) {
      if (!res.ok) return false;
      var dest = new URL(res.url, location.origin);
      if (dest.pathname === "/offline") return false;
      if (/wi-?fi dropped/i.test(text)) return false;
      if (text.indexOf("data-offline-desk") !== -1) return false;
      return true;
    }

    function probeHome(thenLive) {
      fetch("/", {
        cache: "no-store",
        headers: { ${JSON.stringify(PWA_BYPASS_HEADER)}: "1", "Accept": "text/html" }
      }).then(function(res){
        return res.text().then(function(text){
          if (homeIsLive(res, text)) thenLive();
        });
      }).catch(function(){});
    }

    function autoLeave() {
      if (u.searchParams.get(unlock) === "1") return;
      if (guarded() || left) return;
      if (!painted() && !onOffline()) return;

      if (painted() && !onOffline()) {
        purge(function(){ go("/"); });
        setTimeout(function(){ go("/"); }, 400);
        return;
      }

      var probed = false;
      function probe() {
        if (probed || left || guarded()) return;
        probed = true;
        probeHome(function(){ go("/"); });
      }
      purge(probe);
      setTimeout(probe, 400);
    }

    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", autoLeave);
    } else {
      autoLeave();
    }
    window.addEventListener("online", autoLeave);
  } catch (e) {
    try {
      if (location.port === ${JSON.stringify(PWA_DEAD_PORT)}) {
        location.replace(${JSON.stringify(PWA_LIVE_ORIGIN)} + "/");
      } else if (/(?:\\?|&)${PWA_UNLOCK_PARAM}=1(?:&|$)/.test(location.search)) {
        location.replace("/");
      }
    } catch (e2) {}
  }
})();`;
