import { useToast } from "@/hooks/useToast";

const toastStyles = { 
    success: 'bg-slate-700',
    error: 'bg-red-300',
    info: 'bg-purple-600',
}

export const ToastContainer = () => {
    const { toast } = useToast();

    const subgiftToast = toast.filter((toast) => toast.title?.startsWith('subgift'));
    const normalToast = toast.filter((toast) => !toast.title?.startsWith('subgift'));

    const subgiftRecipients = subgiftToast.map((toast) => toast.title);
    const subgiftGroup = subgiftRecipients.length > 0
        ? `🎁🎁🎁🎁🎁`
        : '';

    const friendlyTitle = (toastTitle?: string): string => {
        if (!toastTitle) return '';

        const [type, rest] = toastTitle.split(':').map((s) => s.trim());

        switch (type) {
            case 'sub':
            return `${rest} Subscribed!`;
            case 'resub':
            return `${rest} Resubscribed!`;
            case 'subgift':
            return `${rest} was Gifted a Subscription!`;
            case 'submysterygift':
            return `${rest} Gifted Multiple Subscriptions!`;
            case 'giftpaidupgrade':
            return `${rest} Upgraded their Gift Sub!`;
            case 'raid':
            return `${rest} is Raiding!`;
            case 'announcement':
            return `${rest} Made an Announcement!`;
            default:
            return rest ? `${rest} (${type})` : toastTitle;
        }
    }

  return (
    <div className="fixed bottom-4 right-4 flex flex-col items-end space-y-2 z-50">
      {/* Render non-subgift toasts */}
      {normalToast.map((toast) => (
        <div
          key={toast.id}
          className={`${toastStyles[toast.type || 'info']} text-white inline-block max-w-sm break-words px-4 py-2 rounded-lg shadow-xl`}
        >
          <header className="font-semibold">{friendlyTitle(toast.title)}</header>
          <div>{toast.message}</div>
        </div>
      ))}

      {/* Render grouped subgift toast */}
      {subgiftRecipients.length > 0 && (
        <div
          key="grouped-subgift"
          className={`${toastStyles.info} text-white inline-block max-w-sm break-words px-4 py-2 rounded-lg shadow-xl`}
        >
          <header className="font-semibold">Gift Subs</header>
          <div>{subgiftGroup}</div>
        </div>
      )}
    </div>
  );
};