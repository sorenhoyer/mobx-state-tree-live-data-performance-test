import React from 'react';
import ReactDOM from 'react-dom';
import { observable, toJS } from 'mobx';
import { types } from 'mobx-state-tree';
import { Provider, observer, inject } from 'mobx-react';
import { connectReduxDevtools } from 'mst-middlewares'
import registerServiceWorker from './registerServiceWorker';
import Chart from './Chart';
import Sensor from './models/Sensor';

const RootStore = types.model({
  sensorsCount: (types.number, 2000),
  
})
.volatile(self => ({
  sensors: new Map(),
}))
.actions(self => ({
  afterCreate(){
    const sensorIds = ['sensor1', 'sensor2', 'sensor3','sensor4', 'sensor5', 'sensor6','sensor7', 'sensor8', 'sensor9', 'sensor10'];
    
    for(let sensor of sensorIds) {
      self.sensors.set(sensor, new Sensor(2000));
    }

    setInterval(function(){ 
      let out = {};
      const x = + new Date()  // unix timestamp
      for(let sensor of sensorIds){
        const y = Math.floor(Math.random() * 10000) + 1  
        const m = {x: x, y: y}
        out[sensor] = m;
      }
      
      self.addMeasurement(out)
    }, 1000);
  },
  updateSensors(key, value) {
    self.sensors.set(key, value);
    console.log(self.sensors)
  },

  addMeasurement(incomingData) {
    const keys = [...self.sensors.keys()];
    // add new incoming timestamped device data to existing measurements
    if (keys.length === 0) {
      for (const key in incomingData) {
        const d = new Sensor(2000);
        d.add(incomingData[key]); // measurement
        self.updateSensors(key, d);
      }
    } else {
      for (const key in incomingData) {
        
        if(keys.indexOf(key) > -1){
          self.sensors.get(key).add(incomingData[key]) 
        } else {
          const d = new Sensor(2000);
          d.add(incomingData[key]); // measurement
          self.updateSensors(key, d);
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
    const sensors = /*toJS(*/store.sensors//.toJSON(); //toJS is too expensive
    const keys = [ ...sensors.keys() ];
    console.log(store)
    return (
      <div>
        <p>count: {sensors.get('sensor1') && sensors.get('sensor1').queue.data.length}</p>
        {
          sensors && keys && keys.filter(key=>key ==='sensor1').map(key =>
            <div  key={key}>
              <p>min: {sensors.get(key).minHeap.data[0]} | max: {sensors.get(key).maxHeap.data[0]}</p>
              index.js - protected
              <Chart
                key={key}
                chartKey={key}
                title={key}
                subtitle=''
                xAxisTitle='Time'
                yAxisTitle='Level'
                data={sensors.get(key).queue.data.slice()}
                overlayCharts={[]}
                plotOptions={plotOptions}
              />
            </div>
          )
        }
        
      </div>
    )
  })
);

ReactDOM.render(<Provider store={store} history={history}><App/></Provider>, document.getElementById('root'));
registerServiceWorker();
