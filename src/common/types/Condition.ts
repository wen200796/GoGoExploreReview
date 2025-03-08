export type Condition<T> = (item: T) => boolean;

export interface ConditionGroup<T> {
  type: "AND" | "OR";  // 代表這組條件是 AND 還是 OR
  conditions: (Condition<T> | ConditionGroup<T>)[]; // 內部可以是條件函式或嵌套的條件組
}