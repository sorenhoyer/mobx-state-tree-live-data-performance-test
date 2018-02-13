import { types } from 'mobx-state-tree';

const Measurement = types.model('Measurement', {
  x: types.number,
  y: types.number,
});

export default Measurement;