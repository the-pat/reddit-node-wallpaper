const fs = require('fs');
const request = require('request');
const wallpaper = require('wallpaper');

const get = () => {
    request('https://www.reddit.com/r/earthporn/hot.json?limit=10', (err, response, body) => {
        if (err || response.statusCode !== 200) {
            console.error(err, response);
            return;
        }

        const data = JSON.parse(body);

        // -- callback
        const posts = data.data.children;
        const filteredPosts = posts.filter((post) => post.kind === 't3' && post.data.url.length);
        const urls = filteredPosts.map(post => post.data.url);
        const index = Math.floor(Math.random() * filteredPosts.length);
        const url = urls[index];
        const filename = 'wallpaper.jpg';

        request(url).pipe(fs.createWriteStream(filename)).on('close', () => wallpaper.set(filename).then(() => console.log('wallpaper set')));
    });
};

get();