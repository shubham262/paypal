export const seedProducts = [
	{
		name: "System Design Course",
		slug: "system-design-course",
		description:
			"Learn scalable architecture, tradeoffs, and interview-ready design patterns.",
		price: 990000,//
		currency: "inr",
		active: true,
	},
	{
		name: "Full Stack Course",
		slug: "full-stack-course",
		description:
			"Build complete web apps with frontend, backend, database, and deployment.",
		price: 890000,
		currency: "inr",
		active: true,
	},
	{
		name: "Frontend Development Course",
		slug: "frontend-development-course",
		description:
			"Master modern UI engineering, React patterns, and responsive interfaces.",
		price: 790000,
		currency: "inr",
		active: true,
	},
];
export const seedPlans = [
	{
		name: "PW Basic",
		description: "Access to standard FullStackLife courses.",
		paypalProductId: "PROD-9DY28891EP551234T",
		features: ["HTML Basics", "CSS Advanced", "JS Deep Dive"],
		active: true,
		pricingOptions: [
			{
				interval: "month",
				price: 10,
				currency: "usd",
				paypalPlanId: "P-7MY926400N5310524NI7FY5Y",
			},
			{
				interval: "year",
				price: 100,
				currency: "usd",
				paypalPlanId: "P-2D988681SG495063RNI7FZ5I",
			},
		],
	},

	{
		name: "PW PRO",
		description:
			"Full access including mentorship and advanced backend concepts.",
		paypalProductId: "PROD-46W60150X8643612F",
		features: ["Everything in Basic", "Node.js Mastery", "1-on-1 Mentorship"],
		active: true,
		pricingOptions: [
			{
				interval: "month",
				price: 20,
				currency: "usd",
				paypalPlanId: "P-6PX18183DL049720RNI7F2FY",
			},
			{
				interval: "year",
				price: 220,
				currency: "usd",
				paypalPlanId: "P-7YL73893N95139029NI7F2LY",
			},
		],
	},
];
