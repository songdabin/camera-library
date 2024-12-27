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
channel: [channel_name]
sensor: [sensor_name]
distortion_model: [distortion_model_name]
hfov: [hfov_value]
height: [height_value]
width: [width_value]
intrinsic:
  fx: [fx_value]
  ...
```

## Release Notes

1.0.8
1.0.9 - create README.md

### End
