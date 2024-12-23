import { readYaml } from "./readYaml";

let data = await readYaml("./resources/svc_front.yaml");

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
