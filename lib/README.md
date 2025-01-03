# Camera Library

카메라 파라미터가 포함된 YAML 파일을 읽어와 유효성을 검증하고,
잘못된 입력을 파악하고 수정할 수 있도록 돕고,
검증된 정보를 바탕으로 Camera Model에 저장하여 반환하는 라이브러리입니다.

## Documentation

#### Installation

`$ npm install camera-library`

#### Getting Started

In your editor:

```
import { readYaml } from "camera-library";

const data = readYaml(filePath);

console.log(data.channel);
```

#### Key Features

- YAML 파일 읽기
  - 카메라 파라미터가 포함된 YAML 파일을 읽습니다.
- 유효성 검증
  - 파일의 카메라 파라미터 형식이 올바른지 확인합니다.
- 오류 보고
  - 잘못된 파라미터가 발견되면, 해당 파라미터의 정보를 오류 메시지와 함께 사용자에게 알려줍니다.
- 리턴
  - 검증된 정보를 바탕으로 저장된 camera model을 반환합니다.

#### Input Data Sample Format

```
channel: "mvc_front"        # (string) Camera Channel Name
sensor: "abcd"              # (string) Camera Sensor Name
distortion_model: "kbm"     # (string) Distortion Model Type
hfov: 90.0                  # (float) Horizontal Field of View (degrees, 0.0 - 360.0)
height: 1080                # (int) Image Height in Pixels
width: 1920                 # (int) Image Width in Pixels
intrinsic:                  # (object) Intrinsic Camera Parameters
  fx: 1200.0                # (float) Focal Length in Pixels (X-axis)
  fy: 1200.0                # (float) Focal Length in Pixels (Y-axis)
  cx: 960.0                 # (float) Principal Point X-coordinate (pixels)
  cy: 540.0                 # (float) Principal Point Y-coordinate (pixels)
  ...
vcs_extrinsic:              # (object) VCS Extrinsic Camera Parameters
  frame_from: "vcs"         # (string) Source Coordinate Frame
  frame_to: "svc_front"     # (string) Target Coordinate Frame
  qw: -0.457830327784499    # (float) Real Part of Quaternion
  qx: 0.5430736515642708    # (float) Imaginary Part of Quaternion
  qy: -0.5354141965576975   # (float) Imaginary Part of Quaternion
  qz: 0.4569398626316843    # (float) Imaginary Part of Quaternion
  tx: 3.104786876325451     # (float) Translation Parameter (X-axis)
  ty: 0.016295622111088     # (float) Translation Parameter (Y-axis)
  tz: -1.6926350132369008   # (float) Translation Parameter (Z-axis)
...
```

## Release Notes

1.0.8

1.0.9 - create README.md

### End
