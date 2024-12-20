import { Camera } from "./cameraModel";
import { readYaml } from "./readYaml";

const data: Camera = await readYaml("./resources/svc_front.yaml");

export default function Home() {
  return (
    <html>
      <body>
        <h2>Camera Model Parameter Information</h2>
        <p>channel: {data.channel}</p>
        <p>sensor: {data.sensor}</p>
        <p>distortion_model: {data.distortion_model}</p>
        <p>hfov: {data.hfov}</p>
        <p>height: {data.height}</p>
        <p>width: {data.width}</p>
        <p>distortion_model: {data.distortion_model}</p>
        <h3>Intrinsic</h3>
        <p>fx: {data.intrinsic.fx}</p>
        <p>fy: {data.intrinsic.fy}</p>
        <p>cx: {data.intrinsic.cx}</p>
        <p>cy: {data.intrinsic.cy}</p>
        <p>k1: {data.intrinsic.k1}</p>
        <p>k1: {data.intrinsic.k1}</p>
        <p>k2: {data.intrinsic.k2}</p>
        <p>k3: {data.intrinsic.k3}</p>
        <p>k4: {data.intrinsic.k4}</p>
        <p>k5: {data.intrinsic.k5}</p>
        <p>k6: {data.intrinsic.k6}</p>
        <p>p1: {data.intrinsic.p1}</p>
        <p>p2: {data.intrinsic.p2}</p>
      </body>
    </html>
  );
}
