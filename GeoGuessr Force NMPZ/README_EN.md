# GeoGuessr Force NMPZ

This script forcibly restricts your own screen to NMPZ mode during GeoGuessr gameplay. It is useful for handicap matches and similar scenarios.

## Installation

With Tampermonkey installed in your browser, open [https://greasyfork.org/en/scripts/552078-geoguessr-force-nmpz](https://greasyfork.org/ja/scripts/552078-geoguessr-force-nmpz) and execute the installation.

## Features

Blocks dragging to move your viewpoint and scrolling to zoom within Street View. The operation to turn north by clicking the compass, as well as the W, A, S, D, and N key inputs, are also disabled. Chat input is not affected. Some control elements, such as the zoom buttons, are hidden from the screen.

You can toggle the script on and off from the Tampermonkey extension menu without reloading the page. It works in almost all Party mode game modes. It does not work in Ranked or Unranked matches.

## Usage

Select "GeoGuessr Force NMPZ" from the Tampermonkey icon, and click the Enabled or Disabled item in the menu to toggle the state. The configured state is saved in your browser and will be carried over the next time you open the page.

## Notes

The restriction only applies to your own browser and does not affect other players. Unlike the official NMPZ mode, this is a mechanism that pseudo-restricts actions locally on the client side.

## License

MIT License
