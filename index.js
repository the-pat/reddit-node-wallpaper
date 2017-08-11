const fs = require('fs');
const request = require('request');
const rp = require('request-promise-native');
const wallpaper = require('wallpaper');

const getURL = obj => new Promise(resolve => {
    const posts = obj.data.children.filter(post => post.data.url.length && !post.data.over_18);
    const index = Math.floor(Math.random() * posts.length);
    const url = posts[index].data.url;

    resolve(url);
});

const download = (uri, path) => new Promise(resolve => request(uri).pipe(fs.createWriteStream(path)).on('close', resolve));

const set = (path) => wallpaper.set(path);

let options = {
    uri: 'https://www.reddit.com/r/earthporn/hot.json?limit=10',
    json: true,
};

let path = './wallpaper.jpg';

rp(options)
    .then(getURL)
    .then(url => download(url, path))
    .then(() => set(path))
    .then(() => console.log('success!'))
    .catch(error => console.error(error));