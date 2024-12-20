import { read_yaml } from "./read_yaml";

let data = await read_yaml("./resources/svc_front.yaml");

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
