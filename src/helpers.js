import HTTPStatus from 'httpstatus';
import { URL } 	  from 'url';

export const sendResponse = (result, req, res) => {
	const { context: { statusCode, url } = {}, content } = result;

	if ( statusCode ) {
		const st = new HTTPStatus(statusCode);

		switch (true) {
			case !!url:
				res = res.status(st.isRedirection ? st.code : 302);
				break;
			default:
				res = res.status(st.code);
		}
	}

	if (url) {
		res.redirect(url)
	} else {
		res.send(content);
	}
};

export const sendError = (e, req, res) => res.status(500).send(e.message);


export const getPathFromRequest = ({ url }) => (new URL(url, 'http://localhost')).pathname;
