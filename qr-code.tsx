import { useState, useEffect } from "react";
import QRCodeLib from "qrcode";

interface QRCodeProps {
  value: string;
  size?: number;
  bgColor?: string;
  fgColor?: string;
  level?: string;
  includeMargin?: boolean;
  className?: string;
}

export function QRCode({
  value,
  size = 180,
  bgColor = "#FFFFFF",
  fgColor = "#000000",
  level = "L",
  includeMargin = false,
  className,
}: QRCodeProps) {
  const [qrCodeURL, setQRCodeURL] = useState<string | null>(null);

  useEffect(() => {
    const generateQRCode = async () => {
      try {
        const url = await QRCodeLib.toDataURL(value, {
          margin: includeMargin ? 4 : 0,
          width: size,
          color: {
            dark: fgColor,
            light: bgColor,
          },
          errorCorrectionLevel: level as QRCodeLib.QRCodeErrorCorrectionLevel,
        });
        setQRCodeURL(url);
      } catch (err) {
        console.error("Error generating QR code:", err);
      }
    };

    generateQRCode();
  }, [value, size, bgColor, fgColor, level, includeMargin]);

  if (!qrCodeURL) {
    return (
      <div
        style={{
          height: size,
          width: size,
        }}
        className={`flex items-center justify-center bg-gray-100 rounded-md ${className || ""}`}
      >
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-gray-600" />
      </div>
    );
  }

  return (
    <img
      src={qrCodeURL}
      alt={`QR Code for ${value}`}
      style={{
        height: size,
        width: size,
      }}
      className={`rounded-md ${className || ""}`}
    />
  );
}