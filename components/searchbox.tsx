import { useEffect, useState } from "react";
import { Combobox } from "@headlessui/react";
import champs from "../json/champs_new.json";

import Image from "next/image";
import type { Champ } from "../lib/types";

interface SearchboxProps {
  handleGuess: (champ: Champ) => void;
}

const Searchbox = ({ handleGuess }: SearchboxProps) => {
  const [searchText, setSearchText] = useState("");

  const filteredChamps =
    searchText === ""
      ? []
      : champs.filter((champ) => {
          return champ.name.toLowerCase().startsWith(searchText.toLowerCase());
        });

  return (
    <div className="cursor-default transition-all duration-500 overflow-hidden rounded-lg text-left lg:w-[42rem] sm:w-[75%] shadow-md focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 focus-visible:ring-offset-2 focus-visible:ring-offset-teal-300 text-sm">
      <Combobox onChange={(champ: Champ) => handleGuess(champ)}>
        <Combobox.Input
          placeholder="Type champion name..."
          onChange={(event) => setSearchText(event.target.value)}
          className="border-none py-4 pl-3 pr-10 w-full text-lg leading-5 focus:ring-0 focus:outline-none"
        />
        <Combobox.Options className={`top-0 max-h-[40rem] overflow-y-scroll`}>
          {filteredChamps.map((champ) => (
            <Combobox.Option
              key={`${champ.name} - ${champ.set} - ${champ.traits.join(",")}`}
              value={champ}
              className={({ active }) =>
                `flex space-x-2 items-center last:border-b-0 border-b-[1px] p-2 hover:bg-blue-300 hover:cursor-pointer ${
                  active ? "bg-teal-600 text-white" : ""
                }`
              }
            >
              <div className="flex relative justify-center">
                <div className="overflow-hidden rounded-full border-2 border-cyan-400">
                  <Image
                    src={`/${champ.icon}`}
                    alt={`${champ.name}`}
                    width="48"
                    height="48"
                  />
                </div>
                {champ.name === "Nomsy" && (
                  <div className="absolute flex top-9 space-x-1">
                    {champ.traits.map((trait) => (
                      <div
                        key={`${champ.name},${champ.set},${trait}`}
                        className="flex relative overflow-hidden rounded-full z-10"
                      >
                        <div className="flex w-[18px] h-[18px] border-blue-700 bg-blue-700 p-[1px] justify-center">
                          <Image
                            src={`/icons/${champ.set}/traits/${trait}.svg`}
                            alt={`${champ.name}-${trait}`}
                            width="22"
                            height="22"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <p>
                {champ.name} - Set {champ.set.replace("-", ".")}
              </p>
            </Combobox.Option>
          ))}
        </Combobox.Options>
      </Combobox>
    </div>
  );
};

export default Searchbox;
