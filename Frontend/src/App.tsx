import "./App.css";

import { BrowserRouter } from "react-router-dom";

import AppRouter from "./routes/AppRouter";

import { useSignalR } from "./hooks/useSignalR";
import RealtimeNotificationContainer from "./components/common/Notification/RealtimeNotificationContainer";

function App() {

  // Global SignalR
  useSignalR();

  return (
    <>
      <BrowserRouter>
        <AppRouter />
        <RealtimeNotificationContainer />
      </BrowserRouter>
    </>
  );
}

export default App;
