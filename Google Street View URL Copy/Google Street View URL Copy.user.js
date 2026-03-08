// ==UserScript==
// @name         Google Street View URL Copy
// @name:ja      GoogleストリートビューURLコピー
// @namespace    https://greasyfork.org/ja/users/1492018-sino87
// @version      1.1.0
// @description  Copy the URL with just Ctrl+C on Google Street View pages
// @description:ja GoogleストリートビューのページでCtrl+CをするだけでURLをコピーできます
// @author       sino
// @license      MIT
// @icon         http://www.google.com/s2/favicons?domain=www.google.com/maps/
// @match        https://www.google.com/maps/*
// @match        https://www.google.co.jp/maps/*
// @match        https://www.google.co.uk/maps/*
// @match        https://www.google.de/maps/*
// @match        https://www.google.fr/maps/*
// @match        https://www.google.ca/maps/*
// @match        https://www.google.com.au/maps/*
// @match        https://www.google.it/maps/*
// @match        https://www.google.es/maps/*
// @match        https://www.google.com.br/maps/*
// @match        https://www.google.co.kr/maps/*
// @match        https://www.google.com.tw/maps/*
// @match        https://www.google.com.hk/maps/*
// @match        https://www.google.co.in/maps/*
// @match        https://www.google.com.mx/maps/*
// @match        https://www.google.ru/maps/*
// @match        https://www.google.nl/maps/*
// @match        https://www.google.pl/maps/*
// @match        https://www.google.com.ar/maps/*
// @match        https://www.google.co.th/maps/*
// @grant        none
// @downloadURL  https://update.greasyfork.org/scripts/551779/Google%20Street%20View%20URL%20Copy.user.js
// @updateURL    https://update.greasyfork.org/scripts/551779/Google%20Street%20View%20URL%20Copy.meta.js
// ==/UserScript==

(function () {
    'use strict';

    const isJa = navigator.language.startsWith('ja');
    const MSG_SUCCESS = isJa ? 'URLをコピーしました！' : 'URL copied!';
    const MSG_ERROR   = isJa ? 'コピーに失敗しました' : 'Copy failed';

    const style = document.createElement('style');
    style.textContent = `
        .gsv-copy-toast {
            position: fixed;
            top: 20px;
            left: 50%;
            translate: -50% 0;
            padding: 15px 25px;
            color: #fff;
            border-radius: 4px;
            font-size: 14px;
            font-weight: bold;
            z-index: 10000;
            box-shadow: 0 2px 5px rgba(0,0,0,.3);
            animation: gsv-copy-slide-in .3s ease-out;
            pointer-events: none;
        }
        .gsv-copy-toast.success { background-color: #4CAF50; }
        .gsv-copy-toast.error   { background-color: #f44336; }
        .gsv-copy-toast.out {
            animation: gsv-copy-fade-out .3s ease-in forwards;
        }
        @keyframes gsv-copy-slide-in {
            from { translate: -50% -100px; opacity: 0; }
            to   { translate: -50% 0;      opacity: 1; }
        }
        @keyframes gsv-copy-fade-out {
            to { opacity: 0; }
        }
    `;
    document.head.appendChild(style);

    let activeToast = null;

    function showToast(message, isError = false) {
        activeToast?.remove();

        const el = document.createElement('div');
        el.className = `gsv-copy-toast ${isError ? 'error' : 'success'}`;
        el.textContent = message;
        document.body.appendChild(el);
        activeToast = el;

        setTimeout(() => {
            el.classList.add('out');
            el.addEventListener('animationend', () => el.remove(), { once: true });
        }, 2000);
    }

    document.addEventListener('keydown', (e) => {
        if (!e.ctrlKey || e.key !== 'c') return;

        const sel = window.getSelection();
        if (sel && sel.toString().length > 0) return;

        e.preventDefault();

        const cleanUrl = location.origin + location.pathname;
        navigator.clipboard.writeText(cleanUrl).then(
            () => showToast(MSG_SUCCESS),
            () => showToast(MSG_ERROR, true),
        );
    }, true);
})();
