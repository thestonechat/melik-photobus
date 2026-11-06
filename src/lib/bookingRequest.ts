"use server";

const RESEND_URL = "https://api.resend.com/emails";
const MAX_FIELD_LENGTH = 500;

const SERVICE_NAMES = { bus: "Photo bus", spin: "360 Spin" } as const;

export interface BookingRequest {
  service: keyof typeof SERVICE_NAMES;
  name: string;
  email: string;
  address: string;
  eventType: string;
  dates: string;
}

function isValid(request: BookingRequest) {
  const fields = [request.name, request.email, request.address, request.eventType, request.dates];
  return (
    request.service in SERVICE_NAMES &&
    fields.every((field) => {
      const value = field.trim();
      return value.length > 0 && value.length <= MAX_FIELD_LENGTH;
    }) &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(request.email.trim())
  );
}

/** Emails the request to the team, with Reply-To set so they can answer the customer directly. */
export async function sendBookingRequest(request: BookingRequest): Promise<boolean> {
  const { RESEND_API_KEY, BOOKING_EMAIL_TO, BOOKING_EMAIL_FROM } = process.env;
  if (!RESEND_API_KEY || !BOOKING_EMAIL_TO || !BOOKING_EMAIL_FROM || !isValid(request)) {
    return false;
  }

  const service = SERVICE_NAMES[request.service];
  const response = await fetch(RESEND_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: BOOKING_EMAIL_FROM,
      to: BOOKING_EMAIL_TO,
      reply_to: request.email.trim(),
      subject: `${service} request: ${request.dates.trim()}`,
      text: [
        `Service: ${service}`,
        `Name: ${request.name.trim()}`,
        `Email: ${request.email.trim()}`,
        `Dates: ${request.dates.trim()}`,
        `Venue: ${request.address.trim()}`,
        `Occasion: ${request.eventType.trim()}`,
      ].join("\n"),
    }),
  }).catch(() => null);

  return response?.ok ?? false;
}
