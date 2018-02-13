import { types } from 'mobx-state-tree';
import MeasurementQueue from './MeasurementQueue';
import Heap from './Heap';

const Datapoint = types.model('Datapoint', {
  n: (types.number, 2000),
  queue: types.optional(MeasurementQueue, {}),
  minHeap: types.optional(Heap, {}), 
  maxHeap: types.optional(Heap, {}),
  frequency: types.optional(types.map(types.number), {}),
})
.volatile(self => ({
  
}))
.views(self => ({
  get min(){
    return self.minHeap.head();
  },
  get max(){
    return self.maxHeap.head();
  },
  get(i) {
    return self.queue.get(i);
  },
  size() {
    return self.queue.size;
  }
}))
.actions(self => ({
  afterCreate() {
    self.minHeap.setComparator(); // defaults to min if not specified
  },
  setN(n) {
    self.n = n;
    self.queue.setMaxSize(n);
  },
  add(measurement) {
    let removedItem = self.queue.add(measurement);
    let addedItem = measurement.y;
    
    if(addedItem !== undefined){
      if (!self.frequency.get(addedItem+'')) {
        self.frequency.set(addedItem+'', 1);
        self.maxHeap.add(addedItem);
        self.minHeap.add(addedItem);
      } else {
        self.frequency.set(addedItem+'', self.frequency.get(addedItem+'')+1);
      }
    }
    
    
    if (removedItem !== undefined && removedItem !== 'undefined') {
      self.frequency.set(removedItem, self.frequency.get(removedItem)-1);
      
      if (!self.frequency.get(removedItem)) {
        self.frequency.delete(removedItem);
      }
      
      // remove head if frequency is zero
      while (!self.frequency.get(self.maxHeap.head()+'')) {
        self.maxHeap.remove();
      }
      while (!self.frequency.get(self.minHeap.head()+'')) {
        self.minHeap.remove();
      }
    }
  }
}));

export default Datapoint;