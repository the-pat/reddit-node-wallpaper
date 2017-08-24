const config = require('./config.json');
const fileType = require('file-type');
const fs = require('fs');
const request = require('request');
const rp = require('request-promise-native');
const wallpaper = require('wallpaper');

const change = () => {
    const url = `https://www.reddit.com/r/${randomElement(config.subreddits)}/${config.sort}.json?t=${config.from}limit=${config.limit}`;
    const options = {
        uri: url,
        json: true,
        simple: true,
    };

    const path = './wallpaper';
    let name = '';

    rp(options)
        .then(getURL)
        .then(url => download(url, path))
        .then(() => getType(path))
        // TODO: reject if an html page
        .then(type => { name = `${path}.${type.ext}`; fs.rename(path, name); })
        .then(() => wallpaper.set(name))
        .then(() => console.log('success!'))
        .catch(error => console.error(error));
};

const getURL = obj => new Promise((resolve, reject) => {
    const posts = obj.data.children.filter(post => post.kind.toLowerCase() === 't3' &&
                                                   post.data &&
                                                   config.domains.includes(post.data.domain.toLowerCase()) &&
                                                   !post.data.over_18)
                                   .map(post => ({
                                       url: post.data.url,
                                       domain: post.data.domain.toLowerCase(),
                                   }));
    // TODO: if all posts are filtered, reject and try again
    if (!posts) {
        reject('No posts match the config criteria.');
        return;
    }
    const url = randomElement(posts).url;

    resolve(url);
});

const randomElement = array => array[Math.floor(Math.random() * array.length)];

// TODO: create/find an imgur download module (get help grabbing an image from an album)
const download = (uri, path) => new Promise(resolve => request(uri).pipe(fs.createWriteStream(path)).on('close', resolve));

const getType = path => new Promise((resolve, reject) => fs.readFile(path, (err, data) => err ? reject(err) : resolve(fileType(data))));

change();