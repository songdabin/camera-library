# Camera Model Class

### Requirements

#### Step 1

1. yaml format 불러오기
2. yaml format 검증

   K5, K6 값이 없을 경우, 0으로 처리

   Intrinsic이나 Extrinsic이 없는 경우, 에러 처리

3. Class를 yaml에서 가져온 값으로 초기화

4. three.js 활용

   [Matrix4](https://threejs.org/docs/index.html?q=matrix4#api/en/math/Matrix4), [Quaternion](https://threejs.org/docs/index.html?q=quat#api/en/math/Quaternion), [Euler](https://threejs.org/docs/index.html?q=euler#api/en/math/Euler)을 Class에 적용

5. Test Code

   class 초기화 테스트 코드

   yaml 데이터 검증 테스트 코드

#### Step 2

1. 구조 변경

2. projectCCSToICS 함수 정의

3. Factory Method Design Pattern 적용

4. 모델별 CCSToICS 코드

5. Testing with input & output

---

### Camera Type Description

```
interface Intrinsic {
    fx: number;
    fy: number;
    cx: number;
    cy: number;
    k1: number;
    k2: number;
    k3: number;
    k4: number;
    k5: number;
    k6: number;
    p1: number;
    p2: number;
}

interface Extrinsic {
    frameFrom: string;
    frameTo: string;
    qw: number;
    qx: number;
    qy: number;
    qz: number;
    tx: number;
    ty: number;
    tz: number;
}

class Camera {
    channel: string;
    sensor: string;
    distortionModel: string;
    hfov: number;
    height: number;
    width: number;
    intrinsic: Intrinsic;
    vcsExtrinsic: Extrinsic;
    lcsExtrinsic: Extrinsic;
    mvcsExtrinsic: Extrinsic;
}
```
