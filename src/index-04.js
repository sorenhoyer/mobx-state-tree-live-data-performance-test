import React from 'react';
import ReactDOM from 'react-dom';
import { observable, toJS } from 'mobx';
import { unprotect, types } from 'mobx-state-tree';
import { Provider, observer, inject } from 'mobx-react';
import { connectReduxDevtools } from 'mst-middlewares'
import registerServiceWorker from './registerServiceWorker';
import Chart from './Chart';

const sensors = ['sensor1', 'sensor2', 'sensor3','sensor4', 'sensor5', 'sensor6','sensor7', 'sensor8', 'sensor9', 'sensor10']

const Measurement = types.model('Measurement', {
  x: types.number,
  y: types.number,
});

const MeasurementQueue = types.model('MeasurementQueue', {
  data: types.optional(types.array(Measurement), []),
})
.actions(self => ({
  add(measurement) {
    self.data.push(measurement);
  },
  remove(n){
    self.data = self.data.slice(-n)
  }
}));

const Datapoint = types.model('Datapoint', {
  queue: types.optional(MeasurementQueue, {data: []}),
})
.actions(self => ({
  add(measurement) {
    self.queue.add(measurement);
  },
  remove(n){
    self.queue.remove(-n);
  }
}));

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
        const m = Measurement.create(incomingData[key]);
        const d = Datapoint.create();
        d.add(m);
        self.datapoints.set(key, d);
      }
    } else {
      for (const key in incomingData) {
        if(self.datapoints.keys().indexOf(key) > -1){
          self.datapoints.get(key).add(Measurement.create(incomingData[key]))
        } else {
          const m = Measurement.create(incomingData[key]);
          const d = Datapoint.create();
          self.datapoints.set(key, d);
        }
      }
  
      // remove first measurement from array when limit is reached
      const first = keys[0];
      if(self.datapoints.get(first).queue.data.length >= self.datapointsCount) {
        for (const k of self.datapoints.keys()) {
          self.datapoints.get(k).remove(-self.datapointsCount);
        }
      }
    }
  }
}))

const store = RootStore.create({})

connectReduxDevtools(require('remotedev'), store);
// unprotect(store);
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
    const datapoints = store.datapoints.toJSON();
    return (
      <div>
        
        <p>count: {datapoints['sensor1'] && datapoints['sensor1'].length}</p>
        {datapoints && Object.keys(datapoints) && Object.keys(datapoints).filter(key=>key ==='sensor1').map(key =>
          <Chart
            key={key}
            chartKey={key}
            title={key}
            subtitle=''
            xAxisTitle='Time'
            yAxisTitle='Level'
            data={datapoints[key].queue.data} // maybe use env to set cycles differently for node / production for increased performance
            overlayCharts={[]}
            plotOptions={plotOptions}
          />
        )}
      </div>
    )
  })
);

ReactDOM.render(<Provider store={store} history={history}><App/></Provider>, document.getElementById('root'));
registerServiceWorker();
