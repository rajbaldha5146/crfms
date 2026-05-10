import Spinner from "./Spinner";
import Toast from "./Toast";
import { useUIStore } from "../../store/useUIStore";

const GlobalUIComponents = () => {
  const { isLoading, toast, clearToast } = useUIStore();

  return (
    <>
      {/* Global Spinner */}
      {isLoading && <Spinner />}

      {/* Global Toast */}
      {toast && (
        <Toast
          message={toast.msg}
          type={toast.type}
          onClose={clearToast}
        />
      )}
    </>
  );
};

export default GlobalUIComponents;
