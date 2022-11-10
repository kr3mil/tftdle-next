import type { Champ } from "../pages/types";

import Image from "next/image";

interface GuessesProps {
  guesses: Champ[];
}

const Guesses = ({ guesses }: GuessesProps) => {
  return (
    <>
      {guesses.length > 0 && (
        <div className="flex justify-center mt-4 space-x-4 select-none">
          {/* NAME */}
          <div className="flex flex-col w-20 items-center">
            <p className="font-semibold">Champion</p>
            <div className="border-t-[1px] w-[80%] mt-2" />
            {guesses.map((guess, index) => (
              <div
                className={`flex w-20 h-20 border mt-2 items-center justify-center`}
                key={`${guess.name}, ${index}`}
              >
                <Image
                  src={`/${guess.icon}`}
                  alt={`${guess.name}${index}`}
                  width="128"
                  height="128"
                />
              </div>
            ))}
          </div>

          {/* SET */}
          <div className="flex flex-col w-20 items-center">
            <p className="font-semibold">Set</p>
            <div className="border-t-[1px] w-[80%] mt-2" />
            {guesses.map((guess, index) => (
              <div
                className={`flex w-20 h-20 border mt-2 items-center justify-center`}
                key={`${guess.name}, ${index}`}
              >
                <p className="z-10">{guess.set.replace("-", ".")}</p>
              </div>
            ))}
          </div>

          {/* TRAITS */}
          {/* TODO */}

          {/* COST */}
          <div className="flex flex-col w-20 items-center">
            <p className="font-semibold">Cost</p>
            <div className="border-t-[1px] w-[80%] mt-2" />
            {guesses.map((guess, index) => (
              <div
                className={`flex w-20 h-20 border mt-2 items-center justify-center`}
                key={`${guess.name}, ${index}`}
              >
                <p className="z-10">{guess.cost}</p>
              </div>
            ))}
          </div>

          {/* HEALTH */}
          <div className="flex flex-col w-20 items-center">
            <p className="font-semibold">Health</p>
            <div className="border-t-[1px] w-[80%] mt-2" />
            {guesses.map((guess, index) => (
              <div
                className={`flex w-20 h-20 border mt-2 items-center justify-center`}
                key={`${guess.name}, ${index}`}
              >
                <p className="z-10">{guess.health.split("/")[0].trim()}</p>
              </div>
            ))}
          </div>

          {/* RANGE */}
          <div className="flex flex-col w-20 items-center">
            <p className="font-semibold">Range</p>
            <div className="border-t-[1px] w-[80%] mt-2" />
            {guesses.map((guess, index) => (
              <div
                className={`flex w-20 h-20 border mt-2 items-center justify-center`}
                key={`${guess.name}, ${index}`}
              >
                <p className="z-10">{guess.range}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
};

export default Guesses;
