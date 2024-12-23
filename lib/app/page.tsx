import { readYaml } from "../services/read_yaml";

let data = await readYaml("./assets/svc_front.yaml");

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
