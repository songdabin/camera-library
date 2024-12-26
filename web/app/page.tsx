import { readYaml } from "camera-library/dist/services/read_yaml.js";
import path from "path";

export default function Home() {
  const filePath = path.join(process.cwd(), "assets", "svc_front.yaml");
  const data = readYaml(filePath);

  return (
    <html>
      <body>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <h2>Camera Model Parameter</h2>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3,1fr)",
              gridAutoRows: 400,
            }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              <h3>Parameters</h3>
              <ul>
                <li>channel : {data.channel}</li>
                <li>sensor : {data.sensor}</li>
                <li>distortionModel : {data.distortionModel}</li>
                <li>hfov: {data.hfov}</li>
                <li>height: {data.height}</li>
                <li>width: {data.width}</li>
              </ul>
            </div>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              <h3>Intrinsic Parameters</h3>
              <ul>
                <li>fx: {data.intrinsic.fx}</li>
                <li>fy: {data.intrinsic.fy}</li>
                <li>cx: {data.intrinsic.cx}</li>
                <li>cy: {data.intrinsic.cy}</li>
                <li>k1: {data.intrinsic.k1}</li>
                <li>k2: {data.intrinsic.k2}</li>
                <li>k3: {data.intrinsic.k3}</li>
                <li>k4: {data.intrinsic.k4}</li>
                <li>k5: {data.intrinsic.k5}</li>
                <li>k6: {data.intrinsic.k6}</li>
                <li>p1: {data.intrinsic.p1}</li>
                <li>p2: {data.intrinsic.p2}</li>
              </ul>
            </div>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              <h3>VCS Extrinsic Parameters</h3>
              <ul>
                <li>frame_from: {data.vcsExtrinsic.frameFrom}</li>
                <li>frame_to: {data.vcsExtrinsic.frameTo}</li>
                <li>qw: {data.vcsExtrinsic.qw}</li>
                <li>qx: {data.vcsExtrinsic.qx}</li>
                <li>qy: {data.vcsExtrinsic.qy}</li>
                <li>qz: {data.vcsExtrinsic.qz}</li>
                <li>tx: {data.vcsExtrinsic.tx}</li>
                <li>ty: {data.vcsExtrinsic.ty}</li>
                <li>tz: {data.vcsExtrinsic.tz}</li>
              </ul>
            </div>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              <h3>LCS Extrinsic Parameters</h3>
              <ul>
                <li>frame_from: {data.lcsExtrinsic.frameFrom}</li>
                <li>frame_to: {data.lcsExtrinsic.frameTo}</li>
                <li>qw: {data.lcsExtrinsic.qw}</li>
                <li>qx: {data.lcsExtrinsic.qx}</li>
                <li>qy: {data.lcsExtrinsic.qy}</li>
                <li>qz: {data.lcsExtrinsic.qz}</li>
                <li>tx: {data.lcsExtrinsic.tx}</li>
                <li>ty: {data.lcsExtrinsic.ty}</li>
                <li>tz: {data.lcsExtrinsic.tz}</li>
              </ul>
            </div>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              <h3>MVCS Extrinsic Parameters</h3>
              <ul>
                <li>frame_from: {data.mvcsExtrinsic.frameFrom}</li>
                <li>frame_to: {data.mvcsExtrinsic.frameTo}</li>
                <li>qw: {data.mvcsExtrinsic.qw}</li>
                <li>qx: {data.mvcsExtrinsic.qx}</li>
                <li>qy: {data.mvcsExtrinsic.qy}</li>
                <li>qz: {data.mvcsExtrinsic.qz}</li>
                <li>tx: {data.mvcsExtrinsic.tx}</li>
                <li>ty: {data.mvcsExtrinsic.ty}</li>
                <li>tz: {data.mvcsExtrinsic.tz}</li>
              </ul>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
