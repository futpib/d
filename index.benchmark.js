
const Benchmark = require('benchmark');

const d = require('.');

const series = [ 0, 1, 2, 3 ];

const withInnerDBind = (() => {
	const value = i => d.scope.series[i];
	const sma3 = i => (value(i - 2) + value(i - 1) + value(i)) / 3;
	const absdiff = f => g => i => Math.abs(f(i) - g(i));
	const f = absdiff(sma3)(value);
	return d.bind({ series }, f);
})();

const withOuterDConst = (() => {
	const value = i => d.scope.series[i];
	const sma3 = i => (value(i - 2) + value(i - 1) + value(i)) / 3;
	const absdiff = f => g => i => Math.abs(f(i) - g(i));
	const f = absdiff(sma3)(value);
	return f;
})();

const withThis = (() => {
	function value(i) {
		return this.series[i];
	}
	function sma3(i) {
		return (value.call(this, i - 2) + value.call(this, i - 1) + value.call(this, i)) / 3;
	}
	const absdiff = f => g => function (i) {
		return Math.abs(f.call(this, i) - g.call(this, i));
	};
	const f = absdiff(sma3)(value);
	return f.bind({ series });
})();

const withFactories = (() => {
	const createValue = scope => i => scope.series[i];
	const createSma3 = scope => {
		const value = createValue(scope);
		return i => (value(i - 2) + value(i - 1) + value(i)) / 3;
	};
	const createAbsDiff = scope => createF => createG => {
		const f = createF(scope);
		const g = createG(scope);
		return i => Math.abs(f(i) - g(i));
	};
	const createF = scope => createAbsDiff(scope)(createSma3)(createAbsDiff);
	return createF({ series });
})();

const withNoAbstraction = (() => {
	const value = i => series[i];
	const sma3 = i => (value(i - 2) + value(i - 1) + value(i)) / 3;
	const absdiff = f => g => i => Math.abs(f(i) - g(i));
	const f = absdiff(sma3)(value);
	return f;
})();

const buildBench = withWhat => () => {
	withWhat(series.length - 1);
};

d.const({ series }, () => {
	(new Benchmark.Suite('🤔', {
		onError(err) {
			console.error(err);
		},
	}))
		.add('inner d.bind', buildBench(withInnerDBind))
		.add('outer d.const', buildBench(withOuterDConst))
		.add('this', buildBench(withThis))
		.add('factories', buildBench(withFactories))
		.add('no abstraction', buildBench(withNoAbstraction))
		.on('cycle', event => {
			console.log(String(event.target));
		})
		.on('complete', function () {
			console.log('Fastest is ' + this.filter('fastest').map('name'));
		})
		.run();
});
