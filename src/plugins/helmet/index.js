export default (server, Helmet) => {
	server.on('prepare', ({ document, JSDOM }) => {
	 	const { title, meta, link, script } = Helmet.rewind();

	 	document.head.appendChild(JSDOM.fragment(title.toString()));
	 	document.head.appendChild(JSDOM.fragment(meta.toString()));
	 	document.head.appendChild(JSDOM.fragment(link.toString()));
	 	document.head.appendChild(JSDOM.fragment(script.toString()));
	});
}
