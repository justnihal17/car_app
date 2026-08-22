export interface RescueHeroService {
  _id: string;
  image: string;
  name: string;
  title: string;
  redline: string;
  description: string;
  order: number;
}

export interface RescueService {
  _id: string;
  image: string;
  name: string;
  description: string;
  duration: string;
  points: string[];
  price: number;
}

export interface RescueFaq {
  _id: string;
  questionName: string;
  questionValue: string;
}

export interface RescueSettings {
  description: string;
  getStarted: {
    points: string[];
  };
}
