import QRCode from "qrcode";

export interface QRCodeOptions {
  width?: number;
  margin?: number;
  color?: {
    dark?: string;
    light?: string;
  };
}

export async function generateQRDataURL(
  url: string,
  options: QRCodeOptions = {}
): Promise<string> {
  const defaultOptions: QRCode.QRCodeToDataURLOptions = {
    errorCorrectionLevel: "H", // High error correction allows center logos/emojis
    type: "image/png",
    margin: options.margin ?? 2,
    width: options.width ?? 600,
    color: {
      dark: options.color?.dark ?? "#020617",
      light: options.color?.light ?? "#ffffff",
    },
  };

  return QRCode.toDataURL(url, defaultOptions);
}

export async function generateQRSVG(
  url: string,
  options: QRCodeOptions = {}
): Promise<string> {
  return QRCode.toString(url, {
    type: "svg",
    errorCorrectionLevel: "H",
    margin: options.margin ?? 2,
    width: options.width ?? 600,
    color: {
      dark: options.color?.dark ?? "#020617",
      light: options.color?.light ?? "#ffffff",
    },
  });
}
