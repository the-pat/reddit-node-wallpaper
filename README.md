# reddit-node-wallpaper

### Pre-requisites:

1. NodeJS installed (>v6 preferred) with NPM

### How to use:

1. Download this source code, navigate to the directory
2. Run `npm install` to install all dependencies
3. Copy the sample-config.json file to config.json, change the following:
    * directory - Directory wo which the wallpaper will be downloaded. Attempts to create a folder in a folder doesn't exist, but doesn't always work
    * minimum_image_size - Change the minimum width and height of the wallpaper to find
4. Run `npm start` to start the script
