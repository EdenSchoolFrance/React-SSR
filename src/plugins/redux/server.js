export default (server, { initVar = 'window.__PRELOADED_STATE__' }) => {
	server.on('prepare', ({ document, context: { store } }) => {
		const serializedStore = JSON.stringify(store.getState()).replace(/</g, '\\u003c');
		const script = document.createElement('script');

		script.text = `
			${initVar} = ${serializedStore}
		`

		document.head.appendChild(script);
	})
}
