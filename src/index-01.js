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

const RootStore = types.model({
  datapointsCount: (types.number, 2000),
  datapoints: types.optional(types.map(types.array(Measurement)), {}),
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
        const m = incomingData[key];
        self.datapoints.set(key, [m]);
      }
    } else {
      for (const key in incomingData) {
        self.datapoints.keys().indexOf(key) > -1
          ? self.datapoints.get(key).push(incomingData[key])
          : self.datapoints.set(key, [incomingData[key]]);
      }
  
      // remove first measurement from array when limit is reached
      const first = keys[0];
      if(self.datapoints.get(first).length >= self.datapointsCount) {
        for (const k of self.datapoints.keys()) {
          self.datapoints.set(k, self.datapoints.get(k).slice(-self.datapointsCount));
        }
      }
    }
  }
}))

const store = RootStore.create({})

// connectReduxDevtools(require('remotedev'), store);
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
    const datapoints = store.datapoints//.toJSON();
    return (
      <div>
        
        <p>count: {datapoints.get('sensor1') && datapoints.get('sensor1').length}</p>
        {
          datapoints && datapoints.keys() && datapoints.keys().filter(key=>key ==='sensor1').map(key =>
            <Chart
              key={key}
              chartKey={key}
              title={key}
              subtitle=''
              xAxisTitle='Time'
              yAxisTitle='Level'
              data={datapoints.get(key).slice()}
              overlayCharts={[]}
              plotOptions={plotOptions}
            />
          )
        }
      </div>
    )
  })
);

ReactDOM.render(<Provider store={store} history={history}><App/></Provider>, document.getElementById('root'));
registerServiceWorker();
