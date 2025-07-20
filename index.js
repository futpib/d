'use strict';

function defineProperty(o, k, v) {
	Object.defineProperty(o, k, {
		value: v,
	});
}

function create(proto, props) {
	const o = Object.create(proto);
	if (props) {
		for (const keys of [ Object.getOwnPropertyNames(props), Object.getOwnPropertySymbols(props) ]) {
			for (const k of keys) {
				defineProperty(o, k, props[k]);
			}
		}
	}

	return o;
}

class DynamicEnvironment {
	constructor(ownVars = null, parent = null) {
		this.scope = Object.freeze(create(parent ? parent.scope : null, ownVars));
		this.parent = parent || this;
	}

	static create(ownVars, parent) {
		if (this._lastOwnVars === ownVars && this._lastParent === parent && this._lastInstance) {
			return this._lastInstance;
		}

		this._lastOwnVars = ownVars;
		this._lastParent = parent;
		this._lastInstance = new this(ownVars, parent);
		return this._lastInstance;
	}
}

class D {
	constructor() {
		this._env = new DynamicEnvironment();
	}

	get scope() {
		return this._env.scope;
	}

	const(vars, thunk) {
		this._env = DynamicEnvironment.create(vars, this._env);
		try {
			return thunk();
		} finally {
			this._env = this._env.parent;
		}
	}

	bind(vars, f) {
		const g = (...args) => this.const(vars, () => Reflect.apply(f, this, args));

		defineProperty(g, 'name', 'd.bound ' + f.name);
		defineProperty(g, 'length', f.length);
		return g;
	}
}

module.exports = new D();
