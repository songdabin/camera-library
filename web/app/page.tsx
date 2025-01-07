import { createModel, readFile, readYaml, splitData } from "camera-library";
import path from "path";
import "./style.css";
import { redirect } from "next/navigation";

const Card = ({ title, parameters }) => (
  <div className="card">
    <h3>{title}</h3>
    <ul>
      {Object.entries(parameters).map(([key, value]) => (
        <li key={key}>
          {key}: {String(value)}
        </li>
      ))}
    </ul>
  </div>
);

export default function Home() {
  const filePath = path.join(process.cwd(), "assets", "svc_front.yaml");
  const fileContent = readFile(filePath);
  const [cameraType, cameraParams] = splitData(fileContent);

  let data;

  try {
    data = readYaml(filePath);
  } catch (error) {
    redirect("/validationError");
  }

  const parameterSections = [
    {
      title: "Parameters",
      parameters: {
        channel: data.channel,
        sensor: data.sensor,
        distortion_model: data.distortionModel,
        hfov: data.hfov,
        height: data.height,
        width: data.width,
      },
    },
    { title: "Intrinsic Parameters", parameters: data.intrinsic },
    { title: "VCS Extrinsic Parameters", parameters: data.vcsExtrinsic },
    { title: "LCS Extrinsic Parameters", parameters: data.lcsExtrinsic },
    { title: "MVCS Extrinsic Parameters", parameters: data.mvcsExtrinsic },
  ];

  return (
    <html>
      <body>
        <div className="container">
          <h2>Camera Model Parameters</h2>

          <div className="grid">
            {parameterSections.map(({ title, parameters }) => (
              <Card key={title} title={title} parameters={parameters} />
            ))}
          </div>
        </div>
      </body>
    </html>
  );
}
