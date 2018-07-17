import { sendError, sendResponse, getPathFromRequest } from './helpers';

class Cache
{
	responses = {};

	middleware = (server) => {
		server
			.on('serve', this.store);

		return (req, res, next) => {
			const path = getPathFromRequest(req);

			this
				.fetch(path)
				.then((p) => {
					if (!!p) {
						server.handleResponse(p, req, res);
					} else {
						next();
					}
				})
		}
	}

	store = async (p, req, res) => {
		var path = getPathFromRequest(req);

		responses[path] = p
	}

	fetch = async (path) => {
		var path = getPathFromRequest(req);

		return responses[path]
	}
}

export default Cache;
