import { AppError } from "../../../../core/errors/AppError.js";

const VIRTUAL_CAM_BLACKLIST = [
  "obs",
  "manycam",
  "splitcam",
  "v4l2loopback",
  "snap camera",
  "xsplit",
  "youcam",
  "droidcam",
  "iriun",
  "epoccam",
  "virtual",
  "emulator",
  "fakecam",
];

export const cleanKycString = (val, maxLen = 200) => {
  if (typeof val !== "string") return "";
  return val
    .replace(/[<>'"`;(){}]/g, "")
    .trim()
    .slice(0, maxLen);
};

// Validate Hardware Camera Metadata for KYC Live Verification
export const validateHardwareCamera = (cameraMeta) => {
  if (!cameraMeta || typeof cameraMeta !== "object") {
    throw new AppError(
      "Hardware camera metadata is required for live verification.",
      400,
    );
  }

  const deviceLabel = cleanKycString(cameraMeta.deviceLabel, 150).toLowerCase();
  const usbVendorId = cleanKycString(cameraMeta.usbVendorId, 50).toLowerCase();

  if (!deviceLabel || deviceLabel.length < 3) {
    throw new AppError("Camera hardware label cannot be empty.", 400);
  }

  const isVirtual = VIRTUAL_CAM_BLACKLIST.some(
    (kw) => deviceLabel.includes(kw) || usbVendorId.includes(kw),
  );

  if (isVirtual || cameraMeta.isVirtualCamBlocked === false) {
    throw new AppError(
      "Security Violation: Virtual camera or emulator detected. Use a physical camera.",
      403,
    );
  }

  return {
    deviceLabel: cleanKycString(cameraMeta.deviceLabel, 150),
    usbVendorId: usbVendorId || "integrated_cam",
    isVirtualCamBlocked: true,
    capturedViaMobileQrSync: Boolean(cameraMeta.capturedViaMobileQrSync),
  };
};