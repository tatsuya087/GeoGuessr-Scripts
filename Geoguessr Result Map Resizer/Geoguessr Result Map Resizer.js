// ==UserScript==
// @name            Geoguessr Result Map Resizer
// @name:ja         Geoguessr Result Map Resizer
// @namespace       https://greasyfork.org/ja/users/1492018-sino87
// @version         1.01
// @description     Resize Google Maps on Duels Game Breakdown pages from 1.00x to 1.50x magnification
// @description:ja  DuelsのGame BreakdownページにあるGoogleマップのサイズを1.00倍から1.50倍まで調整可能
// @icon            https://www.google.com/s2/favicons?sz=64&domain=geoguessr.com
// @match           https://www.geoguessr.com/*
// @grant           none
// @license         MIT
// ==/UserScript==

(function() {
    'use strict';

    const SCALE_STORAGE_KEY = "geoguessrMapScale";
    const POSITION_STORAGE_KEY = "geoguessrMapPanelPosition";

    let currentScale = parseFloat(localStorage.getItem(SCALE_STORAGE_KEY)) || 1.00;
    let panelPosition = JSON.parse(localStorage.getItem(POSITION_STORAGE_KEY)) || { top: 80, left: 20 };

    const fontStyle = document.createElement('style');
    fontStyle.textContent = `@import url('https://fonts.googleapis.com/css2?family=Noto+Sans:wght@600&display=swap');`;
    document.head.appendChild(fontStyle);

    function resizeMap() {
        const mapElement = document.querySelector('div.game-summary_mapContainer__iYGL5');
        if (!mapElement) return;

        if (!mapElement.dataset.originalHeight) {
            mapElement.dataset.originalHeight = mapElement.offsetHeight + '';
        }

        const originalHeight = parseFloat(mapElement.dataset.originalHeight);
        const newHeight = originalHeight * currentScale;
        mapElement.style.height = newHeight + 'px';
    }

    function initializeMapResize() {
        const mapElement = document.querySelector('div.game-summary_mapContainer__iYGL5');
        if (mapElement && !mapElement.dataset.originalHeight) {
            const height = mapElement.offsetHeight;
            if (height > 0) {
                mapElement.dataset.originalHeight = height + '';
                resizeMap();
            }
        }
    }

    function createPanel() {
        const existingPanel = document.getElementById('map-scale-panel');
        if (existingPanel) {
            existingPanel.remove();
        }

        const panel = document.createElement('div');
        panel.id = 'map-scale-panel';
        panel.style.cssText = `
            position: fixed;
            top: ${panelPosition.top}px;
            left: ${panelPosition.left}px;
            width: 180px;
            height: 90px;
            background: rgba(15, 15, 15, 0.7);
            color: white;
            border-radius: 8px;
            padding: 10px;
            z-index: 9999;
            font-family: 'Noto Sans', sans-serif;
            font-weight: 600;
            font-size: 16px;
            cursor: move;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            align-items: center;
            box-sizing: border-box;
        `;

        const title = document.createElement('div');
        title.textContent = 'Map Resizer';
        title.style.textAlign = 'center';

        const sliderContainer = document.createElement('div');
        sliderContainer.style.cssText = `
            width: 100%;
            display: flex;
            justify-content: center;
        `;

        const slider = document.createElement('input');
        slider.type = 'range';
        slider.min = '0';
        slider.max = '100';
        slider.value = ((currentScale - 1.00) / 0.50) * 100;
        slider.style.cssText = `
            width: 100%;
            appearance: none;
            height: 0.4rem;
            margin: 0;
            border: 1px solid gray;
            border-radius: 0.4rem;
            padding: 0;
            background-color: black;
        `;

        const sliderStyle = document.createElement('style');
        sliderStyle.textContent = `
            #map-scale-panel input[type="range"]::-webkit-slider-runnable-track {
                margin: 0 -5px;
            }
            #map-scale-panel input[type="range"]::-webkit-slider-thumb {
                -webkit-appearance: none;
                appearance: none;
                height: 16px;
                width: 16px;
                border-radius: 50%;
                background: #7d8cff;
                cursor: pointer;
                border: 1px solid white;
            }
        `;
        document.head.appendChild(sliderStyle);

        const scaleDisplay = document.createElement('div');
        scaleDisplay.textContent = '×' + currentScale.toFixed(2);
        scaleDisplay.style.textAlign = 'center';

        slider.addEventListener('input', function(e) {
            const sliderValue = parseFloat(e.target.value);

            const ratio = sliderValue;
            this.style.background = `linear-gradient(90deg, #7d8cff ${ratio}%, #000000 ${ratio}%)`;

            currentScale = 1.00 + (sliderValue / 100) * 0.50;
            scaleDisplay.textContent = '×' + currentScale.toFixed(2);
            localStorage.setItem(SCALE_STORAGE_KEY, currentScale);
            resizeMap();
        });

        let isDragging = false;
        let dragOffset = { x: 0, y: 0 };

        title.addEventListener('mousedown', function(e) {
            isDragging = true;
            dragOffset.x = e.clientX - panel.offsetLeft;
            dragOffset.y = e.clientY - panel.offsetTop;
            e.preventDefault();
        });

        document.addEventListener('mousemove', function(e) {
            if (isDragging) {
                const maxX = window.innerWidth - panel.offsetWidth;
                const maxY = window.innerHeight - panel.offsetHeight;

                let newX = e.clientX - dragOffset.x;
                let newY = e.clientY - dragOffset.y;

                newX = Math.max(0, Math.min(newX, maxX));
                newY = Math.max(0, Math.min(newY, maxY));

                panel.style.left = newX + 'px';
                panel.style.top = newY + 'px';
            }
        });

        document.addEventListener('mouseup', function() {
            if (isDragging) {
                isDragging = false;
                panelPosition = {
                    top: parseInt(panel.style.top),
                    left: parseInt(panel.style.left)
                };
                localStorage.setItem(POSITION_STORAGE_KEY, JSON.stringify(panelPosition));
            }
        });

        sliderContainer.appendChild(slider);
        panel.appendChild(title);
        panel.appendChild(sliderContainer);
        panel.appendChild(scaleDisplay);

        document.body.appendChild(panel);
    }

    let lastUrl = window.location.href;

    function checkForUrlChange() {
        const currentUrl = window.location.href;
        if (currentUrl !== lastUrl) {
            lastUrl = currentUrl;
            handlePageChange();
        }
    }

    function handlePageChange() {
        const isDuelsResultPage = /^https:\/\/www\.geoguessr\.com(\/[^/]+)?\/duels\/[^/]+\/summary$/.test(window.location.href);

        if (isDuelsResultPage) {
            // 即座に実行を試行
            initializeMapResize();
            createPanel();

            // DOMContentLoadedの場合の追加実行
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', function() {
                    initializeMapResize();
                    createPanel();
                });
            }

            // より短い間隔で再試行
            setTimeout(() => {
                initializeMapResize();
                createPanel();
            }, 100);

            setTimeout(() => {
                initializeMapResize();
                createPanel();
            }, 500);
        } else {
            const panel = document.getElementById('map-scale-panel');
            if (panel) {
                panel.remove();
            }
        }
    }

    // より短い間隔でURL変更をチェック
    setInterval(checkForUrlChange, 100);

    handlePageChange();
})();