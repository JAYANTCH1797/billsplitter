import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount, currency = 'USD') {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatDate(dateString) {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
}

export function getInitials(name) {
  if (!name) return '?';
  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function getAvatarColor(index) {
  const colors = ['avatar-blue', 'avatar-emerald', 'avatar-rose', 'avatar-violet', 'avatar-orange'];
  return colors[index % colors.length];
}

export function calculateEqualSplit(amount, memberCount) {
  return parseFloat((amount / memberCount).toFixed(2));
}

export function validateSplits(splits, totalAmount) {
  const sum = splits.reduce((acc, split) => acc + split.amount, 0);
  return Math.abs(sum - totalAmount) < 0.01;
}
