# Camera Library

### Introduction

카메라 파라미터 정보가 담긴 yaml 파일을 읽어와서, 유효성 검사를 진행하고,

카메라 파라미터 정보를 관리할 수 있게 해주는 라이브러리입니다.

### Structure

```
.
├── config                  # Configuration Files
├── docs                    # Documentation Files
├── lib                     # Library Source Files
    ├── assets              # Static Files for a Specific Feature
    ├── services            # Library Service Implementation Files
    └── models              # Model Files
├── web                     # Test Application Files
└── README.md
```

### Tech Stack

- [TypeScript](https://www.typescriptlang.org/) 5.5.4
- [Prettier](https://prettier.io/) 3.2.5
- [Turborepo](https://turbo.build/repo/docs) 2.3.3
- [ESLint](https://eslint.org/) 9.15.0
- [Zod](https://zod.dev/) 3.24.1
- [Jest](https://jestjs.io/) 29.7.0
- [Three](https://threejs.org/) 0.172.0
