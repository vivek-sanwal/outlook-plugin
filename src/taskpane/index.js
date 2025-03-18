import * as React from "react";
import { createRoot } from "react-dom/client";
import { FluentProvider, webLightTheme } from "@fluentui/react-components";
import Main from "./main";
import './../assets/layout.css';
import './../assets/style.css';
import './../assets/bootstrap.css';
import PluginApp from "./PluginApp";
const title = "Contoso Task Pane Add-in";
const rootElement = document.getElementById("container");
const root = rootElement ? createRoot(rootElement) : undefined;
function decodeURL() {
  if (!window.location.href.split("?")[1]) {
    console.log("No data passed in to Chat element :(.");
    return;
  }
  var params = window.location.href.split("?")[1].split("_");
  var data = {};
  for (var x in params) {
    data[params[x].split("=")[0]] = decodeURIComponent(params[x].split("=")[1]);
  }
  return data;
}

var gid, iid, pid;

var data = decodeURL();

if (data) {
  gid = data.gid;
  pid = data.pid;
  iid = data.iid;
}
class App extends React.Component {
  constructor(props) {
    super(props); {
    }
  }
  componentDidMount() {        
  }

  render() {
    return (
      <React.Fragment>
        {gid !== undefined &&
          <PluginApp gid={gid} iid={iid} pid={pid}></PluginApp>
        }
      </React.Fragment>
    );
  }
}

Office.onReady(() => {
  root?.render(
    <FluentProvider theme={webLightTheme}>
      <App title={title} />
    </FluentProvider>
  );
});

// if (module.hot) {
//   module.hot.accept("./components/App", () => {
//     const NextApp = require("./components/App").default;
//     root?.render(NextApp);
//   });
// }
