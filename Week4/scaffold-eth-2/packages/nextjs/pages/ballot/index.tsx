import { NextPage } from "next";
import BallotInfo from "~~/components/ballot/BallotInfo";

const Ballot: NextPage = () => {
  return (
    <>
      <div className="flex items-center flex-col flex-grow pt-10">
        <div className="px-5">
          <BallotInfo />
        </div>
      </div>
    </>
  );
};

export default Ballot;
