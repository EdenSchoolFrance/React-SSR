export default (server, Helmet) => {
	server.on('prepare', ({ document, JSDOM }) => {
	 	const helmet = Helmet.rewind();

	 	document.head.appendChild(JSDOM.fragment(helmet.title.toString()));
	 	document.head.appendChild(JSDOM.fragment(helmet.meta.toString()));
	 	document.head.appendChild(JSDOM.fragment(helmet.link.toString()));
	});
}
