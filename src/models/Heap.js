import { types } from 'mobx-state-tree';

const swap = (data, i, j) => {
  let temp = data[i];
  data[i] = data[j];
  data[j] = temp;
}

const Heap = types.model('Heap', {
  data: types.optional(types.array(types.number), []),
  size: (types.number, 0),
  inHeap: types.optional(types.map(types.boolean, false), {}),
})
.volatile(self => ({
  comparator: (a,b) => { return a < b; },
}))
.actions(self => ({
  setComparator(callbackFn = (a,b) => { return a > b; }) {
      self.comparator = callbackFn
  },
  head() {
    return self.data[0];
  },
  // add item O(logN);
  add(number) {
  
    if (!self.inHeap.get(number+'')) {
      self.data[self.size++] = number;
      let current = self.size - 1;

      while (current > 0) {
        if (self.comparator(self.data[current >> 1], self.data[current])) {
          swap(self.data, current >> 1, current);
          current >>= 1;
        } else {
          break;
        }
      }
      
      self.inHeap.set(number+'',true);
      
    }
    
  },
  // remove head O(logN);
  remove() {
    self.size--;
    self.inHeap.delete(self.data[0]+'');
    self.data[0] = self.data[self.size];

    let current = 0;
    while (current * 2 + 1 < self.size) {
      let next = current * 2 + 1;
      if (current * 2 + 2 < self.size && self.comparator(self.data[current * 2 + 1], self.data[current * 2 + 2])) {
        next = current * 2 + 2;
      } 
      
      if (self.comparator(self.data[current], self.data[next])) {
        swap(self.data, current, next);
        current = next;
      } else {
        break;
      }
    }
    
  }
}));

export default Heap;