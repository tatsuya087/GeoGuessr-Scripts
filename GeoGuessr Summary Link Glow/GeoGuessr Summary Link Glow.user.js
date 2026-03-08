// ==UserScript==
// @name         GeoGuessr Summary Link Glow
// @name:ja      GeoGuessr Summary Link Glow
// @namespace    https://greasyfork.org/ja/users/1492018-sino87
// @version      1.2.0
// @description  Add cyan glow effect to game result links on GeoGuessr activities page
// @description:ja GeoGuessrのアクティビティページにあるゲームリザルトリンクの視認性を上げるために、水色のグローを追加するユーザースクリプトです
// @author       sino
// @match        https://www.geoguessr.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=geoguessr.com
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_registerMenuCommand
// @license      MIT
// ==/UserScript==

(function () {
    'use strict';

    const STORAGE_KEY = 'glow_color';
    const DEFAULT_COLOR = '#00ffff';
    const STYLE_ID = 'geo-summary-link-glow';
    const PICKER_ID = 'geo-glow-color-picker';

    let glowColor = GM_getValue(STORAGE_KEY, DEFAULT_COLOR);

    function syncStyle() {
        const existing = document.getElementById(STYLE_ID);

        if (!location.pathname.includes('/activities')) {
            existing?.remove();
            return;
        }

        if (existing) {
            document.documentElement.style.setProperty('--geo-glow', glowColor);
            return;
        }

        document.documentElement.style.setProperty('--geo-glow', glowColor);

        const style = document.createElement('style');
        style.id = STYLE_ID;
        style.textContent = `
            a[href*="/results/"],
            a[href*="/challenge/"],
            a[href*="/summary"] {
                color: var(--geo-glow) !important;
                text-shadow: 0 0 15px var(--geo-glow) !important;
                transition: text-shadow 0.3s ease;
                overflow: visible !important;
                position: relative;
            }

            a[href*="/results/"]:hover,
            a[href*="/challenge/"]:hover,
            a[href*="/summary"]:hover {
                text-shadow: 0 0 7.5px var(--geo-glow),
                             0 0 15px var(--geo-glow),
                             0 0 22.5px var(--geo-glow) !important;
            }

            a[href*="/results/"]::before,
            a[href*="/challenge/"]::before,
            a[href*="/summary"]::before {
                content: '';
                position: absolute;
                top: -10px;
                left: -10px;
                right: -10px;
                bottom: -10px;
                pointer-events: none;
            }
        `;
        document.head.appendChild(style);
    }

    function hookHistoryNavigation(callback) {
        for (const method of ['pushState', 'replaceState']) {
            const original = history[method];
            history[method] = function (...args) {
                const result = original.apply(this, args);
                callback();
                return result;
            };
        }
        window.addEventListener('popstate', callback);
    }

    function openColorPicker() {
        if (document.getElementById(PICKER_ID)) return;

        const overlay = document.createElement('div');
        overlay.id = PICKER_ID;
        overlay.style.cssText = `
            position: fixed; inset: 0;
            background: rgba(0,0,0,.55);
            z-index: 10000;
            display: flex; justify-content: center; align-items: center;
        `;

        overlay.innerHTML = `
            <div style="
                background: #1a1a1a; padding: 24px; border-radius: 10px;
                box-shadow: 0 8px 32px rgba(0,0,0,.4);
                text-align: center; color: #fff; font-family: 'Neo Sans', sans-serif;
                min-width: 220px;
            ">
                <h3 style="margin: 0 0 16px">Glow Color Settings</h3>
                <input type="color" value="${glowColor}" style="
                    width: 56px; height: 56px; cursor: pointer;
                    border: none; background: none; margin-bottom: 16px;
                ">
                <div style="display: flex; justify-content: center; gap: 10px">
                    <button data-action="reset" style="
                        padding: 8px 16px; background: ${DEFAULT_COLOR}; color: #000;
                        border: none; border-radius: 6px; cursor: pointer; font-weight: 600;
                    ">Reset Default</button>
                    <button data-action="close" style="
                        padding: 8px 16px; background: #444; color: #fff;
                        border: none; border-radius: 6px; cursor: pointer;
                    ">Close</button>
                </div>
            </div>
        `;

        const colorInput = overlay.querySelector('input[type="color"]');

        overlay.addEventListener('click', (e) => {
            const action = e.target.dataset?.action;
            if (action === 'close' || e.target === overlay) {
                overlay.remove();
            } else if (action === 'reset') {
                updateColor(DEFAULT_COLOR);
                colorInput.value = DEFAULT_COLOR;
            }
        });

        colorInput.addEventListener('input', (e) => updateColor(e.target.value));

        document.body.appendChild(overlay);
    }

    function updateColor(color) {
        glowColor = color;
        GM_setValue(STORAGE_KEY, color);
        document.documentElement.style.setProperty('--geo-glow', color);
    }

    function unclipParents() {
        if (!location.pathname.includes('/activities')) return;

        const links = document.querySelectorAll('a[href*="/results/"], a[href*="/challenge/"], a[href*="/summary"]');
        for (const link of links) {
            let parent = link.parentElement;
            while (parent && parent !== document.body) {
                if (parent.style.overflow === 'visible') {
                    parent = parent.parentElement;
                    continue;
                }
                const overflow = window.getComputedStyle(parent).overflow;
                if (overflow === 'hidden' || overflow === 'clip') {
                    parent.style.overflow = 'visible';
                }
                parent = parent.parentElement;
            }
        }
    }

    GM_registerMenuCommand('Change Glow Color 🎨', openColorPicker);

    syncStyle();
    hookHistoryNavigation(syncStyle);

    setInterval(unclipParents, 500);

})();
