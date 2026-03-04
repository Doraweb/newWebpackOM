import path from 'path';
import os from 'os';

const isWin = /^win/.test(os.platform());

let iconfontUrl = path.resolve(__dirname, 'app/themes/dark/fonts/iconfont');
if (isWin) {
  iconfontUrl = iconfontUrl.replace(/\\/g, '/');
}

module.exports = () => {
  return {
    // Color
    'primary-color': '#2ea2f8',
    // Background
    'body-background': '#2b3034',
    'component-background': '#1b2431',
    'background-color-base': '#65686b',
    // Base
    'heading-color': '#fff',
    'text-color': '#fff',
    'text-color-secondary': 'fade(#fff, 75%)',
    'disabled-color': 'fade(#fff, 25%)',
    'border-radius-base': '0',
    'border-radius-sm': '0',
    // Border
    'border-color-base': '#313d4f',
    'border-color-split': '#313d4f',
    // Outline
    'outline-color': 'fade(#2ea1f8, 75%)',
    // Button
    'btn-default-color': '#fff',
    'btn-default-bg': '#3a4859',
    'btn-default-border': '#495252',
    'btn-disable-color': 'fade(#fff, 25%)',
    'btn-disable-bg': '#3a4859',
    'btn-disable-border': '#495252',
    // Input
    'input-bg': '#1b2431',
    // Table
    'table-header-bg': '#273142',
    'table-row-hover-bg': '#4b5960',
    // Layout
    'layout-header-background': '#1b2431',
    'layout-body-background': '#273142',
    // Animation
    'animation-duration-slow': '0s',
    'animation-duration-base': '0s',
    'animation-duration-fast': '0s',
    // Popover
    'popover-bg': '#273147',
    // Icon Url
    'icon-url': `"${iconfontUrl}"`
  };
};