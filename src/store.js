const RootStore = types.model({
  datapoints: types.optional(types.map(types.array(Measurement)), {}),
})
.actions(self => {
  function updateDatapoints(incomingData) {
    const keys = self.datapoints.keys();
  
    // add new incoming timestamped device data to existing measurements
    if (keys.length === 0) {
      for (const key in incomingData) {
        const m = Measurement.create(incomingData[key]);
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
      if(self.datapoints.get(first).length >= self.settings.datapointsCount) {
        for (const k of self.datapoints.keys()) {
          self.datapoints.set(k, self.datapoints.get(k).slice(-self.settings.datapointsCount));
        }
      }
    }
  }
})

const store = RootStore.create({})