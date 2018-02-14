![Image of Yaktocat](https://raw.githubusercontent.com/sorenhoyer/mobx-state-tree-live-data-performance-test/master/mobx-state-tree-live-data-performance-test.PNG)

# mobx-state-tree-live-data-performance-test
An attempt to lower CPU and RAM usage as much as possible with the current data structure while maintaining an updated min / max value for each insertion. After 2000 seconds (insertions) the chart will start rolling since the first item will be removed when the limit is reached.

**Development** mode:
- clone
- npm install
- npm start to run the app

**Production** mode:

- clone
- npm install
- npm run build
- npm install -g serve
- serve -s build

Testing should be done with a production build.

Rename the index.js to something else and index-[whatever] to index.js to test. Make sure you're not running a cached version - ctrl+f5 with chrome console enabled to force cache flush. Also you may way to simple comment out the chart component, to further isolate the MobX State Tree we're trying to test. The chart is only meant for adding context to this example.

## index.js - using Datapoint + Heap + MeasurementQueue + Measurement: ##


**Notes:**
From a couple of hundreds counts in, until count 800, there were a lot of high spikes (30/40+%) 
in CPU usage every 10-20 seconds, lasting for about 3-5 seconds or so.
About count 800, cpu usage increased permanently to 80%+ and RAM was 3000MB+ at that point, 
before suddenly lowering to just 3% CPU usage and 650MB RAM at count ~ 900.
What could cause this dramatic drop in both CPU and RAM usage?
When the max count at 2000 was reached, the CPU usage increased to stay around 19% - this is due to the removal of the first measurement. Any way to optimize performance here?
From 1400 to 1450 memory use increased quickly from 1000MB to 1300MB and dropped 300MB at 1460 in a second.
This pattern was seen repeatedly from that point on.
From 1800-1850 RAM usage went from 750-1400 dropping back to 1000 and going up to 1400 again 30 seconds later
At 2000+ it's pretty consistent across all tests. It seems to always settle around 19-23% CPU.
RAM Varies more. But at this point 900MB RAM usage was seen after some time.

The browser was: Chrome Version 64.0.3282.119 (Officiel version) (64-bit)

7 (threads/processes) in task manager

- 500 ~ 7% (1200MB RAM)
- 1000 ~ 3% (660MB RAM) (A sudden drop in CPU and MEM Usage was seen at count 900)
- 1500 ~ 4.2% (1200MB RAM)
- 2000 ~ 4.7 - 9.5% | Avg: ~ 7% but varying alot at this point (1400MB RAM)
- 2000+ ~ 19-23% (900 - 1650 MB RAM) (remove first, add last)

### Other tests, to compare with ###

**index-01.js:**

6 (threads/processes) in task manager

- 500 ~ 1.8% (260MB RAM)
- 1000 ~ 2.9% (355MB RAM)
- 1500 ~ 3.2% (440MB RAM)
- 1999 ~ 3.6% (550MB RAM)
- 2000+ ~ 19% (1050MB RAM)


**index 02 - using Measurement:**

N/A

**index 03 - using Datapoint + Measurement:**

N/A

**index 04 - using Datapoint + MeasurementQueue + Measurement:**

- 500 ~ 2% (352MB RAM)
- 1000 ~ 3.5% (700MB RAM)
- 1500 ~ 4% (1250MB RAM)
- 2000 ~ 4.5% (2000MB RAM)
- 2000+ ~ 19% (1100-3300MB RAM) (remove first, add last)
