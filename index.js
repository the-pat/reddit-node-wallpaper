const config = require('./config.json');
const fs = require('fs');
const request = require('request');
const rp = require('request-promise-native');
const wallpaper = require('wallpaper');

const change = () => {
    const url = `https://www.reddit.com/r/${random(config.subreddits)}/${config.sort}.json?t=${config.from}limit=${config.limit}`;
    const options = {
        uri: url,
        json: true,
        simple: true,
    };

    const path = './wallpaper.jpg';

    rp(options)
        .then(getURL)
        .then(url => download(url, path))
        .then(() => wallpaper.set(path))
        .then(() => console.log('success!'))
        .catch(error => console.error(error));
};

const getURL = obj => new Promise(resolve => {
    const posts = obj.data.children.filter(post => post.kind.toLowerCase() === 't3' && post.data && !post.data.over_18)
                                   .map(post => ({
                                       url: post.data.url,
                                       domain: post.data.domain.toLowerCase(),
                                       //type: type(post.data.url),
                                   }));
    const url = random(posts).url;

    resolve(url);
});

const random = array => array[Math.floor(Math.random() * array.length)];

const download = (uri, path) => new Promise(resolve => request(uri).pipe(fs.createWriteStream(path)).on('close', resolve));

change();