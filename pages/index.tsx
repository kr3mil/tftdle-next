import Navbar from "../components/navbar";

import Head from "next/head";
import Searchbox from "../components/searchbox";

export default function Home() {
  return (
    <div className="flex flex-col h-screen">
      <Head>
        <title>TFTdle</title>
        <meta name="description" content="TFT inspired wordle" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Navbar />
      <div className="border-t-[1px] border-gray-700 mb-4" />
      <div className="flex flex-col items-center">
        <Searchbox />
      </div>
    </div>
  );
}
