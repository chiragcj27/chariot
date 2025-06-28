export default function SubscriptionCards() {
    return (
        <section className="w-full min-h-screen bg-pearl py-20 px-4">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="text-center mb-16">
                    <h1 className="text-5xl md:text-6xl font-primary font-bold text-black mb-6">
                        Subscription Plans
                    </h1>
                    <p className="text-xl font-secondary text-black/70 max-w-2xl mx-auto leading-relaxed">
                        Access all the assets you need — choose a plan that grows with your brand.
                        <br />
                        No hidden fees. Cancel anytime.
                    </p>
                </div>

                {/* Plans Grid */}
                <div className="grid md:grid-cols-3 gap-8 mb-16">
                    {/* Starter Plan */}
                    <div className="bg-white rounded-2xl p-8 border border-seafoam/20 shadow-lg hover:shadow-xl transition-all duration-300 flex flex-col">
                        <div className="mb-6">
                            <h3 className="text-2xl font-primary font-bold text-black mb-2">Starter</h3>
                            <div className="flex items-baseline gap-2">
                                <span className="text-4xl font-primary font-bold text-sunrise">₹499</span>
                                <span className="text-black/60 font-secondary">/month</span>
                            </div>
                            <p className="text-black/70 mt-2 font-secondary">Perfect for solopreneurs & small retailers.</p>
                        </div>
                        
                        <ul className="space-y-4 mb-8 flex-grow">
                            <li className="flex items-start gap-3">
                                <div className="w-2 h-2 bg-seafoam rounded-full mt-2 flex-shrink-0"></div>
                                <span className="text-black/80 font-secondary">Access up to 50 credits/month</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <div className="w-2 h-2 bg-seafoam rounded-full mt-2 flex-shrink-0"></div>
                                <span className="text-black/80 font-secondary">Download select templates: flyers, reels, gift cards & more</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <div className="w-2 h-2 bg-seafoam rounded-full mt-2 flex-shrink-0"></div>
                                <span className="text-black/80 font-secondary">Roll over unused credits for up to 2 months</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <div className="w-2 h-2 bg-seafoam rounded-full mt-2 flex-shrink-0"></div>
                                <span className="text-black/80 font-secondary">Great for testing and quick wins</span>
                            </li>
                        </ul>
                        
                        <button className="w-full bg-seafoam border-2 border-black py-3 px-6 rounded-xl font-secondary font-semibold hover:bg-seafoam/90 transition-colors">
                            Start with Starter
                        </button>
                    </div>

                    {/* Pro Plan */}
                    <div className="bg-white rounded-2xl p-8 border-2 border-gold shadow-lg hover:shadow-xl transition-all duration-300 relative flex flex-col">
                        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                            <span className="bg-gold text-white px-4 py-1 rounded-full text-sm font-secondary font-semibold">Most Popular</span>
                        </div>
                        
                        <div className="mb-6">
                            <h3 className="text-2xl font-primary font-bold text-black mb-2">Pro</h3>
                            <div className="flex items-baseline gap-2">
                                <span className="text-4xl font-primary font-bold text-sunrise">₹999</span>
                                <span className="text-black/60 font-secondary">/month</span>
                            </div>
                            <p className="text-black/70 mt-2 font-secondary">For growing brands that post consistently.</p>
                        </div>
                        
                        <ul className="space-y-4 mb-8 flex-grow">
                            <li className="flex items-start gap-3">
                                <div className="w-2 h-2 bg-gold rounded-full mt-2 flex-shrink-0"></div>
                                <span className="text-black/80 font-secondary">Get 200 credits/month</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <div className="w-2 h-2 bg-gold rounded-full mt-2 flex-shrink-0"></div>
                                <span className="text-black/80 font-secondary">Unlock premium packs & seasonal kits (Diwali, Wedding, Valentine&apos;s...)</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <div className="w-2 h-2 bg-gold rounded-full mt-2 flex-shrink-0"></div>
                                <span className="text-black/80 font-secondary">Access top-performing assets for reels, email, catalogs & campaigns</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <div className="w-2 h-2 bg-gold rounded-full mt-2 flex-shrink-0"></div>
                                <span className="text-black/80 font-secondary">Priority chat support</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <div className="w-2 h-2 bg-gold rounded-full mt-2 flex-shrink-0"></div>
                                <span className="text-black/80 font-secondary">Ideal for D2C brands, Instagram sellers, or multi-outlet stores</span>
                            </li>
                        </ul>
                        
                        <button className="w-full bg-gold border-2 border-black py-3 px-6 rounded-xl font-secondary font-semibold hover:bg-gold/90 transition-colors">
                            Go Pro
                        </button>
                    </div>

                    {/* Elite Plan */}
                    <div className="bg-white rounded-2xl p-8 border border-sunrise/20 shadow-lg hover:shadow-xl transition-all duration-300 flex flex-col">
                        <div className="mb-6">
                            <h3 className="text-2xl font-primary font-bold text-black mb-2">Elite</h3>
                            <div className="flex items-baseline gap-2">
                                <span className="text-4xl font-primary font-bold text-sunrise">₹1,999</span>
                                <span className="text-black/60 font-secondary">/month</span>
                            </div>
                            <p className="text-black/70 mt-2 font-secondary">Agency-grade access. Maximum value.</p>
                        </div>
                        
                        <ul className="space-y-4 mb-8 flex-grow">
                            <li className="flex items-start gap-3">
                                <div className="w-2 h-2 bg-sunrise rounded-full mt-2 flex-shrink-0"></div>
                                <span className="text-black/80 font-secondary">Unlimited downloads & access</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <div className="w-2 h-2 bg-sunrise rounded-full mt-2 flex-shrink-0"></div>
                                <span className="text-black/80 font-secondary">Free access to future AI tools (caption generator, voiceover assistant, etc.)</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <div className="w-2 h-2 bg-sunrise rounded-full mt-2 flex-shrink-0"></div>
                                <span className="text-black/80 font-secondary">Early access to influencer marketplace</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <div className="w-2 h-2 bg-sunrise rounded-full mt-2 flex-shrink-0"></div>
                                <span className="text-black/80 font-secondary">Monthly trend insights & recommendations</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <div className="w-2 h-2 bg-sunrise rounded-full mt-2 flex-shrink-0"></div>
                                <span className="text-black/80 font-secondary">Best for large brands, agencies, and marketing teams</span>
                            </li>
                        </ul>
                        
                        <button className="w-full bg-sunrise border-2 border-black text-black py-3 px-6 rounded-xl font-secondary font-semibold hover:bg-sunrise/90 transition-colors">
                            Upgrade to Elite
                        </button>
                    </div>
                </div>

                {/* Annual Plans
                <div className="bg-white rounded-2xl p-8 border border-gold/30 shadow-lg mb-16">
                    <div className="text-center">
                        <h3 className="text-3xl font-bold text-black mb-4">Annual Plans</h3>
                        <p className="text-black/70 mb-6">Pay yearly & get 2 months free</p>
                        
                        <div className="grid md:grid-cols-3 gap-6 mb-8">
                            <div className="flex items-center gap-3">
                                <div className="w-3 h-3 bg-gold rounded-full"></div>
                                <span className="text-black/80">Bonus credits + 1 exclusive Festive Promo Kit</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-3 h-3 bg-gold rounded-full"></div>
                                <span className="text-black/80">Lock-in rates before prices increase</span>
                            </div>
                        </div>
                        
                        <button className="bg-gold text-white py-3 px-8 rounded-xl font-semibold hover:bg-gold/90 transition-colors">
                            Explore Annual Options
                        </button>
                    </div>
                </div> */}

                {/* How Credits Work */}
                <div className="bg-white rounded-2xl p-8 border border-seafoam/20 shadow-lg">
                    <h3 className="text-3xl font-primary font-bold text-black mb-6 text-center">How Credits Work</h3>
                    
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div className="text-center">
                            <div className="w-16 h-16 bg-seafoam/10 rounded-full flex items-center justify-center mx-auto mb-4">
                                <div className="w-8 h-8 bg-seafoam rounded-full"></div>
                            </div>
                            <h4 className="font-primary font-semibold text-black mb-2">Asset Pricing</h4>
                            <p className="text-black/70 text-sm font-secondary">Every asset (e.g., a reel template or flyer) is priced in credits</p>
                        </div>
                        
                        <div className="text-center">
                            <div className="w-16 h-16 bg-seafoam/10 rounded-full flex items-center justify-center mx-auto mb-4">
                                <div className="w-8 h-8 bg-seafoam rounded-full"></div>
                            </div>
                            <h4 className="font-primary font-semibold text-black mb-2">Download & Customize</h4>
                            <p className="text-black/70 text-sm font-secondary">Use credits to download & customize assets</p>
                        </div>
                        
                        <div className="text-center">
                            <div className="w-16 h-16 bg-seafoam/10 rounded-full flex items-center justify-center mx-auto mb-4">
                                <div className="w-8 h-8 bg-seafoam rounded-full"></div>
                            </div>
                            <h4 className="font-primary font-semibold text-black mb-2">Monthly Refresh</h4>
                            <p className="text-black/70 text-sm font-secondary">Credits refresh monthly</p>
                        </div>
                        
                        <div className="text-center">
                            <div className="w-16 h-16 bg-seafoam/10 rounded-full flex items-center justify-center mx-auto mb-4">
                                <div className="w-8 h-8 bg-seafoam rounded-full"></div>
                            </div>
                            <h4 className="font-primary font-semibold text-black mb-2">Keep Forever</h4>
                            <p className="text-black/70 text-sm font-secondary">You keep downloaded assets forever</p>
                        </div>
                    </div>
                    
                    <div className="mt-8 p-4 bg-seafoam/5 rounded-xl text-center">
                        <p className="text-black/80 font-secondary">
                            <strong>Unused credits roll over for 2 months</strong> - so you never lose what you&apos;ve earned.
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
}