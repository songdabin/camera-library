import { readYaml } from "camera-library";
import Link from "next/link";
import path from "path";
import React from "react";
import * as z from "zod";

export default function Modal() {
  const filePath = path.join(process.cwd(), "assets", "svc_front.yaml");
  let data;

  try {
    data = readYaml(filePath);
  } catch (error) {
    if (error instanceof Error) {
      data = error;
      data = data.issues[0];
    }
  }

  const errorBlock = (infoName, inputData) => {
    return (
      <div style={{ display: "flex", alignItems: "center", gap: "3vw" }}>
        <p style={{ backgroundColor: "blanchedalmond", padding: "1vh" }}>
          {infoName}
        </p>
        <div>{inputData}</div>
      </div>
    );
  };

  return (
    <html>
      <body>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            marginTop: "8vh",
            gap: 4,
          }}
        >
          <h2 style={{ marginBottom: "5vh" }}>Validation Error</h2>
          {errorBlock("에러 코드", data.code)}
          {errorBlock("확인할 데이터", data.path)}
          {errorBlock("수정 방향", data.message)}
          <Link
            style={{
              backgroundColor: "seagreen",
              padding: "1vh",
              borderRadius: "4px",
              border: "none",
              textDecoration: "none",
              color: "white",
            }}
            href={"../"}
          >
            다시 확인하기
          </Link>
        </div>
      </body>
    </html>
  );
}
