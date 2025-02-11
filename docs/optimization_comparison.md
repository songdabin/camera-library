## Optimization Comparison

For bulk data optimization,

I used both [BufferAttribute](https://threejs.org/docs/#api/en/core/BufferAttribute) and [Web Worker](https://nodejs.org/api/worker_threads.html).

I checked the operation time with 6 different test cases.

---

### Operation Time

| Test Input # | With Optimization | Without Optimization |
| ------------ | ----------------- | -------------------- |
| 10,000       | 0.723             | 1.799                |
| 50,000       | 0.836             | 5.764                |
| 100,000      | 1.055             | 10.341               |
| 300,000      | 1.193             | 29.096               |
| 500,000      | 1.646             | 52.189               |
| 1,000,000    | 2.074             | 144.218              |
