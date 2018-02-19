import {observable} from 'mobx';

export default class Queue {
  @observable data;
  constructor(maxSize) {
    this.maxSize = maxSize;
    this.size = 0;
    this.data = [];
    this.head = -1;
  }
  
  // add a measurement (x.y values) and return the removed y value if any
  add(measurement) {
    let removedItem = undefined;
    if(this.size >= this.maxSize) {
      let temp = this.data[0];
      removedItem = temp && temp.y ? temp.y+'' : undefined;
      this.data.shift();
    }
    
    this.data.push(measurement);
    
    if (removedItem === undefined && this.size < this.maxSize) {
      this.size++;
    }
    
    return removedItem;
  }
  
  get(i) {
    return this.data[i] //this.data[(this.head - this.size + 1 + i + this.maxSize ) % this.maxSize];
  }
}