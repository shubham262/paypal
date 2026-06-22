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
		name: "PW BASIC",
		description: "Fundamental access to the curriculum.",
		features: ["Standard Course Access", "Community Support"],
		active: true,
		pricingOptions: [
			{
				interval: "month",
				price: 1500,
				currency: "inr",
				razorpayPlanId: "plan_T2cICwfpFGusSk", // Extracted from your screenshot
			},
			{
				interval: "year",
				price: 12000,
				currency: "inr",
				razorpayPlanId: "plan_T2cIXmzN1Pm8Wf", // Extracted from your screenshot
			},
		],
	},
	{
		name: "PW PRO",
		description: "Advanced access with premium mentorship.",
		features: [
			"Standard Course Access",
			"Community Support",
			"1-on-1 Mentorship",
			"System Design Mock Interviews",
		],
		active: true,
		pricingOptions: [
			{
				interval: "month",
				price: 2500,
				currency: "inr",
				razorpayPlanId: "plan_T2cGkapNxr4WsK", // Extracted from your screenshot
			},
			{
				interval: "year",
				price: 24000,
				currency: "inr",
				razorpayPlanId: "plan_T2cHeDgSrlKXaj", // Extracted from your screenshot
			},
		],
	},
];
