
import { CheckCheck, CreditCard, PiggyBank, Rocket } from "lucide-react";

const Reason = () => {
  return (
    <div className="mt-20 text-center">
      <h3 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
        REASONS TO CHOOSE US
      </h3>

      {/* SVG Divider */}
      <div className="my-12">
        <svg
          className="w-full h-20 text-gray-200"
          viewBox="0 0 1280 140"
          preserveAspectRatio="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <g fill="currentColor">
            <path d="M1280 140V0S993.46 140 640 139 0 0 0 0v140z" />
          </g>
        </svg>
      </div>

      {/* Features Section */}
      <div className="bg-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 max-w-6xl mx-auto text-left">

          {/* Feature Card - Awesome quality */}
          <div className="flex items-start space-x-5">
            <div className="w-20 h-20 rounded-full bg-gray-700 flex items-center justify-center text-white">
              <CheckCheck size={25} />
            </div>
            <div>
              <h4 className="text-xl font-semibold text-gray-800 mb-1">
                Awesome quality
              </h4>
              <p className="text-gray-600">
                Providing only the best SMM services on the market.
              </p>
            </div>
          </div>

          {/* Feature Card - Various payments */}
          <div className="flex items-start space-x-5">
            <div className="w-20 h-20 rounded-full bg-gray-700 flex items-center justify-center text-white">
              <CreditCard size={25} />
            </div>
            <div>
              <h4 className="text-xl font-semibold text-gray-800 mb-1">
                Various payment options
              </h4>
              <p className="text-gray-600">
                Add funds through a payment method that fits your needs.
              </p>
            </div>
          </div>

          {/* Feature Card - Affordable pricing */}
          <div className="flex items-start space-x-5">
            <div className="w-20 h-20 rounded-full bg-gray-700 flex items-center justify-center text-white">
              <PiggyBank size={25} />
            </div>
            <div>
              <h4 className="text-xl font-semibold text-gray-800 mb-1">
                Incredible prices
              </h4>
              <p className="text-gray-600">
                You can enjoy super affordable SMM services on our panel.
              </p>
            </div>
          </div>

          {/* Feature Card - Fast delivery */}
          <div className="flex items-start space-x-5">
            <div className="w-20 h-20 rounded-full bg-gray-700 flex items-center justify-center text-white">
              <Rocket size={25} />
            </div>
            <div>
              <h4 className="text-xl font-semibold text-gray-800 mb-1">
                Super quick delivery
              </h4>
              <p className="text-gray-600">
                You can expect your orders to be processed super fast.
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Reason;
