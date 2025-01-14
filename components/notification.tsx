import toast, { Toaster, ToastPosition } from "react-hot-toast";

export function showError(message: String): void {
  toast.error(message);
}

const Notifications = ({ position }: ErrorProps) => <Toaster
  containerStyle={{
    right: '24px',
    top: '80px',
  }}
  position={position}
  toastOptions={{
    error: {
      style: {
        background: '#c44',
        color: '#fff',
      },
    },
    icon: null,
    style: {
      borderRadius: '4px',
      boxShadow: 'none',
      padding: '8px'
    }
  }} />;

type ErrorProps = {
  position: ToastPosition;
};

export default Notifications;
