import { readYaml } from "camera-library/dist/read_yaml.js";
import path from "path";

export default function Home() {
  const filePath = path.join(process.cwd(), "assets", "svc_front.yaml");
  const data = readYaml(filePath);

  console.log(data);

  return (
    <html>
      <body>
        <div>Home</div>
      </body>
    </html>
  );
}
