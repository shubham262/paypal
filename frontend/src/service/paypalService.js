import api from ".";

export const fetchProducts = async () => {
	try {
		const { data } = await api.get(`/api/ecommerce/products`);
		return data;
	} catch (error) {
		throw error;
	}
};

export const fetchPlans = async () => {
	try {
		const { data } = await api.get(`/api/ecommerce/plans`);
		return data;
	} catch (error) {
		throw error;
	}
};

export const fetchOrderStatus = async (orderId) => {
	try {
		const { data } = await api.get(`/api/ecommerce/order-status/${orderId}`);
		return data;
	} catch (error) {
		throw error;
	}
};

export const fetchSubscriptionStatus = async (orderId) => {
	try {
		const { data } = await api.get(
			`/api/ecommerce/subscription-status/${orderId}`
		);
		return data;
	} catch (error) {
		throw error;
	}
};

export const checkout = async (payload) => {
	try {
		const { data } = await api.post(`/api/ecommerce/create-checkout`, payload);
		return data;
	} catch (error) {
		throw error;
	}
};

export const capture = async (payload) => {
	try {
		const { data } = await api.post(`/api/ecommerce/capture-checkout`, payload);
		return data;
	} catch (error) {
		throw error;
	}
};

export const subscribe = async (payload) => {
	try {
		const { data } = await api.post(
			`/api/ecommerce/create-subscription`,
			payload
		);
		return data;
	} catch (error) {
		throw error;
	}
};

export const verify = async (payload) => {
	try {
		const { data } = await api.post(`/api/ecommerce/verify-payment`, payload);
		return data;
	} catch (error) {
		throw error;
	}
};

export const verifySubscription = async (payload) => {
	try {
		const { data } = await api.post(
			`/api/ecommerce/verify-subscription`,
			payload
		);
		return data;
	} catch (error) {
		throw error;
	}
};
