import EventEmitter from 'events';
import { renderToStaticMarkup } from 'react-dom/server';

const _component = Symbol("component");

class Renderer extends EventEmitter {
	constructor (Component, ...args) {
		super(...args);

		this[_component] = Component;
	}

	use (plugin, ...args) {
		plugin(this, ...args)

		return this;
	}

	render = async (path, req) => {
		const initMap = {
			path,
			context: {},
			req
		};

		this.emit('init', initMap);

	  	const rootComponent = this[_component](initMap);

		const renderApp = async (content, forceRender = false) => {
			const tasks = [];

			this.emit('rendering', initMap, (task) => tasks.push(task));

			if (tasks.length) {
				await Promise.all(tasks);
				return renderApp(undefined, true);
			} else if (forceRender) {
				return await renderApp(renderToStaticMarkup(rootComponent));
			}

			this.emit('rendered', initMap);

			return content;
	  	};

	  	const content = await renderApp(undefined, true);

		Object.assign(initMap, { content });

		this.emit('end', initMap);

		const { context } = initMap;

	  	return { content, path, context };
	}
}

export default Renderer;
