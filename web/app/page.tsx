import { readYaml } from "camera-library/dist/services/read_yaml.js";
import path from "path";

export default function Home() {
  const filePath = path.join(process.cwd(), "assets", "svc_front.yaml");
  const data = readYaml(filePath);

  return (
    <html>
      <body>
        <div>
          <h2>Camera Model Parameter</h2>
          <ul>
            <li>channel : {data.channel}</li>
            <li>sensor : {data.sensor}</li>
            <li>distortionModel : {data.distortionModel}</li>
          </ul>
        </div>
      </body>
    </html>
  );
}
