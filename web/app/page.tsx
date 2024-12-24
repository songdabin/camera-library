import { readYaml } from "camera-library";

let data = readYaml("../../lib/assets/svc_front.yaml");

console.log(data);

export default function Home() {
  return (
    <html>
      <body>
        <div>Home</div>
      </body>
    </html>
  );
}
