import { RouterProvider } from "react-router";
import routes from "./routes/routes";
import { Toaster } from "react-hot-toast";

function App() {
  return (
    <>
    <Toaster position="top-right"/>
      <RouterProvider router={routes} />
    </>
  )
}

export default App