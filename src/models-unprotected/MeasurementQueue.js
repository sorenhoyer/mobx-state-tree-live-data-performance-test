import { types } from 'mobx-state-tree';
import Measurement from './Measurement';

const MeasurementQueue = types.model('MeasurementQueue', {
  maxSize: (types.number, 2000),
  size: (types.number, 0),
  data: types.optional(types.array(Measurement), []),
  //head: (types.number, -1),
})
.actions(self => ({
  setMaxSize(n) {
    self.maxSize = n;
  },
  // add a number and return the removed item if any
  add(measurement) {
    let removedItem = undefined;
    if(self.size >= self.maxSize) {
      let temp = self.data[0];
      removedItem = temp && temp.y ? temp.y+'' : undefined;
      self.data.shift();
    }
    
    self.data.push(measurement);
    
    if (removedItem === undefined && self.size < self.maxSize) {
      self.size++;
    }
    
    return removedItem;
  },
  get(i) {
    return self.data[i];
  }
}));

export default MeasurementQueue;