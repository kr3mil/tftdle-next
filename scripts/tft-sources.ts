export type RosterSource = Readonly<{
  setId: string;
  setLabel: string;
  setOrder: number;
  patch: string;
  setKey: string;
  mutator?: string;
}>;

// Fixed final-patch snapshots make every historical roster reproducible.
export const HISTORICAL_ROSTERS: readonly RosterSource[] = [
  { setId: "1", setLabel: "Set 1", setOrder: 1, patch: "9.21", setKey: "1" },
  { setId: "2", setLabel: "Set 2", setOrder: 2, patch: "10.5", setKey: "2" },
  { setId: "3", setLabel: "Set 3", setOrder: 3, patch: "10.11", setKey: "3" },
  { setId: "3.5", setLabel: "Set 3.5", setOrder: 3.5, patch: "10.18", setKey: "3", mutator: "TFTSet3" },
  { setId: "4", setLabel: "Set 4", setOrder: 4, patch: "11.1", setKey: "4", mutator: "TFTSet4" },
  { setId: "4.5", setLabel: "Set 4.5", setOrder: 4.5, patch: "11.8", setKey: "4", mutator: "TFTSet4_Act2" },
  { setId: "5", setLabel: "Set 5", setOrder: 5, patch: "11.14", setKey: "5", mutator: "TFT_Set5" },
  { setId: "5.5", setLabel: "Set 5.5", setOrder: 5.5, patch: "11.21", setKey: "5", mutator: "TFT_Set5_Stage2" },
  { setId: "6", setLabel: "Set 6", setOrder: 6, patch: "12.2", setKey: "6", mutator: "TFT_Set6" },
  { setId: "6.5", setLabel: "Set 6.5", setOrder: 6.5, patch: "12.10", setKey: "6", mutator: "TFTSet6_Stage2" },
  { setId: "7", setLabel: "Set 7", setOrder: 7, patch: "12.16", setKey: "7", mutator: "TFTSet7" },
  { setId: "7.5", setLabel: "Set 7.5", setOrder: 7.5, patch: "12.22", setKey: "7", mutator: "TFTSet7_Stage2" },
  { setId: "8", setLabel: "Set 8", setOrder: 8, patch: "12.23", setKey: "8", mutator: "TFTSet8" },
  { setId: "8.5", setLabel: "Set 8.5", setOrder: 8.5, patch: "13.11", setKey: "8", mutator: "TFTSet8_Stage2" },
  { setId: "9", setLabel: "Set 9", setOrder: 9, patch: "13.17", setKey: "9", mutator: "TFTSet9" },
  { setId: "9.5", setLabel: "Set 9.5", setOrder: 9.5, patch: "13.22", setKey: "9", mutator: "TFTSet9_Stage2" },
  { setId: "10", setLabel: "Set 10", setOrder: 10, patch: "14.5", setKey: "10", mutator: "TFTSet10" },
  { setId: "11", setLabel: "Set 11", setOrder: 11, patch: "14.14", setKey: "11", mutator: "TFTSet11" },
  { setId: "12", setLabel: "Set 12", setOrder: 12, patch: "14.22", setKey: "12", mutator: "TFTSet12" },
  { setId: "13", setLabel: "Set 13", setOrder: 13, patch: "15.5", setKey: "13", mutator: "TFTSet13" },
  { setId: "14", setLabel: "Set 14", setOrder: 14, patch: "15.14", setKey: "14", mutator: "TFTSet14" },
  { setId: "15", setLabel: "Set 15", setOrder: 15, patch: "15.23", setKey: "15", mutator: "TFTSet15" },
  { setId: "16", setLabel: "Set 16", setOrder: 16, patch: "16.7", setKey: "16", mutator: "TFTSet16" },
] as const;

export const CURRENT_ROSTER: RosterSource = {
  setId: "17",
  setLabel: "Set 17",
  setOrder: 17,
  patch: "latest",
  setKey: "17",
  mutator: "TFTSet17",
};
