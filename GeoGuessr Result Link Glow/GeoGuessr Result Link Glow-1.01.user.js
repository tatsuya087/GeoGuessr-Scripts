// ==UserScript==
// @name         GeoGuessr Result Link Glow
// @name:ja      GeoGuessr リザルトリンクGlow
// @namespace    https://greasyfork.org/ja/users/1492018-sino87
// @version      1.01
// @description  Add cyan glow effect to game result links on GeoGuessr activities page
// @description:ja GeoGuessrのアクティビティページにあるゲームリザルトリンクの視認性を上げるために、水色のグローを追加するユーザースクリプトです
// @author       sino
// @match        https://www.geoguessr.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=geoguessr.com
// @grant        none
// @license      MIT
// ==/UserScript==

(function() {
    'use strict';

    function addGlowStyle() {
        if (document.getElementById('game-link-glow-style')) return;

        const style = document.createElement('style');
        style.id = 'game-link-glow-style';
        style.textContent = `
            .game-link-glow {
                text-shadow: 0 0 15px #00ffff !important;
                color: #00ffff !important;
                transition: text-shadow 0.3s ease;
            }
            .game-link-glow:hover {
                text-shadow: 0 0 7.5px #00ffff,
                             0 0 15px #00ffff,
                             0 0 22.5px #00ffff !important;
            }
            a.next-link_anchor__CQUJ3 {
                overflow: visible !important;
            }
            a.next-link_anchor__CQUJ3[href*="/challenge/"] {
                overflow: visible !important;
            }
            a.next-link_anchor__CQUJ3[href*="/challenge/"]::before {
                content: '';
                position: absolute;
                top: -10px;
                left: -10px;
                right: -10px;
                bottom: -10px;
                pointer-events: none;
            }
            a.next-link_anchor__CQUJ3[href*="/results/"] {
                overflow: visible !important;
            }
            a.next-link_anchor__CQUJ3[href*="/results/"]::before {
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

    function applyGlowToGameLinks() {
        if (!window.location.pathname.includes('/activities')) return;

        const links = document.querySelectorAll('a.next-link_anchor__CQUJ3');
        links.forEach(link => {
            const href = link.href;
            const text = link.textContent.trim();

            let shouldGlow = false;

            if (href.includes('/duels/') && href.includes('/summary') &&
                (text === 'game' || text === 'Game')) {
                shouldGlow = true;
            }

            if (href.includes('/results/') && text.includes('points')) {
                shouldGlow = true;
            }

            if (href.includes('/battle-royale/') && href.includes('/summary') &&
                text === 'Game') {
                shouldGlow = true;
            }

            if (href.includes('/challenge/') && text.includes('points')) {
                shouldGlow = true;
            }

            if (href.includes('/results/') && text.startsWith('The streak ended at ')) {
                shouldGlow = true;
            }

            if (href.includes('/team-duels/') && href.includes('/summary') &&
                (text === 'Game' || text === 'game')) {
                shouldGlow = true;
            }

            if (shouldGlow) {
                link.classList.add('game-link-glow');

                let parent = link.parentElement;
                while (parent && parent !== document.body) {
                    const overflow = window.getComputedStyle(parent).overflow;
                    if (overflow === 'hidden' || overflow === 'clip') {
                        parent.style.overflow = 'visible';
                    }
                    parent = parent.parentElement;
                }
            }
        });
    }

    let currentUrl = window.location.href;

    function checkUrlChange() {
        if (currentUrl !== window.location.href) {
            currentUrl = window.location.href;
            setTimeout(() => {
                applyGlowToGameLinks();
            }, 500);
        }
    }

    addGlowStyle();

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', applyGlowToGameLinks);
    } else {
        applyGlowToGameLinks();
    }

    const observer = new MutationObserver(() => {
        applyGlowToGameLinks();
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true
    });

    setInterval(checkUrlChange, 500);
})();