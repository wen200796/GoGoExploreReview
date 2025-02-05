export class BidirectionalMap<K, V> {
  private map: Map<K, V>;
  private reverseMap: Map<V, K>;

  constructor() {
    this.map = new Map();
    this.reverseMap = new Map();
  }

  set(key: K, value: V): void {
    this.map.set(key, value);
    this.reverseMap.set(value, key);
  }

  getValue(key: K): V | undefined {
    return this.map.get(key);
  }

  getKey(value: V): K | undefined {
    return this.reverseMap.get(value);
  }
}