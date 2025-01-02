import { readYaml } from "camera-library";
import path from "path";

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
  const data = readYaml(filePath);

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
      <head>
        <style>
          {`
            body {
              background-color: #f4f7fa;
              margin: 5vh 0;
              padding: 0;
              box-sizing: border-box;
            }

            .container {
              max-width: 70vw;
              margin: 0 auto;
              padding: 40px;
              background-color: #fff;
              border-radius: 8px;
              box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
            }

            h2 {
              text-align: center;
              color: #333;
              font-size: 2.5rem;
              margin-bottom: 30px;
              font-weight: 600;
            }

            .grid {
              display: grid;
              grid-template-columns: repeat(2, 1fr);
              grid-gap: 40px;
              margin-top: 20px;
            }

            .card {
              background-color: #fafafa;
              padding: 10px 20px;
              border-radius: 8px;
              box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
            }

            .card h3 {
              color: #4b4f58;
              font-size: 1.5rem;
              margin-bottom: 15px;
            }

            .card ul {
              list-style-type: none;
              padding: 0;
            }

            .card li {
              margin-bottom: 10px;
            }

            .card ul li:last-child {
              margin-bottom: 0;
            }

            @media (max-width: 768px) {
              .grid {
                grid-template-columns: 1fr;
              }
            }
          `}
        </style>
      </head>
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
