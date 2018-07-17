export default (renderer, configureStore) => {
	renderer.on('init', (ctx) => {
		const store = configureStore();

		Object.assign(ctx, {
			store
		});
	});

	renderer.on('rendered', ({ store }) => store.close());
}

export { default as Saga } from './saga';
export { default as Server } from './server';
