import React from 'react';
import ReactDOM from 'react-dom';
import { observable, toJS } from 'mobx';
import { types, unprotect } from 'mobx-state-tree';
import { Provider, observer, inject } from 'mobx-react';
import { connectReduxDevtools } from 'mst-middlewares'
import registerServiceWorker from './registerServiceWorker';
import Chart from './Chart';
import Heap from './models-unprotected/Heap';
import Measurement from './models-unprotected/Measurement';
import MeasurementQueue from './models-unprotected/MeasurementQueue';
import Datapoint from './models-unprotected/Datapoint';

const swap = (data, i, j) => {
  let temp = data[i];
  data[i] = data[j];
  data[j] = temp;
}

const sensors = ['sensor1', 'sensor2', 'sensor3','sensor4', 'sensor5', 'sensor6','sensor7', 'sensor8', 'sensor9', 'sensor10']

const RootStore = types.model({
  datapointsCount: (types.number, 2000),
  datapoints: types.optional(types.map(Datapoint), {}),
})
.actions(self => ({
  afterCreate(){
    setInterval(function(){ 
      let out = {};
      const x = + new Date()  // unix timestamp
      for(let sensor of sensors){
        const y = Math.floor(Math.random() * 10000) + 1  
        const m = {x: x, y: y}
        out[sensor] = m;
      }
      
      self.setDatapoints(out)
    }, 1000);
  },

  setDatapoints(incomingData) {
    const keys = self.datapoints.keys();
    // add new incoming timestamped device data to existing measurements
    if (keys.length === 0) {
      for (const key in incomingData) {
        const d = Datapoint.create();
        unprotect(d)
        const m = Measurement.create(incomingData[key]);
        unprotect(m)
        // d.add(m); // measurement
          // let removedItem = self.queue.add(m);
          let removedItem = undefined;
          if(d.queue.size >= d.queue.maxSize) {
            let temp = d.queue.data[0];
            removedItem = temp && temp.y ? temp.y+'' : undefined;
            d.queue.data.shift();
          }
          
          d.queue.data.push(m);
          
          if (removedItem === undefined && d.queue.size < d.queue.maxSize) {
            d.queue.size++;
          }

        let addedItem = m.y;

        if(addedItem !== undefined){
          if (!d.frequency.get(addedItem+'')) {
            d.frequency.set(addedItem+'', 1);
              //self.maxHeap.add(addedItem);
              if (!d.maxHeap.inHeap.get(addedItem+'')) {
                d.maxHeap.data[d.maxHeap.size++] = addedItem;
                let current = d.maxHeap.size - 1;
          
                while (current > 0) {
                  if (d.maxHeap.comparator(d.maxHeap.data[current >> 1], d.maxHeap.data[current])) {
                    swap(d.maxHeap.data, current >> 1, current);
                    current >>= 1;
                  } else {
                    break;
                  }
                }
                
                d.maxHeap.inHeap.set(addedItem+'',true);
                
              }
              //self.minHeap.add(addedItem);
              if (!d.minHeap.inHeap.get(addedItem+'')) {
                d.minHeap.data[d.minHeap.size++] = addedItem;
                let current = d.minHeap.size - 1;
          
                while (current > 0) {
                  if (d.minHeap.comparator(d.minHeap.data[current >> 1], d.minHeap.data[current])) {
                    swap(d.minHeap.data, current >> 1, current);
                    current >>= 1;
                  } else {
                    break;
                  }
                }
                
                d.minHeap.inHeap.set(addedItem+'',true);
                
              }
          } else {
            d.frequency.set(addedItem+'', d.frequency.get(addedItem+'')+1);
          }
        }
        
        
        if (removedItem !== undefined && removedItem !== 'undefined') {
          d.frequency.set(removedItem, d.frequency.get(removedItem)-1);
          
          if (!d.frequency.get(removedItem)) {
            d.frequency.delete(removedItem);
          }
          
          // remove head if frequency is zero
          while (!d.frequency.get(d.maxHeap.data[0]+'')) {
            //self.maxHeap.remove();
            d.maxHeap.size--;
            d.maxHeap.inHeap.delete(d.maxHeap.data[0]+'');
            d.maxHeap.data[0] = d.maxHeap.data[d.maxHeap.size];

            let current = 0;
            while (current * 2 + 1 < d.maxHeap.size) {
              let next = current * 2 + 1;
              if (current * 2 + 2 < d.maxHeap.size && d.maxHeap.comparator(d.maxHeap.data[current * 2 + 1], d.maxHeap.data[current * 2 + 2])) {
                next = current * 2 + 2;
              } 
              
              if (d.maxHeap.comparator(d.maxHeap.data[current], d.maxHeap.data[next])) {
                swap(d.maxHeap.data, current, next);
                current = next;
              } else {
                break;
              }
            }
          }
          while (!d.frequency.get(d.minHeap.data[0]()+'')) {
            //self.minHeap.remove();
            d.minHeap.size--;
            d.minHeap.inHeap.delete(d.minHeap.data[0]+'');
            d.minHeap.data[0] = d.minHeap.data[d.minHeap.size];

            let current = 0;
            while (current * 2 + 1 < d.minHeap.size) {
              let next = current * 2 + 1;
              if (current * 2 + 2 < d.minHeap.size && d.minHeap.comparator(d.minHeap.data[current * 2 + 1], d.minHeap.data[current * 2 + 2])) {
                next = current * 2 + 2;
              } 
              
              if (d.minHeap.comparator(d.minHeap.data[current], d.minHeap.data[next])) {
                swap(d.minHeap.data, current, next);
                current = next;
              } else {
                break;
              }
            }
          }
        }
        self.datapoints.set(key, d);
      }
    } else {
      for (const key in incomingData) {
        
        if(self.datapoints.keys().indexOf(key) > -1){
          self.datapoints.get(key).add(Measurement.create(incomingData[key])) 
        } else {
          const d = Datapoint.create();
          d.add(Measurement.create(incomingData[key])); // measurement
          self.datapoints.set(key, d);
        }
      }
    }
  }
}))

const store = RootStore.create({})

// connectReduxDevtools(require('remotedev'), store);
unprotect(store);
window.store = store;

const history = {
  snapshots: observable.shallowArray(),
  actions: observable.shallowArray(),
  patches: observable.shallowArray()
};

const plotOptions = {
  series: {
    turboThreshold: 10000,
    marker: {
      enabled: false
    }
  }
};

const App = inject('store')(
  observer(({ store }) => {
    const datapoints = /*toJS(*/store.datapoints.toJSON(); //toJS is too expensive

    return (
      <div>
        <p>count: {datapoints['sensor1'] && datapoints['sensor1'].queue.data.length}</p>
        {datapoints && Object.keys(datapoints) && Object.keys(datapoints).filter(key=>key ==='sensor1').map(key =>
          <div  key={key}>
            {/*ideally we could have used the datapoints[key].min datapoints[key].max computed view functions here instead*/}
            <p>min: {datapoints[key].minHeap.data[0]} | max: {datapoints[key].maxHeap.data[0]}</p>
            index-unprotected.js - UN-protected
            <Chart
              key={key}
              chartKey={key}
              title={key}
              subtitle=''
              xAxisTitle='Time'
              yAxisTitle='Level'
              data={datapoints[key].queue.data}
              overlayCharts={[]}
              plotOptions={plotOptions}
            />
          </div>
        )}
        
      </div>
    )
  })
);

ReactDOM.render(<Provider store={store} history={history}><App/></Provider>, document.getElementById('root'));
registerServiceWorker();
