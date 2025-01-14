import toast, { Toaster } from "react-hot-toast";

export function showError(message: String): void {
  toast.error(message);
}

const Notifications = () => (
  <Toaster
    containerStyle={{
      right: "24px",
      bottom: "24px",
    }}
    position="bottom-center"
    toastOptions={{
      error: {
        style: {
          background: "#c44",
          color: "#fff",
        },
      },
      icon: null,
      style: {
        borderRadius: "4px",
        boxShadow: "none",
        padding: "8px",
      },
    }}
  />
);

export default Notifications;
