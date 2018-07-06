import Path 		from 'path';
import fs 			from 'fs';
import EventEmitter from 'events';
import { URL } 		from 'url';
import assign      	from "lodash/assign";
import find      	from "lodash/find";
import every      	from "lodash/every";
import serveStatic 	from "serve-static";

import HTTPStatus from 'httpstatus';
import { Router } from 'express';
import { JSDOM }  from 'jsdom';

const _options = Symbol("options");
const _cache = Symbol("cache");

Path.dirname(require.main.filename);

var { window } = new JSDOM('<!doctype html><html><body></body></html>');

window.matchMedia = window.matchMedia || function() {
	return {
		matches : false,
		addListener : function() {},
		removeListener: function() {}
	};
};

global.document  = window.document;
global.window    = window;
global.navigator = window.navigator;

const sendResponse = (result, req, res) => {
	const { context: { statusCode, url } = {}, content } = result;

	if ( statusCode ) {
		const st = new HTTPStatus(statusCode);

		switch (true) {
			case !!url:
				res.status(st.isRedirection ? st.code : 302).redirect(url);
				break;
			default:
				res.status(st.code).send(content);
		}
	} else {
		res.send(content);
	}
};

const sendError = (e, req, res) => res.status(500).send(e.message);

export default class Server extends EventEmitter {
	constructor (options, ...args) {
		super(...args);

		this[_options] = options;
		this[_cache] = [];

		this
			.on('send/result', sendResponse)
			.on('send/error', sendError);
	}

	use (plugin, ...args) {
		plugin(this, ...args)

		return this;
	}

	prepare = (renderer) => async (path) => {
		const { buildPath, indexFile = "index.html", rootElement = "root" } = this[_options];

		const [ { content, ...context }, dom ] = await Promise.all([
			renderer.render(path),
			JSDOM.fromFile(Path.resolve(buildPath, indexFile))
		]);

		const { window: { document } } = dom;

	  	document.getElementById(rootElement).innerHTML = content;

	   	this.emit('prepare', { document, JSDOM });

		const result = { ...context, content: dom.serialize() };

		this.emit('prepared', result);

	  	return result;
	}

	serveStatic = (config = { index: false }) => serveStatic(this[_options].buildPath, config);

	get staticMiddleware () {
		return this.serveStatic();
	}

	serve = (renderer) => (req, res) => {
		const { url } = req;

		var path = (new URL(url, 'http://localhost')).pathname;

		this.prepare(renderer)(path)
			.then((result) => this.emit('send/result', result, req, res))
			.catch((error) => this.emit('send/error', error, req, res))
		;
	}
}
