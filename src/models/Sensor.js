import Heap from './Heap';
import Queue from './Queue';
import { customCompareMin, customCompareMax } from './Heap';
import {observable} from 'mobx';

export default class Sensor {
  @observable queue;

  constructor(n) {
    this.n = n;
    this.queue = new Queue(this.n);
    this.minHeap = new Heap(customCompareMin);
    this.maxHeap = new Heap(customCompareMax);
    this.frequency = {};
  }
  add(measurement) {
    let removedItem = this.queue.add(measurement);
    let addedItem = measurement.y;
    
    if (addedItem !== undefined) {
      if (!this.frequency[addedItem+'']) {
        this.frequency[addedItem+''] = 1;
        this.maxHeap.add(addedItem);
        this.minHeap.add(addedItem);
      } else {
        this.frequency[addedItem+''] = this.frequency[addedItem+''] +1;
      }
    }
    
    if (removedItem !== undefined && removedItem !== 'undefined') {
      this.frequency[removedItem+''] = this.frequency[removedItem+'']-1;
      
      if (!this.frequency[removedItem+'']) {
        delete this.frequency[removedItem+''];
      }
      
      // remove head if frequency is zero
      while (!this.frequency[this.maxHeap.head()+'']) {
        this.maxHeap.remove();
      }
      while (!this.frequency[this.minHeap.head()+'']) {
        this.minHeap.remove();
      }
    }
  }
  
  size() {
    return this.queue.size;
  }
  
  get(i) {
    return this.queue.get(i);
  }
  
  max() {
    return this.maxHeap.head();
  }

  min() {
    return this.minHeap.head();
  }
}