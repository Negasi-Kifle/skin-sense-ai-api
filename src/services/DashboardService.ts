import { Booking } from "@/models/Booking";
import { Treatment } from "@/models/Treatment";

// PRD FR16 — total bookings, average basket, average attach rate, top services.
export async function getDashboardMetrics() {
  const [totalBookings, basketAgg, attachAgg, topAgg] = await Promise.all([
    Booking.countDocuments({}),
    Booking.aggregate<{ avg: number }>([
      { $group: { _id: null, avg: { $avg: "$totalETB" } } },
      { $project: { _id: 0, avg: 1 } },
    ]),
    Booking.aggregate<{ avg: number }>([
      { $project: { count: { $size: { $ifNull: ["$selectedItems", []] } } } },
      { $group: { _id: null, avg: { $avg: "$count" } } },
      { $project: { _id: 0, avg: 1 } },
    ]),
    Booking.aggregate<{ _id: string; count: number }>([
      { $unwind: "$selectedItems" },
      { $group: { _id: "$selectedItems.treatmentId", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
    ]),
  ]);

  const topIds = topAgg.map((r) => r._id);
  const topTreatments = await Treatment.find({ _id: { $in: topIds } });
  const nameById = new Map(topTreatments.map((t) => [String(t._id), t.name]));

  return {
    totalBookings,
    averageBasketETB: basketAgg[0]?.avg ?? null,
    averageAttachRate: attachAgg[0]?.avg ?? null,
    topServices: topAgg.map((r) => ({
      treatmentId: String(r._id),
      name: nameById.get(String(r._id)) ?? "Unknown",
      count: r.count,
    })),
  };
}
