
const Benchmark = require('benchmark');

const d = require('.');

const series = [ 0, 1, 2, 3 ];
const series_ = [ 1, 2, 3, 4 ];

const withD = (() => {
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
	return f;
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
	return createF;
})();

const withLexical = (() => {
	return ({ series }) => {
		const value = i => series[i];
		const sma3 = i => (value(i - 2) + value(i - 1) + value(i)) / 3;
		const absdiff = f => g => i => Math.abs(f(i) - g(i));
		const f = absdiff(sma3)(value);
		return f;
	};
})();

const benchmark = (n, f) => {
	console.log();
	console.log(n);
	return f(new Benchmark.Suite(n, {
		onError(err) {
			console.error(err);
		},
	}))
		.on('cycle', event => {
			console.log(String(event.target));
		})
		.on('complete', function () {
			console.log('Fastest is ' + this.filter('fastest').map('name'));
		})
		.run();
};

d.const({ series }, () => {
	const withThisBound = withThis.bind({ series });
	const withFactoriesBound = withFactories({ series });
	const withLexicalBound = withLexical({ series });

	benchmark('Without changing context', b => {
		return b
			.add('d', () => {
				withD(series.length - 1);
			})
			.add('this', () => {
				withThisBound(series.length - 1);
			})
			.add('factories', () => {
				withFactoriesBound(series.length - 1);
			})
			.add('lexical', () => {
				withLexicalBound(series.length - 1);
			});
	});
});

benchmark('With changing context', b => {
	return b
		.add('d+const', () => {
			d.const({ series }, () => withD(series.length - 1));
			d.const({ series: series_ }, () => withD(series_.length - 1));
		})
		.add('d+bind', () => {
			d.bind({ series }, withD)(series.length - 1);
			d.bind({ series: series_ }, withD)(series_.length - 1);
		})
		.add('this+call', () => {
			withThis.call({ series }, series.length - 1);
			withThis.call({ series: series_ }, series_.length - 1);
		})
		.add('this+bind', () => {
			withThis.bind({ series })(series.length - 1);
			withThis.bind({ series: series_ })(series_.length - 1);
		})
		.add('factories', () => {
			withFactories({ series })(series.length - 1);
			withFactories({ series: series_ })(series_.length - 1);
		})
		.add('lexical', () => {
			withLexical({ series })(series.length - 1);
			withLexical({ series: series_ })(series_.length - 1);
		});
});

benchmark('With changing context 2', b => {
	const dConstA = n => d.const({ series }, () => withD(n));
	const dConstB = n => d.const({ series: series_ }, () => withD(n));

	const dBindA = d.bind({ series }, withD);
	const dBindB = d.bind({ series: series_ }, withD);

	const thisCallA = n => withThis.call({ series }, n);
	const thisCallB = n => withThis.call({ series: series_ }, n);

	const thisBindA = withThis.bind({ series });
	const thisBindB = withThis.bind({ series: series_ });

	const factoriesA = withFactories({ series });
	const factoriesB = withFactories({ series: series_ });

	const lexicalA = withLexical({ series });
	const lexicalB = withLexical({ series: series_ });

	return b
		.add('d+const', () => {
			dConstA(series.length - 1);
			dConstB(series.length - 1);
		})
		.add('d+bind', () => {
			dBindA(series.length - 1);
			dBindB(series.length - 1);
		})
		.add('this+call', () => {
			thisCallA(series.length - 1);
			thisCallB(series.length - 1);
		})
		.add('this+bind', () => {
			thisBindA(series.length - 1);
			thisBindB(series.length - 1);
		})
		.add('factories', () => {
			factoriesA(series.length - 1);
			factoriesB(series.length - 1);
		})
		.add('lexical', () => {
			lexicalA(series.length - 1);
			lexicalB(series.length - 1);
		});
});
