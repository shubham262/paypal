export const seedProducts = [
	{
		name: "System Design Course",
		slug: "system-design-course",
		description:
			"Learn scalable architecture, tradeoffs, and interview-ready design patterns.",
		price: 990000,
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
		paypalProductId: "PROD-8NS71971JN581603N",
		features: ["HTML Basics", "CSS Advanced", "JS Deep Dive"],
		active: true,
		pricingOptions: [
			{
				interval: "month",
				price: 9.99,
				currency: "usd",
				paypalPlanId: "P-5JU19657P2462721ANI7AFSQ",
			},
			{
				interval: "year",
				price: 99.99,
				currency: "usd",
				paypalPlanId: "P-9W17228409774842VNI7AFYI",
			},
		],
	},

	{
		name: "PW PRO",
		description:
			"Full access including mentorship and advanced backend concepts.",
		paypalProductId: "PROD-0MD16968A56320906",
		features: ["Everything in Basic", "Node.js Mastery", "1-on-1 Mentorship"],
		active: true,
		pricingOptions: [
			{
				interval: "month",
				price: 19.99,
				currency: "usd",
				paypalPlanId: "P-59G7701706133130MNI7AEVQ",
			},
			{
				interval: "year",
				price: 199.99,
				currency: "usd",
				paypalPlanId: "P-9VH484728W8809701NI7AE7A",
			},
		],
	},
];
