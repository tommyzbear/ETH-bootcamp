import type { NextPage } from "next";
import WalletInfo from "~~/components/wallet/WalletInfo";

const Home: NextPage = () => {
  return (
    <>
      <div className="flex items-center flex-col flex-grow pt-10">
        <div className="px-5">
          <PageBody></PageBody>
        </div>
      </div>
    </>
  );
};

function PageBody() {
  return (
    <>
      <WalletInfo />
    </>
  );
}

export default Home;
