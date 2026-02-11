import { BillingPlanModel } from "../models/billing-plan";
import { DocumentModel } from "../models/document";
import { ProjectModel } from "../models/project";
import { SubscriptionModel } from "../models/subscription";
import { UserModel } from "../models/user";
import { ApiRequestModel } from "../models/api-request";
import { analyticsCache } from "../../services/cache";

export interface AnalyticsRange {
  startDate: Date;
  endDate: Date;
}

interface SummaryResponse {
  range: { startDate: string; endDate: string };
  totals: {
    users: number;
    activeUsers: number;
    projects: number;
    documents: number;
  };
  subscriptions: {
    total: number;
    active: number;
    trialing: number;
    pastDue: number;
    canceled: number;
  };
  revenue: {
    monthlyRecurringCents: number;
    annualRecurringCents: number;
  };
}

interface UsageResponse {
  range: { startDate: string; endDate: string };
  toolUsage: Array<{ tool: string; count: number }>;
  apiUsage: {
    totalRequests: number;
    methods: Array<{ method: string; count: number }>;
  };
  dailyTraffic: Array<{ date: string; requests: number; projects: number; documents: number; users: number }>;
}

interface RevenueResponse {
  range: { startDate: string; endDate: string };
  totals: {
    recognizedCents: number;
    monthlyRecurringCents: number;
    annualRecurringCents: number;
  };
  subscriptions: Array<{ planCode: string; interval: string; seats: number; count: number; revenueCents: number }>;
  dailyRevenue: Array<{ date: string; revenueCents: number }>;
}

const ACTIVE_SUBSCRIPTION_STATUSES = ["active", "trialing", "past_due"];

const toIsoDate = (date: Date): string => date.toISOString().slice(0, 10);

const withAnalyticsCache = async <T>(key: string, producer: () => Promise<T>): Promise<T> => {
  const cached = await analyticsCache.get<T>(key);
  if (cached) {
    return cached;
  }

  const value = await producer();
  await analyticsCache.set(key, value);
  return value;
};

const matchCreatedRange = (range: AnalyticsRange) => ({ createdAt: { $gte: range.startDate, $lte: range.endDate } });

const getRecurringRevenueByInterval = async () => {
  const revenueRows = await SubscriptionModel.aggregate<{
    _id: string;
    interval: string;
    recurringCents: number;
  }>([
    {
      $match: {
        status: { $in: ACTIVE_SUBSCRIPTION_STATUSES },
        currentPeriodEnd: { $gt: new Date() },
      },
    },
    {
      $lookup: {
        from: "billingplans",
        localField: "planCode",
        foreignField: "planCode",
        as: "plan",
      },
    },
    { $unwind: "$plan" },
    {
      $group: {
        _id: "$interval",
        recurringCents: {
          $sum: {
            $multiply: [
              "$seats",
              {
                $cond: [
                  { $eq: ["$interval", "year"] },
                  "$plan.priceYearlyCents",
                  "$plan.priceMonthlyCents",
                ],
              },
            ],
          },
        },
      },
    },
  ]);

  const monthlyRecurringCents = revenueRows.find((row) => row._id === "month")?.recurringCents ?? 0;
  const annualRecurringCents = revenueRows.find((row) => row._id === "year")?.recurringCents ?? 0;

  return { monthlyRecurringCents, annualRecurringCents };
};

export const getAnalyticsSummary = async (range: AnalyticsRange): Promise<SummaryResponse> => {
  const key = `summary:${range.startDate.toISOString()}:${range.endDate.toISOString()}`;

  return withAnalyticsCache(key, async () => {
    const [
      users,
      activeUsers,
      projects,
      documents,
      subscriptionStatuses,
      recurringRevenue,
    ] = await Promise.all([
      UserModel.estimatedDocumentCount(),
      SubscriptionModel.distinct("userId", {
        status: { $in: ACTIVE_SUBSCRIPTION_STATUSES },
        currentPeriodEnd: { $gt: new Date() },
      }),
      ProjectModel.countDocuments(matchCreatedRange(range)),
      DocumentModel.countDocuments(matchCreatedRange(range)),
      SubscriptionModel.aggregate<Array<{ _id: string; count: number }>>([
        {
          $group: {
            _id: "$status",
            count: { $sum: 1 },
          },
        },
      ]),
      getRecurringRevenueByInterval()
    ]);

    const statusMap = new Map(subscriptionStatuses.map((row) => [row._id, row.count]));

    return {
      range: { startDate: range.startDate.toISOString(), endDate: range.endDate.toISOString() },
      totals: {
        users,
        activeUsers: activeUsers.length,
        projects,
        documents,
      },
      subscriptions: {
        total: subscriptionStatuses.reduce((total, row) => total + row.count, 0),
        active: statusMap.get("active") ?? 0,
        trialing: statusMap.get("trialing") ?? 0,
        pastDue: statusMap.get("past_due") ?? 0,
        canceled: statusMap.get("canceled") ?? 0,
      },
      revenue: recurringRevenue,
    };
  });
};

export const getAnalyticsUsage = async (range: AnalyticsRange): Promise<UsageResponse> => {
  const key = `usage:${range.startDate.toISOString()}:${range.endDate.toISOString()}`;

  return withAnalyticsCache(key, async () => {
    const [apiUsageRows, toolUsageRows, dailyRequestRows, dailyProjectRows, dailyDocumentRows, dailyUserRows] =
      await Promise.all([
        ApiRequestModel.aggregate<Array<{ _id: string; count: number }>>([
          { $match: matchCreatedRange(range) },
          { $group: { _id: "$method", count: { $sum: 1 } } },
          { $sort: { count: -1 } },
        ]),
        Promise.all([
          DocumentModel.countDocuments(matchCreatedRange(range)),
          ProjectModel.countDocuments(matchCreatedRange(range)),
          ApiRequestModel.countDocuments(matchCreatedRange(range)),
        ]),
        ApiRequestModel.aggregate<Array<{ _id: string; count: number }>>([
          { $match: matchCreatedRange(range) },
          {
            $group: {
              _id: {
                $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
              },
              count: { $sum: 1 },
            },
          },
          { $sort: { _id: 1 } },
        ]),
        ProjectModel.aggregate<Array<{ _id: string; count: number }>>([
          { $match: matchCreatedRange(range) },
          { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, count: { $sum: 1 } } },
          { $sort: { _id: 1 } },
        ]),
        DocumentModel.aggregate<Array<{ _id: string; count: number }>>([
          { $match: matchCreatedRange(range) },
          { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, count: { $sum: 1 } } },
          { $sort: { _id: 1 } },
        ]),
        UserModel.aggregate<Array<{ _id: string; count: number }>>([
          { $match: matchCreatedRange(range) },
          { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, count: { $sum: 1 } } },
          { $sort: { _id: 1 } },
        ]),
      ]);

    const requestsByDay = new Map(dailyRequestRows.map((row) => [row._id, row.count]));
    const projectsByDay = new Map(dailyProjectRows.map((row) => [row._id, row.count]));
    const documentsByDay = new Map(dailyDocumentRows.map((row) => [row._id, row.count]));
    const usersByDay = new Map(dailyUserRows.map((row) => [row._id, row.count]));

    const dayCount = Math.max(1, Math.ceil((range.endDate.getTime() - range.startDate.getTime()) / 86_400_000) + 1);
    const dailyTraffic = Array.from({ length: dayCount }, (_, index) => {
      const date = new Date(range.startDate);
      date.setUTCDate(date.getUTCDate() + index);
      const dateKey = toIsoDate(date);
      return {
        date: dateKey,
        requests: requestsByDay.get(dateKey) ?? 0,
        projects: projectsByDay.get(dateKey) ?? 0,
        documents: documentsByDay.get(dateKey) ?? 0,
        users: usersByDay.get(dateKey) ?? 0,
      };
    });

    return {
      range: { startDate: range.startDate.toISOString(), endDate: range.endDate.toISOString() },
      toolUsage: [
        { tool: "Document Editor", count: toolUsageRows[0] },
        { tool: "Project Workspace", count: toolUsageRows[1] },
        { tool: "API Tester", count: toolUsageRows[2] },
      ],
      apiUsage: {
        totalRequests: apiUsageRows.reduce((total, row) => total + row.count, 0),
        methods: apiUsageRows.map((row) => ({ method: row._id, count: row.count })),
      },
      dailyTraffic,
    };
  });
};

export const getAnalyticsRevenue = async (range: AnalyticsRange): Promise<RevenueResponse> => {
  const key = `revenue:${range.startDate.toISOString()}:${range.endDate.toISOString()}`;

  return withAnalyticsCache(key, async () => {
    const [recurringRevenue, subscriptionBreakdown, dailyRevenueRows] = await Promise.all([
      getRecurringRevenueByInterval(),
      SubscriptionModel.aggregate<Array<{ _id: { planCode: string; interval: string; seats: number }; count: number }>>([
        {
          $match: {
            status: { $in: ACTIVE_SUBSCRIPTION_STATUSES },
            currentPeriodEnd: { $gt: new Date() },
          },
        },
        {
          $group: {
            _id: {
              planCode: "$planCode",
              interval: "$interval",
              seats: "$seats",
            },
            count: { $sum: 1 },
          },
        },
      ]),
      SubscriptionModel.aggregate<Array<{ _id: string; revenueCents: number }>>([
        { $match: matchCreatedRange(range) },
        {
          $lookup: {
            from: "billingplans",
            localField: "planCode",
            foreignField: "planCode",
            as: "plan",
          },
        },
        { $unwind: "$plan" },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            revenueCents: {
              $sum: {
                $multiply: [
                  "$seats",
                  {
                    $cond: [{ $eq: ["$interval", "year"] }, "$plan.priceYearlyCents", "$plan.priceMonthlyCents"],
                  },
                ],
              },
            },
          },
        },
        { $sort: { _id: 1 } },
      ]),
    ]);

    const plans = await BillingPlanModel.find({}, { planCode: 1, priceMonthlyCents: 1, priceYearlyCents: 1 }).lean();
    const planPriceMap = new Map(plans.map((plan) => [plan.planCode, plan]));

    const subscriptions = subscriptionBreakdown
      .map((row) => {
        const plan = planPriceMap.get(row._id.planCode);
        const unitPrice = row._id.interval === "year" ? plan?.priceYearlyCents ?? 0 : plan?.priceMonthlyCents ?? 0;
        return {
          planCode: row._id.planCode,
          interval: row._id.interval,
          seats: row._id.seats,
          count: row.count,
          revenueCents: unitPrice * row._id.seats * row.count,
        };
      })
      .sort((a, b) => b.revenueCents - a.revenueCents);

    const recognizedCents = dailyRevenueRows.reduce((total, row) => total + row.revenueCents, 0);

    return {
      range: { startDate: range.startDate.toISOString(), endDate: range.endDate.toISOString() },
      totals: {
        recognizedCents,
        monthlyRecurringCents: recurringRevenue.monthlyRecurringCents,
        annualRecurringCents: recurringRevenue.annualRecurringCents,
      },
      subscriptions,
      dailyRevenue: dailyRevenueRows.map((row) => ({ date: row._id, revenueCents: row.revenueCents })),
    };
  });
};

export const parseAnalyticsRange = (startDateRaw?: string, endDateRaw?: string): AnalyticsRange => {
  const endDate = endDateRaw ? new Date(endDateRaw) : new Date();
  const startDate = startDateRaw ? new Date(startDateRaw) : new Date(endDate.getTime() - 29 * 86_400_000);

  if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
    throw new Error("Invalid date range");
  }

  if (startDate > endDate) {
    throw new Error("startDate must be before endDate");
  }

  const normalizedStart = new Date(Date.UTC(startDate.getUTCFullYear(), startDate.getUTCMonth(), startDate.getUTCDate()));
  const normalizedEnd = new Date(Date.UTC(endDate.getUTCFullYear(), endDate.getUTCMonth(), endDate.getUTCDate(), 23, 59, 59, 999));

  return { startDate: normalizedStart, endDate: normalizedEnd };
};
