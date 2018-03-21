
import test from 'ava';

import d from '.';

const testMacro = (t, id) => {
	t.truthy(id);

	t.is(d.scope.toString, undefined);
	t.is(d.scope[id], undefined);

	const f = x => x + d.scope[id];

	// With
	t.is(d.const({ [id]: 2 }, () => f(1)), 3);

	// With shadowing
	t.is(d.const({ [id]: 'xuz' }, () => d.const({ [id]: 3 }, () => f(1))), 4);

	// Bound
	const g = d.bind({ [id]: 3 }, f);
	t.is(g(1), 4);

	// Bound twice
	const h = d.bind({ [id]: 'foo' }, g);
	t.is(h(1), g(1));

	// Bound inside with
	t.is(d.const({ [id]: 'bar' }, () => g(1)), g(1));

	// With inside bound
	const i = d.bind({ [id]: 'buz' }, () => d.const({ [id]: 2 }, () => f(1)));
	t.is(i(1), 3);

	// Error
	t.throws(() => d.const({ [id]: 2 }, () => {
		throw new Error('test');
	}), 'test');

	t.is(d.scope[id], undefined);
};

test('with string', testMacro, 'str');
test('with symbol', testMacro, Symbol('sym'));

test('Bound function name and length', t => {
	const f = (a, b, c) => a + b + c;
	const g = d.bind({}, f);
	t.is(g.name, 'd.bound f');
	t.is(g.length, 3);
});
