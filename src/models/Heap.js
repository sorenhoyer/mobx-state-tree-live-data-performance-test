const swap = (data, i, j) => {
  let temp = data[i];
  data[i] = data[j];
  data[j] = temp;
}

export const customCompareMax = (a,b) => { return a < b; }

export const customCompareMin = (a,b) => { return a > b; }

export default class Heap {
  constructor(customCompareFunction) {
    this.data = [];
    this.inHeap = {};
    this.size = 0;
    this.customCompareFunction = customCompareFunction;
  }
  
  head() {
    return this.data[0];
  }

  // add item O(logN);
  add(number) {
  
    if (!this.inHeap[number]) {
      this.data[this.size++] = number;
      let current = this.size - 1;

      while (current > 0) {
        if (this.customCompareFunction(this.data[current >> 1], this.data[current])) {
          swap(this.data, current >> 1, current);
          current >>= 1;
        } else {
          break;
        }
      }
      this.inHeap[number] = true;
    }
  }

  // remove head O(logN);
  remove() {
    this.size--;
    delete this.inHeap[this.data[0]];
    this.data[0] = this.data[this.size];

    let current = 0;
    while (current * 2 + 1 < this.size) {
      let next = current * 2 + 1;
      if (current * 2 + 2 < this.size && this.customCompareFunction(this.data[current * 2 + 1], this.data[current * 2 + 2])) {
        next = current * 2 + 2;
      } 
      
      if (this.customCompareFunction(this.data[current], this.data[next])) {
        swap(this.data, current, next);
        current = next;
      } else {
        break;
      }
    }
    
  }
}