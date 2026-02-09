import crypto from "crypto";
import axios from "axios";

export type AnalyticsEvent = {
  distinctId: string;
  event: string;
  properties?: Record<string, unknown>;
  timestamp?: string;
};

const ANALYTICS_ENDPOINT = process.env.POSTHOG_HOST;
const POSTHOG_KEY = process.env.POSTHOG_API_KEY;
const ANALYTICS_MODE = process.env.ANALYTICS_MODE ?? "posthog";

const generateAnonId = () => crypto.randomUUID();

const sendPostHogEvent = async (payload: AnalyticsEvent): Promise<void> => {
  if (!POSTHOG_KEY || !ANALYTICS_ENDPOINT) return;
  await axios.post(
    `${ANALYTICS_ENDPOINT}/capture/`,
    {
      api_key: POSTHOG_KEY,
      distinct_id: payload.distinctId,
      event: payload.event,
      properties: payload.properties ?? {},
      timestamp: payload.timestamp,
    },
    {
      headers: {
        "Content-Type": "application/json",
        "User-Agent": "jsondeck-analytics",
      },
      validateStatus: () => true,
    }
  );
};

const sendCustomEvent = async (payload: AnalyticsEvent): Promise<void> => {
  const endpoint = process.env.ANALYTICS_WEBHOOK_URL;
  if (!endpoint) return;
  await axios.post(endpoint, payload, {
    headers: {
      "Content-Type": "application/json",
    },
    validateStatus: () => true,
  });
};

const dispatchEvent = async (payload: AnalyticsEvent): Promise<void> => {
  if (ANALYTICS_MODE === "custom") {
    await sendCustomEvent(payload);
    return;
  }
  await sendPostHogEvent(payload);
};

export const analytics = {
  identify(distinctId?: string) {
    return distinctId ?? generateAnonId();
  },
  async trackPageView(path: string, distinctId?: string) {
    await dispatchEvent({
      distinctId: distinctId ?? generateAnonId(),
      event: "page_view",
      properties: {
        path,
        source: "web",
      },
      timestamp: new Date().toISOString(),
    });
  },
  async trackToolUsage(tool: string, details?: Record<string, unknown>, distinctId?: string) {
    await dispatchEvent({
      distinctId: distinctId ?? generateAnonId(),
      event: "tool_usage",
      properties: {
        tool,
        ...details,
      },
      timestamp: new Date().toISOString(),
    });
  },
  async trackApiUsage(endpoint: string, method: string, status: number, distinctId?: string) {
    await dispatchEvent({
      distinctId: distinctId ?? generateAnonId(),
      event: "api_usage",
      properties: {
        endpoint,
        method,
        status,
      },
      timestamp: new Date().toISOString(),
    });
  },
};
