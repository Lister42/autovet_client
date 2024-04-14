import { Status } from "@/utils/types";

const StatusView = ({className, status }: {className: string, status: Status }) => {
  return (
    <div className={className}>
      <p>
        {status === Status.Upcoming ? (
          <span className="indicator-center badge indicator-item">
            Upcoming
          </span>
        ): status === Status.NotCheckedIn ? (
          <span className="indicator-center badge-warning badge indicator-item">
            Not Checked In
          </span>
        ) : status === Status.Waiting ? (
          <span className="indicator-center badge-warning badge indicator-item">
            Waiting
          </span>
        ) : status === Status.CheckedIn ? (
          <span className="indicator-center badge-success badge indicator-item">
            Checked In
          </span>
        ) : status === Status.AwaitingPickup ? (
          <span className="indicator-center badge-warning badge indicator-item">
            Awaiting Pickup
          </span>
        ) : status === Status.CheckingOut ? (
          <span className="indicator-center badge-warning badge indicator-item">
            Checking Out
          </span>
        ) : status === Status.InvoiceSent ? (
          <span className="indicator-center badge-accent badge indicator-item">
            Invoice Sent
          </span>
        ) : (
          <></>
        )}
      </p>
    </div>
  );
};

export default StatusView;
