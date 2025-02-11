## Optimization Comparison

For bulk data optimization,

I used both [BufferAttribute](https://threejs.org/docs/#api/en/core/BufferAttribute) and [Web Worker](https://nodejs.org/api/worker_threads.html).

I checked the operation time with 6 different test cases.

---

### Operation Time

| Test Input # | With Optimization | Without Optimization |
| ------------ | ----------------- | -------------------- |
| 10,000       | 0.723             | 3.357                |
| 50,000       | 0.836             | 11.714               |
| 100,000      | 1.055             | 21.876               |
| 200,000      | 1.42              | 42.285               |
| 300,000      | 1.193             | 62.889               |
| 500,000      | 1.646             | 116.998              |
