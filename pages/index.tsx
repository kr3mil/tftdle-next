import Navbar from "../components/navbar";

import Head from "next/head";
import Image from "next/image";
import Searchbox from "../components/searchbox";
import type { Champ } from "./types";
import { useState } from "react";
import Guesses from "../components/guesses";

export default function Home() {
  const [guesses, setGuesses] = useState<Champ[]>([]);

  const handleGuess = (champ: Champ) => {
    setGuesses([champ, ...guesses]);
  };

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
        <Searchbox handleGuess={handleGuess} />
      </div>
      <Guesses guesses={guesses} />
    </div>
  );
}
