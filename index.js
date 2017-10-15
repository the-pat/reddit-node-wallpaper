const config = require('./config.json');
const fileType = require('file-type');
const fs = require('fs');
const request = require('request');
const rp = require('request-promise-native');
const wallpaper = require('wallpaper');

const change = (start = 0) => {
    if(start === config.maxRetry) {
        console.log('We tried our best, but were unable to change the wallpaper. Sorry.');
        return;
    }
  
    const url = `https://www.reddit.com/r/${randomElement(config.subreddits)}/${config.sort}.json?t=${config.from}&limit=${config.limit}`;
    const options = {
        uri: url,
        json: true,
        simple: true,
    };
    
    const path = config.directory + '/wallpaper';
    let name = '';

    if (!fs.existsSync(config.directory)) {
        fs.mkdirSync(config.directory);
    }

    rp(options)
        .then(getURL)
        .then(url => download(url, path))
        .then(() => getType(path))
        .then(type => new Promise((resolve, reject) => {
            if (!type || !config.types.includes(type.ext)) {
                reject('type is null');
                return;
            }

            name = `${path}.${type.ext}`;
            fs.rename(path, name);
            resolve();
        }))
        .then(() => wallpaper.set(name))
        .then(() => console.log('success!'))
        .catch(error => {
            console.error(error);
            change(start + 1);
        });
};

const getURL = obj => new Promise((resolve, reject) => {
    const posts = obj.data.children.filter(post => post.kind.toLowerCase() === 't3' &&
        post.data &&
        config.domains.includes(post.data.domain.toLowerCase()) &&
        !post.data.over_18 &&
        post.data.preview.images[0].source.width >= config.minimum_image_size.width &&
        post.data.preview.images[0].source.height >= config.minimum_image_size.height)
        .map(post => ({
            url: post.data.preview.images[0].source.url,
            domain: post.data.domain.toLowerCase(),
        }));

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