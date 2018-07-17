import Path 		from 'path';
import fs 			from 'fs';
import EventEmitter from 'events';
import assign      	from "lodash/assign";
import find      	from "lodash/find";
import every      	from "lodash/every";
import serveStatic 	from "serve-static";

import { Router } from 'express';
import { JSDOM }  from 'jsdom';

import { sendError, sendResponse, getPathFromRequest } from './helpers';

const _options = Symbol("options");

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

export default class Server extends EventEmitter {
	constructor (options, ...args) {
		super(...args);

		this[_options] = options;

		this
			.on('serve', this.handleResponse)
			.on('send/result', sendResponse)
			.on('send/error', sendError);
	}

	use (plugin, ...args) {
		plugin(this, ...args)

		return this;
	}

	prepare = (renderer) => async (path, req) => {
		const { buildPath, indexFile = "index.html", rootElement = "root" } = this[_options];

		const [ { content, ...context }, dom ] = await Promise.all([
			renderer.render(path, req),
			JSDOM.fromFile(Path.resolve(buildPath, indexFile))
		]);

		const { window: { document } } = dom;

	  	document.getElementById(rootElement).innerHTML = content;

	   	this.emit('prepare', { document, JSDOM, context });

		const result = { ...context, content: dom.serialize() };

		this.emit('prepared', result);

	  	return result;
	}

	serveStatic = (config = { index: false }) => serveStatic(this[_options].buildPath, config);

	get staticMiddleware () {
		return this.serveStatic();
	}

	serve = (renderer) => (req, res) => {
		const p =  this.prepare(renderer)(getPathFromRequest(req), req);

		this.emit('serve', p, req, res);
	}

	handleResponse = (p, req, res) => {
		p
			.then((result) => this.emit('send/result', result, req, res))
			.catch((error) => this.emit('send/error', error, req, res))
		;
	}
}
