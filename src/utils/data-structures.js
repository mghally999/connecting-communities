/**
 * data-structures.js
 * --------------------------------------------------------------
 * Hand-rolled DSA primitives used across the site so we never lean on
 * Array.prototype.indexOf for hot paths. They are small, well-tested
 * and tree-shakable, with O(1) insert/lookup characteristics.
 *
 *   • SinglyLinkedList — used for ordered, append-heavy queues
 *     (e.g. analytics events, AR placement attempts).
 *   • DoublyLinkedList — used for the Pyramids guided-walkthrough
 *     where we step forwards/backwards between scenes in O(1).
 *   • HashMap          — used everywhere we need O(1) lookup-by-id
 *     (Sanity content keyed by slug, hot-spots keyed by step id).
 *
 *  All collections are iterable (Symbol.iterator) so `for…of` works.
 */

/* -------------------------------------------------------------- */
/*  Singly Linked List                                            */
/* -------------------------------------------------------------- */

class SListNode {
  constructor(value) {
    this.value = value;
    this.next = null;
  }
}

export class SinglyLinkedList {
  constructor(iterable) {
    this.head = null;
    this.tail = null;
    this.length = 0;
    if (iterable) for (const v of iterable) this.push(v);
  }

  push(value) {
    const node = new SListNode(value);
    if (!this.head) this.head = this.tail = node;
    else {
      this.tail.next = node;
      this.tail = node;
    }
    this.length += 1;
    return this;
  }

  shift() {
    if (!this.head) return undefined;
    const { value } = this.head;
    this.head = this.head.next;
    if (!this.head) this.tail = null;
    this.length -= 1;
    return value;
  }

  toArray() {
    const out = [];
    let cur = this.head;
    while (cur) {
      out.push(cur.value);
      cur = cur.next;
    }
    return out;
  }

  *[Symbol.iterator]() {
    let cur = this.head;
    while (cur) {
      yield cur.value;
      cur = cur.next;
    }
  }
}

/* -------------------------------------------------------------- */
/*  Doubly Linked List                                            */
/* -------------------------------------------------------------- */

class DListNode {
  constructor(value) {
    this.value = value;
    this.prev = null;
    this.next = null;
  }
}

export class DoublyLinkedList {
  constructor(iterable) {
    this.head = null;
    this.tail = null;
    this.length = 0;
    if (iterable) for (const v of iterable) this.push(v);
  }

  push(value) {
    const node = new DListNode(value);
    if (!this.head) {
      this.head = this.tail = node;
    } else {
      node.prev = this.tail;
      this.tail.next = node;
      this.tail = node;
    }
    this.length += 1;
    return node;
  }

  /**
   * Find the node containing `value` (uses identity by default,
   * falls back to a custom comparator).
   */
  find(value, comparator) {
    let cur = this.head;
    while (cur) {
      if (comparator ? comparator(cur.value, value) : cur.value === value)
        return cur;
      cur = cur.next;
    }
    return null;
  }

  /**
   * Walk N steps from a starting node — O(|N|), used by the
   * pyramids walkthrough to “jump” to scene-by-index.
   */
  step(from, n) {
    let cur = from;
    const dir = n >= 0 ? "next" : "prev";
    let remaining = Math.abs(n);
    while (cur && remaining > 0) {
      cur = cur[dir];
      remaining -= 1;
    }
    return cur;
  }

  toArray() {
    const out = [];
    let cur = this.head;
    while (cur) {
      out.push(cur.value);
      cur = cur.next;
    }
    return out;
  }

  *[Symbol.iterator]() {
    let cur = this.head;
    while (cur) {
      yield cur.value;
      cur = cur.next;
    }
  }
}

/* -------------------------------------------------------------- */
/*  HashMap                                                       */
/* -------------------------------------------------------------- */

/**
 * Open-addressed hashmap with linear probing.  Native `Map` would
 * be more than enough for production use, but the brief explicitly
 * called for a hand-built one and it gives us a predictable iteration
 * order plus a tiny memory footprint.
 */
export class HashMap {
  constructor(initialCapacity = 16) {
    this._capacity = nextPow2(initialCapacity);
    this._mask = this._capacity - 1;
    this._buckets = new Array(this._capacity).fill(null);
    this.size = 0;
  }

  _hash(key) {
    // FNV-1a hash for stable distribution on string keys.
    const str = String(key);
    let h = 0x811c9dc5;
    for (let i = 0; i < str.length; i += 1) {
      h ^= str.charCodeAt(i);
      h = (h + ((h << 1) + (h << 4) + (h << 7) + (h << 8) + (h << 24))) >>> 0;
    }
    return h & this._mask;
  }

  set(key, value) {
    if (this.size + 1 > this._capacity * 0.7) this._resize(this._capacity * 2);
    let i = this._hash(key);
    // Linear probe until we find an empty slot or a matching key.
    while (this._buckets[i]) {
      if (this._buckets[i].key === key) {
        this._buckets[i].value = value;
        return this;
      }
      i = (i + 1) & this._mask;
    }
    this._buckets[i] = { key, value };
    this.size += 1;
    return this;
  }

  get(key) {
    let i = this._hash(key);
    while (this._buckets[i]) {
      if (this._buckets[i].key === key) return this._buckets[i].value;
      i = (i + 1) & this._mask;
    }
    return undefined;
  }

  has(key) {
    return this.get(key) !== undefined;
  }

  _resize(newCapacity) {
    const oldBuckets = this._buckets;
    this._capacity = newCapacity;
    this._mask = newCapacity - 1;
    this._buckets = new Array(newCapacity).fill(null);
    this.size = 0;
    for (const slot of oldBuckets) if (slot) this.set(slot.key, slot.value);
  }

  *[Symbol.iterator]() {
    for (const slot of this._buckets) if (slot) yield [slot.key, slot.value];
  }
}

const nextPow2 = (n) => {
  let p = 1;
  while (p < n) p <<= 1;
  return p;
};

/* -------------------------------------------------------------- */
/*  Algorithms — recursion, sort, search                          */
/* -------------------------------------------------------------- */

/**
 * Binary search — O(log n).  Used to resolve the active scroll
 * scene from a sorted array of trigger offsets.
 */
export const binarySearch = (sortedArr, target, accessor = (x) => x) => {
  let lo = 0;
  let hi = sortedArr.length - 1;
  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    const v = accessor(sortedArr[mid]);
    if (v === target) return mid;
    if (v < target) lo = mid + 1;
    else hi = mid - 1;
  }
  return Math.max(0, hi); // last value <= target
};

/**
 * Recursive quicksort with median-of-three pivot for stability.
 * Pure (does not mutate the input).
 */
export const quickSort = (arr, key = (x) => x) => {
  if (arr.length <= 1) return arr.slice();
  const a = arr.slice();
  const sort = (lo, hi) => {
    if (lo >= hi) return;
    const mid = (lo + hi) >> 1;
    // Median-of-three pivot selection.
    const candidates = [a[lo], a[mid], a[hi]].sort((x, y) => key(x) - key(y));
    const pivot = key(candidates[1]);
    let i = lo;
    let j = hi;
    while (i <= j) {
      while (key(a[i]) < pivot) i += 1;
      while (key(a[j]) > pivot) j -= 1;
      if (i <= j) {
        [a[i], a[j]] = [a[j], a[i]];
        i += 1;
        j -= 1;
      }
    }
    sort(lo, j);
    sort(i, hi);
  };
  sort(0, a.length - 1);
  return a;
};

/**
 * Memoise any pure function via a HashMap keyed by JSON-stringified
 * arguments.  Used by Sanity GROQ helpers.
 */
export const memoize = (fn) => {
  const cache = new HashMap();
  return (...args) => {
    const key = JSON.stringify(args);
    if (cache.has(key)) return cache.get(key);
    const out = fn(...args);
    cache.set(key, out);
    return out;
  };
};
