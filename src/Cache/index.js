import { sendError, sendResponse, getPathFromRequest } from '../helpers';

const _ttl = Symbol("ttl");
const _responses = Symbol("responses");

class Cache
{
	constructor ({ ttl = 86400000 }) {
		this[_ttl] = parseInt(ttl, 10);
		this[_responses] = {};
	}

	middleware = (server) => {
		server
			.on('serve', this.store);

		return (req, res, next) => {
			const path = getPathFromRequest(req);

			this
				.fetch(path)
				.then((p) => {
					if (!!p) {
						if (!p.then) { // workaround for misteriously auto-resolving promise
							if (!(p instanceof Error)) {
								p = Promise.resolve(p);
							} else {
								p = Promise.reject(p);
							}
						}
						server.handleResponse(p, req, res);
					} else {
						next();
					}
				})
		}
	}

	store = async (p, req, res) => this.add(getPathFromRequest(req), p)

	fetch = async (path) => this.validate(path) && this.getPromise(path);

	add = (path, p) => {
		this[_responses][path] = {
			p: p,
			date: Date.now()
		}
	}

	remove = (path) => delete this[_responses][path];

	getPromise = (path) => (!!this[_responses][path] && this[_responses][path].p);

	getDate = (path) => (!!this[_responses][path] && this[_responses][path].date) || 0;

	validate = (path) => {
		const date = this.getDate(path);

		if (!date || (date + this[_ttl] < Date.now())) {
			this.remove(path);

			return false;
		}

		return true;
	}
}

export default Cache;
