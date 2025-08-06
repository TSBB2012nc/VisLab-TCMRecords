export interface StageStats {
  count: number;
  ratio: string;
}

export interface HerbColorMap {
  [key: string]: {
    book_category: string;
    book_color: number[];
    expert_category: string;
    expert_color: number[];
  };
}

export interface PatientData {
  [key: string]: {
    date: string;
    scripts: {
      [key: string]: {
        amount: number;
      };
    };
  };
}

export interface StreamData {
  visit_num: number;
  date: string;
  scripts: {
    [key: string]: {
      amount: number;
    };
  };
}
