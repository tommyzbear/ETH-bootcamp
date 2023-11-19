import Proposals from "./Proposals";
import VoteHistory from "./VoteHistory";
import Winner from "./Winner";

export default function BallotInfo() {
  return (
    <div className="card w-full bg-primary text-primary-content mt-4">
      <div className="card-body max-w-full">
        <h2 className="card-title">Ballot Info</h2>
        <Winner />
        <Proposals />
        <VoteHistory />
      </div>
    </div>
  );
}
