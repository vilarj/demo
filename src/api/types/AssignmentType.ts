import { Tool } from './ToolInventoryType';

// Type aliases for date components to enhance readability for ISO8601Date.
type YEAR = number;
type MONTH = number;
type DAY = number;

/**
 * Represents a date string in ISO 8601 format (YYYY-MM-DD).
 * @example "2024-07-21"
 */
export type ISO8601Date = `${YEAR}-${MONTH}-${DAY}`;

/**
 * Represents the result of an assignment operation.
 * Can be `ok: true` with the updated `tool` object on success,
 * or `ok: false` with an `error` message on failure.
 */
export type AssigmentResult = { ok: true; tool: Tool } | { ok: false; error: string };

/**
 * Represents the result of an unassignment operation.
 * Can be `ok: true` with the updated `tool` object on success,
 * or `ok: false` with an `error` message on failure.
 */
export type UnassignResult = { ok: true; tool: Tool } | { ok: false; error: string };
