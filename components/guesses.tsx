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
        </div>
      )}
    </>
  );
};

export default Guesses;
