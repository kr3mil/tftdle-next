import Navbar from "../components/navbar";

import Head from "next/head";
import Image from "next/image";
import Searchbox from "../components/searchbox";
import type { Champ } from "../lib/types";
import { useEffect, useState } from "react";
import Guesses from "../components/guesses";
import champs from "../json/champs_new.json";

export default function Home() {
  const [guesses, setGuesses] = useState<Champ[]>([]);
  const [champToGuess, setChampToGuess] = useState<Champ | undefined>();
  const [guessedCorrectly, setGuessedCorrectly] = useState<Boolean>(false);
  const [tftdleCount, setTftdleCount] = useState<number | undefined>();

  function mulberry32(a: number) {
    return function () {
      var t = (a += 0x6d2b79f5);
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  useEffect(() => {
    let today = new Date().toLocaleDateString();

    if (guesses.length > 0) {
      console.log(`Setting local: ${today}/guesses`);
      console.log(JSON.stringify(guesses));
      localStorage.setItem(`${today}/guesses`, JSON.stringify(guesses));
    }

    const checkIfCorrect = () => {
      if (guesses[0] === champToGuess) {
        setGuessedCorrectly(true);
      }
    };

    checkIfCorrect();
  }, [guesses, champToGuess]);

  useEffect(() => {
    let today = new Date().toLocaleDateString();
    let randomSeed: number = parseInt(today.replace("/", ""));

    let randomNumFunc: Function = mulberry32(randomSeed);
    let randomNum = randomNumFunc();

    setChampToGuess(champs[Math.floor(randomNum * champs.length)]);

    setTftdleCount(
      Math.floor(
        (new Date().getTime() - new Date("11/14/2022").getTime()) /
          (1000 * 3600 * 24)
      )
    );

    const localStorageGuessesString = localStorage.getItem(`${today}/guesses`);

    if (localStorageGuessesString) {
      console.log(`local: ${localStorageGuessesString}`);
      const localStorageGuesses = JSON.parse(localStorageGuessesString);

      if (localStorageGuesses && localStorageGuesses.length > 0) {
        setGuesses(localStorageGuesses);
      }
    }
  }, []);

  const handleGuess = (champ: Champ) => {
    setGuesses([champ, ...guesses]);
  };

  const handleCopyClipboardClick = () => {
    let textBuilder =
      "I found #TFTdle champion #" +
      tftdleCount +
      " in only " +
      guesses.length +
      " attempts!\n\n";

    for (let i = guesses.length - 1; i >= 0; i--) {
      textBuilder += guesses[i].set === champToGuess!.set ? "🟩" : "🟥";

      textBuilder += guesses[i].traits.every((r) =>
        champToGuess!.traits.includes(r)
      )
        ? "🟩"
        : guesses[i].traits.some((r) => champToGuess!.traits.includes(r))
        ? "🟧"
        : "🟥";

      textBuilder += guesses[i].gender === champToGuess!.gender ? "🟩" : "🟥";

      textBuilder += guesses[i].cost === champToGuess!.cost ? "🟩" : "🟥";

      textBuilder += guesses[i].health === champToGuess!.health ? "🟩" : "🟥";

      textBuilder += guesses[i].range === champToGuess!.range ? "🟩" : "🟥";

      textBuilder += "\n";
    }

    textBuilder += "\nhttps://tftdle.com";

    navigator.clipboard.writeText(textBuilder);
  };

  return (
    <div className="flex flex-col h-screen">
      <Head>
        <title>TFTdle</title>
        <meta
          name="description"
          content="TFTdle, inspired by Wordle and Pokedle.club, is a daily TFT guessing game, guess the champion based off key attributes"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Navbar tftdleCount={tftdleCount} />
      <div className="border-t-[1px] border-gray-700" />
      {!guessedCorrectly && (
        <div className="flex flex-col items-center mt-4 mb-12">
          <Searchbox handleGuess={handleGuess} />
        </div>
      )}

      <Guesses guesses={guesses} champToGuess={champToGuess} />

      {guessedCorrectly && (
        <button
          className="rounded-xl border mt-4 w-[80%] self-center py-2 bg-cyan-800 text-white font-semibold"
          onClick={handleCopyClipboardClick}
        >
          Copy to Clipboard!
        </button>
      )}

      <div className="opacity-0">
        <p className="h-10">test</p>
      </div>
    </div>
  );
}
