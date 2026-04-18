const PaymentSection = () => (
  <section className="bg-white dark:bg-[#0f0f1a] py-24 px-6">
    <div className="max-w-3xl mx-auto text-center">
      <span className="text-brand-600 dark:text-brand-400 text-sm font-semibold uppercase tracking-widest mb-4 block">Payments</span>
      <h2 className="text-4xl sm:text-5xl font-black text-gray-900 dark:text-white mb-4">
        Pay your way
      </h2>
      <p className="text-gray-500 dark:text-gray-400 text-base leading-relaxed mb-10">
        We support all major payment methods so you can fund your account instantly, wherever you are in the world.
      </p>
      <div className="bg-gray-50 dark:bg-[#0a0a0f] border border-gray-100 dark:border-white/5 rounded-2xl p-8 shadow-sm dark:shadow-none">
        <img
          src="/images/payments.png"
          alt="Payment methods"
          className="max-h-20 mx-auto object-contain"
          onError={(e) => {
            e.target.parentElement.innerHTML = '<div class=\"flex flex-wrap justify-center gap-4 text-gray-400 dark:text-gray-500 text-sm font-medium\"><span>Visa</span><span>Mastercard</span><span>PayPal</span><span>Crypto</span><span>Bank Transfer</span></div>';
          }}
        />
      </div>
    </div>
  </section>
);

export default PaymentSection;