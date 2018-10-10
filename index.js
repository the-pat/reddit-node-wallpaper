const config = require('./config.json');
const fileType = require('file-type');
const fs = require('fs');
const request = require('request');
const rp = require('request-promise-native');
const wallpaper = require('wallpaper');

const change = async (start = 0) => {
	try {
		if (!config) {
			return console.log('Please configure the `config.json`.');
		}

		if (start === config.maxRetry) {
			return console.log('We tried our best, but were unable to change the wallpaper. Sorry.');
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

		const obj = await rp(options);
		const imgUrl = await getURL(obj);
		await download(imgUrl, path);
		const type = await getType(path);
		
		if (!type || !config.types.includes(type.ext)) throw 'type is null';

		name = `${path}.${type.ext}`;
		fs.renameSync(path, name);
		wallpaper.set(name);
		console.log('Success!');
	}
	catch (e) {
		console.error(e);
		change(start + 1);
	}
};

const getURL = async obj => {
	const posts = obj.data.children
		.filter(post => 
			post.kind.toLowerCase() === 't3' &&
			post.data &&
			config.domains.includes(post.data.domain.toLowerCase()) &&
			post.data.over_18 === (config.over_18 === 'true') &&
			post.data.score >= config.score &&
			post.data.preview.images[0].source.width >= config.minimum_image_size.width &&
			post.data.preview.images[0].source.height >= config.minimum_image_size.height
		)
		.map(post => ({
			url: post.data.preview.images[0].source.url,
			domain: post.data.domain.toLowerCase(),
		}));

	if (!posts) {
		throw 'No posts match the config criteria.';
	}

	return randomElement(posts).url;
};

const randomElement = array => array[Math.floor(Math.random() * array.length)];

const download = (uri, path) => new Promise(resolve => request(uri).pipe(fs.createWriteStream(path)).on('close', resolve));

const getType = path => new Promise((resolve, reject) => fs.readFile(path, (err, data) => err ? reject(err) : resolve(fileType(data))));
		
change();