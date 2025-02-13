# Bulk Data Optimization

This document shows the results of the bulk data optimization process.

In this optimization process, [_**BufferAttribute**_](https://threejs.org/docs/#api/en/core/BufferAttribute) and [_**Web Workers**_](https://developer.mozilla.org/ko/docs/Web/API/Web_Workers_API) were used to handle large datasets more efficiently.

### BufferAttribute

In the case of bulk data optimization, using _**BufferAttribute**_ allows us to store and transform data in a way that improves access speed.

### Web Workers

This parallel processing of _**Web Workers**_ significantly speeds up operations on large datasets by splitting the workload across multiple threads.

| Test Input # | With Optimization (s) | Without Optimization (s) |
| ------------ | --------------------- | ------------------------ |
| 10,000       | 1.689                 | 3.357                    |
| 50,000       | 1.658                 | 11.714                   |
| 100,000      | 1.793                 | 21.876                   |
| 200,000      | 2.269                 | 42.285                   |
| 300,000      | 2.512                 | 62.889                   |
| 500,000      | 3.165                 | 116.998                  |

## Observations

- Using _**BufferAttribute**_ and _**Web Workers**_ together has led to a notable reduction in processing times, especially for larger datasets.
- The optimization becomes more apparent as the input size increases, where the time savings are significant.

## Conclusion

By using _**BufferAttribute**_ to efficiently manage large datasets in memory and utilizing _**Web Workers**_ to parallelize the workload, we have achieved substantial performance improvements. This optimization is especially beneficial when handling datasets at scale, reducing processing time and increasing overall efficiency.
