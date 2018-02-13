import React from 'react';
import ReactDOM from 'react-dom';
import { observable, toJS } from 'mobx';
import { types } from 'mobx-state-tree';
import { Provider, observer, inject } from 'mobx-react';
import { connectReduxDevtools } from 'mst-middlewares'
import registerServiceWorker from './registerServiceWorker';
import Chart from './Chart';
import Heap from './models/Heap';
import Measurement from './models/Measurement';
import MeasurementQueue from './models/MeasurementQueue';
import Datapoint from './models/Datapoint';

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
  updateDatapoints(key, value) {
    self.datapoints.set(key, value);
  },

  setDatapoints(incomingData) {
    const keys = self.datapoints.keys();
    // add new incoming timestamped device data to existing measurements
    if (keys.length === 0) {
      for (const key in incomingData) {
        const d = Datapoint.create();
        d.add(Measurement.create(incomingData[key])); // measurement
        self.updateDatapoints(key, d);
      }
    } else {
      for (const key in incomingData) {
        
        if(self.datapoints.keys().indexOf(key) > -1){
          self.datapoints.get(key).add(Measurement.create(incomingData[key])) 
        } else {
          const d = Datapoint.create();
          d.add(Measurement.create(incomingData[key])); // measurement
          self.updateDatapoints(key, d);
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
    const datapoints = /*toJS(*/store.datapoints.toJSON(); //toJS is too expensive

    return (
      <div>
        <p>count: {datapoints['sensor1'] && datapoints['sensor1'].queue.data.length}</p>
        {datapoints && Object.keys(datapoints) && Object.keys(datapoints).filter(key=>key ==='sensor1').map(key =>
          <div  key={key}>
            {/*ideally we could have used the datapoints[key].min datapoints[key].max computed view functions here instead*/}
            <p>min: {datapoints[key].minHeap.data[0]} | max: {datapoints[key].maxHeap.data[0]}</p>
          
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
