const fs = require('fs');
const request = require('request');
const wallpaper = require('wallpaper');

const getAndSetWallpaper = () => {
    get(data => {
        const urls = redditPostUrls(data);
        const url = urls[randomIndex(urls)];
        const filename = 'wallpaper.jpg';

        download(url, filename, () => wallpaper.set(filename).then(() => console.log('wallpaper set')));
    });
};

const get = (next) => {
    request('https://www.reddit.com/r/earthporn/hot.json?limit=10', (err, response, body) => {
        if (err || response.statusCode !== 200) {
            console.error(err, response);
            return;
        }

        const data = JSON.parse(body);
        get(data);
    });
};

const redditPostUrls = posts => posts.data.children
                                          .filter(post => post.data.url.length)
                                          .map(post => post.data.url);

const randomIndex = array => Math.floor(Math.random() * array.length);

const download = (uri, path, next) => request(uri).pipe(fs.createWriteStream(path)).on('close', next);

get();