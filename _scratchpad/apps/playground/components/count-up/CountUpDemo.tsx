import CountUpTo from './count-up-to';

export default function CountUpDemo() {
  return (
    <div className="p-8 space-y-8 bg-gray-900 text-white">
      <h1 className="text-3xl font-bold mb-8">Custom CountUp Component Demo</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Basic Usage */}
        <div className="bg-gray-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-2">Basic Count</h3>
          <div className="text-3xl font-bold text-blue-400">
            <CountUpTo value={1234} />
          </div>
          <p className="text-sm text-gray-400 mt-2">Simple count to 1,234</p>
        </div>

        {/* With Decimals */}
        <div className="bg-gray-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-2">With Decimals</h3>
          <div className="text-3xl font-bold text-green-400">
            <CountUpTo value={99.99} decimals={2} />
          </div>
          <p className="text-sm text-gray-400 mt-2">Counting with 2 decimal places</p>
        </div>

        {/* Currency Format */}
        <div className="bg-gray-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-2">Currency</h3>
          <div className="text-3xl font-bold text-green-400">
            <CountUpTo value={1234567} prefix="$" decimals={2} />
          </div>
          <p className="text-sm text-gray-400 mt-2">Currency with prefix</p>
        </div>

        {/* Percentage */}
        <div className="bg-gray-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-2">Percentage</h3>
          <div className="text-3xl font-bold text-purple-400">
            <CountUpTo value={85.7} suffix="%" decimals={1} />
          </div>
          <p className="text-sm text-gray-400 mt-2">Percentage with suffix</p>
        </div>

        {/* Large Numbers */}
        <div className="bg-gray-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-2">Large Numbers</h3>
          <div className="text-3xl font-bold text-red-400">
            <CountUpTo value={9876543210} />
          </div>
          <p className="text-sm text-gray-400 mt-2">Large number with separators</p>
        </div>

        {/* Custom Duration */}
        <div className="bg-gray-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-2">Slow Animation</h3>
          <div className="text-3xl font-bold text-yellow-400">
            <CountUpTo value={500} duration={3} />
          </div>
          <p className="text-sm text-gray-400 mt-2">3-second duration</p>
        </div>

        {/* Start from Different Value */}
        <div className="bg-gray-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-2">Custom Start</h3>
          <div className="text-3xl font-bold text-cyan-400">
            <CountUpTo value={200} start={100} />
          </div>
          <p className="text-sm text-gray-400 mt-2">Starting from 100</p>
        </div>

        {/* COVID Data Example */}
        <div className="bg-gray-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-2">COVID Cases</h3>
          <div className="text-3xl font-bold text-orange-400">
            <CountUpTo value={1234567} suffix=" cases" />
          </div>
          <p className="text-sm text-gray-400 mt-2">Real-world usage example</p>
        </div>

        {/* Fast Animation */}
        <div className="bg-gray-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-2">Fast Animation</h3>
          <div className="text-3xl font-bold text-pink-400">
            <CountUpTo value={777} duration={0.5} />
          </div>
          <p className="text-sm text-gray-400 mt-2">0.5-second duration</p>
        </div>
      </div>

      {/* Features List */}
      <div className="bg-gray-800 rounded-lg p-6 mt-8">
        <h2 className="text-xl font-semibold mb-4">Features</h2>
        <ul className="space-y-2 text-gray-300">
          <li>✅ Smooth easing animation (cubic ease-out)</li>
          <li>✅ Configurable duration</li>
          <li>✅ Number formatting with separators</li>
          <li>✅ Decimal precision control</li>
          <li>✅ Prefix and suffix support</li>
          <li>✅ Custom start values</li>
          <li>✅ Performance optimized with requestAnimationFrame</li>
          <li>✅ TypeScript support</li>
          <li>✅ Zero external dependencies</li>
          <li>✅ Automatic cleanup on unmount</li>
        </ul>
      </div>
    </div>
  );
}
