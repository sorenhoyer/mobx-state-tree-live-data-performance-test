import React from 'react';
import Highcharts from 'highcharts';
//import { observer } from 'mobx-react';

import { 
  withHighcharts, 
  HighchartsChart, 
  Chart as TheChart,
  Title,
  Subtitle,
  Legend,
  XAxis,
  YAxis,
  SplineSeries,
  Tooltip
} from 'react-jsx-highcharts';

const Chart = ({
  className,
  onValueChange, 
  overlayCharts, 
  data,
  chartKey,
  title,
  subtitle,
  xaxisTitle,
  yaxisTitle,
  options,
  plotOptions,
  children}) => {
    return (
      <HighchartsChart plotOptions={plotOptions ? plotOptions : {}} className={className}>
        <TheChart />
        <Title>{title}</Title>
        <Subtitle>{subtitle}</Subtitle>
        <Legend 
          layout="vertical" 
          align="right" 
          verticalAlign="middle" 
        /> 
        <Tooltip 
          padding={10} 
          hideDelay={250} 
          shape="square" 
          split /* valueSuffix=" °C"  */ /* shared */ 
        />
        <XAxis 
          type="datetime"
          crosshair={{ zIndex: 10 }}>
          <XAxis.Title>{xaxisTitle}</XAxis.Title>
        </XAxis>
        <YAxis 
          id="number">
          <YAxis.Title>{yaxisTitle}</YAxis.Title>
          <SplineSeries 
            id={chartKey} 
            name={chartKey} 
            data={data ? data : []} 
          />    
          {
            overlayCharts.map((oc) => {
              return <SplineSeries key={oc} id={oc} name={oc} data={data ? data : []} />
            })
          }
        </YAxis>
      </HighchartsChart>
    )   
}
  
export default withHighcharts(Chart, Highcharts);
//export default withHighcharts((observer(Chart)), Highcharts);