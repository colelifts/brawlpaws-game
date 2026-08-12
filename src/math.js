export const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
export const lerp = (a, b, amount) => a + (b - a) * amount;
export const distance = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
export const normalize = (x, y) => {
  const length = Math.hypot(x, y);
  return length > 0.0001 ? { x: x / length, y: y / length } : { x: 0, y: 0 };
};
export const shortestAngle = (from, to) => Math.atan2(Math.sin(to - from), Math.cos(to - from));
export const approachAngle = (from, to, amount) => from + shortestAngle(from, to) * amount;
export const circleOverlap = (a, b) => distance(a, b) < a.radius + b.radius;
export const withinArc = (origin, facing, target, range, arc) => {
  const dx = target.x - origin.x;
  const dy = target.y - origin.y;
  return Math.hypot(dx, dy) <= range + (target.radius || 0)
    && Math.abs(shortestAngle(facing, Math.atan2(dy, dx))) <= arc / 2;
};
export function segmentCircleHit(start, end, circle, padding = 0) {
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const lengthSq = dx * dx + dy * dy || 1;
  const t = clamp(((circle.x - start.x) * dx + (circle.y - start.y) * dy) / lengthSq, 0, 1);
  const px = start.x + dx * t;
  const py = start.y + dy * t;
  return Math.hypot(circle.x - px, circle.y - py) <= circle.radius + padding;
}
