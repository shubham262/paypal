import React from "react";
import { Modal, Spin, Result, Button } from "antd";
import { LoadingOutlined } from "@ant-design/icons";

export default function PaymentVerifyModal({ isOpen, status, onClose }) {
	const antIcon = <LoadingOutlined style={{ fontSize: 48 }} spin />;

	return (
		<Modal
			open={isOpen}
			footer={null}
			closable={status !== "verifying"}
			centered
			destroyOnHidden
		>
			<div style={{ padding: "24px 0", textAlign: "center" }}>
				{status === "verifying" && (
					<div style={{ padding: "40px 0" }}>
						<Spin indicator={antIcon} />
						<h3 style={{ marginTop: 24 }}>Verifying Payment Security Seal</h3>
						<p style={{ color: "#666" }}>
							Securing your transaction with the bank. Please do not refresh or
							close this tab.
						</p>
					</div>
				)}

				{status === "success" && (
					<Result
						status="success"
						title="Payment Verified Successfully!"
						subTitle="Your access to the FullStackLife course platform has been unlocked."
					/>
				)}

				{status === "failed" && (
					<Result
						status="error"
						title="Cryptographic Verification Failed"
						subTitle="The payment went through, but the secure signature handshake failed. Do not worry, your funds are safe."
						extra={[
							<Button type="primary" key="retry" onClick={onClose}>
								Close & Retry
							</Button>,
							<Button key="support" href="mailto:support@fullstacklife.com">
								Contact Support
							</Button>,
						]}
					/>
				)}
			</div>
		</Modal>
	);
}
