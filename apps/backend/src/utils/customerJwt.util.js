import jwt from "jsonwebtoken";
import crypto from "crypto";

//  Issue Isolated Storefront Customer JWT Cookie ('customer_jwt')
export const sendCustomerTokenResponse = (
  customer,
  statusCode,
  res,
  message,
) => {
  const token = jwt.sign(
    {
      id: customer.id,
      merchantId: customer.merchantId,
      role: "customer",
      tokenType: "customer",
      jti: crypto.randomUUID(),
    },
    process.env.JWT_SECRET || "super_secret_fallback_key_2026",
    { expiresIn: "7d" },
  );

  const cookieOptions = {
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
  };

  return res
    .status(statusCode)
    .cookie("customer_jwt", token, cookieOptions)
    .json({
      error: false,
      status: statusCode,
      message,
      data: {
        customer_id: customer.id,
        merchant_id: customer.merchantId,
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        is_guest: false,
      },
    });
};

export const clearCustomerTokenCookie = (res) => {
  res.cookie("customer_jwt", "logged_out", {
    expires: new Date(Date.now() + 1000),
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
  });
};