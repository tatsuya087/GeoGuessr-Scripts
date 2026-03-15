// ==UserScript==
// @name         GeoGuessr Force NMPZ
// @name:ja      GeoGuessr 強制NMPZ
// @namespace    http://tampermonkey.net/
// @version      1.1.0
// @description  A script that forces NMPZ mode for yourself in GeoGuessr.
// @description:ja GeoGuessrで自分だけ強制的にNMPZモードにするスクリプトです。
// @author       sino
// @match        https://www.geoguessr.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=geoguessr.com
// @license      MIT
// @run-at       document-start
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_registerMenuCommand
// @grant        GM_unregisterMenuCommand
// @downloadURL https://update.greasyfork.org/scripts/552078/GeoGuessr%20Force%20NMPZ.user.js
// @updateURL https://update.greasyfork.org/scripts/552078/GeoGuessr%20Force%20NMPZ.meta.js
// ==/UserScript==

(function() {
    'use strict';

    const STORAGE_KEY = 'nmpz_enabled';
    const CSS_ID = 'nmpz-style';

    const PANORAMA_MAP = [
        { path: '/live-challenge/',     selector: '.game-panorama_panorama__tyXtc'  },
        { path: '/duels/',              selector: '.duels-panorama_panorama__fLR_P' },
        { path: '/team-duels/',         selector: '.duels-panorama_panorama__fLR_P' },
        { path: '/battle-royale/',      selector: '.game_panoramaWrapper__r9aMX'    },
        { path: '/competitive-streak/', selector: '.game_panorama__nn0wc'           },
    ];

    const CONTROLS = {
        compass:       { selector: '.compass_compass__lRB0J',     hide: false, noPointer: true  },
        zoomGroup:     { selector: '.styles_controlGroup__2t2NT', hide: true,  noPointer: false },
        subController: { selector: '.styles_columnTwo__kyT60',    hide: true,  noPointer: false },
    };

    let menuCommandId = null;
    let isEnabled = GM_getValue(STORAGE_KEY, true);
    let panoramaObserver = null;
    let panoramaRespawnObserver = null;

    function isGamePage() {
        const path = window.location.pathname;
        return PANORAMA_MAP.some(e => path.includes(e.path));
    }

    function getPanoramaSelector() {
        const path = window.location.pathname;
        return PANORAMA_MAP.find(e => path.includes(e.path))?.selector ?? null;
    }

    function preventEvent(e) {
        e.preventDefault();
        e.stopPropagation();
        return false;
    }

    function preventDragAndZoom(e) {
        if (e.type === 'mousemove' || e.type === 'wheel' ||
            e.type === 'touchmove' || e.type === 'drag' || e.type === 'dragstart') {
            e.preventDefault();
            e.stopPropagation();
            return false;
        }
    }

    function preventMovementKeys(e) {
        if (!isEnabled || !isGamePage()) return;

        const activeElement = document.activeElement;
        if (activeElement && (
            activeElement.tagName === 'INPUT' ||
            activeElement.tagName === 'TEXTAREA' ||
            activeElement.isContentEditable
        )) {
            return;
        }

        const key = e.key.toUpperCase();
        if (key === 'N' || key === 'W' || key === 'A' || key === 'S' || key === 'D') {
            e.preventDefault();
            e.stopPropagation();
            return false;
        }
    }

    function injectCSS() {
        if (document.getElementById(CSS_ID)) return;

        const rules = Object.values(CONTROLS).map(({ selector, hide, noPointer }) => {
            const declarations = [
                hide      ? 'display: none !important;'        : null,
                noPointer ? 'pointer-events: none !important;' : null,
            ].filter(Boolean).join(' ');
            return `${selector} { ${declarations} }`;
        });

        const style = document.createElement('style');
        style.id = CSS_ID;
        style.textContent = rules.join('\n');
        document.head.appendChild(style);
    }

    function removeCSS() {
        document.getElementById(CSS_ID)?.remove();
    }

    function applyOverlay(panorama) {
        if (panorama.dataset.disableApplied === 'true') return;

        const overlay = document.createElement('div');
        overlay.id = 'geoguessr-disable-overlay';
        overlay.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: 1;
            cursor: pointer;
            background-color: transparent;
            pointer-events: auto;
        `;

        overlay.addEventListener('mousemove',   preventDragAndZoom, true);
        overlay.addEventListener('wheel',       preventDragAndZoom, true);
        overlay.addEventListener('touchmove',   preventDragAndZoom, true);
        overlay.addEventListener('drag',        preventDragAndZoom, true);
        overlay.addEventListener('dragstart',   preventDragAndZoom, true);
        overlay.addEventListener('contextmenu', preventEvent,       true);

        if (getComputedStyle(panorama).position === 'static') {
            panorama.style.position = 'relative';
        }

        panorama.appendChild(overlay);
        panorama.dataset.disableApplied = 'true';
    }

    function removeOverlay() {
        document.getElementById('geoguessr-disable-overlay')?.remove();

        const selector = getPanoramaSelector();
        if (!selector) return;
        const panorama = document.querySelector(selector);
        if (panorama) delete panorama.dataset.disableApplied;
    }

    function startPanoramaRespawnObserver() {
        if (panoramaRespawnObserver) return;

        const selector = getPanoramaSelector();
        if (!selector) return;

        panoramaRespawnObserver = new MutationObserver(() => {
            const panorama = document.querySelector(selector);
            if (panorama && panorama.dataset.disableApplied !== 'true') {
                applyOverlay(panorama);
            }
        });

        panoramaRespawnObserver.observe(document.body, { childList: true, subtree: true });
    }

    function stopPanoramaRespawnObserver() {
        if (panoramaRespawnObserver) {
            panoramaRespawnObserver.disconnect();
            panoramaRespawnObserver = null;
        }
    }

    function waitForPanorama() {
        if (panoramaObserver) {
            panoramaObserver.disconnect();
            panoramaObserver = null;
        }

        const selector = getPanoramaSelector();
        if (!selector) return;

        const existing = document.querySelector(selector);
        if (existing) {
            applyOverlay(existing);
            startPanoramaRespawnObserver();
            return;
        }

        panoramaObserver = new MutationObserver(() => {
            const panorama = document.querySelector(selector);
            if (panorama) {
                panoramaObserver.disconnect();
                panoramaObserver = null;
                applyOverlay(panorama);
                startPanoramaRespawnObserver();
            }
        });

        panoramaObserver.observe(document.body, { childList: true, subtree: true });
    }

    function enableFeatures() {
        if (isGamePage()) {
            injectCSS();
            waitForPanorama();
        }
    }

    function disableFeatures() {
        if (panoramaObserver) {
            panoramaObserver.disconnect();
            panoramaObserver = null;
        }
        stopPanoramaRespawnObserver();
        removeOverlay();
        removeCSS();
    }

    function toggleEnabled() {
        isEnabled = !isEnabled;
        GM_setValue(STORAGE_KEY, isEnabled);

        if (isEnabled) {
            enableFeatures();
        } else {
            disableFeatures();
        }

        updateMenuCommand();
    }

    function updateMenuCommand() {
        if (menuCommandId !== null) {
            GM_unregisterMenuCommand(menuCommandId);
        }

        const status = isEnabled ? 'Enabled ✅' : 'Disabled ❌';
        menuCommandId = GM_registerMenuCommand(`NMPZ Mode: ${status}`, toggleEnabled, {
            autoClose: false,
        });
    }

    document.addEventListener('keydown',  preventMovementKeys, true);
    document.addEventListener('keyup',    preventMovementKeys, true);
    document.addEventListener('keypress', preventMovementKeys, true);

    let currentUrl = window.location.href;

    const urlObserver = new MutationObserver(() => {
        if (currentUrl !== window.location.href) {
            currentUrl = window.location.href;

            stopPanoramaRespawnObserver();
            removeOverlay();

            if (isGamePage() && isEnabled) {
                waitForPanorama();
            }
        }
    });

    urlObserver.observe(document.body, { childList: true, subtree: true });

    if (isGamePage() && isEnabled) {
        enableFeatures();
    }

    updateMenuCommand();

})();