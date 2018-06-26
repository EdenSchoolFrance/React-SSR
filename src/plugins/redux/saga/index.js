const isSagaRunning = (store) => !!store.activeEffectIds.length;

const isSagaCompleted = (store) => new Promise((resolve) => {
	const waitCompleted = () => {
		if (isSagaRunning(store)) {
			setImmediate(() => {
				waitCompleted(store);
			})
		} else {
	   		resolve();
	   	}
	}

	waitCompleted();
});

export default (renderer, rootSaga) => {
	renderer.on('init', (ctx) => {
		const { store } = ctx;

		Object.assign(ctx, {
			sagaTask: store.runSaga(rootSaga)
		});
	});

	renderer.on('rendering', ({ store }, next) => isSagaRunning(store) && next(isSagaCompleted(store)));
}
