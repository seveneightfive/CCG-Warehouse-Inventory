// Restrained, semantic color-coding so status is scannable at a glance
// without turning the board into a rainbow.

const NEUTRAL = { bg: "#EBECEF", fg: "#3A3F4B", bar: "#8A8F9C" };
const ACTIVE = { bg: "#E4F4F5", fg: "#0B5B66", bar: "#12798A" };
const AUCTION = { bg: "#FBF0DB", fg: "#7A5613", bar: "#E7A93D" };
const WAITING = { bg: "#FDEFE0", fg: "#8A4B0F", bar: "#E08A2C" };
const DONE = { bg: "#EFE9F7", fg: "#43306E", bar: "#5B3E96" };
const DELAYED = { bg: "#FBE7E4", fg: "#8C2C1E", bar: "#C0392B" };
const READY_GREEN = { bg: "#E4F3EA", fg: "#1E6B41", bar: "#2F8F5B" };

export const INVENTORY_STATUS_COLORS = {
  "Just Received": NEUTRAL,
  "In Progress": ACTIVE,
  "In Repair": ACTIVE,
  "Ready for Auction": AUCTION,
  "Going to Auction": AUCTION,
  "Sale Ready": AUCTION,
  "Project Only": NEUTRAL,
  "On Route": NEUTRAL,
  "On Location": NEUTRAL,
  "Sold - Awaiting Pickup": WAITING,
  Sold: DONE,
};

export const WORK_ORDER_STATUS_COLORS = {
  "Just Assigned": NEUTRAL,
  "In progress": ACTIVE,
  Delayed: DELAYED,
  Complete: DONE,
};

export const INSPECTION_OUTCOME_COLORS = {
  "Needs Attention": DELAYED,
  "Ready to Clean & Photograph": READY_GREEN,
};

export function statusColor(status, map) {
  return map[status] || NEUTRAL;
}
