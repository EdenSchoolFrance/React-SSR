export default (renderer, configureStore) => {
	let dispatchCount = 0;

	renderer.on('init', (ctx) => {
		const store = configureStore();

		store.subscribe(() => dispatchCount++);

		Object.assign(ctx, {
			store
		});
	});

	renderer.on('rendering', ({ store }, next) => {
		if (!!dispatchCount) {
			dispatchCount = 0;

			next(Promise.resolve());
		}
	});

	renderer.on('rendered', ({ store }) => store.close());
}

export { default as Saga } from './saga';
export { default as Server } from './server';
